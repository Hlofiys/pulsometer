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
const int deviceId = 2;

// MQTT topics
const char *mqtt_topic_device_status = "device/status";
const char *mqtt_topic_heartbeat_data = "device/data";
const char *mqtt_topic_device_switch = "device/switch/2";

// Device status
bool collecting = false;
int session = 0;

// MQTT client
PicoMQTT::Client mqtt("45.135.234.114");

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 10800);

// Sensor (adjust to your sensor type)
MAX30101 sensor;
const auto kSamplingRate = sensor.SAMPLING_RATE_100SPS;
const float kSamplingFrequency = 100.0;

// Finger Detection Threshold and Cooldown
const unsigned long kFingerThreshold = 10000;
const unsigned int kFingerCooldownMs = 500;

// Edge Detection Threshold (decrease for MAX30100)
const float kEdgeThreshold = -400.0;

// Filters
const float kLowPassCutoff = 5.0;
const float kHighPassCutoff = 0.5;

// Averaging
const bool kEnableAveraging = true;
const int kAveragingSamples = 50;
const int kSampleThreshold = 5;

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

// ------------------------------------------------------------
// SETUP      SETUP      SETUP      SETUP      SETUP      SETUP
// ------------------------------------------------------------
void setup()
{
	Serial.begin(9600);
	WiFiManager wifiManager;
	if (!wifiManager.autoConnect("Pulsemeter 2", "12345678"))
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
        MAX30101::MultiLedConfiguration multiLedCfg;
				multiLedCfg.slot[0] = MAX30101::SLOT_RED;
				multiLedCfg.slot[1] = MAX30101::SLOT_IR;
				multiLedCfg.slot[2] = MAX30101::SLOT_GREEN;
				multiLedCfg.slot[3] = MAX30101::SLOT_OFF;

				if (!sensor.setMultiLedConfiguration(multiLedCfg)) {
					Serial.println("Failed to set multi-LED configuration.");
				}
        if (!sensor.setLedCurrent(MAX30101::LED_RED, 60)) Serial.println("Failed to set RED LED current");
				if (!sensor.setLedCurrent(MAX30101::LED_IR, 50)) Serial.println("Failed to set IR LED current");
				if (!sensor.setLedCurrent(MAX30101::LED_GREEN, 100)) Serial.println("Failed to set GREEN LED current");
        if (!sensor.setADCRange(MAX30101::ADC_RANGE_16384NA)) Serial.println("Failed to set ADC Range");
        if (!sensor.setResolution(MAX30101::RESOLUTION_17BIT_215US)) Serial.println("Failed to set Resolution");
        if (!sensor.setSampleAveraging(MAX30101::SMP_AVE_NONE)) Serial.println("Failed to set Sample Averaging");
        if (!sensor.enableFIFORollover()) Serial.println("Failed to enable FIFO Rollover");
        if (!sensor.setMode(MAX30101::MODE_MULTI_LED)) {
					Serial.println("Failed to set multi-LED mode.");
				}
        sensor.clearFIFO();
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

// Filter Instances
HighPassFilter high_pass_filter(kHighPassCutoff, kSamplingFrequency);
LowPassFilter low_pass_filter_red(kLowPassCutoff, kSamplingFrequency);
LowPassFilter low_pass_filter_ir(kLowPassCutoff, kSamplingFrequency);
LowPassFilter low_pass_filter_green(kLowPassCutoff, kSamplingFrequency);
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
// LOOP     LOOP     LOOP     LOOP     LOOP     LOOP     LOOP
// ------------------------------------------------------------
void loop()
{
	mqtt.loop();
	timeClient.update();
	if (collecting && millis() - latestBpmPublish > 5000)
	{
		auto sample = sensor.readSample(1000);
		float current_value_red = sample.slot[0];
		float current_value_ir = sample.slot[1];
    float current_value_green = sample.slot[2];
    Serial.print("Red: ");
    Serial.print(current_value_red);
    Serial.print(" IR: ");
    Serial.print(current_value_ir);
    Serial.print(" Green: ");
    Serial.println(current_value_green);

		// Detect Finger using raw sensor value
		if (sample.slot[0] > kFingerThreshold)
		{
			if (millis() - finger_timestamp > kFingerCooldownMs)
			{
				finger_detected = true;
			}
		}
		else
		{
			// Reset values if the finger is removed
			differentiator.reset();
			averager_bpm.reset();
			averager_r.reset();
			averager_spo2.reset();
			low_pass_filter_red.reset();
			low_pass_filter_ir.reset();
      low_pass_filter_green.reset();
			high_pass_filter.reset();
			stat_red.reset();
			stat_ir.reset();

			finger_detected = false;
			finger_timestamp = millis();
		}

		if (finger_detected)
		{
			current_value_red = low_pass_filter_red.process(current_value_red);
			current_value_ir = low_pass_filter_ir.process(current_value_ir);

			// Statistics for pulse oximetry
			stat_red.process(current_value_red);
			stat_ir.process(current_value_ir);

			// Heart beat detection using value for green LED
			float lpf_green_for_hr = low_pass_filter_green.process(current_value_green);
			float hpf_green_for_hr = high_pass_filter.process(lpf_green_for_hr);
			float current_diff = differentiator.process(hpf_green_for_hr);
      // Log filtered green values
      Serial.print("Filtered Green: ");
      Serial.print(lpf_green_for_hr, 2); Serial.print(",");
      Serial.print("High Pass Green: ");
      Serial.print(hpf_green_for_hr, 2); Serial.print(",");
      // Log current difference
      Serial.print("Current Diff: ");
      Serial.println(current_diff, 2); Serial.print(",");


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
					if (last_heartbeat != 0 && crossed_time - last_heartbeat > 300)
					{
						// Show Results
						int bpm = 60000 / (crossed_time - last_heartbeat);
						float rred = (stat_red.maximum() - stat_red.minimum()) / stat_red.average();
						float rir = (stat_ir.maximum() - stat_ir.minimum()) / stat_ir.average();
						float r = rred / rir;
						float spo2 = kSpO2_A * r * r + kSpO2_B * r + kSpO2_C;
						digitalWrite(ledPin, LOW);
						if (bpm > 50 && bpm < 250)
						{
							// Average?
							if (kEnableAveraging)
							{
								int average_bpm = averager_bpm.process(bpm);
								int average_spo2 = averager_spo2.process(spo2);

								// Show if enough samples have been collected
								if (averager_bpm.count() > kSampleThreshold)
								{
									latestBpmPublish = millis();
									Serial.print("Heart Rate (avg, bpm): ");
									Serial.println(average_bpm);
									Serial.print("SpO2 (avg, %): ");
									Serial.println(average_spo2);
									JsonDocument doc;
									doc["id"] = deviceId;
									doc["bpm"] = average_bpm;
									doc["sessionId"] = session;
									doc["oxygen"] = average_spo2;
									if (average_spo2 > 100)
										doc["oxygen"] = 98;
									doc["time"] = timeClient.getEpochTime();
									auto publish = mqtt.begin_publish(mqtt_topic_heartbeat_data, measureJson(doc), 1, true);
									serializeJson(doc, publish);
									publish.send();
								}
							}
							else
							{
								Serial.print("Heart Rate (current, bpm): ");
								Serial.println(bpm);
								Serial.print("SpO2 (current, %): ");
								Serial.println(spo2);
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
		if (millis() - latestKeepAlivePublish > 15000)
		{
			publishStatusMessage();
			latestKeepAlivePublish = millis();
		}
		delay(2500);
	}
}