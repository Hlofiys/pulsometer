#include "Arduino.h"

#include "WiFiManager.h"

#include <PubSubClient.h>

#include <ArduinoJson.h>

#include <secrets.h>

#include <MAX3010x.h>

#include "filters.h"
// Using built in LED pin for demo
#define ledPin 2

// device id
const int deviceId = 2;

/******* MQTT Broker Connection Details *******/
const char *mqtt_server = "home.hlofiys.xyz";
const char *mqtt_clientId = "Client 2";
const int mqtt_port = 1883;

// MQTT topics
const char *mqtt_topic_device_status = "device/status";
const char *mqtt_topic_heartbeat_data = "device/data";
const char *mqtt_topic_device_switch = "device/switch/2";

// Device status
bool collecting = false;

// MQTT client
WiFiClient espClient;
PubSubClient client(espClient);

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

bool tryConnectToMqttServer()
{
	if (strlen(mqtt_username) == 0)
	{
		return client.connect(mqtt_clientId);
	}
	else
	{
		return client.connect(mqtt_clientId, mqtt_username, mqtt_password);
	}
}

void reconnect()
{
	// Loop until we're reconnected
	while (!client.connected())
	{
		Serial.print("Attempting MQTT connection...");
		// Attempt to connect
		// If you do not want to use a username and password, change next line to
		if (tryConnectToMqttServer())
		{
			Serial.println("connected");
			client.subscribe(mqtt_topic_device_switch);
		}
		else
		{
			Serial.print(mqtt_server);
			Serial.print(" failed, rc=");
			Serial.print(client.state());
			Serial.println(" try again in 5 seconds");
			// Wait 5 seconds before retrying
			delay(5000);
		}
	}
}

/**** Method for Publishing MQTT Messages **********/
void publishMessage(const char *topic, String payload, boolean retained)
{
	if (client.publish(topic, payload.c_str(), true))
		Serial.println("Message published [" + String(topic) + "]: " + payload);
}

void publishStatusMessage()
{
	Serial.print("Keep Alive");
	JsonDocument doc;
	doc["id"] = deviceId;
	char mqtt_message[128];
	serializeJson(doc, mqtt_message);
	publishMessage(mqtt_topic_device_status, mqtt_message, true);
}

void handleMqttState()
{
	if (!client.connected())
	{
		reconnect();
	}
	client.loop();
}

/***** Call back Method for Receiving MQTT messages and Switching Status ****/

void callback(char *topic, byte *payload, unsigned int length)
{
	String incommingMessage = "";
	for (int i = 0; (unsigned int)i < length; i++)
		incommingMessage += (char)payload[i];

	Serial.println("Message arrived [" + String(topic) + "]" + incommingMessage);

	//--- check the incomming message
	if (strcmp(topic, mqtt_topic_device_switch) == 0)
	{
		if (incommingMessage.equals("1"))
{
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
			collecting = false; // Turn the Collecting off
sensor.shutdown();
		}
	}
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

	client.setServer(mqtt_server, mqtt_port);
	client.setCallback(callback);

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
	if (!client.connected())
	{
		reconnect();
	}
	client.loop();
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
									char mqtt_message[128];
									serializeJson(doc, mqtt_message);
									publishMessage(mqtt_topic_heartbeat_data, mqtt_message, true);
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