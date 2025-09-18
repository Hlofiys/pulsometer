#include "Arduino.h"

#include "WiFiManager.h"

#include <PicoMQTT.h>

#include <ArduinoJson.h>

#include <NTPClient.h>

#include <MAX3010x.h>

#include "filters.h"
// Using built in LED pin for demo
#define ledPin 2

// device id
const int deviceId = 5;

// MQTT topics
const char *mqtt_topic_device_status = "device/status";
const char *mqtt_topic_heartbeat_data = "device/data";
const char *mqtt_topic_device_switch = "device/switch/5";

// Device status
bool collecting = false;
int session = 0;

// MQTT client
PicoMQTT::Client mqtt("45.135.234.114");

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 10800);

// Sensor (adjust to your sensor type)
MAX30101 sensor;
const auto kSamplingRate = sensor.SAMPLING_RATE_400SPS;
const float kSamplingFrequency = 400.0;

// Wrist Detection Threshold and Cooldown (much lower for wrist)
const unsigned long kFingerThreshold = 1500;  // Even lower for stationary wrist
const unsigned int kFingerCooldownMs = 100;   // Very fast response

// Edge Detection Threshold (much less sensitive for wrist)
const float kEdgeThreshold = -2000.0;  // Much higher threshold to avoid noise

// Filters - Balanced for sports and rest
const float kLowPassCutoff = 2.5;  // Allow more signal through for sports
const float kHighPassCutoff = 0.6;  // Balanced filtering

// Averaging - Balanced for sports and rest
const bool kEnableAveraging = true;
const int kAveragingSamples = 100;  // Balanced averaging for sports responsiveness
const int kSampleThreshold = 8;     // Reasonable threshold for sports

// Pulse prediction parameters
const int kPulsePredictionSamples = 10;  // Number of recent BPMs to use for prediction
const unsigned long kMaxPredictionTime = 15000;  // Max time to show predicted value (15s)
const float kMotionThreshold = 500.0;  // Motion detection threshold

// Additional filtering parameters
const int kMedianFilterSize = 5;  // Size of median filter for BPM readings

// Pulse prediction and motion detection variables (declare before functions)
float recent_bpms[kPulsePredictionSamples];
int recent_bpm_index = 0;
int recent_bpm_count = 0;
float predicted_bpm = 0;
long last_valid_measurement = 0;
float last_motion_value = 0;
bool motion_detected = false;
long last_motion_time = 0;

// Median filter for BPM stability
float median_filter[kMedianFilterSize];
int median_index = 0;
int median_count = 0;

/**** Method for Publishing MQTT Messages **********/

void publishStatusMessage()
{
	Serial.println("Keep Alive ");
	JsonDocument doc;
	doc["id"] = deviceId;
	auto publish = mqtt.begin_publish(mqtt_topic_device_status, measureJson(doc), 1, true);
	serializeJson(doc, publish);
	publish.send();
}

/**** Pulse Prediction Functions **********/

float medianFilter(float value) {
	// Add value to circular buffer
	median_filter[median_index] = value;
	median_index = (median_index + 1) % kMedianFilterSize;
	if (median_count < kMedianFilterSize) {
		median_count++;
	}
	
	// Create a copy for sorting
	float temp[kMedianFilterSize];
	for (int i = 0; i < median_count; i++) {
		temp[i] = median_filter[i];
	}
	
	// Simple bubble sort
	for (int i = 0; i < median_count - 1; i++) {
		for (int j = 0; j < median_count - i - 1; j++) {
			if (temp[j] > temp[j + 1]) {
				float swap = temp[j];
				temp[j] = temp[j + 1];
				temp[j + 1] = swap;
			}
		}
	}
	
	// Return median
	return temp[median_count / 2];
}

float getPredictedBpm() {
	if (recent_bpm_count == 0) return 0;
	
	// Simple weighted average with more weight on recent samples
	float sum = 0;
	float weight_sum = 0;
	
	for (int i = 0; i < recent_bpm_count; i++) {
		int idx = (recent_bpm_index - 1 - i + kPulsePredictionSamples) % kPulsePredictionSamples;
		float weight = 1.0 + (float)i * 0.1; // More weight on recent samples
		sum += recent_bpms[idx] * weight;
		weight_sum += weight;
	}
	
	return sum / weight_sum;
}

void addBpmToHistory(float bpm) {
	// Outlier filtering - reject readings too far from recent average
	if (recent_bpm_count > 0) {
		float current_avg = getPredictedBpm();
		if (abs(bpm - current_avg) > 30) {  // Reject if >30 BPM from average (sports tolerance)
			Serial.print("Rejecting outlier BPM: ");
			Serial.println(bpm);
			return;
		}
	}
	
	recent_bpms[recent_bpm_index] = bpm;
	recent_bpm_index = (recent_bpm_index + 1) % kPulsePredictionSamples;
	if (recent_bpm_count < kPulsePredictionSamples) {
		recent_bpm_count++;
	}
	last_valid_measurement = millis();
}

bool shouldUsePrediction() {
	return (recent_bpm_count >= 2) && 
		   (millis() - last_valid_measurement < kMaxPredictionTime);
}

void detectMotion(float raw_value) {
	if (!isnan(last_motion_value)) {
		float motion_diff = abs(raw_value - last_motion_value);
		if (motion_diff > kMotionThreshold) {
			motion_detected = true;
			last_motion_time = millis();
		} else if (millis() - last_motion_time > 2000) {
			motion_detected = false;
		}
	}
	last_motion_value = raw_value;
}

void publishHeartRateData(int bpm, int spo2, bool is_predicted = false) {
	JsonDocument doc;
	doc["id"] = deviceId;
	doc["bpm"] = bpm;
	doc["sessionId"] = session;
	doc["oxygen"] = spo2;
	if (spo2 > 100) doc["oxygen"] = 98;
	doc["time"] = timeClient.getEpochTime();
	doc["predicted"] = is_predicted;  // Flag to indicate if this is predicted
	
	auto publish = mqtt.begin_publish(mqtt_topic_heartbeat_data, measureJson(doc), 1, true);
	serializeJson(doc, publish);
	publish.send();
}

// Filter Instances
HighPassFilter high_pass_filter(kHighPassCutoff, kSamplingFrequency);
LowPassFilter low_pass_filter_red(kLowPassCutoff, kSamplingFrequency);
LowPassFilter low_pass_filter_ir(kLowPassCutoff, kSamplingFrequency);
Differentiator differentiator(kSamplingFrequency);
MovingAverageFilter<kAveragingSamples> averager_bpm;
MovingAverageFilter<kAveragingSamples> averager_r;
MovingAverageFilter<kAveragingSamples> averager_spo2;

// Statistic for pulse oximetry
MinMaxAvgStatistic stat_red;
MinMaxAvgStatistic stat_ir;

// R value to SpO2 calibration factors
// See https://www.maximintegrated.com/en/design/technical-documents/app-notes/6/6845.html
float kSpO2_A = 1.5958422;
float kSpO2_B = -34.6596622;
float kSpO2_C = 112.6898759;

// Timestamp of the last heartbeat
long last_heartbeat = 0;

// Timestamp for finger detection
long finger_timestamp = 0;
bool finger_detected = false;

// Last diff to detect zero crossing
float last_diff = NAN;
bool crossed = false;
long crossed_time = 0;

// Cooldown
long latestBpmPublish = 0;
long latestKeepAlivePublish = 0;

// ------------------------------------------------------------
// SETUP      SETUP      SETUP      SETUP      SETUP      SETUP
// ------------------------------------------------------------
void setup()
{
	Serial.begin(9600);
	WiFiManager wifiManager;
	if (!wifiManager.autoConnect("Pulsemeter 5", "12345678"))
	{
		Serial.println("failed to connect and hit timeout");
		delay(3000);
		// reset and try again, or maybe put it to deep sleep
		ESP.reset();
		delay(5000);
	}

	Serial.println("connected...yeey :)");

	Serial.println("local ip");
	Serial.println(WiFi.localIP());

	mqtt.subscribe(mqtt_topic_device_switch, [](const char *topic, const char *payload)
				   {
		// payload might be binary, but PicoMQTT guarantees that it's zero-terminated
		Serial.printf("Received message in topic '%s': %s\n", topic, payload);
		JsonDocument json;
		if (deserializeJson(json, payload))
		{
			Serial.println("Json parsing failed.");
			return;
		}
		if (strcmp(json["isActivate"], "1") == 0)
		{
			Serial.println("start measure");
			collecting = true; // Turn the Collecting on
			session = int(json["sessionId"]);
			if (sensor.begin() && sensor.setSamplingRate(kSamplingRate))
			{
				Serial.println("Sensor initialized");
			}
			else
			{
				Serial.println("Sensor not found");
				ESP.restart();
			}
		}
		else
		{
			Serial.println("stop measure");
			collecting = false; // Turn the Collecting off
			digitalWrite(ledPin, LOW);
			session = 0;
			sensor.shutdown();

			// Reset all values on measure stop
			differentiator.reset();
			averager_bpm.reset();
			averager_r.reset();
			averager_spo2.reset();
			low_pass_filter_red.reset();
			low_pass_filter_ir.reset();
			high_pass_filter.reset();
			stat_red.reset();
			stat_ir.reset();
			finger_detected = false;
			finger_timestamp = millis();
			last_diff = NAN;
			crossed = false;
			crossed_time = 0;
			last_heartbeat = 0;
			
			// Reset prediction variables
			recent_bpm_count = 0;
			recent_bpm_index = 0;
			predicted_bpm = 0;
			last_valid_measurement = 0;
			motion_detected = false;
			last_motion_time = 0;
			
			// Reset median filter
			median_count = 0;
			median_index = 0;
	} });
	mqtt.begin();
	timeClient.begin();

	// Inbuilt LED
	pinMode(ledPin, OUTPUT);
	// Initialize sensor

	if (sensor.begin() && sensor.setSamplingRate(kSamplingRate))
	{
		Serial.println("Sensor initialized");
		sensor.shutdown();
	}
	else
	{
		Serial.println("Sensor not found");
		ESP.restart();
	}
}

// ------------------------------------------------------------
// LOOP     LOOP     LOOP     LOOP     LOOP     LOOP     LOOP
// ------------------------------------------------------------
void loop()
{
	mqtt.loop();
	timeClient.update();
	// Adaptive sampling: faster during high BPM (sports), normal during rest
	long sampling_interval = (recent_bpm_count > 0 && getPredictedBpm() > 120) ? 2000 : 4000;
	if (collecting && millis() - latestBpmPublish > sampling_interval)
	{
		auto sample = sensor.readSample(1000);
		float current_value_red = sample.red;
		float current_value_ir = sample.ir;

		// Motion detection for wrist movement
		detectMotion(current_value_red);

		// Debug output every 2 seconds
		static long last_debug = 0;
		if (millis() - last_debug > 2000) {
			Serial.print("Red: ");
			Serial.print(sample.red);
			Serial.print(", Threshold: ");
			Serial.print(kFingerThreshold);
			Serial.print(", Motion: ");
			Serial.print(motion_detected ? "YES" : "NO");
			Serial.print(", Finger: ");
			Serial.println(finger_detected ? "YES" : "NO");
			last_debug = millis();
		}

		// Wrist detection - always try to measure, motion just helps
		if (sample.red > kFingerThreshold)
		{
			if (millis() - finger_timestamp > kFingerCooldownMs)
			{
				finger_detected = true;
			}
		}
		// If motion detected, lower the threshold temporarily
		else if (motion_detected && sample.red > (kFingerThreshold / 2))
		{
			if (millis() - finger_timestamp > kFingerCooldownMs)
			{
				finger_detected = true;
			}
		}
		else
		{
			// Don't reset immediately for wrist - allow brief contact loss
			if (millis() - finger_timestamp > 1000) {  // 1 second grace period
				differentiator.reset();
				averager_bpm.reset();
				averager_r.reset();
				averager_spo2.reset();
				low_pass_filter_red.reset();
				low_pass_filter_ir.reset();
				high_pass_filter.reset();
				stat_red.reset();
				stat_ir.reset();

				finger_detected = false;
			}
			finger_timestamp = millis();
		}

		if (finger_detected)
		{
			current_value_red = low_pass_filter_red.process(current_value_red);
			current_value_ir = low_pass_filter_ir.process(current_value_ir);

			// Statistics for pulse oximetry
			stat_red.process(current_value_red);
			stat_ir.process(current_value_ir);

			// Heart beat detection using value for red LED
			float current_value = high_pass_filter.process(current_value_red);
			float current_diff = differentiator.process(current_value);

			// Valid values?
			if (!isnan(current_diff) && !isnan(last_diff))
			{

				// Detect Heartbeat - Zero-Crossing
				if (last_diff > 0 && current_diff < 0)
				{
					crossed = true;
					crossed_time = millis();
				}

				if (current_diff > 0)
				{
					crossed = false;
				}

				// Detect Heartbeat - Falling Edge Threshold
				if (crossed && current_diff < kEdgeThreshold)
				{
					// Minimum 300ms between heartbeats (max 200 BPM) for sports monitoring
					if (last_heartbeat != 0 && crossed_time - last_heartbeat > 300)
					{
						// Show Results
						int bpm = 60000 / (crossed_time - last_heartbeat);
						float rred = (stat_red.maximum() - stat_red.minimum()) / stat_red.average();
						float rir = (stat_ir.maximum() - stat_ir.minimum()) / stat_ir.average();
						float r = rred / rir;
						float spo2 = kSpO2_A * r * r + kSpO2_B * r + kSpO2_C;
						digitalWrite(ledPin, LOW);
						if (bpm > 50 && bpm < 200)  // Sports range: resting to max exercise
						{
							// Average?
							if (kEnableAveraging)
							{
								// Apply median filter first to remove spikes
								float filtered_bpm = medianFilter(bpm);
								int average_bpm = averager_bpm.process(filtered_bpm);
								int average_spo2 = averager_spo2.process(spo2);

								// Show if enough samples have been collected
								if (averager_bpm.count() > kSampleThreshold)
								{
									// Add to prediction history
									addBpmToHistory(average_bpm);
									
									latestBpmPublish = millis();
									Serial.print("Heart Rate (measured, bpm): ");
									Serial.println(average_bpm);
									Serial.print("SpO2 (avg, %): ");
									Serial.println(average_spo2);
									
									publishHeartRateData(average_bpm, average_spo2, false);
								}
							}
							else
							{
								// Add to prediction history even for non-averaged
								addBpmToHistory(bpm);
								Serial.print("Heart Rate (current, bpm): ");
								Serial.println(bpm);
								Serial.print("SpO2 (current, %): ");
								Serial.println(spo2);
								
								publishHeartRateData(bpm, spo2, false);
								latestBpmPublish = millis();
							}
						}
						// Reset statistic
						stat_red.reset();
						stat_ir.reset();
					}
					digitalWrite(ledPin, HIGH);
					crossed = false;
					last_heartbeat = crossed_time;
				}
			}

			last_diff = current_diff;
		}
	}
	else
	{
		// Check if we should publish predicted values (adaptive interval)
		long prediction_interval = (recent_bpm_count > 0 && getPredictedBpm() > 120) ? 5000 : 8000;
		if (collecting && shouldUsePrediction() && millis() - latestBpmPublish > prediction_interval)
		{
			predicted_bpm = getPredictedBpm();
			if (predicted_bpm > 50 && predicted_bpm < 200)
			{
				// Add some realistic variation (±3 bpm)
				int variation = random(-3, 4);
				int final_bpm = constrain(predicted_bpm + variation, 40, 200);
				
				Serial.print("Heart Rate (predicted, bpm): ");
				Serial.println(final_bpm);
				
				// Use last known SpO2 or estimate
				int estimated_spo2 = 97; // Conservative estimate for wrist
				publishHeartRateData(final_bpm, estimated_spo2, true);
				latestBpmPublish = millis();
			}
		}
		
		if (millis() - latestKeepAlivePublish > 15000)
		{
			publishStatusMessage();
			latestKeepAlivePublish = millis();
		}
		delay(2500);
	}
}