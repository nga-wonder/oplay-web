#include <Adafruit_NeoPixel.h>

// Neopixel configuration
#define NEOPIXEL_PIN 45
#define NUM_PIXELS 48 // Match the 48 sensors
Adafruit_NeoPixel pixels(NUM_PIXELS, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);

// Multiplexer pins
#define MUX_S0 23
#define MUX_S1 25
#define MUX_S2 29
#define MUX_S3 33
#define MUX_SIG_1 A0
#define MUX_SIG_2 A1
#define MUX_SIG_3 A4
#define MUX_SIG_4 A5

#define NUM_SENSORS_PER_MUX 12
#define NUM_MUX 4
#define TOTAL_SENSORS (NUM_SENSORS_PER_MUX * NUM_MUX) // 48

// Color definitions
uint32_t COLOR_MAGNET = pixels.Color(255, 255, 255); // Default: White for pieces
#define COLOR_QUEST pixels.Color(255, 0, 0)         // Red for questcard positions
#define COLOR_OFF pixels.Color(0, 0, 0)             // Off for empty non-questcard positions

// Timing configuration
#define HOLD_TIME 1000 // Time to hold a piece to confirm detection (ms)

// Sensor states and timing
bool lastState[TOTAL_SENSORS] = {false};
unsigned long detectTime[TOTAL_SENSORS] = {0};
bool sentSerial[TOTAL_SENSORS] = {false};

// Questcard positions
bool isQuestCard[TOTAL_SENSORS] = {false};

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  while (!Serial) {
    ; // Wait for serial port to connect (needed for Mega)
  }
  Serial.println("Arduino initialized");

  // Initialize Neopixels
  pixels.begin();
  pixels.setBrightness(10); // Normal brightness
  pixels.clear();
  pixels.show();

  // Initialize multiplexer pins
  pinMode(MUX_S0, OUTPUT);
  pinMode(MUX_S1, OUTPUT);
  pinMode(MUX_S2, OUTPUT);
  pinMode(MUX_S3, OUTPUT);

  // Initialize sensor input pins with pull-up resistors
  pinMode(MUX_SIG_1, INPUT_PULLUP);
  pinMode(MUX_SIG_2, INPUT_PULLUP);
  pinMode(MUX_SIG_3, INPUT_PULLUP);
  pinMode(MUX_SIG_4, INPUT_PULLUP);
}

// Function to convert HSV to RGB for rainbow effect
uint32_t hsvToRgb(uint16_t hue, uint8_t saturation, uint8_t value) {
  uint8_t r, g, b;
  uint16_t h = hue % 360;
  uint8_t region = h / 60;
  uint8_t remainder = (h - (region * 60)) * 255 / 60;
  uint8_t p = (value * (255 - saturation)) >> 8;
  uint8_t q = (value * (255 - ((saturation * remainder) >> 8))) >> 8;
  uint8_t t = (value * (255 - ((saturation * (255 - remainder)) >> 8))) >> 8;

  switch (region) {
    case 0: r = value; g = t; b = p; break;
    case 1: r = q; g = value; b = p; break;
    case 2: r = p; g = value; b = t; break;
    case 3: r = p; g = q; b = value; break;
    case 4: r = t; g = p; b = value; break;
    default: r = value; g = p; b = q; break;
  }
  return pixels.Color(r, g, b);
}

// Rainbow wave effect
void rainbowWaveEffect() {
  const int waveDuration = 3000; // 3 seconds for wave
  const int fadeDuration = 1000; // 1 second for fade out
  const int pixelsPerStep = 4; // Number of pixels to light up per step
  const int steps = NUM_PIXELS / pixelsPerStep + (NUM_PIXELS % pixelsPerStep ? 1 : 0);
  const int delayPerStep = waveDuration / steps;

  // Set higher brightness for effect
  pixels.setBrightness(20);
  
  // Rainbow wave
  for (int step = 0; step < steps; step++) {
    pixels.clear();
    for (int i = 0; i < pixelsPerStep; i++) {
      int pixel = step * pixelsPerStep + i;
      if (pixel < NUM_PIXELS) {
        uint16_t hue = (pixel * 360 / NUM_PIXELS + (step * 30)) % 360; // Shift hue for rainbow
        pixels.setPixelColor(pixel, hsvToRgb(hue, 255, 255));
      }
    }
    pixels.show();
    delay(delayPerStep);
  }

  // Fade out
  for (int brightness = 255; brightness >= 0; brightness -= 5) {
    for (int i = 0; i < NUM_PIXELS; i++) {
      uint16_t hue = (i * 360 / NUM_PIXELS) % 360;
      uint32_t color = hsvToRgb(hue, 255, brightness);
      pixels.setPixelColor(i, color);
    }
    pixels.show();
    delay(fadeDuration / 51); // 51 steps (255/5)
  }

  // Restore normal brightness and clear
  pixels.setBrightness(10);
  pixels.clear();
  pixels.show();
}

void setMuxChannel(int channel) {
  digitalWrite(MUX_S0, bitRead(channel, 0));
  digitalWrite(MUX_S1, bitRead(channel, 1));
  digitalWrite(MUX_S2, bitRead(channel, 2));
  digitalWrite(MUX_S3, bitRead(channel, 3));
}

bool readSensorStable(int mux, int channel, int readings = 3) {
  int pin;
  switch (mux) {
    case 0: pin = MUX_SIG_1; break;
    case 1: pin = MUX_SIG_2; break;
    case 2: pin = MUX_SIG_3; break;
    case 3: pin = MUX_SIG_4; break;
    default: return false;
  }

  // Take multiple readings for stability
  for (int i = 0; i < readings; i++) {
    setMuxChannel(channel);
    if (digitalRead(pin) != LOW) {
      return false; // Sensor not triggered
    }
    delay(5); // Small delay between readings
  }
  return true; // Sensor triggered
}

void loop() {
  unsigned long currentTime = millis();

  // Handle incoming serial data
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command.length() > 0) {
      Serial.print("Received command: ");
      Serial.println(command);
      if (command.startsWith("QUEST:")) {
        processQuestCommand(command);
      } else if (command.startsWith("COLOR:")) {
        processColorCommand(command);
      } else if (command == "INIT_EFFECT") {
        processInitEffectCommand();
      } else {
        Serial.println("Unknown command");
      }
    }
  }

  // Read sensors
  for (int mux = 0; mux < NUM_MUX; mux++) {
    for (int channel = 0; channel < NUM_SENSORS_PER_MUX; channel++) {
      int sensorIndex = (mux * NUM_SENSORS_PER_MUX) + channel;
      bool isMagnetDetected = readSensorStable(mux, channel);

      // State transition handling
      if (isMagnetDetected && !lastState[sensorIndex]) {
        // Piece placed
        detectTime[sensorIndex] = currentTime;
        sentSerial[sensorIndex] = false;
      } else if (!isMagnetDetected && lastState[sensorIndex]) {
        // Piece removed
        detectTime[sensorIndex] = 0;
        sentSerial[sensorIndex] = false;
      } else if (isMagnetDetected && !sentSerial[sensorIndex]) {
        // Piece held long enough
        if (currentTime - detectTime[sensorIndex] >= HOLD_TIME) {
          Serial.println(sensorIndex); // Send 0-based sensor ID
          Serial.print("Sent sensor ID: ");
          Serial.println(sensorIndex);
          sentSerial[sensorIndex] = true;
        }
      }

      lastState[sensorIndex] = isMagnetDetected;
    }
  }

  // Update LED colors
  for (int i = 0; i < TOTAL_SENSORS; i++) {
    if (lastState[i]) {
      pixels.setPixelColor(i, COLOR_MAGNET); // Piece present: custom color
    } else if (isQuestCard[i]) {
      pixels.setPixelColor(i, COLOR_QUEST);  // Empty questcard: red
    } else {
      pixels.setPixelColor(i, COLOR_OFF);    // Empty non-questcard: off
    }
  }
  pixels.show();

  // Small delay to prevent overwhelming the serial buffer
  delay(10);
}

void processQuestCommand(String command) {
  Serial.println("Processing QUEST command");
  String positionsStr = command.substring(6); // After "QUEST:"
  Serial.print("Positions string: ");
  Serial.println(positionsStr);

  // Reset questcard positions
  memset(isQuestCard, false, sizeof(isQuestCard));

  // Parse comma-separated positions
  int start = 0;
  int comma = positionsStr.indexOf(',');
  while (comma != -1) {
    String posStr = positionsStr.substring(start, comma);
    posStr.trim(); // Remove any whitespace
    int pos = posStr.toInt() - 1; // Convert 1-based to 0-based
    if (pos >= 0 && pos < TOTAL_SENSORS && posStr.length() > 0) {
      isQuestCard[pos] = true;
      Serial.print("Set questcard position: ");
      Serial.println(pos);
    } else {
      Serial.print("Invalid position: ");
      Serial.println(posStr);
    }
    start = comma + 1;
    comma = positionsStr.indexOf(',', start);
  }

  // Parse last position
  String posStr = positionsStr.substring(start);
  posStr.trim(); // Remove any whitespace
  int pos = posStr.toInt() - 1; // Convert 1-based to 0-based
  if (pos >= 0 && pos < TOTAL_SENSORS && posStr.length() > 0) {
    isQuestCard[pos] = true;
    Serial.print("Set questcard position: ");
    Serial.println(pos);
  } else {
    Serial.print("Invalid last position: ");
    Serial.println(posStr);
  }
}

void processColorCommand(String command) {
  Serial.println("Processing COLOR command");
  String colorStr = command.substring(6); // After "COLOR:"
  Serial.print("Color string: ");
  Serial.println(colorStr);

  // Parse RGB values
  int r, g, b;
  int firstComma = colorStr.indexOf(',');
  int secondComma = colorStr.indexOf(',', firstComma + 1);
  if (firstComma != -1 && secondComma != -1) {
    String rStr = colorStr.substring(0, firstComma);
    String gStr = colorStr.substring(firstComma + 1, secondComma);
    String bStr = colorStr.substring(secondComma + 1);
    rStr.trim();
    gStr.trim();
    bStr.trim();
    r = rStr.toInt();
    g = gStr.toInt();
    b = bStr.toInt();
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && rStr.length() > 0 && gStr.length() > 0 && bStr.length() > 0) {
      COLOR_MAGNET = pixels.Color(r, g, b);
      Serial.print("Updated COLOR_MAGNET to: R=");
      Serial.print(r);
      Serial.print(", G=");
      Serial.print(g);
      Serial.print(", B=");
      Serial.println(b);
    } else {
      Serial.println("Invalid RGB values");
    }
  } else {
    Serial.println("Invalid COLOR format");
  }
}

void processInitEffectCommand() {
  Serial.println("Processing INIT_EFFECT command");
  rainbowWaveEffect();
  Serial.println("EFFECT_DONE");
}