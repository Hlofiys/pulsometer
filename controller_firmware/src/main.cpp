// http://forum.arduino.cc/index.php?topic=209140.30

#include "Arduino.h"

#include "WiFiManager.h"

#include <PubSubClient.h>

#include <ArduinoJson.h>

#include <secrets.h>
// Using built in LED pin for demo
#define ledPin 13

// Pulse meter connected to any Analog pin
#define sensorPin A0

// device id
const int deviceId = 1;

// Values from provided (eBay) code
float alpha = 0.75;
int period = 50;
float maxVal = 0.0;

/******* MQTT Broker Connection Details *******/
const char *mqtt_server = "mqtt.hlofiys.xyz";
const char *mqtt_clientId = "Client" + deviceId;
const int mqtt_port = 8883;

// MQTT topics
const char *mqtt_topic_device_status = "device/status";
const char *mqtt_topic_heartbeat_data = "device/data";
const char *mqtt_topic_device_switch = "device/switch/" + deviceId;

// Device status
bool collecting = false;

// MQTT client
WiFiClient espClient;
PubSubClient client(espClient);

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
		Serial.println("Message publised [" + String(topic) + "]: " + payload);
}

void publishStatusMessage()
{
	Serial.print("Keep Alive");
	publishMessage(mqtt_topic_device_status, String(deviceId).c_str(), true);
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
			collecting = true; // Turn the Collecting on
		else
			collecting = false; // Turn the Collecting off
	}
}

// ------------------------------------------------------------
// SETUP      SETUP      SETUP      SETUP      SETUP      SETUP
// ------------------------------------------------------------
void setup()
{
	WiFiManager wifiManager;
	if (!wifiManager.autoConnect("Pulsemeter 1", "123123"))
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

	// Debugging window (easy to write data to LCD 16x2)
	Serial.begin(9600);
	Serial.println("Pulse rate detection started.");
}

// ------------------------------------------------------------
// LOOP     LOOP     LOOP     LOOP     LOOP     LOOP     LOOP
// ------------------------------------------------------------
void loop()
{
	handleMqttState();
	if (collecting)
	{

		// Arbitrary initial value for the sensor value (0 - 1023)
		// too large and it takes a few seconds to 'lock on' to pulse
		static float oldValue = 500;

		// Time recording for BPM (beats per minute)
		static unsigned long bpmMills = millis();
		static int bpm = 0;

		// Keep track of when we had the the last pulse - ignore
		// further pulses if too soon (probably false reading)
		static unsigned long timeBetweenBeats = millis();
		int minDelayBetweenBeats = 400;

		// This is generic code provided with the board:
		// Read the sensor value (0 - 1023)
		int rawValue = analogRead((unsigned char)sensorPin);

		// Some maths (USA: math) to determine whether we are detected a peak (pulse)
		float value = alpha * oldValue + (1 - alpha) * rawValue;
		float change = value - oldValue;
		oldValue = value;

		// Forum suggested improvement (works very well)
		// Display data on the LED via a blip:
		// Empirically, if we detect a peak as being X% from
		// absolute max, we find the pulse even when amplitude
		// varies on the low side.

		// if we find a new maximum value AND we haven't had a pulse lately
		if ((change >= maxVal) && (millis() > timeBetweenBeats + minDelayBetweenBeats))
		{

			// Reset max every time we find a new peak
			maxVal = change;

			// Flash LED and beep the buzzer
			digitalWrite(ledPin, 1);

			// Reset the heart beat time values
			timeBetweenBeats = millis();
			bpm++;
		}
		else
		{
			// No pulse detected, ensure LED is off (may be off already)
			digitalWrite(ledPin, 0);
		}
		// Slowly decay max for when sensor is moved around
		// but decay must be slower than time needed to hit
		// next pulse peak. Originally: 0.98
		maxVal = maxVal * 0.97;

		// Every 15 seconds extrapolate the pulse rate. Improvement would
		// be to average out BPM over last 60 seconds
		if (millis() >= bpmMills + 15000)
		{
			Serial.print("BPM (approx): ");
			Serial.println(bpm * 4);
			JsonDocument doc;
			doc["deviceId"] = deviceId;
			doc["bpm"] = bpm * 4;

			char mqtt_message[128];
			serializeJson(doc, mqtt_message);

			publishMessage(mqtt_topic_heartbeat_data, mqtt_message, true);
			bpm = 0;
			bpmMills = millis();
		}

		// Must delay here to give the value a chance to decay
		delay(period);
	}
	else
	{
		publishStatusMessage();
	}
	delay(500);
}