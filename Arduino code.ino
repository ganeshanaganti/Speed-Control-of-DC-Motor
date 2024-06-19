#include <SoftwareSerial.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define RX_PIN 2  // TX of esp8266 connected with Arduino pin 2
#define TX_PIN 3  // RX of esp8266 connected with Arduino pin 3
LiquidCrystal_I2C lcd(0x27, 16, 2);

#define POTENTIOMETER_PIN  A0  // 10k Variable Resistor
#define BUTTON_CLOCKWISE A1 // Clockwise Button
#define BUTTON_STOP A2 // Stop Button
#define BUTTON_ANTICLOCKWISE A3 // Anticlockwise Button

#define MOTOR_ENA_PIN 11 // Enable1 L298 for PWM
#define MOTOR_IN1_PIN 10 // In1 L298 for Clockwise
#define MOTOR_IN2_PIN 9  // In2 L298 for Anticlockwise

int adcValue = 0;
int pwmDutyCycle;
int lcdDutyCycle;
int motorState = 0;

String WIFI_SSID = "Kanna";   // WIFI NAME
String WIFI_PASS = "kannakannu";    // WIFI PASSWORD
String API = "0IJ2EVDNU3KVHOFE";  // Write API KEY
String HOST = "api.thingspeak.com";
String PORT = "80";
int countTrueCommand;
int countTimeCommand;
boolean found = false;
SoftwareSerial esp8266(RX_PIN, TX_PIN);


void setup(){
  Serial.begin(9600);

  pinMode(POTENTIOMETER_PIN, INPUT);
  pinMode(BUTTON_CLOCKWISE, INPUT_PULLUP);
  pinMode(BUTTON_STOP, INPUT_PULLUP);
  pinMode(BUTTON_ANTICLOCKWISE, INPUT_PULLUP);
  pinMode(MOTOR_ENA_PIN, OUTPUT);
  pinMode(MOTOR_IN1_PIN, OUTPUT);
  pinMode(MOTOR_IN2_PIN, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.print(" JAI SHREE RAM");
  Serial.begin(115200);
  esp8266.begin(115200);
  lcd.setCursor(0, 1);
  lcd.print("SPEED CONTROL OF DC MOTOR");
  sendCommand("AT", 5, "OK");
  sendCommand("AT+CWMODE=1", 5, "OK");
  sendCommand("AT+CWJAP=\"" + WIFI_SSID + "\",\"" + WIFI_PASS + "\"", 20, "OK");
  lcd.clear();
  lcd.print("Connecting to");
  lcd.setCursor(0, 1);
  lcd.print("WiFi: ");
  lcd.print(WIFI_SSID);
  delay(3000);
}

void loop(){ 
    adcValue = analogRead(POTENTIOMETER_PIN);
    pwmDutyCycle = map(adcValue, 0, 1023, 0, 255);  
    lcdDutyCycle = map(adcValue, 0, 1023, 0, 100); 

    analogWrite(MOTOR_ENA_PIN, pwmDutyCycle);
    Serial.println(pwmDutyCycle);
    lcd.setCursor(0, 0);
    lcd.print("Duty Cycle: ");
    lcd.print(lcdDutyCycle); 
    lcd.print("%  ");

    if(digitalRead(BUTTON_CLOCKWISE) == 0){ motorState = 1; }
    if(digitalRead(BUTTON_STOP) == 0){ motorState = 0; }
    if(digitalRead(BUTTON_ANTICLOCKWISE) == 0){ motorState = 2; }

    lcd.setCursor(0, 1);

    if(motorState == 0){ 
        lcd.print("      Stop      ");
        digitalWrite(MOTOR_IN1_PIN, LOW);  
        digitalWrite(MOTOR_IN2_PIN, LOW);
    }

    if(motorState == 1){ 
        lcd.print("    Clockwise   ");
        digitalWrite(MOTOR_IN1_PIN, HIGH);  
        digitalWrite(MOTOR_IN2_PIN, LOW);
    }

    if(motorState == 2){ 
        lcd.print(" Anticlockwise  ");
        digitalWrite(MOTOR_IN1_PIN, LOW);  
        digitalWrite(MOTOR_IN2_PIN, HIGH);
    }
      //To send the data to server
  String getData = "GET /update?api_key=" + API + "&field1=" + lcdDutyCycle + "&field2=" + motorState;
  sendCommand("AT+CIPMUX=1", 5, "OK");
  sendCommand("AT+CIPSTART=0,\"TCP\",\"" + HOST + "\"," + PORT, 15, "OK");
  sendCommand("AT+CIPSEND=0," + String(getData.length() + 4), 4, ">");
  esp8266.println(getData);
  delay(1500);
  countTrueCommand++;
  sendCommand("AT+CIPCLOSE=0", 5, "OK");
  delay(3000);
}
void sendCommand(String command, int maxTime, char readReplay[]) {
  Serial.print(countTrueCommand);
  Serial.print(". at command => ");
  Serial.print(command);
  Serial.print(" ");
  while (countTimeCommand < (maxTime * 1)) {
    esp8266.println(command);      //at+cipsend
    if (esp8266.find(readReplay))  //ok
    {
      found = true;
      break;
    }
    countTimeCommand++;
  }
  if (found == true) {
    Serial.println("OK");
    countTrueCommand++;
    countTimeCommand = 0;
  }
  if (found == false) {
    Serial.println("Fail");
    countTrueCommand = 0;
    countTimeCommand = 0;
  }
  found = false;
}
