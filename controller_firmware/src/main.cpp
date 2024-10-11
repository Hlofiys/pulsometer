#include "Arduino.h"

#include "WiFiManager.h"

#include <PubSubClient.h>

#include <ArduinoJson.h>

#include <secrets.h>

#include "MAX30105.h"

#include "heartRate.h"

#include <Wire.h>
// Using built in LED pin for demo
#define ledPin 2

// Pulse meter connected to any Analog pin
#define sensorPin A0
const byte RATE_SIZE = 4; // Increase this for more averaging. 4 is good.
byte rates[RATE_SIZE];	  // Array of heart rates
byte rateSpot = 0;
long lastBeat = 0; // Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;

// device id
const int deviceId = 1;

int period = 20;

/******* MQTT Broker Connection Details *******/
const char *mqtt_server = "home.hlofiys.xyz";
const char *mqtt_clientId = "Client" + deviceId;
const int mqtt_port = 1883;

// MQTT topics
const char *mqtt_topic_device_status = "device/status";
const char *mqtt_topic_heartbeat_data = "device/data";
const char *mqtt_topic_device_switch = "device/switch/1";

// Device status
bool collecting = false;

// MQTT client
WiFiClient espClient;
PubSubClient client(espClient);

MAX30105 particleSensor;

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
			collecting = true; // Turn the Collecting on
		else
			collecting = false; // Turn the Collecting off
	}
}

void Heart_Beat()
{
	long irValue = particleSensor.getIR();
	if (checkForBeat(irValue) == true)
	{
		long delta = millis() - lastBeat;
		lastBeat = millis();
		beatsPerMinute = 60 / (delta / 1000.0);
		if (beatsPerMinute < 255 && beatsPerMinute > 20)
		{
			rates[rateSpot++] = (byte)beatsPerMinute;
			rateSpot %= RATE_SIZE;
			beatAvg = 0;
			for (byte x = 0; x < RATE_SIZE; x++)
				beatAvg += rates[x];
			beatAvg /= RATE_SIZE;
		}
	}

	if (irValue < 50000)
	{
		beatsPerMinute = 0;
		beatAvg = 0;
	}
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

	client.setServer(mqtt_server, mqtt_port);
	client.setCallback(callback);

	// Inbuilt LED
	pinMode(ledPin, OUTPUT);
	// Initialize sensor

	if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) // Use default I2C port, 400kHz speed
	{
		Serial.println("MAX30102 was not found. Please check wiring/power. ");
		while (1)
			;
	}
	Serial.println("Place your index finger on the sensor with steady pressure.");

	particleSensor.setup();					   // Configure sensor with default settings
	particleSensor.setPulseAmplitudeRed(0x0A); // Turn Red LED to low to indicate sensor is running
	particleSensor.setPulseAmplitudeGreen(0);  // Turn off Green LED
}

// ------------------------------------------------------------
// LOOP     LOOP     LOOP     LOOP     LOOP     LOOP     LOOP
// ------------------------------------------------------------
void loop()
{
	if (!client.connected())
	{
		reconnect();
	}
	delay(30);
	client.loop();
	if (collecting)
	{
		for (int i = 0; i < 500; i++)
			Heart_Beat();
		Serial.print("BPM=");
		Serial.print(beatsPerMinute);
		Serial.print(", Avg BPM=");
		Serial.println(beatAvg);

		JsonDocument doc;
		doc["id"] = deviceId;
		doc["bpm"] = beatsPerMinute;
		char mqtt_message[128];
		serializeJson(doc, mqtt_message);
		publishMessage(mqtt_topic_heartbeat_data, mqtt_message, true);
		delay(2500);
	}
	else
	{
		publishStatusMessage();
		delay(2500);
	}
}