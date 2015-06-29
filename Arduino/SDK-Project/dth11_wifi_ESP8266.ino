#include "DHT.h"                                                   // include DHT lib for humidity and temperature sensor
#include "LiquidCrystal.h"                                         // include LCD lib for 1602 LCD diplay	
#include "SoftwareSerial.h"					   // include	Software Serial lib for ESP8266 

#define DHTPIN 7                                                   // DHT11 pin
#define DHTTYPE DHT11                                              // DHT 11 

LiquidCrystal lcd(12, 11, 10, 5, 4, 3, 2);                         //lcd pins
SoftwareSerial esp8266(8, 9);                                      //esp pins

int photocellPin = 0;                                              // the cell and 10K pulldown are connected to a0
int photocellReading;                                              // the analog reading froe sensor divider

int dropDataCounter = 0;                                           // data sender counter

int led = 13;                                                      // build-in led 

DHT dht(DHTPIN, DHTTYPE);                                          // init DHT 11

//======================Configure 
String backendServerIP = "89.108.88.202";                            // backend serer IP rzrbld.ru
String backendServerPort = "3000";                                  // backend server PORT
String wifiSSID = "myWiFi";                                         // WiFi SSID name
String wifiPassword = "thelongestwifipasswordontheearth";                                       // WiFi password
String arduinoUUID = "d4e4016e-63a4-4f65-812a-37d8a8011a09";        // WARN! generate new before upload to arduino


//======================Setup
void setup() {
  Serial.begin(9600);                                   // HW serial Arduino <> computer
  esp8266.begin(9600);                                  // SW serial Arduino <> ESP8266, more speed more unstable. 9600 is quite enough
  pinMode(led, OUTPUT);
  dht.begin();                                          // start humidity sensor
  lcd.begin(16, 2);                                     // start lcd screen
  updateLoadingScreen(1, "[i] start v0.1  ", "[INFO] start v0.1");    
  digitalWrite(led, LOW);                               // turn off builtin arduino led

  esp8266.println("AT+RST");                            // reset ESP8266 module
  delay(1000);                                          // wait till ESP8266 is up
  if (esp8266.find("ready")) {                          // if ESP8266 up and ready
    updateLoadingScreen(2, "[i] ESP is up  ", "[INFO] ESP8266 is up");
  }
  else                                                  // if ESP8266 is down
  {
    updateLoadingScreen(2, "[E] ESP is NA  ", "[ERROR] ESP8266 no response.");
    while (1);						// halt
  }
  delay(500);                                           // wait more
                                                        // connect to the wifi
  boolean connected = false;				// satate 
  for (int i = 0; i < 5; i++)                           // try 5 times to connect
  {
    if (connectWiFi()) {				// if connected
      connected = true;                                 // set state = true
      updateLoadingScreen(3, "[i] WiFi cncted ", "[INFO] WiFi connected.");
      break;						// break 
    }
  }
  if (!connected) {					// if still not connected
    updateLoadingScreen(3, "[E] WiFi cnct NA", "[ERROR] WiFi can't connect.");
    while (1);                                          // hang
  }
  delay(5000);						// wait 5 sec
  updateLoadingScreen(4, "[i] Obtain IP   ", "[INFO] Obtain IP address.");
  
  esp8266.println("AT+CIFSR");				// try to get IP value. not critical. [WIP] 
  Serial.println(esp8266.read());
  																
  esp8266.println("AT+CIPMUX=0");			// set the single connection mode
  updateLoadingScreen(5, "[i] CIPMUX:0    ", "[INFO] Set CIPMUX:0.");
  delay(1000);						// wait a sec
  esp8266.println("AT+CIPMODE=0");			// set "not data mode" duplex mode (get/send data)
  updateLoadingScreen(6, "[i] CIPMODE:0   ", "[INFO] Set CIPMODE:0.");
  delay(1000);						// wait a sec	
  updateLoadingScreen(7, "[i] Post init   ", "[INFO] Post init");
  delay(1000);						// wait a sec	
}

void loop() {
  
  lcd.clear();
  photocellReading = analogRead(photocellPin);          //read photocell data

 																																		// Reading temperature or humidity takes about 250 milliseconds!
  																																  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  int h = dht.readHumidity();				// Read humidity
  int t = dht.readTemperature();			// Read temperature as Celsius

  																																	// Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    lcd.setCursor(0, 0);
    Serial.println("Failed to read from DHT sensor!");
    lcd.print("Failed to read from DHT sensor!");
    return;
  }


  lcd.setCursor(0, 0);     																					// set lcd cursor to 0,0 upper string, first element on left side
  lcd.print("T:");																									// T: for Temperature
  lcd.print(t);        																							// temp value from DHT 11
  lcd.print((char)223);																							// graduses sign
  lcd.print("C ");																									// C for Celsius
  lcd.print("H:");																									// H: for Humidity
  lcd.print(h);																											// humidity value from DHT11
  lcd.print("%");																										// percent sign

  lcd.setCursor(0, 1);     																					// set lcd cursor to 0,1 bottom string, first element on left side
  lcd.print("L:");         																					// L: for Light sensor\photo sensor
  lcd.print(photocellReading);         	                // photo sensor value

  delay(100);   																										// wait 100ms
  if(dropDataCounter>20){																					// On backend server sends every 100 values. Ajust delay or if statement for more result or less
    dropDataCounter = 0;																						// Set data counter is 0
    String cmd = "AT+CIPSTART=\"TCP\",\"";		// start bulding connection to backend server
    cmd += backendServerIP;																					// IP address of backend server
    cmd += "\",";
    cmd += backendServerPort;																								// backend server PORT
    esp8266.println(cmd);																						// send connection command to ESP8266 
    Serial.println(cmd);																						// serial debug out 
    if (esp8266.find("Error")) {			// error connection
      return;																												// return;
    }																																	
    cmd = "POST /data/";   																							// building POST request
    cmd += arduinoUUID;
    cmd += "/t/";
    cmd += t;																												// --
    cmd += "/h/";																										// --
    cmd += h;																												// --
    cmd += "/l/";																										// --		
    cmd += photocellReading;			         // --			
    cmd += " HTTP/1.0\r\nHost: test.iot.domain\r\nConnection: close\r\n\r\n";
    esp8266.print("AT+CIPSEND=");			// send sending command to ESP8266
    esp8266.println(cmd.length());			// calculate length of the POST request
    if (esp8266.find(">"))																					// send mode success
    {
      Serial.print("[INFO] Send mode engaged");
    } else																													// send mode error
    {
      esp8266.println("AT+CIPCLOSE");			// close connection
      Serial.println("[WARN] Connect timeout. Wait 15 sec");// serial debug out 
      delay(15000);																									// wait 15 sec
      return;																												// return
    }
    esp8266.print(cmd);																							// finaly send data to backend server	
    Serial.print(cmd);																							// serial debug out 
    delay(2000);																										// wait 2 sec			

    while (esp8266.available())				// read answer
    {
      char c = esp8266.read();				// --
    }
  }
  delay(500);																												// wait 500 ms
  dropDataCounter++;																								// increase data counter
}

boolean connectWiFi()																								// wifi connection function
{																																		
  esp8266.println("AT+CWMODE=1");		        // set ESP8266 to STA mode: 1 = WiFi client, 2 = Soft AP (router), 3 = both.
  String cmd = "AT+CWJAP=\"";				// build connection string
  cmd += wifiSSID;																										// wifi network SSID, hidden supported
  cmd += "\",\"";																										// --
  cmd += wifiPassword;																							// wifi password
  cmd += "\"";			
  Serial.println(cmd);																								// --
  Serial.println("[INFO] Connecting to wifi network");	// serial debug out 
  esp8266.println(cmd);																							// send connection commant to ESP8266
  delay(5000);																											// connection established in 1-5 secs
  if (esp8266.find("OK"))																						// if connection success
  {
    Serial.println("[INFO] Connected to WiFi.");        // serial debug out 
    return true;																										// return true
  } else
  {
    Serial.println("[ERROR] Can not connect to the WiFi.");	 // serial debug out 
    return false;																										// return false
  }
}

void updateLoadingScreen(int postition, String message, String debugLog)
{
  Serial.println(debugLog);                 // Serial debug print log
  lcd.print(">");                           // print loading screen
  lcd.setCursor(0, 1);                      // --
  lcd.print(message);                       // --
  lcd.setCursor(postition, 0);              // --
}
