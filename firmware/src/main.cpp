#include "Arduino.h"

#include "WiFiManager.h"

#include <PicoMQTT.h>

#include <PicoWebsocket.h>

#include <ArduinoJson.h>

#include <secrets.h>

#include <MAX3010x.h>

#include "filters.h"
// Using built in LED pin for demo
#define ledPin 2

// device id
const int deviceId = 1;

/******* MQTT Broker Connection Details *******/
const char *mqtt_server = "mqtt.hlofiys.xyz";

// MQTT topics
const char *mqtt_topic_device_status = "device/status";
const char *mqtt_topic_heartbeat_data = "device/data";
const char *mqtt_topic_device_switch = "device/switch/1";

// Device status
bool collecting = false;

// MQTT client
PicoMQTT::Client mqtt("broker.hivemq.com");

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
	Serial.print("Keep Alive ");
	JsonDocument doc;
	doc["id"] = deviceId;
	auto publish = mqtt.begin_publish(mqtt_topic_device_status, measureJson(doc), 1 ,true);
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
	if (!wifiManager.autoConnect("Pulsemeter 1", "12345678"))
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
		if (strcmp(payload, "1") == 0)
		{
			Serial.println("start measure");
			collecting = true; // Turn the Collecting on
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
			sensor.shutdown();
	} });
	mqtt.begin();

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
LowPassFilter low_pass_filter(kLowPassCutoff, kSamplingFrequency);
Differentiator differentiator(kSamplingFrequency);
MovingAverageFilter<kAveragingSamples> averager;

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
	if (collecting && millis() - latestBpmPublish > 50000)
	{
		auto sample = sensor.readSample(1000);
		float current_value = sample.red;

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
			averager.reset();
			low_pass_filter.reset();
			high_pass_filter.reset();

			finger_detected = false;
			finger_timestamp = millis();
		}

		if (finger_detected)
		{
			current_value = low_pass_filter.process(current_value);
			current_value = high_pass_filter.process(current_value);
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
						digitalWrite(ledPin, LOW);
						if (bpm > 50 && bpm < 250)
						{
							// Average?
							if (kEnableAveraging)
							{
								int average_bpm = averager.process(bpm);

								// Show if enough samples have been collected
								if (averager.count() > kSampleThreshold)
								{
									latestBpmPublish = millis();
									Serial.print("Heart Rate (avg, bpm): ");
									Serial.println(average_bpm);
									JsonDocument doc;
									doc["id"] = deviceId;
									doc["bpm"] = average_bpm;
									auto publish = mqtt.begin_publish(mqtt_topic_heartbeat_data, measureJson(doc), 1, true);
									serializeJson(doc, publish);
									publish.send();
								}
							}
							else
							{
								Serial.print("Heart Rate (current, bpm): ");
								Serial.println(bpm);
							}
						}
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