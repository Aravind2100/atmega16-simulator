# ⚡ ATmega16 Microcontroller Simulator & Circuit Learning Lab

An interactive, educational simulator for the **Microchip/Atmel ATmega16** 8-bit AVR microcontroller. Built for students, engineers, and hobbyists learning embedded systems, C programming, and assembly language.

---

## 🌟 Key Features

### 🖥️ Two-Panel Layout
- **Left Side Panel (Coding & Architecture)**:
  - **Syntax-Highlighted Code Editor**: Write in **AVR C (GCC)** or **AVR Assembly (`.asm`)**.
  - **One-Click "Compile & Flash"**: Generates genuine Intel HEX and disassembles instructions in milliseconds using the official GNU `avr-gcc` toolchain.
  - **Built-in Client-Side Assembler**: Instant, zero-latency browser assembler supporting AVR mnemonics, labels, expressions, and directives.
  - **Register & Memory Inspector**:
    - Real-time view of all 32 Working Registers (`R0`–`R31`) with change highlighting.
    - All 8 **SREG Flags** (`I`, `T`, `H`, `S`, `V`, `N`, `Z`, `C`) with status LEDs.
    - Port direction & output registers: `PORTA`/`DDRA`/`PINA` through `PORTD`/`DDRD`/`PIND`.
    - Program Counter (`PC`), Stack Pointer (`SP`), CPU cycle counter, and simulated time.
  - **Disassembly View**: Shows exact byte addresses and opcodes, with a live pointer highlighting the executing instruction.
  - **Single-Step Debugging**: Step instruction-by-instruction to trace program flow.

### 🔌 Right Side Panel (Interactive Circuit & Breadboard)
- **Visual ATmega16 DIP-40 Chip**:
  - Realistic 40-pin package with notch, pin numbers, port bit labels, and alternate functions (`ADC`, `INT`, `PWM`, `USART`).
  - Active LED indicators on every pin showing electrical state:
    - 🟢 **HIGH (+5V)**
    - 🟡 **Input with Pull-Up Enabled** (`PU` amber badge, ~30kΩ to 5V)
    - 🔵 **Floating Input** (`FLT` badge, high impedance Hi-Z)
    - ⚪ **LOW (0V / GND)**
- **Interactive Component Library**:
  - **4x4 Matrix Membrane Keypad**: 16 tactile keys (0-9, A-D, *, #) with 8 terminals (R1-R4, C1-C4) and multi-pass matrix scanning.
  - **16x2 Character LCD Display (HD44780)**: Supports both **8-Bit Mode** (D0-D7 single-cycle write) and **4-Bit Mode** (D4-D7 dual-nibble) with live bus mode indicator.
  - **8-Bit Digital LED Display**: 8 circular LEDs (Bit 7 to Bit 0) with live hexadecimal (`0x00`-`0xFF`), decimal (`0`-`255`), and binary telemetry.
  - **Latching Press Switch**: Industrial toggle push-switch with locking ON/OFF contacts and neon green indicator.
  - **LM35 Precision Centigrade Temperature Sensor**: TO-92 package with interactive temperature slider (`0°C` to `100°C`), live voltage readout (`10 mV/°C`), and direct ADC connectivity.
  - **DC Motor**: Animated rotating fan blades with RPM gauge and direction indicator (CW/CCW), driven by Fast PWM on `PB3 (OC0)` or `PD5 (OC1A)`.
  - **4-Phase Stepper Motor**: 28BYJ-48 / NEMA style motor with rotating dial needle (`0°` to `360°`), step counter, and 4 phase indicator LEDs (`Coil 1, 2, 3, 4`).
  - **10-bit ADC System**: Full 8-channel conversion (`ADC0`–`ADC7` on `PA0`–`PA7`), supporting **AVCC (5V)** and the famous ATmega16 **Internal 2.56V Reference**.
  - **Single LEDs** (Red, Green, Blue, Yellow, Amber) with radial bloom glow.
  - **Tactile Push Buttons** (clickable, active-low pull-up support).
  - **7-Segment Display** (common-cathode 0–9 digit rendering).
  - **Analog Potentiometer**: 0–5V rotary dial feeding into ADC pins.
  - **Piezo Buzzer**: Generates real acoustic sound in the browser using the Web Audio API.
  - **Power Rails**: `+5V (VCC)` and `GND (0V)`.

---

## 📚 17 Curated Interactive Learning Lessons

1. **LED Blinker (PA0)**: Learn `DDRA` and `PORTA` pin toggling.
2. **Knight Rider 8-LED Scanner**: 8-bit port manipulation and bit shifts on `PORTA`.
3. **Push Button with Internal Pull-Up**: Reading `PINB` with active-low button logic.
4. **7-Segment Display Counter**: Driving a common-cathode display 0–9 on `PORTC`.
5. **Traffic Light Controller**: Timed Red, Yellow, Green cycle on `PORTD`.
6. **Analog Potentiometer & ADC**: Reading 10-bit analog voltage on `PA0` to control LED bar graph.
7. **16x2 Character LCD**: Sending commands and strings to an HD44780 LCD in 4-bit mode.
8. **Piezo Buzzer Tone Synthesis**: Producing audible pitch frequencies on `PD5`.
9. **Hardware Interrupt (INT0)**: Asynchronous event handling via `ISR(INT0_vect)` on `PD2`.
10. **AVR Assembly Masterclass**: Step-by-step assembly tutorial (`LDI`, `OUT`, `IN`, `SBI`, `CBI`, `RJMP`, `BRNE`).
11. **LM35 Temperature Sensor & ADC**: Thermometer reading analog voltage using internal 2.56V reference.
12. **DC Motor Speed Control (PWM)**: Pulse Width Modulation on `PB3 (OC0)` mapped to potentiometer.
13. **Stepper Motor 4-Phase Sequencer**: Full-step wave drive sequencer rotating shaft needle 360°.
14. **Press Switch (Latching Input)**: Reading an industrial latching push switch on `PB0`.
15. **Internal Pull-Up Resistors (`PORTA = 0xF0`)**: Real hardware pull-up logic preventing floating CMOS input pins.
16. **4x4 Keypad + 16x2 LCD (4-bit) + LED**: Matrix keypad scanning writing pressed keys to LCD and lighting active LED.
17. **16x2 LCD in 8-Bit Mode + 8-Bit LED Bus**: Native 8-bit parallel bus (`PORTA = byte`) and live 8-bit LED counter.

---

## ☁️ Deploying to Vercel

This project is fully prepared for one-click deployment on [Vercel](https://vercel.com):

1. **Push this Git repository to GitHub**:
   ```bash
   git remote add origin https://github.com/your-username/atmega16-simulator.git
   git branch -M main
   git push -u origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
   - Framework Preset: **Vite** (auto-detected via `vercel.json`).
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click **Deploy**!

> **💡 Cloud Simulation Mode**:
> All 17 project presets include pre-compiled firmware and run 100% client-side in the browser on Vercel without requiring a backend server! Pure AVR Assembly also compiles entirely in-browser.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Dev Server (Frontend)
```bash
npm run dev
```

### 3. Start Backend Compiler Server (Optional for local C compiling)
```bash
npm run server
```
