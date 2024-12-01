#include "Arduino.h"

#include "WiFiManager.h"

#include <PicoMQTT.h>

#include <ArduinoJson.h>

#include <NTPClient.h>

#include <secrets.h>

#include <MAX3010x.h>

#include "filters.h"
// Using built in LED pin for demo
#define ledPin 2

// device id
const int deviceId = 2;

/******* MQTT Broker Connection Details *******/
const char *mqtt_server = "mqtt.hlofiys.xyz";

// MQTT topics
const char *mqtt_topic_device_status = "device/status";
const char *mqtt_topic_heartbeat_data = "device/data";
const char *mqtt_topic_device_switch = "device/switch/2";

// Device status
bool collecting = false;
int session = 0;

// MQTT client
PicoMQTT::Client mqtt("broker.hivemq.com");

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 10800);

// Sensor (adjust to your sensor type)
MAX30105 sensor;
const auto kSamplingRate = sensor.SAMPLING_RATE_400SPS;
const float kSamplingFrequency = 400.0;

// Finger Detection Threshold and Cooldown
const unsigned long kFingerThreshold = 10000;
const unsigned int kFingerCooldownMs = 500;

// Edge Detection Threshold (decrease for MAX30100)
const float kEdgeThreshold = -2000.0;

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
	if (collecting && millis() - latestBpmPublish > 50000)
	{
		auto sample = sensor.readSample(1000);
		float current_value_red = sample.red;
		float current_value_ir = sample.ir;

		// Detect Finger using raw sensor value
		if (sample.red > kFingerThreshold)
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