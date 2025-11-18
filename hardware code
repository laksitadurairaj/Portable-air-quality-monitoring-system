#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// ====== WiFi & Server ======
const char* ssid = "laksi";
const char* password = "12345678";
const char* serverUrl = "http://10.40.241.237:3000/upload";  // Your backend upload URL

// ====== Telegram Bot ======
const char* telegramToken = "8320808948:AAEk4_r_ICIGLGfpEzAZs_EuUl_Y2F_eGnM";  // Replace with your token
const char* chatID = "5712507364";  // Replace with your chat ID
WiFiClientSecure client;

// ====== Sensors ======
const int MQ2_PIN = 34;   // Smoke + LPG
const int MQ7_PIN = 35;   // CO
const int MQ135_PIN = 32; // CO2

// ====== LEDs ======
const int RED_LED = 26;
const int GREEN_LED = 27;

// ====== Globals ======
float co_ppm = 0, co2_ppm = 0, lpg_ppm = 0, smoke_ppm = 0;
unsigned long lastSent = 0;
unsigned long lastAlert = 0;
const unsigned long sendInterval = 60000;  // upload every 1 minute
const unsigned long alertInterval = 30000; // alert every 30 seconds if unsafe

// ====== Setup ======
void setup() {
  Serial.begin(115200);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected to WiFi");
    Serial.print("📡 ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
  }

  client.setInsecure(); // Skip SSL certificate verification for Telegram
}

// ====== Read Sensor Values ======
void readSensors() {
  int mq2_value = analogRead(MQ2_PIN);
  int mq7_value = analogRead(MQ7_PIN);
  int mq135_value = analogRead(MQ135_PIN);

  float mq2_voltage = (mq2_value / 4095.0) * 3.3;
  float mq7_voltage = (mq7_value / 4095.0) * 3.3;
  float mq135_voltage = (mq135_value / 4095.0) * 3.3;

  co_ppm = map(mq7_voltage * 1000, 200, 2800, 1, 100);
  co2_ppm = map(mq135_voltage * 1000, 250, 3000, 400, 2000);
  lpg_ppm = map(mq2_voltage * 1000, 200, 3000, 1, 100);
  smoke_ppm = map(mq2_voltage * 1000, 200, 3000, 1, 100);

  co_ppm = constrain(co_ppm, 0, 100);
  co2_ppm = constrain(co2_ppm, 400, 2000);
  lpg_ppm = constrain(lpg_ppm, 0, 100);
  smoke_ppm = constrain(smoke_ppm, 0, 100);

  Serial.printf("📊 CO: %.1f | CO₂: %.1f | LPG: %.1f | Smoke: %.1f\n",
                co_ppm, co2_ppm, lpg_ppm, smoke_ppm);
}

// ====== Unsafe Condition ======
bool isUnsafe() {
  return (co_ppm > 70 || co2_ppm > 1500 || lpg_ppm > 70 || smoke_ppm > 10);
}

// ====== Send Telegram Message ======
void sendTelegram(String message) {
  if (WiFi.status() != WL_CONNECTED) return;

  if (!client.connect("api.telegram.org", 443)) {
    Serial.println("⚠ Telegram connection failed");
    return;
  }

  String url = "/bot" + String(telegramToken) +
               "/sendMessage?chat_id=" + chatID +
               "&text=" + message;
  client.println("GET " + url + " HTTP/1.1");
  client.println("Host: api.telegram.org");
  client.println("Connection: close");
  client.println();
  delay(100);
  Serial.println("📩 Telegram message sent");
}

// ====== Read Telegram Command ======
String readTelegramMessage() {
  if (WiFi.status() != WL_CONNECTED) return "";
  if (!client.connect("api.telegram.org", 443)) return "";

  String url = "/bot" + String(telegramToken) + "/getUpdates";
  client.println("GET " + url + " HTTP/1.1");
  client.println("Host: api.telegram.org");
  client.println("Connection: close");
  client.println();

  String response = "";
  while (client.connected()) {
    String line = client.readStringUntil('\n');
    response += line;
  }

  if (response.indexOf("/Chennai") != -1) {
    return "Chennai";
  }
  return "";
}

// ====== Upload to Backend ======
void uploadToServer() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String jsonData = "{\"location\":\"Chennai\",\"co\":" + String(co_ppm) +
                    ",\"co2\":" + String(co2_ppm) +
                    ",\"smoke\":" + String(smoke_ppm) +
                    ",\"lpg\":" + String(lpg_ppm) + "}";

  int httpResponseCode = http.POST(jsonData);

  if (httpResponseCode > 0) {
    Serial.println("✅ Data sent to server successfully");
  } else {
    Serial.println("❌ Failed to send data to server");
  }

  http.end();
}

// ====== Loop ======
void loop() {
  readSensors();

  // LED Control
  if (isUnsafe()) {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);

    if (millis() - lastAlert > alertInterval) {
      String alert = "🚨 Air Quality Alert! %0A"
                     "CO: " + String(co_ppm) + " ppm%0A"
                     "CO₂: " + String(co2_ppm) + " ppm%0A"
                     "LPG: " + String(lpg_ppm) + " ppm%0A"
                     "Smoke: " + String(smoke_ppm) + " ppm";
      sendTelegram(alert);
      lastAlert = millis();
    }

  } else {
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
  }

  // Upload data every 1 minute
  if (millis() - lastSent > sendInterval) {
    uploadToServer();
    lastSent = millis();
  }

  // Respond to Telegram command
  String cmd = readTelegramMessage();
  if (cmd == "Chennai") {
    String report = "🌇 Chennai Air Quality Report %0A"
                    "CO: " + String(co_ppm) + " ppm%0A"
                    "CO₂: " + String(co2_ppm) + " ppm%0A"
                    "LPG: " + String(lpg_ppm) + " ppm%0A"
                    "Smoke: " + String(smoke_ppm) + " ppm";
    sendTelegram(report);
  }

  delay(2000); // Read sensors every 2 seconds
}
