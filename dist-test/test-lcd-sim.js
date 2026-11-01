var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { CPU, AVRIOPort, avrInstruction } from "avr8js";
const ATMEGA16_ADDR = {
  // Ports
  PINA: 57,
  DDRA: 58,
  PORTA: 59,
  PINB: 54,
  DDRB: 55,
  PORTB: 56,
  PINC: 51,
  DDRC: 52,
  PORTC: 53,
  PIND: 48,
  DDRD: 49,
  PORTD: 50,
  // Timers
  TCNT0: 82,
  TCCR0: 83,
  OCR0: 92,
  TIMSK: 89,
  TIFR: 88,
  TCNT1L: 76,
  TCNT1H: 77,
  TCCR1A: 79,
  TCCR1B: 78,
  OCR1AL: 74,
  OCR1AH: 75,
  OCR1BL: 72,
  OCR1BH: 73,
  // ADC
  ADCL: 36,
  ADCH: 37,
  ADCSRA: 38,
  ADMUX: 39,
  // CPU Status & Stack
  SPL: 93,
  SPH: 94,
  SREG: 95,
  MCUCR: 85,
  MCUCSR: 84,
  GICR: 91,
  GIFR: 90,
  SFIOR: 80
  // Special Function IO Register (bit 2 = PUD Pull-Up Disable)
};
const ATMEGA16_DIP40_PINS = [
  // Left side: Pins 1 to 20 (top to bottom)
  { pinNumber: 1, name: "PB0", port: "B", portBit: 0, altFunctions: ["XCK", "T0"] },
  { pinNumber: 2, name: "PB1", port: "B", portBit: 1, altFunctions: ["T1"] },
  { pinNumber: 3, name: "PB2", port: "B", portBit: 2, altFunctions: ["AIN0", "INT2"] },
  { pinNumber: 4, name: "PB3", port: "B", portBit: 3, altFunctions: ["AIN1", "OC0"] },
  { pinNumber: 5, name: "PB4", port: "B", portBit: 4, altFunctions: ["SS"] },
  { pinNumber: 6, name: "PB5", port: "B", portBit: 5, altFunctions: ["MOSI"] },
  { pinNumber: 7, name: "PB6", port: "B", portBit: 6, altFunctions: ["MISO"] },
  { pinNumber: 8, name: "PB7", port: "B", portBit: 7, altFunctions: ["SCK"] },
  { pinNumber: 9, name: "RESET", altFunctions: [] },
  { pinNumber: 10, name: "VCC", altFunctions: ["+5V"] },
  { pinNumber: 11, name: "GND", altFunctions: ["0V"] },
  { pinNumber: 12, name: "XTAL2", altFunctions: ["OSC2"] },
  { pinNumber: 13, name: "XTAL1", altFunctions: ["OSC1"] },
  { pinNumber: 14, name: "PD0", port: "D", portBit: 0, altFunctions: ["RXD"] },
  { pinNumber: 15, name: "PD1", port: "D", portBit: 1, altFunctions: ["TXD"] },
  { pinNumber: 16, name: "PD2", port: "D", portBit: 2, altFunctions: ["INT0"] },
  { pinNumber: 17, name: "PD3", port: "D", portBit: 3, altFunctions: ["INT1"] },
  { pinNumber: 18, name: "PD4", port: "D", portBit: 4, altFunctions: ["OC1B"] },
  { pinNumber: 19, name: "PD5", port: "D", portBit: 5, altFunctions: ["OC1A"] },
  { pinNumber: 20, name: "PD6", port: "D", portBit: 6, altFunctions: ["ICP1"] },
  // Right side: Pins 40 down to 21 (top to bottom)
  { pinNumber: 40, name: "PA0", port: "A", portBit: 0, altFunctions: ["ADC0"] },
  { pinNumber: 39, name: "PA1", port: "A", portBit: 1, altFunctions: ["ADC1"] },
  { pinNumber: 38, name: "PA2", port: "A", portBit: 2, altFunctions: ["ADC2"] },
  { pinNumber: 37, name: "PA3", port: "A", portBit: 3, altFunctions: ["ADC3"] },
  { pinNumber: 36, name: "PA4", port: "A", portBit: 4, altFunctions: ["ADC4"] },
  { pinNumber: 35, name: "PA5", port: "A", portBit: 5, altFunctions: ["ADC5"] },
  { pinNumber: 34, name: "PA6", port: "A", portBit: 6, altFunctions: ["ADC6"] },
  { pinNumber: 33, name: "PA7", port: "A", portBit: 7, altFunctions: ["ADC7"] },
  { pinNumber: 32, name: "AREF", altFunctions: ["Vref"] },
  { pinNumber: 31, name: "GND", altFunctions: ["0V"] },
  { pinNumber: 30, name: "AVCC", altFunctions: ["+5V"] },
  { pinNumber: 29, name: "PC7", port: "C", portBit: 7, altFunctions: ["TOSC2"] },
  { pinNumber: 28, name: "PC6", port: "C", portBit: 6, altFunctions: ["TOSC1"] },
  { pinNumber: 27, name: "PC5", port: "C", portBit: 5, altFunctions: ["TDI"] },
  { pinNumber: 26, name: "PC4", port: "C", portBit: 4, altFunctions: ["TDO"] },
  { pinNumber: 25, name: "PC3", port: "C", portBit: 3, altFunctions: ["TMS"] },
  { pinNumber: 24, name: "PC2", port: "C", portBit: 2, altFunctions: ["TCK"] },
  { pinNumber: 23, name: "PC1", port: "C", portBit: 1, altFunctions: ["SDA"] },
  { pinNumber: 22, name: "PC0", port: "C", portBit: 0, altFunctions: ["SCL"] },
  { pinNumber: 21, name: "PD7", port: "D", portBit: 7, altFunctions: ["OC2"] }
];
class Atmega16Simulator {
  constructor(progMem) {
    __publicField(this, "cpu");
    __publicField(this, "portA");
    __publicField(this, "portB");
    __publicField(this, "portC");
    __publicField(this, "portD");
    // External analog voltages applied to PA0-PA7 (0..5V)
    __publicField(this, "analogInputs", [0, 0, 0, 0, 0, 0, 0, 0]);
    // Callback notified when pins change
    __publicField(this, "onPinChangeCallbacks", []);
    // Synchronous callbacks notified immediately when any port register is written
    __publicField(this, "onPortWriteCallbacks", []);
    const memory = progMem || new Uint16Array(8192);
    this.cpu = new CPU(memory, 1024 + 32 + 64);
    this.cpu.data[ATMEGA16_ADDR.SPL] = 95;
    this.cpu.data[ATMEGA16_ADDR.SPH] = 4;
    const configA = {
      PIN: ATMEGA16_ADDR.PINA,
      DDR: ATMEGA16_ADDR.DDRA,
      PORT: ATMEGA16_ADDR.PORTA,
      externalInterrupts: []
    };
    const configB = {
      PIN: ATMEGA16_ADDR.PINB,
      DDR: ATMEGA16_ADDR.DDRB,
      PORT: ATMEGA16_ADDR.PORTB,
      externalInterrupts: []
    };
    const configC = {
      PIN: ATMEGA16_ADDR.PINC,
      DDR: ATMEGA16_ADDR.DDRC,
      PORT: ATMEGA16_ADDR.PORTC,
      externalInterrupts: []
    };
    const configD = {
      PIN: ATMEGA16_ADDR.PIND,
      DDR: ATMEGA16_ADDR.DDRD,
      PORT: ATMEGA16_ADDR.PORTD,
      externalInterrupts: []
    };
    this.portA = new AVRIOPort(this.cpu, configA);
    this.portB = new AVRIOPort(this.cpu, configB);
    this.portC = new AVRIOPort(this.cpu, configC);
    this.portD = new AVRIOPort(this.cpu, configD);
    const notifyChange = (portName) => {
      this.syncPortPullUps(portName);
      for (let i = 0; i < this.onPortWriteCallbacks.length; i++) {
        this.onPortWriteCallbacks[i](portName);
      }
      if (this.onPinChangeCallbacks.length > 0) {
        const pinInfos = this.getAllPinInfos();
        for (const cb of this.onPinChangeCallbacks) {
          cb(pinInfos);
        }
      }
    };
    this.portA.addListener(() => notifyChange("A"));
    this.portB.addListener(() => notifyChange("B"));
    this.portC.addListener(() => notifyChange("C"));
    this.portD.addListener(() => notifyChange("D"));
    this.setupAdcSimulation();
    this.setupTimerSimulation();
  }
  /**
   * Synchronize internal pull-up resistors according to ATmega16 hardware logic:
   * When DDRxn = 0 (input) and PORTxn = 1 and SFIOR.PUD = 0:
   * The internal ~30kΩ pull-up to +5V is enabled.
   * If the pin is not externally pulled to GND, PINxn samples 1 (HIGH, 5V).
   * When DDRxn = 0 and PORTxn = 0:
   * The pull-up is disabled, leaving the pin in high-impedance / floating state (samples 0).
   */
  syncPortPullUps(portName) {
    const ddrAddr = ATMEGA16_ADDR[`DDR${portName}`];
    const portAddr = ATMEGA16_ADDR[`PORT${portName}`];
    const ddr = this.cpu.data[ddrAddr];
    const port = this.cpu.data[portAddr];
    const pud = !!(this.cpu.data[ATMEGA16_ADDR.SFIOR] & 4);
    const portObj = portName === "A" ? this.portA : portName === "B" ? this.portB : portName === "C" ? this.portC : this.portD;
    for (let bit = 0; bit < 8; bit++) {
      const isOutput = !!(ddr & 1 << bit);
      const portBitVal = !!(port & 1 << bit);
      if (!isOutput) {
        if (portBitVal && !pud) {
          portObj.setPin(bit, true);
        } else {
          portObj.setPin(bit, false);
        }
      }
    }
  }
  syncAllPullUps() {
    this.syncPortPullUps("A");
    this.syncPortPullUps("B");
    this.syncPortPullUps("C");
    this.syncPortPullUps("D");
  }
  subscribePinChange(cb) {
    this.onPinChangeCallbacks.push(cb);
  }
  subscribePortWrite(cb) {
    this.onPortWriteCallbacks.push(cb);
  }
  /**
   * Fast O(1) voltage check for a specific port bit without allocating objects
   */
  getPortPinVoltage(port, bit) {
    const ddrAddr = port === "A" ? ATMEGA16_ADDR.DDRA : port === "B" ? ATMEGA16_ADDR.DDRB : port === "C" ? ATMEGA16_ADDR.DDRC : ATMEGA16_ADDR.DDRD;
    const portAddr = port === "A" ? ATMEGA16_ADDR.PORTA : port === "B" ? ATMEGA16_ADDR.PORTB : port === "C" ? ATMEGA16_ADDR.PORTC : ATMEGA16_ADDR.PORTD;
    const ddr = this.cpu.data[ddrAddr];
    const portVal = this.cpu.data[portAddr];
    if (ddr & 1 << bit) {
      return portVal & 1 << bit ? 5 : 0;
    }
    const pud = !!(this.cpu.data[ATMEGA16_ADDR.SFIOR] & 4);
    if (portVal & 1 << bit && !pud) {
      return 5;
    }
    const pinAddr = port === "A" ? ATMEGA16_ADDR.PINA : port === "B" ? ATMEGA16_ADDR.PINB : port === "C" ? ATMEGA16_ADDR.PINC : ATMEGA16_ADDR.PIND;
    return this.cpu.data[pinAddr] & 1 << bit ? 5 : 0;
  }
  /**
   * Fast lookup for a named pin ('PB1', 'PA0', 'VCC', 'GND')
   */
  getPinVoltageByName(name) {
    if (name === "VCC" || name === "AVCC" || name === "AREF" || name === "RESET") return 5;
    if (name === "GND") return 0;
    const match = name.match(/^P([ABCD])([0-7])$/);
    if (match) {
      return this.getPortPinVoltage(match[1], parseInt(match[2], 10));
    }
    return 0;
  }
  setAnalogInput(channel, voltage) {
    if (channel >= 0 && channel < 8) {
      this.analogInputs[channel] = Math.max(0, Math.min(5, voltage));
    }
  }
  /**
   * Set an external digital input signal on a specific port bit
   */
  setDigitalInput(port, bit, value) {
    const targetPort = port === "A" ? this.portA : port === "B" ? this.portB : port === "C" ? this.portC : this.portD;
    targetPort.setPin(bit, value);
  }
  /**
   * Execute single instruction
   */
  step() {
    avrInstruction(this.cpu);
    this.cpu.tick();
    this.syncAllPullUps();
    this.tickInternalPeripherals();
  }
  /**
   * Execute N clock cycles or instructions
   */
  stepCount(count) {
    for (let i = 0; i < count; i++) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }
    this.syncAllPullUps();
    this.tickInternalPeripherals();
  }
  reset() {
    this.cpu.reset();
    this.cpu.data[ATMEGA16_ADDR.SPL] = 95;
    this.cpu.data[ATMEGA16_ADDR.SPH] = 4;
    this.cpu.data[ATMEGA16_ADDR.PORTA] = 0;
    this.cpu.data[ATMEGA16_ADDR.DDRA] = 0;
    this.cpu.data[ATMEGA16_ADDR.PORTB] = 0;
    this.cpu.data[ATMEGA16_ADDR.DDRB] = 0;
    this.cpu.data[ATMEGA16_ADDR.PORTC] = 0;
    this.cpu.data[ATMEGA16_ADDR.DDRC] = 0;
    this.cpu.data[ATMEGA16_ADDR.PORTD] = 0;
    this.cpu.data[ATMEGA16_ADDR.DDRD] = 0;
    this.cpu.data[ATMEGA16_ADDR.SFIOR] = 0;
    this.syncAllPullUps();
  }
  loadProgram(progMem) {
    for (let i = 0; i < 8192; i++) {
      this.cpu.progMem[i] = i < progMem.length ? progMem[i] : 0;
    }
    this.reset();
  }
  /**
   * Get complete CPU state snapshot for Register Inspector
   */
  getCpuState() {
    const r = [];
    for (let i = 0; i < 32; i++) {
      r.push(this.cpu.data[i]);
    }
    const sreg = this.cpu.data[ATMEGA16_ADDR.SREG];
    const sregFlags = {
      I: !!(sreg & 128),
      T: !!(sreg & 64),
      H: !!(sreg & 32),
      S: !!(sreg & 16),
      V: !!(sreg & 8),
      N: !!(sreg & 4),
      Z: !!(sreg & 2),
      C: !!(sreg & 1)
    };
    const sp = this.cpu.data[ATMEGA16_ADDR.SPL] | this.cpu.data[ATMEGA16_ADDR.SPH] << 8;
    const ports = {
      A: {
        port: this.cpu.data[ATMEGA16_ADDR.PORTA],
        ddr: this.cpu.data[ATMEGA16_ADDR.DDRA],
        pin: this.cpu.data[ATMEGA16_ADDR.PINA]
      },
      B: {
        port: this.cpu.data[ATMEGA16_ADDR.PORTB],
        ddr: this.cpu.data[ATMEGA16_ADDR.DDRB],
        pin: this.cpu.data[ATMEGA16_ADDR.PINB]
      },
      C: {
        port: this.cpu.data[ATMEGA16_ADDR.PORTC],
        ddr: this.cpu.data[ATMEGA16_ADDR.DDRC],
        pin: this.cpu.data[ATMEGA16_ADDR.PINC]
      },
      D: {
        port: this.cpu.data[ATMEGA16_ADDR.PORTD],
        ddr: this.cpu.data[ATMEGA16_ADDR.DDRD],
        pin: this.cpu.data[ATMEGA16_ADDR.PIND]
      }
    };
    const timers = {
      tcnt0: this.cpu.data[ATMEGA16_ADDR.TCNT0],
      tccr0: this.cpu.data[ATMEGA16_ADDR.TCCR0],
      ocr0: this.cpu.data[ATMEGA16_ADDR.OCR0]
    };
    const adc = {
      admux: this.cpu.data[ATMEGA16_ADDR.ADMUX],
      adcsra: this.cpu.data[ATMEGA16_ADDR.ADCSRA],
      value: this.cpu.data[ATMEGA16_ADDR.ADCL] | this.cpu.data[ATMEGA16_ADDR.ADCH] << 8
    };
    return {
      r,
      sreg,
      sregFlags,
      pc: this.cpu.pc,
      sp,
      cycles: this.cpu.cycles,
      ports,
      timers,
      adc
    };
  }
  /**
   * Get electrical & logical state of all 40 DIP pins
   */
  getAllPinInfos() {
    const list = [];
    for (const def of ATMEGA16_DIP40_PINS) {
      if (!def.port) {
        let voltage2 = 0;
        let state2 = "low";
        let direction2 = "input";
        if (def.name === "VCC" || def.name === "AVCC") {
          voltage2 = 5;
          state2 = "high";
          direction2 = "output";
        } else if (def.name === "RESET") {
          voltage2 = 5;
          state2 = "pullup";
          direction2 = "input-pullup";
        } else if (def.name === "AREF") {
          voltage2 = 5;
          state2 = "high";
          direction2 = "input";
        }
        list.push({
          pinNumber: def.pinNumber,
          name: def.name,
          altFunctions: def.altFunctions,
          direction: direction2,
          state: state2,
          voltage: voltage2
        });
        continue;
      }
      const portName = def.port;
      const bit = def.portBit;
      const ddrAddr = portName === "A" ? ATMEGA16_ADDR.DDRA : portName === "B" ? ATMEGA16_ADDR.DDRB : portName === "C" ? ATMEGA16_ADDR.DDRC : ATMEGA16_ADDR.DDRD;
      const portAddr = portName === "A" ? ATMEGA16_ADDR.PORTA : portName === "B" ? ATMEGA16_ADDR.PORTB : portName === "C" ? ATMEGA16_ADDR.PORTC : ATMEGA16_ADDR.PORTD;
      const pinAddr = portName === "A" ? ATMEGA16_ADDR.PINA : portName === "B" ? ATMEGA16_ADDR.PINB : portName === "C" ? ATMEGA16_ADDR.PINC : ATMEGA16_ADDR.PIND;
      const ddrBit = !!(this.cpu.data[ddrAddr] & 1 << bit);
      const portBitVal = !!(this.cpu.data[portAddr] & 1 << bit);
      const pinBitVal = !!(this.cpu.data[pinAddr] & 1 << bit);
      const pud = !!(this.cpu.data[ATMEGA16_ADDR.SFIOR] & 4);
      let direction = "input";
      let state = "tristate";
      let voltage = 0;
      let pullUpEnabled = false;
      let isFloating = false;
      if (ddrBit) {
        direction = "output";
        pullUpEnabled = false;
        isFloating = false;
        if (portBitVal) {
          state = "high";
          voltage = 5;
        } else {
          state = "low";
          voltage = 0;
        }
      } else {
        if (portBitVal && !pud) {
          direction = "input-pullup";
          pullUpEnabled = true;
          isFloating = false;
          if (pinBitVal) {
            state = "pullup";
            voltage = 5;
          } else {
            state = "low";
            voltage = 0;
          }
        } else {
          direction = "input";
          pullUpEnabled = false;
          if (pinBitVal) {
            state = "high";
            voltage = 5;
            isFloating = false;
          } else {
            state = "tristate";
            voltage = 0;
            isFloating = true;
          }
        }
      }
      const bitmask = 1 << bit;
      const maskHex = "0x" + bitmask.toString(16).padStart(2, "0").toUpperCase();
      const pinAddressLabel = `PIN${portName}${bit} => ${maskHex}`;
      list.push({
        pinNumber: def.pinNumber,
        name: def.name,
        port: def.port,
        portBit: def.portBit,
        bitmask,
        pinAddressLabel,
        altFunctions: def.altFunctions,
        direction,
        state,
        voltage,
        pullUpEnabled,
        isFloating
      });
    }
    return list;
  }
  // ADC conversion simulation
  setupAdcSimulation() {
    this.cpu.writeHooks[ATMEGA16_ADDR.ADCSRA] = (value) => {
      this.cpu.data[ATMEGA16_ADDR.ADCSRA] = value;
      if (value & 64 && value & 128) {
        this.runAdcConversion(value);
      }
      return true;
    };
  }
  runAdcConversion(adcsraVal) {
    const admux = this.cpu.data[ATMEGA16_ADDR.ADMUX];
    const channel = admux & 7;
    const vInput = this.analogInputs[channel] ?? 0;
    const refs = admux >> 6 & 3;
    let vRef = 5;
    if (refs === 3) {
      vRef = 2.56;
    } else if (refs === 1) {
      vRef = 5;
    }
    const rawDigital = Math.min(1023, Math.max(0, Math.round(vInput / vRef * 1023)));
    const adlar = !!(admux & 32);
    if (adlar) {
      this.cpu.data[ATMEGA16_ADDR.ADCL] = rawDigital << 6 & 192;
      this.cpu.data[ATMEGA16_ADDR.ADCH] = rawDigital >> 2 & 255;
    } else {
      this.cpu.data[ATMEGA16_ADDR.ADCL] = rawDigital & 255;
      this.cpu.data[ATMEGA16_ADDR.ADCH] = rawDigital >> 8 & 3;
    }
    this.cpu.data[ATMEGA16_ADDR.ADCSRA] = adcsraVal & -65 | 16;
    if (adcsraVal & 8) {
      this.cpu.queueInterrupt({
        address: 28 >> 1,
        // word address 14
        flagRegister: ATMEGA16_ADDR.ADCSRA,
        flagMask: 16,
        enableRegister: ATMEGA16_ADDR.ADCSRA,
        enableMask: 8
      });
    }
  }
  // Timer simulation hooks
  setupTimerSimulation() {
    this.cpu.writeHooks[ATMEGA16_ADDR.OCR0] = (val) => {
      this.cpu.data[ATMEGA16_ADDR.OCR0] = val;
      return true;
    };
  }
  tickInternalPeripherals() {
    const tccr0 = this.cpu.data[ATMEGA16_ADDR.TCCR0];
    const cs0 = tccr0 & 7;
    if (cs0 !== 0) {
      const oldTcnt = this.cpu.data[ATMEGA16_ADDR.TCNT0];
      const newTcnt = oldTcnt + 1 & 255;
      this.cpu.data[ATMEGA16_ADDR.TCNT0] = newTcnt;
      const ocr0 = this.cpu.data[ATMEGA16_ADDR.OCR0];
      if (newTcnt === ocr0) {
        this.cpu.data[ATMEGA16_ADDR.TIFR] |= 2;
      }
      if (newTcnt === 0 && oldTcnt === 255) {
        this.cpu.data[ATMEGA16_ADDR.TIFR] |= 1;
        const adcsra = this.cpu.data[ATMEGA16_ADDR.ADCSRA];
        if (adcsra & 128 && adcsra & 32) {
          this.runAdcConversion(adcsra);
        }
      }
      const isFastPwm = (tccr0 & 72) === 72;
      const isNonInverting = (tccr0 & 48) === 32;
      if (isFastPwm && isNonInverting) {
        const ddrB = this.cpu.data[ATMEGA16_ADDR.DDRB];
        if (ddrB & 1 << 3) {
          const isHigh = newTcnt < ocr0;
          if (isHigh) {
            this.cpu.data[ATMEGA16_ADDR.PORTB] |= 1 << 3;
          } else {
            this.cpu.data[ATMEGA16_ADDR.PORTB] &= -9;
          }
        }
      }
    }
  }
}
class AudioDriver {
  constructor() {
    __publicField(this, "ctx", null);
    __publicField(this, "osc", null);
    __publicField(this, "gain", null);
    __publicField(this, "isPlaying", false);
    __publicField(this, "lastToggleTime", 0);
    __publicField(this, "toggleCount", 0);
    __publicField(this, "estimatedFreq", 0);
  }
  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.05;
        this.gain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {
      });
    }
  }
  pulse(high) {
    const now = performance.now();
    this.toggleCount++;
    if (now - this.lastToggleTime > 100) {
      const deltaSec = (now - this.lastToggleTime) / 1e3;
      this.estimatedFreq = Math.round(this.toggleCount / 2 / deltaSec);
      this.toggleCount = 0;
      this.lastToggleTime = now;
      if (this.estimatedFreq >= 50 && this.estimatedFreq <= 8e3) {
        this.setTone(this.estimatedFreq);
      } else if (high) {
        this.setTone(1e3);
      } else {
        this.stop();
      }
    }
  }
  setTone(freq) {
    try {
      this.ensureContext();
      if (!this.ctx || !this.gain) return;
      if (!this.osc) {
        this.osc = this.ctx.createOscillator();
        this.osc.type = "square";
        this.osc.connect(this.gain);
        this.osc.start();
        this.isPlaying = true;
      }
      this.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.01);
      this.gain.gain.setTargetAtTime(0.04, this.ctx.currentTime, 0.01);
    } catch {
    }
  }
  stop() {
    if (this.gain && this.ctx) {
      this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
    }
  }
  destroy() {
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {
      }
      this.osc = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
      }
      this.ctx = null;
    }
    this.isPlaying = false;
  }
}
const buzzerAudio = new AudioDriver();
const KEYPAD_4X4_MAP = {
  "1": { row: "r1", col: "c1" },
  "2": { row: "r1", col: "c2" },
  "3": { row: "r1", col: "c3" },
  "A": { row: "r1", col: "c4" },
  "4": { row: "r2", col: "c1" },
  "5": { row: "r2", col: "c2" },
  "6": { row: "r2", col: "c3" },
  "B": { row: "r2", col: "c4" },
  "7": { row: "r3", col: "c1" },
  "8": { row: "r3", col: "c2" },
  "9": { row: "r3", col: "c3" },
  "C": { row: "r3", col: "c4" },
  "*": { row: "r4", col: "c1" },
  "0": { row: "r4", col: "c2" },
  "#": { row: "r4", col: "c3" },
  "D": { row: "r4", col: "c4" }
};
class CircuitEngine {
  constructor(mcu) {
    __publicField(this, "mcu");
    __publicField(this, "components", []);
    __publicField(this, "wires", []);
    // Component Live States
    __publicField(this, "ledStates", /* @__PURE__ */ new Map());
    __publicField(this, "ledBarStates", /* @__PURE__ */ new Map());
    __publicField(this, "segStates", /* @__PURE__ */ new Map());
    __publicField(this, "lcdStates", /* @__PURE__ */ new Map());
    __publicField(this, "motorSpeeds", /* @__PURE__ */ new Map());
    __publicField(this, "dcMotorStates", /* @__PURE__ */ new Map());
    __publicField(this, "stepperStates", /* @__PURE__ */ new Map());
    __publicField(this, "buzzerActive", /* @__PURE__ */ new Map());
    // Fast pre-resolved hardware bindings for edge-triggered LCD updates
    __publicField(this, "lcdBindings", []);
    this.mcu = mcu;
    this.mcu.subscribePortWrite((portName) => {
      this.syncFastPeripherals(portName);
    });
  }
  resolveTerminalBinding(compId, termId) {
    const wire = this.wires.find(
      (w) => w.toCompId === compId && w.toTermId === termId || w.fromCompId === compId && w.fromTermId === termId
    );
    if (!wire) return { type: "none" };
    const otherComp = wire.toCompId === compId ? wire.fromCompId : wire.toCompId;
    const otherTerm = wire.toCompId === compId ? wire.fromTermId : wire.toTermId;
    if (otherComp === "atmega16") {
      const match = otherTerm.match(/^P([ABCD])([0-7])$/);
      if (match) {
        return {
          type: "mcu",
          port: match[1],
          bit: parseInt(match[2], 10)
        };
      }
    } else if (otherComp === "vcc" || otherTerm === "vcc") {
      return { type: "vcc" };
    } else if (otherComp === "gnd" || otherTerm === "gnd") {
      return { type: "gnd" };
    }
    return { type: "none" };
  }
  getBindingVoltage(binding) {
    if (binding.type === "mcu") {
      return this.mcu.getPortPinVoltage(binding.port, binding.bit);
    }
    if (binding.type === "vcc") return 5;
    return 0;
  }
  rebuildLcdBindings() {
    var _a;
    this.lcdBindings = [];
    for (const comp of this.components) {
      if (comp.type === "lcd1602") {
        const hasLowerBitsWired = this.wires.some(
          (w) => w.toCompId === comp.id && ["d0", "d1", "d2", "d3"].includes(w.toTermId) || w.fromCompId === comp.id && ["d0", "d1", "d2", "d3"].includes(w.fromTermId)
        );
        const is8Bit = hasLowerBitsWired || ((_a = comp.props) == null ? void 0 : _a.is8BitMode) === true;
        if (!this.lcdStates.has(comp.id)) {
          this.lcdStates.set(comp.id, {
            lines: ["                ", "                "],
            cursorRow: 0,
            cursorCol: 0,
            displayOn: true,
            nibbleBuffer: null,
            lastE: false,
            backlight: true,
            initialized: false,
            is8BitMode: is8Bit
          });
        } else {
          const state = this.lcdStates.get(comp.id);
          state.is8BitMode = is8Bit;
        }
        const binding = {
          comp,
          rs: this.resolveTerminalBinding(comp.id, "rs"),
          e: this.resolveTerminalBinding(comp.id, "e"),
          d: [
            this.resolveTerminalBinding(comp.id, "d0"),
            this.resolveTerminalBinding(comp.id, "d1"),
            this.resolveTerminalBinding(comp.id, "d2"),
            this.resolveTerminalBinding(comp.id, "d3"),
            this.resolveTerminalBinding(comp.id, "d4"),
            this.resolveTerminalBinding(comp.id, "d5"),
            this.resolveTerminalBinding(comp.id, "d6"),
            this.resolveTerminalBinding(comp.id, "d7")
          ],
          is8Bit
        };
        this.lcdBindings.push(binding);
      }
      if (comp.type === "led-bar" && !this.ledBarStates.has(comp.id)) {
        this.ledBarStates.set(comp.id, [false, false, false, false, false, false, false, false]);
      }
    }
  }
  setComponentsAndWires(components, wires) {
    this.components = components;
    this.wires = wires;
    this.rebuildLcdBindings();
  }
  syncFastPeripherals(_portName) {
    for (let i = 0; i < this.lcdBindings.length; i++) {
      const binding = this.lcdBindings[i];
      const lcd = this.lcdStates.get(binding.comp.id);
      if (!lcd) continue;
      const eHigh = this.getBindingVoltage(binding.e) > 2;
      if (lcd.lastE && !eHigh) {
        const rs = this.getBindingVoltage(binding.rs) > 2;
        const is8Bit = binding.is8Bit || lcd.is8BitMode === true;
        if (is8Bit) {
          const d0 = this.getBindingVoltage(binding.d[0]) > 2 ? 1 : 0;
          const d1 = this.getBindingVoltage(binding.d[1]) > 2 ? 1 : 0;
          const d2 = this.getBindingVoltage(binding.d[2]) > 2 ? 1 : 0;
          const d3 = this.getBindingVoltage(binding.d[3]) > 2 ? 1 : 0;
          const d4 = this.getBindingVoltage(binding.d[4]) > 2 ? 1 : 0;
          const d5 = this.getBindingVoltage(binding.d[5]) > 2 ? 1 : 0;
          const d6 = this.getBindingVoltage(binding.d[6]) > 2 ? 1 : 0;
          const d7 = this.getBindingVoltage(binding.d[7]) > 2 ? 1 : 0;
          const byteVal = d7 << 7 | d6 << 6 | d5 << 5 | d4 << 4 | d3 << 3 | d2 << 2 | d1 << 1 | d0;
          this.executeLcdByte(lcd, rs, byteVal);
        } else {
          const d4 = this.getBindingVoltage(binding.d[4]) > 2 ? 1 : 0;
          const d5 = this.getBindingVoltage(binding.d[5]) > 2 ? 1 : 0;
          const d6 = this.getBindingVoltage(binding.d[6]) > 2 ? 1 : 0;
          const d7 = this.getBindingVoltage(binding.d[7]) > 2 ? 1 : 0;
          const nibble = d7 << 3 | d6 << 2 | d5 << 1 | d4;
          if (!rs && lcd.nibbleBuffer === null && !lcd.initialized && (nibble === 2 || nibble === 3)) {
            if (nibble === 2) {
              lcd.initialized = true;
            }
            lcd.nibbleBuffer = null;
          } else if (lcd.nibbleBuffer === null) {
            lcd.nibbleBuffer = nibble;
          } else {
            const byteVal = lcd.nibbleBuffer << 4 | nibble;
            lcd.nibbleBuffer = null;
            lcd.initialized = true;
            this.executeLcdByte(lcd, rs, byteVal);
          }
        }
      }
      lcd.lastE = eHigh;
    }
  }
  reset() {
    var _a;
    this.ledStates.clear();
    this.ledBarStates.clear();
    this.segStates.clear();
    this.motorSpeeds.clear();
    this.dcMotorStates.clear();
    this.stepperStates.clear();
    this.buzzerActive.clear();
    for (const comp of this.components) {
      if (comp.type === "lcd1602") {
        const hasLowerBitsWired = this.wires.some(
          (w) => w.toCompId === comp.id && ["d0", "d1", "d2", "d3"].includes(w.toTermId) || w.fromCompId === comp.id && ["d0", "d1", "d2", "d3"].includes(w.fromTermId)
        );
        this.lcdStates.set(comp.id, {
          lines: ["                ", "                "],
          cursorRow: 0,
          cursorCol: 0,
          displayOn: true,
          nibbleBuffer: null,
          lastE: false,
          backlight: true,
          initialized: false,
          is8BitMode: hasLowerBitsWired || ((_a = comp.props) == null ? void 0 : _a.is8BitMode) === true
        });
      }
    }
    this.rebuildLcdBindings();
  }
  /**
   * Update electrical nets and propagate signals between MCU & components
   */
  updateCircuit() {
    var _a, _b, _c, _d, _e;
    const pinInfos = this.mcu.getAllPinInfos();
    const pinMap = /* @__PURE__ */ new Map();
    for (const p of pinInfos) {
      pinMap.set(p.name, p);
    }
    const termVoltages = /* @__PURE__ */ new Map();
    for (const comp of this.components) {
      if (comp.type === "vcc") {
        termVoltages.set(`${comp.id}:out`, 5);
      } else if (comp.type === "gnd") {
        termVoltages.set(`${comp.id}:out`, 0);
      } else if (comp.type === "potentiometer") {
        const val = typeof ((_a = comp.props) == null ? void 0 : _a.value) === "number" ? comp.props.value : 0.5;
        termVoltages.set(`${comp.id}:vcc`, 5);
        termVoltages.set(`${comp.id}:gnd`, 0);
        termVoltages.set(`${comp.id}:wiper`, val * 5);
      } else if (comp.type === "lm35") {
        const temp = typeof ((_b = comp.props) == null ? void 0 : _b.temp) === "number" ? comp.props.temp : 25;
        const vOut = Math.max(0, temp * 0.01);
        termVoltages.set(`${comp.id}:vcc`, 5);
        termVoltages.set(`${comp.id}:gnd`, 0);
        termVoltages.set(`${comp.id}:vout`, vOut);
      }
    }
    for (const p of pinInfos) {
      if (p.direction === "output") {
        termVoltages.set(`atmega16:${p.name}`, p.voltage);
      } else if (p.direction === "input-pullup") {
        termVoltages.set(`atmega16:${p.name}`, 5);
      }
    }
    for (let pass = 0; pass < 4; pass++) {
      for (const comp of this.components) {
        if (comp.type === "push-button" || comp.type === "toggle-switch" || comp.type === "press-switch") {
          const isClosed = !!((_c = comp.props) == null ? void 0 : _c.pressed) || !!((_d = comp.props) == null ? void 0 : _d.closed);
          if (isClosed) {
            const v1 = termVoltages.get(`${comp.id}:pin1`);
            const v2 = termVoltages.get(`${comp.id}:pin2`);
            if (v1 !== void 0 && v2 === void 0) {
              termVoltages.set(`${comp.id}:pin2`, v1);
            } else if (v2 !== void 0 && v1 === void 0) {
              termVoltages.set(`${comp.id}:pin1`, v2);
            } else if (v1 !== void 0 && v2 !== void 0) {
              if (v1 === 0 || v2 === 0) {
                termVoltages.set(`${comp.id}:pin1`, 0);
                termVoltages.set(`${comp.id}:pin2`, 0);
              } else {
                const maxV = Math.max(v1, v2);
                termVoltages.set(`${comp.id}:pin1`, maxV);
                termVoltages.set(`${comp.id}:pin2`, maxV);
              }
            }
          }
        } else if (comp.type === "keypad4x4") {
          const pressedKey = (_e = comp.props) == null ? void 0 : _e.pressedKey;
          if (pressedKey && KEYPAD_4X4_MAP[pressedKey]) {
            const { row, col } = KEYPAD_4X4_MAP[pressedKey];
            const rKey = `${comp.id}:${row}`;
            const cKey = `${comp.id}:${col}`;
            const vR = termVoltages.get(rKey);
            const vC = termVoltages.get(cKey);
            if (vR !== void 0 && vC === void 0) {
              termVoltages.set(cKey, vR);
            } else if (vC !== void 0 && vR === void 0) {
              termVoltages.set(rKey, vC);
            } else if (vR !== void 0 && vC !== void 0) {
              if (vR === 0 || vC === 0) {
                termVoltages.set(rKey, 0);
                termVoltages.set(cKey, 0);
              } else {
                const maxV = Math.max(vR, vC);
                termVoltages.set(rKey, maxV);
                termVoltages.set(cKey, maxV);
              }
            }
          }
        }
      }
      for (const wire of this.wires) {
        const fromKey = `${wire.fromCompId}:${wire.fromTermId}`;
        const toKey = `${wire.toCompId}:${wire.toTermId}`;
        const vFrom = termVoltages.get(fromKey);
        const vTo = termVoltages.get(toKey);
        if (vFrom !== void 0 && vTo === void 0) {
          termVoltages.set(toKey, vFrom);
        } else if (vTo !== void 0 && vFrom === void 0) {
          termVoltages.set(fromKey, vTo);
        } else if (vFrom !== void 0 && vTo !== void 0) {
          if (vFrom === 0 || vTo === 0) {
            termVoltages.set(fromKey, 0);
            termVoltages.set(toKey, 0);
          } else {
            const high = Math.max(vFrom, vTo);
            termVoltages.set(fromKey, high);
            termVoltages.set(toKey, high);
          }
        }
      }
    }
    for (const p of pinInfos) {
      if (!p.port) continue;
      const key = `atmega16:${p.name}`;
      const vNet = termVoltages.get(key);
      if (p.direction === "input-pullup") {
        if (vNet !== void 0 && vNet < 1.5) {
          this.mcu.setDigitalInput(p.port, p.portBit, false);
        } else {
          this.mcu.setDigitalInput(p.port, p.portBit, true);
        }
      } else if (p.direction === "input") {
        if (vNet !== void 0) {
          this.mcu.setDigitalInput(p.port, p.portBit, vNet >= 2.2);
        } else {
          this.mcu.setDigitalInput(p.port, p.portBit, false);
        }
      }
      if (p.port === "A") {
        const channel = p.portBit;
        if (vNet !== void 0) {
          this.mcu.setAnalogInput(channel, vNet);
        }
      }
    }
    for (const comp of this.components) {
      if (comp.type === "led") {
        const vAnode = termVoltages.get(`${comp.id}:anode`) ?? 0;
        const vCathode = termVoltages.get(`${comp.id}:cathode`) ?? 0;
        const isLit = vAnode > vCathode + 1.6;
        this.ledStates.set(comp.id, isLit);
      } else if (comp.type === "led-bar") {
        const vCom = termVoltages.get(`${comp.id}:com`) ?? 0;
        const bars = [];
        for (let i = 0; i < 8; i++) {
          const vAnode = termVoltages.get(`${comp.id}:d${i}`) ?? termVoltages.get(`${comp.id}:a${i}`) ?? 0;
          bars.push(vAnode > vCom + 1.6);
        }
        this.ledBarStates.set(comp.id, bars);
      } else if (comp.type === "seven-segment") {
        const vCom = termVoltages.get(`${comp.id}:com`) ?? 0;
        const segs = {};
        for (const s of ["a", "b", "c", "d", "e", "f", "g", "dp"]) {
          const vPin = termVoltages.get(`${comp.id}:${s}`) ?? 0;
          segs[s] = vPin > vCom + 1.6;
        }
        this.segStates.set(comp.id, segs);
      } else if (comp.type === "buzzer") {
        const vPos = termVoltages.get(`${comp.id}:pos`) ?? 0;
        const vNeg = termVoltages.get(`${comp.id}:neg`) ?? 0;
        const active = vPos > vNeg + 2;
        this.buzzerActive.set(comp.id, active);
        if (active) {
          buzzerAudio.pulse(true);
        }
      } else if (comp.type === "dc-motor") {
        const vPos = termVoltages.get(`${comp.id}:pos`) ?? 0;
        const vNeg = termVoltages.get(`${comp.id}:neg`) ?? 0;
        const diff = vPos - vNeg;
        const speed = Math.abs(diff) > 1 ? Math.min(1, Math.abs(diff) / 5) : 0;
        const direction = diff >= 0 ? 1 : -1;
        const current = this.dcMotorStates.get(comp.id) || { angle: 0 };
        const newAngle = (current.angle + speed * direction * 25) % 360;
        const rpm = Math.round(speed * 2400);
        this.dcMotorStates.set(comp.id, { speed, direction, angle: newAngle, rpm });
        this.motorSpeeds.set(comp.id, speed);
      } else if (comp.type === "stepper-motor") {
        const v1 = (termVoltages.get(`${comp.id}:in1`) ?? 0) > 2;
        const v2 = (termVoltages.get(`${comp.id}:in2`) ?? 0) > 2;
        const v3 = (termVoltages.get(`${comp.id}:in3`) ?? 0) > 2;
        const v4 = (termVoltages.get(`${comp.id}:in4`) ?? 0) > 2;
        const pattern = (v1 ? 1 : 0) | (v2 ? 2 : 0) | (v3 ? 4 : 0) | (v4 ? 8 : 0);
        const current = this.stepperStates.get(comp.id) || {
          angle: 0,
          stepCount: 0,
          coils: [false, false, false, false],
          lastStepPattern: 0
        };
        if (pattern !== current.lastStepPattern && pattern !== 0) {
          let stepDir = 1;
          const last = current.lastStepPattern;
          if (last === 1 && pattern === 2 || last === 2 && pattern === 4 || last === 4 && pattern === 8 || last === 8 && pattern === 1 || last === 9 && pattern === 3 || last === 3 && pattern === 6 || last === 6 && pattern === 12 || last === 12 && pattern === 9) {
            stepDir = 1;
          } else if (last === 2 && pattern === 1 || last === 4 && pattern === 2 || last === 8 && pattern === 4 || last === 1 && pattern === 8 || last === 3 && pattern === 9 || last === 6 && pattern === 3 || last === 12 && pattern === 6 || last === 9 && pattern === 12) {
            stepDir = -1;
          }
          const stepAngle = 7.5;
          current.angle = (current.angle + stepDir * stepAngle + 360) % 360;
          current.stepCount += stepDir;
          current.lastStepPattern = pattern;
        }
        current.coils = [v1, v2, v3, v4];
        this.stepperStates.set(comp.id, current);
      } else if (comp.type === "lcd1602") {
        this.processLcd(comp, termVoltages);
      }
    }
  }
  // Helper to execute an 8-bit instruction or data byte on HD44780
  executeLcdByte(lcd, rs, byteVal) {
    if (!rs) {
      if (byteVal === 1) {
        lcd.lines = ["                ", "                "];
        lcd.cursorRow = 0;
        lcd.cursorCol = 0;
      } else if (byteVal === 2 || byteVal === 3) {
        lcd.cursorRow = 0;
        lcd.cursorCol = 0;
      } else if ((byteVal & 128) !== 0) {
        const addr = byteVal & 127;
        if (addr >= 64) {
          lcd.cursorRow = 1;
          lcd.cursorCol = Math.min(15, Math.max(0, addr - 64));
        } else {
          lcd.cursorRow = 0;
          lcd.cursorCol = Math.min(15, Math.max(0, addr));
        }
      } else if ((byteVal & 32) !== 0) {
        const is8Bit = !!(byteVal & 16);
        lcd.is8BitMode = is8Bit;
      }
    } else {
      const char = byteVal >= 32 && byteVal <= 126 ? String.fromCharCode(byteVal) : " ";
      const r = lcd.cursorRow;
      const c = lcd.cursorCol;
      const lineArr = lcd.lines[r].split("");
      lineArr[c] = char;
      const newLines = [lcd.lines[0], lcd.lines[1]];
      newLines[r] = lineArr.join("");
      lcd.lines = newLines;
      lcd.cursorCol = (c + 1) % 16;
      if (lcd.cursorCol === 0) {
        lcd.cursorRow = (r + 1) % 2;
      }
    }
  }
  // Handle HD44780 8-bit and 4-bit protocol for the 16x2 LCD
  processLcd(comp, termVoltages) {
    var _a;
    const lcd = this.lcdStates.get(comp.id);
    if (!lcd) return;
    const rs = (termVoltages.get(`${comp.id}:rs`) ?? 0) > 2;
    const e = (termVoltages.get(`${comp.id}:e`) ?? 0) > 2;
    const d0 = (termVoltages.get(`${comp.id}:d0`) ?? 0) > 2 ? 1 : 0;
    const d1 = (termVoltages.get(`${comp.id}:d1`) ?? 0) > 2 ? 1 : 0;
    const d2 = (termVoltages.get(`${comp.id}:d2`) ?? 0) > 2 ? 1 : 0;
    const d3 = (termVoltages.get(`${comp.id}:d3`) ?? 0) > 2 ? 1 : 0;
    const d4 = (termVoltages.get(`${comp.id}:d4`) ?? 0) > 2 ? 1 : 0;
    const d5 = (termVoltages.get(`${comp.id}:d5`) ?? 0) > 2 ? 1 : 0;
    const d6 = (termVoltages.get(`${comp.id}:d6`) ?? 0) > 2 ? 1 : 0;
    const d7 = (termVoltages.get(`${comp.id}:d7`) ?? 0) > 2 ? 1 : 0;
    const hasLowerBitsWired = this.wires.some(
      (w) => w.toCompId === comp.id && ["d0", "d1", "d2", "d3"].includes(w.toTermId) || w.fromCompId === comp.id && ["d0", "d1", "d2", "d3"].includes(w.fromTermId)
    );
    const is8Bit = hasLowerBitsWired || lcd.is8BitMode === true || ((_a = comp.props) == null ? void 0 : _a.is8BitMode) === true;
    lcd.is8BitMode = is8Bit;
    if (lcd.lastE && !e) {
      if (is8Bit) {
        const byteVal = d7 << 7 | d6 << 6 | d5 << 5 | d4 << 4 | d3 << 3 | d2 << 2 | d1 << 1 | d0;
        this.executeLcdByte(lcd, rs, byteVal);
      } else {
        const nibble = d7 << 3 | d6 << 2 | d5 << 1 | d4;
        if (!rs && lcd.nibbleBuffer === null && !lcd.initialized && (nibble === 2 || nibble === 3)) {
          if (nibble === 2) {
            lcd.initialized = true;
          }
          lcd.nibbleBuffer = null;
        } else if (lcd.nibbleBuffer === null) {
          lcd.nibbleBuffer = nibble;
        } else {
          const byteVal = lcd.nibbleBuffer << 4 | nibble;
          lcd.nibbleBuffer = null;
          lcd.initialized = true;
          this.executeLcdByte(lcd, rs, byteVal);
        }
      }
    }
    lcd.lastE = e;
  }
}
function parseIntelHex(hexString, flashWordCount = 8192) {
  const progMem = new Uint16Array(flashWordCount);
  let bytesUsed = 0;
  let highestByteAddress = 0;
  let extendedAddress = 0;
  const lines = hexString.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(":")) continue;
    const byteCount = parseInt(trimmed.substring(1, 3), 16);
    const address = parseInt(trimmed.substring(3, 7), 16);
    const recordType = parseInt(trimmed.substring(7, 9), 16);
    if (recordType === 0) {
      const fullAddress = extendedAddress + address;
      for (let i = 0; i < byteCount; i++) {
        const byteVal = parseInt(trimmed.substring(9 + i * 2, 11 + i * 2), 16);
        const currByteAddr = fullAddress + i;
        const wordIndex = currByteAddr >> 1;
        if (wordIndex < flashWordCount) {
          if (currByteAddr % 2 === 0) {
            progMem[wordIndex] = progMem[wordIndex] & 65280 | byteVal;
          } else {
            progMem[wordIndex] = progMem[wordIndex] & 255 | byteVal << 8;
          }
          bytesUsed++;
          if (currByteAddr > highestByteAddress) {
            highestByteAddress = currByteAddr;
          }
        }
      }
    } else if (recordType === 1) {
      break;
    } else if (recordType === 2) {
      extendedAddress = parseInt(trimmed.substring(9, 13), 16) << 4;
    } else if (recordType === 4) {
      extendedAddress = parseInt(trimmed.substring(9, 13), 16) << 16;
    }
  }
  return {
    progMem,
    bytesUsed,
    highestByteAddress: highestByteAddress + 1
  };
}
const EXAMPLE_PROJECTS = [
  {
    id: "led-blink",
    title: "1. LED Blinker (GPIO Output)",
    category: "Beginner",
    description: "Learn the fundamentals of Data Direction Register (DDRA) and Port Register (PORTA) by blinking an LED.",
    language: "c",
    code: `/*
 * ATmega16 LED Blinker
 * Blinks an LED connected to PA0 (Pin 40) every 500ms
 */
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
    // 1. Configure PA0 as OUTPUT
    // Setting bit 0 of DDRA to 1 makes PA0 an output pin
    DDRA |= (1 << PA0);

    while (1) {
        // 2. Turn ON the LED (Set PA0 HIGH = 5V)
        PORTA |= (1 << PA0);
        _delay_ms(500);

        // 3. Turn OFF the LED (Set PA0 LOW = 0V)
        PORTA &= ~(1 << PA0);
        _delay_ms(500);
    }

    return 0;
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "led1", type: "led", x: 580, y: 380, label: "Red LED", props: { color: "red" } },
      { id: "gnd1", type: "gnd", x: 580, y: 480, label: "GND" }
    ],
    wires: [
      // PA0 (Pin 40) -> LED Anode
      { id: "w1", color: "#ef4444", fromCompId: "atmega16", fromTermId: "PA0", toCompId: "led1", toTermId: "anode" },
      // LED Cathode -> GND
      { id: "w2", color: "#1f2937", fromCompId: "led1", fromTermId: "cathode", toCompId: "gnd1", toTermId: "out" }
    ],
    learningNotes: [
      "DDRA (Data Direction Register A): Configures pins as input (0) or output (1).",
      "PORTA: When configured as output, writing 1 puts +5V on the pin, writing 0 puts 0V (GND).",
      "The LED requires current to flow from Anode (+) to Cathode (-) to illuminate."
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9436000C944C000C940000D09AD89A50
:100070002FEF84E39CE0215080409040E1F700C0E6
:100080000000D8982FEF84E39CE0215080409040FE
:0C009000E1F700C00000EBCFF894FFCFB8
:00000001FF
`,
    flashUsed: 156,
    sramUsed: 0
  },
  {
    id: "knight-rider",
    title: "2. Knight Rider / 8-LED Chaser",
    category: "GPIO",
    description: "Control an entire 8-bit port (PORTA) with bitwise shifting to create a scanning Knight Rider chaser light.",
    language: "c",
    code: `/*
 * 8-LED Knight Rider Scanner on PORTA
 * Demonstrates 8-bit port control and bitwise operators
 */
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
    // Set all 8 pins of PORTA as OUTPUT (PA0 to PA7)
    DDRA = 0xFF;

    while (1) {
        // Scan Forward: PA0 -> PA7
        for (uint8_t i = 0; i < 8; i++) {
            PORTA = (1 << i);
            _delay_ms(70);
        }

        // Scan Backward: PA6 -> PA1
        for (int8_t i = 6; i > 0; i--) {
            PORTA = (1 << i);
            _delay_ms(70);
        }
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "ledbar1", type: "led-bar", x: 580, y: 180, label: "8-LED Bar Graph" },
      { id: "gnd1", type: "gnd", x: 740, y: 140, label: "GND" }
    ],
    wires: [
      { id: "w0", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA0", toCompId: "ledbar1", toTermId: "a0" },
      { id: "w1", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA1", toCompId: "ledbar1", toTermId: "a1" },
      { id: "w2", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA2", toCompId: "ledbar1", toTermId: "a2" },
      { id: "w3", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA3", toCompId: "ledbar1", toTermId: "a3" },
      { id: "w4", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA4", toCompId: "ledbar1", toTermId: "a4" },
      { id: "w5", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA5", toCompId: "ledbar1", toTermId: "a5" },
      { id: "w6", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA6", toCompId: "ledbar1", toTermId: "a6" },
      { id: "w7", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA7", toCompId: "ledbar1", toTermId: "a7" },
      { id: "wg", color: "#1f2937", fromCompId: "ledbar1", fromTermId: "com", toCompId: "gnd1", toTermId: "out" }
    ],
    learningNotes: [
      "Writing 0xFF to DDRA configures all 8 pins of Port A as outputs simultaneously.",
      "PORTA = (1 << i) illuminates only the i-th LED at a time.",
      "Useful for bar graph meters, audio visualizers, and battery level gauges."
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9436000C9493000C9400008FEF8ABB22
:10007000E1E0F0E070E460E250E148E034E022E0EA
:1000800090E080E0DF01082E01C0AA0F0A94EAF791
:10009000ABBBAFE7B5EBC1E0A150B040C040E1F76A
:1000A00000C0000001968830910561F77BBB8FE7A7
:1000B00095EBA1E081509040A040E1F700C0000026
:1000C0006BBBBFE7C5EB81E0B150C0408040E1F7BA
:1000D00000C000005BBB9FE7A5EBB1E09150A040E2
:1000E000B040E1F700C000004BBBCFE785EB91E0EB
:1000F000C15080409040E1F700C000003BBBAFE73B
:10010000B5EBC1E0A150B040C040E1F700C0000035
:100110002BBB8FE795EBA1E081509040A040E1F729
:0A01200000C00000ADCFF894FFCF3F
:00000001FF
`,
    flashUsed: 298,
    sramUsed: 0
  },
  {
    id: "button-led",
    title: "3. Push Button & Internal Pull-Up",
    category: "Beginner",
    description: "Read a tactile button input on PB0 using internal pull-up resistor and control an LED on PA0.",
    language: "c",
    code: `/*
 * Push Button with Internal Pull-Up Resistor
 * Press button on PB0 to turn ON the LED on PA0!
 */
#include <avr/io.h>

int main(void) {
    // 1. Configure PA0 as OUTPUT for LED
    DDRA |= (1 << PA0);

    // 2. Configure PB0 as INPUT
    DDRB &= ~(1 << PB0);

    // 3. Enable Internal PULL-UP Resistor on PB0
    // (When DDR=0, writing 1 to PORT activates internal ~30k pull-up)
    PORTB |= (1 << PB0);

    while (1) {
        // Read PINB: When button is pressed, it connects PB0 to GND (logic 0)
        if (!(PINB & (1 << PB0))) {
            PORTA |= (1 << PA0);  // Button Pressed -> LED ON
        } else {
            PORTA &= ~(1 << PA0); // Released -> LED OFF
        }
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "btn1", type: "push-button", x: 100, y: 150, label: "Push Button" },
      { id: "gnd_btn", type: "gnd", x: 40, y: 150, label: "GND" },
      { id: "led1", type: "led", x: 580, y: 380, label: "Green LED", props: { color: "green" } },
      { id: "gnd_led", type: "gnd", x: 580, y: 480, label: "GND" }
    ],
    wires: [
      // PB0 -> Button Pin 2
      { id: "wb1", color: "#eab308", fromCompId: "atmega16", fromTermId: "PB0", toCompId: "btn1", toTermId: "pin2" },
      // Button Pin 1 -> GND
      { id: "wb2", color: "#1f2937", fromCompId: "btn1", fromTermId: "pin1", toCompId: "gnd_btn", toTermId: "out" },
      // PA0 -> LED Anode
      { id: "wl1", color: "#22c55e", fromCompId: "atmega16", fromTermId: "PA0", toCompId: "led1", toTermId: "anode" },
      // LED Cathode -> GND
      { id: "wl2", color: "#1f2937", fromCompId: "led1", fromTermId: "cathode", toCompId: "gnd_led", toTermId: "out" }
    ],
    learningNotes: [
      "Internal Pull-Up saves you from needing external resistors on your breadboard!",
      "When button is unpressed: PB0 reads 1 (HIGH, 5V via pull-up).",
      "When button is pressed: PB0 is shorted to GND and reads 0 (LOW, active-low logic).",
      "Always read inputs from the PINx register (PINB), never from PORTx!"
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9436000C943F000C940000D09AB8987F
:10007000C09AB09902C0D89AFCCFD898FACFF89419
:02008000FFCFB0
:00000001FF
`,
    flashUsed: 130,
    sramUsed: 0
  },
  {
    id: "seven-seg",
    title: "4. 7-Segment Display 0-9 Counter",
    category: "Displays",
    description: "Drive a common-cathode 7-segment display on PORTC to count from 0 to 9.",
    language: "c",
    code: `/*
 * 7-Segment Display Decimal Counter (0 to 9)
 * Connected to PORTC: PC0=a, PC1=b, PC2=c, PC3=d, PC4=e, PC5=f, PC6=g
 */
#include <avr/io.h>
#include <util/delay.h>

// 7-segment digit patterns for common-cathode (g f e d c b a)
const uint8_t DIGITS[10] = {
    0x3F, // 0: a b c d e f
    0x06, // 1: b c
    0x5B, // 2: a b d e g
    0x4F, // 3: a b c d g
    0x66, // 4: b c f g
    0x6D, // 5: a c d f g
    0x7D, // 6: a c d e f g
    0x07, // 7: a b c
    0x7F, // 8: all segments
    0x6F  // 9: a b c d f g
};

int main(void) {
    // Configure entire PORTC as OUTPUT
    DDRC = 0xFF;

    uint8_t count = 0;
    while (1) {
        PORTC = DIGITS[count];
        count = (count + 1) % 10;
        _delay_ms(600);
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "seg1", type: "seven-segment", x: 580, y: 180, label: "7-Segment Display" },
      { id: "gnd1", type: "gnd", x: 700, y: 140, label: "GND" }
    ],
    wires: [
      { id: "w_a", color: "#ef4444", fromCompId: "atmega16", fromTermId: "PC0", toCompId: "seg1", toTermId: "a" },
      { id: "w_b", color: "#f97316", fromCompId: "atmega16", fromTermId: "PC1", toCompId: "seg1", toTermId: "b" },
      { id: "w_c", color: "#eab308", fromCompId: "atmega16", fromTermId: "PC2", toCompId: "seg1", toTermId: "c" },
      { id: "w_d", color: "#22c55e", fromCompId: "atmega16", fromTermId: "PC3", toCompId: "seg1", toTermId: "d" },
      { id: "w_e", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC4", toCompId: "seg1", toTermId: "e" },
      { id: "w_f", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PC5", toCompId: "seg1", toTermId: "f" },
      { id: "w_g", color: "#a855f7", fromCompId: "atmega16", fromTermId: "PC6", toCompId: "seg1", toTermId: "g" },
      { id: "w_com", color: "#1f2937", fromCompId: "seg1", fromTermId: "com", toCompId: "gnd1", toTermId: "out" }
    ],
    learningNotes: [
      "A 7-segment display contains 7 individual LEDs arranged in a figure-8 shape.",
      "Common Cathode means all negative terminals connect together to GND.",
      "Each segment lights up when its corresponding pin is set HIGH (+5V)."
    ],
    precompiledHex: `:100000000C942A000C943F000C943F000C943F0089
:100010000C943F000C943F000C943F000C943F0064
:100020000C943F000C943F000C943F000C943F0054
:100030000C943F000C943F000C943F000C943F0044
:100040000C943F000C943F000C943F000C943F0034
:100050000C943F0011241FBECFE5D4E0DEBFCDBF1E
:1000600010E0A0E6B0E0E8E0F1E002C005900D92FB
:10007000AA36B107D9F70E9441000C9482000C9473
:1000800000008FEF84BB80E02AE030E090E0FC01CC
:10009000E05AFF4F408145BB0196B9010E945A00CA
:1000A0004FEF55EA9EE0415050409040E1F700C0CC
:1000B0000000ECCF97FB072E16F4009407D077FDD5
:1000C00009D00E946E0007FC05D03EF49095819502
:1000D0009F4F0895709561957F4F0895AA1BBB1B94
:1000E00051E107C0AA1FBB1FA617B70710F0A61B38
:1000F000B70B881F991F5A95A9F780959095BC0159
:08010000CD010895F894FFCF32
:0A0108003F065B4F666D7D077F6FB9
:00000001FF
`,
    flashUsed: 274,
    sramUsed: 10
  },
  {
    id: "traffic-light",
    title: "5. Traffic Light Controller",
    category: "GPIO",
    description: "Realistic intersection traffic light sequencer using Red, Yellow, and Green LEDs on PORTD.",
    language: "c",
    code: `/*
 * Traffic Light Timing Controller
 * PD0 = Red, PD1 = Yellow, PD2 = Green
 */
#include <avr/io.h>
#include <util/delay.h>

#define RED_PIN    PD0
#define YELLOW_PIN PD1
#define GREEN_PIN  PD2

int main(void) {
    // Configure PD0, PD1, PD2 as outputs
    DDRD |= (1 << RED_PIN) | (1 << YELLOW_PIN) | (1 << GREEN_PIN);

    while (1) {
        // State 1: RED (Stop)
        PORTD = (1 << RED_PIN);
        _delay_ms(1500);

        // State 2: RED + YELLOW (Prepare to go)
        PORTD = (1 << RED_PIN) | (1 << YELLOW_PIN);
        _delay_ms(600);

        // State 3: GREEN (Go)
        PORTD = (1 << GREEN_PIN);
        _delay_ms(1500);

        // State 4: YELLOW (Caution)
        PORTD = (1 << YELLOW_PIN);
        _delay_ms(700);
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "led_red", type: "led", x: 100, y: 320, label: "Red", props: { color: "red" } },
      { id: "led_yel", type: "led", x: 100, y: 400, label: "Yellow", props: { color: "yellow" } },
      { id: "led_grn", type: "led", x: 100, y: 480, label: "Green", props: { color: "green" } },
      { id: "gnd_traffic", type: "gnd", x: 30, y: 400, label: "GND" }
    ],
    wires: [
      { id: "w_r", color: "#ef4444", fromCompId: "atmega16", fromTermId: "PD0", toCompId: "led_red", toTermId: "anode" },
      { id: "w_y", color: "#eab308", fromCompId: "atmega16", fromTermId: "PD1", toCompId: "led_yel", toTermId: "anode" },
      { id: "w_g", color: "#22c55e", fromCompId: "atmega16", fromTermId: "PD2", toCompId: "led_grn", toTermId: "anode" },
      { id: "w_rk", color: "#1f2937", fromCompId: "led_red", fromTermId: "cathode", toCompId: "gnd_traffic", toTermId: "out" },
      { id: "w_yk", color: "#1f2937", fromCompId: "led_yel", fromTermId: "cathode", toCompId: "gnd_traffic", toTermId: "out" },
      { id: "w_gk", color: "#1f2937", fromCompId: "led_grn", fromTermId: "cathode", toCompId: "gnd_traffic", toTermId: "out" }
    ],
    learningNotes: [
      "State machines are the foundation of embedded control systems.",
      "Defines (#define) create clean, readable hardware abstraction.",
      "Notice how PD0, PD1, PD2 pins turn on and off in exact sequence."
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9436000C9466000C94000081B38760F7
:1000700081BB31E023E094E082E032BB4FEF5EE9E8
:1000800064E2415050406040E1F700C0000022BBF4
:100090004FEF55EA6EE0415050406040E1F700C03C
:1000A000000092BB4FEF5EE964E241505040604077
:1000B000E1F700C0000082BB4FEF56E161E1415023
:1000C00050406040E1F700C00000D7CFF894FFCF68
:00000001FF
`,
    flashUsed: 208,
    sramUsed: 0
  },
  {
    id: "adc-pot",
    title: "6. Analog Potentiometer & ADC Reading",
    category: "Analog & Sensors",
    description: "Read analog voltage (0-5V) via 10-bit ADC channel 0 (PA0) and display level on 8-LED bar graph.",
    language: "c",
    code: `/*
 * ATmega16 10-bit ADC Reader
 * Reads voltage from Potentiometer on PA0 (ADC0)
 * Lights up proportional number of LEDs on PORTB
 */
#include <avr/io.h>
#include <util/delay.h>

void adc_init(void) {
    // AREF = AVcc (+5V), select ADC channel 0 (PA0)
    ADMUX = (1 << REFS0);

    // Enable ADC, prescaler = 64 (8MHz / 64 = 125 kHz ADC clock)
    ADCSRA = (1 << ADEN) | (1 << ADPS2) | (1 << ADPS1);
}

uint16_t adc_read(void) {
    // Start conversion
    ADCSRA |= (1 << ADSC);

    // Wait until conversion completes (ADSC clears to 0)
    while (ADCSRA & (1 << ADSC));

    // Read 10-bit result from ADC data register
    return ADC;
}

int main(void) {
    DDRB = 0xFF; // All PORTB pins as output for LEDs
    adc_init();

    while (1) {
        uint16_t val = adc_read(); // 0 to 1023
        
        // Convert 0..1023 to 0..8 LED bar pattern
        uint8_t num_leds = (val * 8) / 1024;
        uint8_t pattern = 0;
        for (uint8_t i = 0; i <= num_leds && i < 8; i++) {
            pattern |= (1 << i);
        }

        PORTB = pattern;
        _delay_ms(50);
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "pot1", type: "potentiometer", x: 580, y: 380, label: "Potentiometer", props: { value: 0.6 } },
      { id: "vcc1", type: "vcc", x: 580, y: 480, label: "+5V" },
      { id: "gnd1", type: "gnd", x: 680, y: 480, label: "GND" },
      { id: "ledbar1", type: "led-bar", x: 100, y: 150, label: "8-LED Bar" },
      { id: "gnd2", type: "gnd", x: 40, y: 150, label: "GND" }
    ],
    wires: [
      // Potentiometer VCC, GND, Wiper -> PA0
      { id: "w_pot_v", color: "#ef4444", fromCompId: "pot1", fromTermId: "vcc", toCompId: "vcc1", toTermId: "out" },
      { id: "w_pot_g", color: "#1f2937", fromCompId: "pot1", fromTermId: "gnd", toCompId: "gnd1", toTermId: "out" },
      { id: "w_pot_w", color: "#06b6d4", fromCompId: "pot1", fromTermId: "wiper", toCompId: "atmega16", toTermId: "PA0" },
      // PORTB to LED Bar
      { id: "wb0", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB0", toCompId: "ledbar1", toTermId: "a0" },
      { id: "wb1", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB1", toCompId: "ledbar1", toTermId: "a1" },
      { id: "wb2", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB2", toCompId: "ledbar1", toTermId: "a2" },
      { id: "wb3", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB3", toCompId: "ledbar1", toTermId: "a3" },
      { id: "wb4", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB4", toCompId: "ledbar1", toTermId: "a4" },
      { id: "wb5", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB5", toCompId: "ledbar1", toTermId: "a5" },
      { id: "wb6", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB6", toCompId: "ledbar1", toTermId: "a6" },
      { id: "wb7", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB7", toCompId: "ledbar1", toTermId: "a7" },
      { id: "w_bar_g", color: "#1f2937", fromCompId: "ledbar1", fromTermId: "com", toCompId: "gnd2", toTermId: "out" }
    ],
    learningNotes: [
      "ATmega16 has an integrated 10-bit Successive Approximation ADC (8 channels on PORTA).",
      "Input voltage between 0V and 5V translates linearly into integer 0 to 1023.",
      "Try rotating the potentiometer knob in the circuit panel to see the LEDs update in real time!"
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9441000C946E000C94000080E487B95B
:1000700086E886B90895369A3699FECF84B195B14F
:1000800008958FEF87BB0E943600C1E0D0E00E9448
:100090003B0023E0880F991F2A95E1F7392F369509
:1000A000369590E080E020E0AE01082E01C0440FBC
:1000B0000A94EAF7242B41E0480F341720F0019608
:1000C0008830910589F728BB2FE788E391E021501C
:1000D00080409040E1F700C00000D9CFF894FFCFF6
:00000001FF
`,
    flashUsed: 224,
    sramUsed: 0
  },
  {
    id: "lcd-hello",
    title: "7. 16x2 LCD Character Display",
    category: "Displays",
    description: "Interface the industry-standard HD44780 16x2 Liquid Crystal Display in 4-bit bus mode.",
    language: "c",
    code: `/*
 * 16x2 Character LCD Driver (HD44780, 4-bit Mode)
 * RS = PB0, E = PB1, D4=PB4, D5=PB5, D6=PB6, D7=PB7
 */
#include <avr/io.h>
#include <util/delay.h>

void lcd_pulse_e(void) {
    PORTB |= (1 << PB1);  // E HIGH
    _delay_us(5);
    PORTB &= ~(1 << PB1); // E LOW
    _delay_us(50);
}

void lcd_send_nibble(uint8_t nibble) {
    // Send high 4 bits to PB4-PB7
    PORTB = (PORTB & 0x0F) | ((nibble & 0x0F) << 4);
    lcd_pulse_e();
}

void lcd_cmd(uint8_t cmd) {
    PORTB &= ~(1 << PB0); // RS = 0 (Command)
    lcd_send_nibble(cmd >> 4);
    lcd_send_nibble(cmd & 0x0F);
    _delay_ms(2);
}

void lcd_char(char c) {
    PORTB |= (1 << PB0);  // RS = 1 (Data)
    lcd_send_nibble(c >> 4);
    lcd_send_nibble(c & 0x0F);
    _delay_us(50);
}

void lcd_print(const char* str) {
    while (*str) lcd_char(*str++);
}

int main(void) {
    DDRB = 0xFF; // PB0..PB7 all outputs
    _delay_ms(50);

    // HD44780 4-bit Initialization sequence
    lcd_send_nibble(0x03); _delay_ms(5);
    lcd_send_nibble(0x03); _delay_ms(5);
    lcd_send_nibble(0x03); _delay_ms(5);
    lcd_send_nibble(0x02); // 4-bit mode

    lcd_cmd(0x28); // 2 lines, 5x8 font
    lcd_cmd(0x0C); // Display ON, Cursor OFF
    lcd_cmd(0x01); // Clear display
    _delay_ms(2);

    lcd_print("ATmega16 Ready!");
    lcd_cmd(0xC0); // Move to 2nd row
    lcd_print("Learning AVR C");

    while (1) {
        // Idle
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 240, y: 120, label: "ATmega16" },
      { id: "lcd1", type: "lcd1602", x: 550, y: 120, label: "16x2 LCD" }
    ],
    wires: [
      { id: "w_rs", color: "#ef4444", fromCompId: "atmega16", fromTermId: "PB0", toCompId: "lcd1", toTermId: "rs" },
      { id: "w_e", color: "#eab308", fromCompId: "atmega16", fromTermId: "PB1", toCompId: "lcd1", toTermId: "e" },
      { id: "w_d4", color: "#22c55e", fromCompId: "atmega16", fromTermId: "PB4", toCompId: "lcd1", toTermId: "d4" },
      { id: "w_d5", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PB5", toCompId: "lcd1", toTermId: "d5" },
      { id: "w_d6", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB6", toCompId: "lcd1", toTermId: "d6" },
      { id: "w_d7", color: "#a855f7", fromCompId: "atmega16", fromTermId: "PB7", toCompId: "lcd1", toTermId: "d7" }
    ],
    learningNotes: [
      "4-bit mode saves microcontroller pins: uses only 6 wires instead of 10!",
      "RS (Register Select): LOW for instructions (clear, cursor position), HIGH for character data.",
      "E (Enable): Triggered by a falling edge to latch data into the display controller."
    ],
    precompiledHex: `:100000000C942A000C943F000C943F000C943F0089
:100010000C943F000C943F000C943F000C943F0064
:100020000C943F000C943F000C943F000C943F0054
:100030000C943F000C943F000C943F000C943F0044
:100040000C943F000C943F000C943F000C943F0034
:100050000C943F0011241FBECFE5D4E0DEBFCDBF1E
:1000600010E0A0E6B0E0ECE9F1E002C005900D92EE
:10007000A038B107D9F70E9488000C94CC000C94EA
:100080000000C19A8DE08A95F1F70000C19885E8DB
:100090008A95F1F70000089598B39F7040E1849F1E
:1000A00090011124922B98BB0C944100CF93C82F40
:1000B000C09882958F700E944C008C2F8F700E9488
:1000C0004C008FE99FE00197F1F700C00000CF914D
:1000D0000895CF93C82FC09A859585958595859568
:1000E0000E944C008C2F8F700E944C0085E88A95EE
:1000F000F1F70000CF910895CF93DF93EC01899140
:10010000811103C0DF91CF9108950E946900F7CF5C
:100110008FEF87BB2FE788E391E02150804090402C
:10012000E1F700C0000083E00E944C008FE097E2FE
:100130000197F1F700C0000083E00E944C008FE0BF
:1001400097E20197F1F700C0000083E00E944C00A5
:100150008FE097E20197F1F700C0000082E00E9473
:100160004C0088E20E9456008CE00E94560081E01C
:100170000E9456008FE99FE00197F1F700C0000050
:1001800080E690E00E947C0080EC0E94560080E7B0
:0C01900090E00E947C00FFCFF894FFCFAD
:10019C0041546D6567613136205265616479210087
:1001AC004C6561726E696E672041565220430000A7
:00000001FF
`,
    flashUsed: 444,
    sramUsed: 32
  },
  {
    id: "buzzer-melody",
    title: "8. Piezo Buzzer & Tone Synthesis",
    category: "Displays",
    description: "Synthesize audio frequencies using software delay toggling on PD5 to play musical alert beeps.",
    language: "c",
    code: `/*
 * Piezo Buzzer Tone Synthesis on PD5
 * Produces pleasant audible pitch through frequency toggling
 */
#include <avr/io.h>
#include <util/delay.h>

void play_tone(uint16_t freq_hz, uint16_t duration_ms) {
    uint32_t period_us = 1000000UL / freq_hz;
    uint32_t half_period = period_us / 2;
    uint32_t cycles = ((uint32_t)freq_hz * duration_ms) / 1000;

    for (uint32_t i = 0; i < cycles; i++) {
        PORTD |= (1 << PD5);
        _delay_us(500); // approx ~1kHz tone
        PORTD &= ~(1 << PD5);
        _delay_us(500);
    }
}

int main(void) {
    DDRD |= (1 << PD5); // Buzzer output on PD5

    while (1) {
        // Play alert tones
        play_tone(1000, 200);
        _delay_ms(100);
        play_tone(1500, 200);
        _delay_ms(100);
        play_tone(2000, 300);
        _delay_ms(1500);
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "buzz1", type: "buzzer", x: 100, y: 380, label: "Piezo Buzzer" },
      { id: "gnd_b", type: "gnd", x: 40, y: 380, label: "GND" }
    ],
    wires: [
      { id: "w_bpos", color: "#f59e0b", fromCompId: "atmega16", fromTermId: "PD5", toCompId: "buzz1", toTermId: "pos" },
      { id: "w_bneg", color: "#1f2937", fromCompId: "buzz1", fromTermId: "neg", toCompId: "gnd_b", toTermId: "out" }
    ],
    learningNotes: [
      "Sound is created by air pressure waves produced by rapid vibration.",
      "Toggling an I/O pin between 0V and 5V rapidly flexes the piezo ceramic disc.",
      "Turn up your browser volume to hear the synthesized audio tone!"
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E945B000C94BB000C9400009C01DB011F
:100070000E94AC0028EE33E040E050E00E948A008D
:1000800080E090E0DC0182179307A407B50709F42C
:100090000895959AE7EEF3E03197F1F700C000007C
:1000A0009598E7EEF3E03197F1F700C00000019674
:1000B000A11DB11DE8CF8D9A68EC70E088EE93E049
:1000C0000E9436002FEF80E792E021508040904060
:1000D000E1F700C0000068EC70E08CED95E00E9454
:1000E00036002FEF80E792E0215080409040E1F70A
:1000F00000C000006CE271E080ED97E00E943600E5
:100100002FEF8EE994E2215080409040E1F700C04B
:100110000000D2CFA1E21A2EAA1BBB1BFD010DC00D
:10012000AA1FBB1FEE1FFF1FA217B307E407F507A7
:1001300020F0A21BB30BE40BF50B661F771F881F83
:10014000991F1A9469F760957095809590959B0119
:10015000AC01BD01CF010895A29FB001B39FC001C2
:10016000A39F700D811D1124911DB29F700D811DE3
:0A0170001124911D0895F894FFCFAB
:00000001FF
`,
    flashUsed: 378,
    sramUsed: 0
  },
  {
    id: "ext-interrupt",
    title: "9. Hardware Interrupt (INT0)",
    category: "Interrupts",
    description: "Handle asynchronous hardware events using ATmega16 External Interrupt 0 (INT0) on pin PD2.",
    language: "c",
    code: `/*
 * ATmega16 Hardware Interrupt (INT0)
 * External button connected to PD2 (INT0) triggers ISR instantly!
 */
#include <avr/io.h>
#include <avr/interrupt.h>

// Interrupt Service Routine for External Interrupt 0
ISR(INT0_vect) {
    // Toggle the indicator LED on PA7 immediately
    PORTA ^= (1 << PA7);
}

int main(void) {
    // PA7 as LED output
    DDRA |= (1 << PA7);

    // PD2 as input with pull-up enabled
    DDRD &= ~(1 << PD2);
    PORTD |= (1 << PD2);

    // Configure MCUCR for Falling Edge trigger on INT0 (ISC01=1, ISC00=0)
    MCUCR |= (1 << ISC01);
    MCUCR &= ~(1 << ISC00);

    // Enable INT0 in General Interrupt Control Register (GICR)
    GICR |= (1 << INT0);

    // Enable Global Interrupts (sets I-bit in SREG)
    sei();

    while (1) {
        // Main loop is free to do other tasks!
        // CPU automatically vectors to ISR(INT0_vect) on button press.
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "btn_int", type: "push-button", x: 100, y: 360, label: "INT0 Button" },
      { id: "gnd_int", type: "gnd", x: 40, y: 360, label: "GND" },
      { id: "led_int", type: "led", x: 580, y: 150, label: "Interrupt LED", props: { color: "blue" } },
      { id: "gnd_led_i", type: "gnd", x: 580, y: 250, label: "GND" }
    ],
    wires: [
      { id: "w_int", color: "#ec4899", fromCompId: "atmega16", fromTermId: "PD2", toCompId: "btn_int", toTermId: "pin2" },
      { id: "w_gint", color: "#1f2937", fromCompId: "btn_int", fromTermId: "pin1", toCompId: "gnd_int", toTermId: "out" },
      { id: "w_l", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA7", toCompId: "led_int", toTermId: "anode" },
      { id: "w_lk", color: "#1f2937", fromCompId: "led_int", fromTermId: "cathode", toCompId: "gnd_led_i", toTermId: "out" }
    ],
    learningNotes: [
      "Interrupts pause the main program immediately to execute time-critical code.",
      "INT0 is located on PD2 (Pin 16).",
      "sei() sets the global interrupt flag (I-bit in SREG).",
      "Notice the SREG inspector updates the I flag when sei() is called!"
    ],
    precompiledHex: `:100000000C942A000C9436000C9434000C943400A8
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9445000C9453000C9400001F920F92C4
:100070000FB60F9211248F938BB380588BBB8F9147
:100080000F900FBE0F901F901895D79A8A98929A4A
:1000900085B7826085BF85B78E7F85BF8BB780644B
:0A00A0008BBF7894FFCFF894FFCFD8
:00000001FF
`,
    flashUsed: 170,
    sramUsed: 0
  },
  {
    id: "asm-masterclass",
    title: "10. AVR Assembly Masterclass (LDI, OUT, RJMP)",
    category: "Assembly",
    description: "Learn pure AVR Assembly instruction by instruction. Watch registers R16-R31 update in the inspector!",
    language: "asm",
    code: `; ==========================================
; ATmega16 Pure Assembly Tutorial
; Learn LDI, OUT, IN, RJMP, SBI, CBI bitwise!
; ==========================================

.equ DDRA  = 0x1A   ; I/O Address for Data Direction Port A
.equ PORTA = 0x1B   ; I/O Address for Port A Output
.equ PINB  = 0x16   ; I/O Address for Port B Input
.equ DDRB  = 0x17   ; I/O Address for Data Direction Port B
.equ PORTB = 0x18   ; I/O Address for Port B Output

.org 0x0000
    rjmp main       ; Reset Vector jumps to main program

main:
    ; 1. Initialize Stack Pointer to RAMEND (0x045F)
    ldi r16, 0x5F
    out 0x3D, r16   ; SPL
    ldi r16, 0x04
    out 0x3E, r16   ; SPH

    ; 2. Configure PA0 as Output using SBI (Set Bit in I/O)
    sbi DDRA, 0

    ; 3. Configure PB0 as Input with Pull-Up
    cbi DDRB, 0     ; Clear Bit in I/O -> Input
    sbi PORTB, 0    ; Set Bit in I/O -> Pull-Up ON

loop:
    ; 4. Turn LED ON: Set Bit 0 of PORTA
    sbi PORTA, 0

    ; 5. Delay loop: Counts down R17 and R18
    ldi r17, 0x40
delay1:
    ldi r18, 0xFF
sub_delay1:
    dec r18
    brne sub_delay1
    dec r17
    brne delay1

    ; 6. Turn LED OFF: Clear Bit 0 of PORTA
    cbi PORTA, 0

    ; 7. Delay loop
    ldi r17, 0x40
delay2:
    ldi r18, 0xFF
sub_delay2:
    dec r18
    brne sub_delay2
    dec r17
    brne delay2

    ; 8. Repeat loop
    rjmp loop
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "led_asm", type: "led", x: 580, y: 380, label: "Assembly LED", props: { color: "blue" } },
      { id: "gnd_asm", type: "gnd", x: 580, y: 480, label: "GND" }
    ],
    wires: [
      { id: "w1", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA0", toCompId: "led_asm", toTermId: "anode" },
      { id: "w2", color: "#1f2937", fromCompId: "led_asm", fromTermId: "cathode", toCompId: "gnd_asm", toTermId: "out" }
    ],
    learningNotes: [
      "LDI (Load Immediate): Loads an 8-bit constant into registers R16 to R31.",
      "OUT / IN: Transfers data between general purpose registers and I/O registers.",
      "SBI / CBI: Sets or clears a single individual bit in I/O space in 1 CPU cycle!",
      "DEC & BRNE: Decrements register and branches if not zero (Zero flag Z in SREG).",
      'Use the "Step Instruction" button to step through each assembly line and watch R17, R18 change!'
    ]
  },
  {
    id: "lm35-temp",
    title: "11. LM35 Temperature Sensor & ADC",
    category: "Analog & Sensors",
    description: "Read real-time temperature from an analog LM35 precision temperature sensor on PA0 (ADC0) using ATmega16 internal 2.56V reference.",
    language: "c",
    code: `/*
 * ATmega16 LM35 Temperature Sensor Reader
 * Connected to PA0 (ADC0)
 * Uses ATmega16 Internal 2.56V Reference (REFS1:REFS0 = 11)
 *
 * LM35 formula: Vout = 10 mV / °C
 * ADC resolution with 2.56V ref: 2560 mV / 1024 = 2.5 mV/step
 * Temperature (°C) = (ADC_value * 2.5) / 10 = ADC_value / 4
 */
#include <avr/io.h>
#include <util/delay.h>

void adc_init(void) {
    // Select Internal 2.56V Voltage Reference (REFS1=1, REFS0=1), Channel ADC0 (PA0)
    ADMUX = (1 << REFS1) | (1 << REFS0);

    // Enable ADC, set clock prescaler to 64 (8MHz / 64 = 125 kHz)
    ADCSRA = (1 << ADEN) | (1 << ADPS2) | (1 << ADPS1);
}

uint16_t adc_read(void) {
    ADCSRA |= (1 << ADSC); // Start conversion
    while (ADCSRA & (1 << ADSC)); // Wait for completion
    return ADC;
}

int main(void) {
    // PORTB outputs to 8-LED Bar graph as temperature indicator
    DDRB = 0xFF;
    adc_init();

    while (1) {
        uint16_t raw_adc = adc_read();
        
        // Temperature in Celsius: ADC / 4
        // (e.g. 20°C -> ADC ~80, 40°C -> ADC ~160, 60°C -> ADC ~240)
        uint16_t temp_c = raw_adc / 4;

        // Map 0°C - 80°C to 8-LED bar graph (10°C per LED)
        uint8_t num_leds = temp_c / 10;
        uint8_t pattern = 0;
        for (uint8_t i = 0; i <= num_leds && i < 8; i++) {
            pattern |= (1 << i);
        }

        PORTB = pattern;
        _delay_ms(100);
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "lm35_1", type: "lm35", x: 580, y: 360, label: "LM35", props: { temp: 35 } },
      { id: "vcc_lm", type: "vcc", x: 580, y: 480, label: "+5V" },
      { id: "gnd_lm", type: "gnd", x: 680, y: 480, label: "GND" },
      { id: "ledbar_t", type: "led-bar", x: 100, y: 150, label: "Temp Gauge" },
      { id: "gnd_bar", type: "gnd", x: 40, y: 150, label: "GND" }
    ],
    wires: [
      // LM35 VCC, GND, and VOUT -> PA0 (ADC0)
      { id: "wt_v", color: "#ef4444", fromCompId: "lm35_1", fromTermId: "vcc", toCompId: "vcc_lm", toTermId: "out" },
      { id: "wt_g", color: "#1f2937", fromCompId: "lm35_1", fromTermId: "gnd", toCompId: "gnd_lm", toTermId: "out" },
      { id: "wt_o", color: "#10b981", fromCompId: "lm35_1", fromTermId: "vout", toCompId: "atmega16", toTermId: "PA0" },
      // PORTB to LED Bar
      { id: "wb0", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB0", toCompId: "ledbar_t", toTermId: "a0" },
      { id: "wb1", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB1", toCompId: "ledbar_t", toTermId: "a1" },
      { id: "wb2", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB2", toCompId: "ledbar_t", toTermId: "a2" },
      { id: "wb3", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB3", toCompId: "ledbar_t", toTermId: "a3" },
      { id: "wb4", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB4", toCompId: "ledbar_t", toTermId: "a4" },
      { id: "wb5", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB5", toCompId: "ledbar_t", toTermId: "a5" },
      { id: "wb6", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB6", toCompId: "ledbar_t", toTermId: "a6" },
      { id: "wb7", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB7", toCompId: "ledbar_t", toTermId: "a7" },
      { id: "wt_bg", color: "#1f2937", fromCompId: "ledbar_t", fromTermId: "com", toCompId: "gnd_bar", toTermId: "out" }
    ],
    learningNotes: [
      "The LM35 produces an analog output voltage linearly proportional to Celsius temperature (10 mV/°C).",
      "At 25°C, output is 250 mV (0.25V). At 100°C, output is 1000 mV (1.0V).",
      "ATmega16 internal 2.56V bandgap reference provides high precision (2.5 mV per count).",
      "Drag the slider on the LM35 sensor in the circuit view to see the temperature update live!"
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9441000C947F000C94000080EC87B942
:1000700086E886B90895369A3699FECF84B195B14F
:1000800008958FEF87BB0E943600C8E2D0E001E000
:1000900010E00E943B00BE010E946B0090E080E0F7
:1000A00020E0A801082E01C0440F0A94EAF7242B8F
:1000B00031E0380F631720F001968830910589F7F9
:1000C00028BB2FEF80E792E0215080409040E1F77D
:1000D00000C00000DECFAA1BBB1B51E107C0AA1F56
:1000E000BB1FA617B70710F0A61BB70B881F991FD9
:1000F0005A95A9F780959095BC01CD010895F89483
:02010000FFCF2F
:00000001FF
`,
    flashUsed: 258,
    sramUsed: 0
  },
  {
    id: "dc-motor-pwm",
    title: "12. DC Motor Speed Control (PWM)",
    category: "Analog & Sensors",
    description: "Control DC motor rotation speed smoothly using Timer0 Fast PWM (OC0 pin PB3) and a Potentiometer on PA0 (ADC0).",
    language: "c",
    code: `/*
 * ATmega16 DC Motor Speed Control via Fast PWM
 * - Potentiometer on PA0 (ADC0) sets desired speed
 * - Timer0 in Fast PWM mode generates pulse width on PB3 (OC0)
 * - DC motor speed varies from 0 to 2,400 RPM!
 */
#include <avr/io.h>
#include <util/delay.h>

void pwm_init(void) {
    // PB3 (OC0) as output
    DDRB |= (1 << PB3);

    // Fast PWM mode (WGM01:WGM00 = 11)
    // Non-inverting compare match (COM01=1, COM00=0)
    // Clock prescaler = 64 (CS01=1, CS00=1)
    TCCR0 = (1 << WGM00) | (1 << WGM01) | (1 << COM01) | (1 << CS01) | (1 << CS00);
    OCR0 = 0; // Initial 0% duty cycle
}

void adc_init(void) {
    // AVCC reference, Channel ADC0 (PA0)
    ADMUX = (1 << REFS0);
    ADCSRA = (1 << ADEN) | (1 << ADPS2) | (1 << ADPS1);
}

uint16_t adc_read(void) {
    ADCSRA |= (1 << ADSC);
    while (ADCSRA & (1 << ADSC));
    return ADC;
}

int main(void) {
    pwm_init();
    adc_init();

    while (1) {
        // Read 10-bit analog voltage from Potentiometer (0 to 1023)
        uint16_t val = adc_read();

        // Map 10-bit ADC (0-1023) to 8-bit PWM duty cycle (0-255)
        OCR0 = (uint8_t)(val >> 2);

        _delay_ms(30);
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "motor1", type: "dc-motor", x: 100, y: 220, label: "DC Motor" },
      { id: "gnd_m", type: "gnd", x: 40, y: 220, label: "GND" },
      { id: "pot_m", type: "potentiometer", x: 580, y: 380, label: "Speed Dial", props: { value: 0.75 } },
      { id: "vcc_pot", type: "vcc", x: 580, y: 480, label: "+5V" },
      { id: "gnd_pot", type: "gnd", x: 680, y: 480, label: "GND" }
    ],
    wires: [
      // PB3 (OC0) -> Motor (+)
      { id: "wm_p", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PB3", toCompId: "motor1", toTermId: "pos" },
      // Motor (-) -> GND
      { id: "wm_n", color: "#1f2937", fromCompId: "motor1", fromTermId: "neg", toCompId: "gnd_m", toTermId: "out" },
      // Potentiometer VCC, GND, Wiper -> PA0
      { id: "wp_v", color: "#ef4444", fromCompId: "pot_m", fromTermId: "vcc", toCompId: "vcc_pot", toTermId: "out" },
      { id: "wp_g", color: "#1f2937", fromCompId: "pot_m", fromTermId: "gnd", toCompId: "gnd_pot", toTermId: "out" },
      { id: "wp_w", color: "#eab308", fromCompId: "pot_m", fromTermId: "wiper", toCompId: "atmega16", toTermId: "PA0" }
    ],
    learningNotes: [
      "PWM (Pulse Width Modulation) controls motor speed by rapidly pulsing power ON and OFF.",
      "OCR0 register sets the duty cycle: 0 = 0% (Stopped), 128 = 50% (Medium), 255 = 100% (Full Speed).",
      "The fan blades rotate visually in the circuit canvas proportional to OCR0 duty cycle!"
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9446000C9458000C940000BB9A8BE64A
:1000700083BF1CBE089580E487B986E886B90895D9
:10008000369A3699FECF84B195B108950E94360014
:100090000E943B000E944000969587959695879513
:1000A0008CBF8FE59AEE0197F1F700C00000F2CF08
:0400B000F894FFCFF2
:00000001FF
`,
    flashUsed: 180,
    sramUsed: 0
  },
  {
    id: "stepper-seq",
    title: "13. Stepper Motor 4-Phase Sequencer",
    category: "Displays",
    description: "Drive a 4-phase unipolar stepper motor using Port C (PC0-PC3) in full-step excitation mode with live shaft angle display.",
    language: "c",
    code: `/*
 * ATmega16 4-Phase Stepper Motor Sequencer
 * Drives 4 coils using PC0, PC1, PC2, PC3
 * Standard 4-step sequence:
 * Step 1: 0001 (Coil 1)
 * Step 2: 0010 (Coil 2)
 * Step 3: 0100 (Coil 3)
 * Step 4: 1000 (Coil 4)
 */
#include <avr/io.h>
#include <util/delay.h>

// 4-step excitation wave drive pattern
const uint8_t STEP_SEQUENCE[4] = {
    0x01, // 0000 0001: Phase 1 ON
    0x02, // 0000 0010: Phase 2 ON
    0x04, // 0000 0100: Phase 3 ON
    0x08  // 0000 1000: Phase 4 ON
};

int main(void) {
    // Configure PC0, PC1, PC2, PC3 as outputs for motor coils
    DDRC |= 0x0F;

    while (1) {
        // Rotate Clockwise 360 degrees (48 steps)
        for (uint16_t i = 0; i < 48; i++) {
            PORTC = (PORTC & 0xF0) | STEP_SEQUENCE[i % 4];
            _delay_ms(80);
        }

        _delay_ms(500);

        // Rotate Counter-Clockwise 360 degrees
        for (int16_t i = 47; i >= 0; i--) {
            PORTC = (PORTC & 0xF0) | STEP_SEQUENCE[i % 4];
            _delay_ms(80);
        }

        _delay_ms(500);
    }
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "step1", type: "stepper-motor", x: 580, y: 180, label: "Stepper" },
      { id: "gnd_st", type: "gnd", x: 700, y: 140, label: "GND" }
    ],
    wires: [
      { id: "ws1", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PC0", toCompId: "step1", toTermId: "in1" },
      { id: "ws2", color: "#eab308", fromCompId: "atmega16", fromTermId: "PC1", toCompId: "step1", toTermId: "in2" },
      { id: "ws3", color: "#22c55e", fromCompId: "atmega16", fromTermId: "PC2", toCompId: "step1", toTermId: "in3" },
      { id: "ws4", color: "#ec4899", fromCompId: "atmega16", fromTermId: "PC3", toCompId: "step1", toTermId: "in4" },
      { id: "ws_g", color: "#1f2937", fromCompId: "step1", fromTermId: "com", toCompId: "gnd_st", toTermId: "out" }
    ],
    learningNotes: [
      "Stepper motors move in precise angular steps by energizing stator electromagnet coils sequentially.",
      "Watch each coil indicator (1, 2, 3, 4) illuminate in synchronization with the program!",
      "The central needle shows the exact rotor position in degrees (0° to 360°)."
    ],
    precompiledHex: `:100000000C942A000C943F000C943F000C943F0089
:100010000C943F000C943F000C943F000C943F0064
:100020000C943F000C943F000C943F000C943F0054
:100030000C943F000C943F000C943F000C943F0044
:100040000C943F000C943F000C943F000C943F0034
:100050000C943F0011241FBECFE5D4E0DEBFCDBF1E
:1000600010E0A0E6B0E0E6E1F1E002C005900D92FC
:10007000A436B107D9F70E9441000C9489000C9472
:10008000000084B38F6084BB30E020E085B3F901C9
:10009000E370FF27E05AFF4F807F9081892B85BB5B
:1000A0004FEF83EF91E0415080409040E1F700C076
:1000B00000002F5F3F4F2033310541F72FEF44E31E
:1000C0008CE0215040408040E1F700C000002FE26A
:1000D00030E085B3F901E370FF27E05AFF4F807FDE
:1000E0009081892B85BB9FEF43EF81E09150404089
:1000F0008040E1F700C000002150310950F72FEF98
:1001000044E38CE0215040408040E1F700C0000013
:06011000BBCFF894FFCF05
:0401160001020408D6
:00000001FF
`,
    flashUsed: 282,
    sramUsed: 4
  },
  {
    id: "press-switch-demo",
    title: "14. Press Switch (Latching Input)",
    category: "Inputs",
    description: "Read an industrial latching press switch on PB0 with internal pull-up and drive an active LED on PA0.",
    language: "c",
    code: `/*
 * ATmega16 Latching Press Switch Demo
 * PB0 = Press Switch (active-low with internal pull-up)
 * PA0 = Green Indicator LED
 *
 * Click the Press Switch on the breadboard to latch it ON (closed),
 * and click again to release it OFF (open).
 */
#include <avr/io.h>

int main(void) {
    // 1. Configure PA0 as OUTPUT for LED
    DDRA |= (1 << PA0);

    // 2. Configure PB0 as INPUT with PULL-UP
    DDRB &= ~(1 << PB0);
    PORTB |= (1 << PB0);

    while (1) {
        // Read PINB: When switch is latched CLOSED, PB0 connects to GND (logic 0)
        if (!(PINB & (1 << PB0))) {
            PORTA |= (1 << PA0); // Switch ON -> LED ON
        } else {
            PORTA &= ~(1 << PA0); // Switch OFF -> LED OFF
        }
    }

    return 0;
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "sw1", type: "toggle-switch", x: 80, y: 160, label: "SW1", props: { closed: false } },
      { id: "gnd_sw", type: "gnd", x: 80, y: 310, label: "GND" },
      { id: "led1", type: "led", x: 580, y: 380, label: "Status LED", props: { color: "green" } },
      { id: "gnd_led", type: "gnd", x: 580, y: 480, label: "GND" }
    ],
    wires: [
      { id: "wsw1", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PB0", toCompId: "sw1", toTermId: "pin1" },
      { id: "wsw2", color: "#1f2937", fromCompId: "sw1", fromTermId: "pin2", toCompId: "gnd_sw", toTermId: "out" },
      { id: "wled1", color: "#22c55e", fromCompId: "atmega16", fromTermId: "PA0", toCompId: "led1", toTermId: "anode" },
      { id: "wled2", color: "#1f2937", fromCompId: "led1", fromTermId: "cathode", toCompId: "gnd_led", toTermId: "out" }
    ],
    learningNotes: [
      "A Press Switch (latching push switch) maintains its contact state after being pressed, unlike a momentary tactile button.",
      "Click the switch once to latch it CLOSED (ON), and click it again to release it OPEN (OFF).",
      "The neon indicator dot illuminates when the switch is closed."
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9436000C943F000C940000D09AB8987F
:10007000C09AB09902C0D89AFCCFD898FACFF89419
:02008000FFCFB0
:00000001FF
`,
    flashUsed: 130,
    sramUsed: 0
  },
  {
    id: "internal-pullup-demo",
    title: "15. Internal Pull-Up Resistors (PORTA = 0xF0)",
    category: "Inputs",
    description: "Learn how PORTA = 0xF0 activates the ATmega16 internal ~30kΩ pull-up resistors on PA4..PA7 to eliminate floating pins.",
    language: "c",
    code: `/*
 * ATmega16 Internal Pull-Up Resistors & Floating Pin Demo
 *
 * DDRA = 0x00;   // Configure all Port A pins as INPUT
 * PORTA = 0xF0;  // Enable internal pull-ups on PA4..PA7 (0b11110000)
 *                // PA0..PA3 remain floating (Hi-Z, no pull-up)
 *
 * DDRC = 0x01;   // PC0 as OUTPUT for Status LED
 */
#include <avr/io.h>

int main(void) {
    // 1. All Port A pins configured as INPUT
    DDRA = 0x00;

    // 2. Enable internal pull-up resistor on PA4 so it doesn't float!
    // High nibble (PA4, PA5, PA6, PA7) pull-ups enabled:
    PORTA = 0xF0;

    // 3. Configure PC0 as OUTPUT for indicator LED
    DDRC |= (1 << PC0);

    while (1) {
        // PA4 has pull-up enabled:
        // When switch is OPEN: PA4 is held stably at +5V HIGH (bit is 1)
        // When switch is CLOSED to GND: PA4 is pulled to 0V LOW (bit is 0)
        if (!(PINA & (1 << PA4))) {
            // Switch pressed/closed -> LED ON
            PORTC |= (1 << PC0);
        } else {
            // Switch open (pulled HIGH by internal 30kΩ resistor) -> LED OFF
            PORTC &= ~(1 << PC0);
        }
    }

    return 0;
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "sw1", type: "press-switch", x: 580, y: 220, label: "PA4 Switch", props: { closed: false } },
      { id: "gnd_sw", type: "gnd", x: 720, y: 220, label: "GND" },
      { id: "led1", type: "led", x: 580, y: 380, label: "PC0 LED", props: { color: "amber" } },
      { id: "gnd_led", type: "gnd", x: 580, y: 480, label: "GND" }
    ],
    wires: [
      { id: "w_sw1", color: "#f59e0b", fromCompId: "atmega16", fromTermId: "PA4", toCompId: "sw1", toTermId: "pin1" },
      { id: "w_gnd_sw", color: "#1f2937", fromCompId: "sw1", fromTermId: "pin2", toCompId: "gnd_sw", toTermId: "out" },
      { id: "w_led", color: "#eab308", fromCompId: "atmega16", fromTermId: "PC0", toCompId: "led1", toTermId: "anode" },
      { id: "w_gnd_led", color: "#1f2937", fromCompId: "led1", fromTermId: "cathode", toCompId: "gnd_led", toTermId: "out" }
    ],
    learningNotes: [
      "PORTA = 0xF0; enables the internal ~30kΩ pull-up resistor on PA4, PA5, PA6, and PA7.",
      "Notice the amber PU badges on PA4..PA7 on the chip and in the register viewer, while PA0..PA3 have sky FLT (Floating) badges.",
      "Without pull-up resistors, an open switch leaves the CMOS pin floating, picking up ambient electromagnetic noise and reading unpredictable states.",
      "Click the PA4 switch: when closed, PA4 drops to 0V (LOW) and PC0 LED lights up!"
    ],
    precompiledHex: `:100000000C942A000C9434000C9434000C943400AA
:100010000C9434000C9434000C9434000C94340090
:100020000C9434000C9434000C9434000C94340080
:100030000C9434000C9434000C9434000C94340070
:100040000C9434000C9434000C9434000C94340060
:100050000C94340011241FBECFE5D4E0DEBFCDBF29
:100060000E9436000C9440000C9400001ABA80EFF5
:100070008BBBA09ACC9902C0A89AFCCFA898FACFC3
:04008000F894FFCF22
:00000001FF
`,
    flashUsed: 132,
    sramUsed: 0
  },
  {
    id: "keypad-lcd-demo",
    title: "16. 4x4 Keypad + 16x2 LCD (4-bit) + LED",
    category: "Inputs",
    description: "Interface a 4x4 matrix membrane keypad with internal pull-ups, displaying keys on a 16x2 LCD in 4-bit mode with active LED feedback.",
    language: "c",
    code: `/*
 * 4x4 Keypad + 16x2 Character LCD (4-bit Mode) + Key Indicator LED
 *
 * Microcontroller Connections:
 * - 16x2 LCD (PORTB):
 *     RS = PB0, E = PB1, D4 = PB4, D5 = PB5, D6 = PB6, D7 = PB7
 * - 4x4 Matrix Keypad (PORTA):
 *     Rows:    PA0 (R1), PA1 (R2), PA2 (R3), PA3 (R4) [OUTPUT, active-low]
 *     Columns: PA4 (C1), PA5 (C2), PA6 (C3), PA7 (C4) [INPUT with pull-ups]
 * - Indicator LED (PORTC):
 *     PC0 = Green LED (lights up when any key is pressed)
 */
#include <avr/io.h>
#include <util/delay.h>

// HD44780 4-bit Mode Pulse & Command Functions
void lcd_pulse_e(void) {
    PORTB |= (1 << PB1);
    _delay_us(5);
    PORTB &= ~(1 << PB1);
    _delay_us(50);
}

void lcd_send_nibble(uint8_t nibble) {
    PORTB = (PORTB & 0x0F) | ((nibble & 0x0F) << 4);
    lcd_pulse_e();
}

void lcd_cmd(uint8_t cmd) {
    PORTB &= ~(1 << PB0); // RS = 0 (Command)
    lcd_send_nibble(cmd >> 4);
    lcd_send_nibble(cmd & 0x0F);
    _delay_ms(2);
}

void lcd_char(char c) {
    PORTB |= (1 << PB0);  // RS = 1 (Data)
    lcd_send_nibble(c >> 4);
    lcd_send_nibble(c & 0x0F);
    _delay_us(50);
}

void lcd_print(const char* str) {
    while (*str) lcd_char(*str++);
}

void lcd_init(void) {
    DDRB = 0xFF; // PB0..PB7 all outputs
    _delay_ms(50);
    lcd_send_nibble(0x03); _delay_ms(5);
    lcd_send_nibble(0x03); _delay_ms(5);
    lcd_send_nibble(0x03); _delay_ms(5);
    lcd_send_nibble(0x02); // 4-bit mode

    lcd_cmd(0x28); // 2 lines, 5x8 font
    lcd_cmd(0x0C); // Display ON, Cursor OFF
    lcd_cmd(0x01); // Clear display
    _delay_ms(2);
}

// 4x4 Keypad Key Map [Row][Column]
const char KEY_MAP[4][4] = {
    { '1', '2', '3', 'A' },
    { '4', '5', '6', 'B' },
    { '7', '8', '9', 'C' },
    { '*', '0', '#', 'D' }
};

// Scan 4x4 matrix: returns key character or 0 if idle
char scan_keypad(void) {
    for (uint8_t row = 0; row < 4; row++) {
        // Drive current row LOW (0), other rows HIGH (1), keep pull-ups on cols (0xF0)
        PORTA = (0xF0) | (~(1 << row) & 0x0F);
        _delay_us(10);

        // Read column inputs (PA4..PA7)
        uint8_t cols = (PINA >> 4) & 0x0F;

        for (uint8_t col = 0; col < 4; col++) {
            if (!(cols & (1 << col))) {
                return KEY_MAP[row][col];
            }
        }
    }
    return 0; // No key pressed
}

int main(void) {
    // 1. Configure Port A:
    // PA0..PA3 as OUTPUT (Rows), PA4..PA7 as INPUT (Cols)
    DDRA = 0x0F;
    // Enable internal pull-ups on PA4..PA7, set rows HIGH initially
    PORTA = 0xFF;

    // 2. Configure PC0 as OUTPUT for indicator LED
    DDRC |= (1 << PC0);
    PORTC &= ~(1 << PC0);

    // 3. Initialize 16x2 LCD in 4-bit mode
    lcd_init();
    lcd_print("4x4 Keypad Scan");
    lcd_cmd(0xC0); // Move to row 2
    lcd_print("Key: [None]");

    char lastKey = 0;

    while (1) {
        char key = scan_keypad();

        if (key != 0) {
            // Key pressed -> Turn indicator LED ON
            PORTC |= (1 << PC0);

            if (key != lastKey) {
                // Update 16x2 LCD display
                lcd_cmd(0xC6); // Move cursor inside [ ]
                lcd_char(key);
                lcd_char(' ');
                lastKey = key;
            }
        } else {
            // Key released -> Turn indicator LED OFF
            PORTC &= ~(1 << PC0);
            if (lastKey != 0) {
                lcd_cmd(0xC6);
                lcd_print("None");
                lastKey = 0;
            }
        }
        _delay_ms(30);
    }

    return 0;
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "lcd1", type: "lcd1602", x: 620, y: 80, label: "16x2 LCD (4-bit)" },
      { id: "kp1", type: "keypad4x4", x: 620, y: 250, label: "4x4 Keypad" },
      { id: "led1", type: "led", x: 840, y: 250, label: "Key LED", props: { color: "green" } },
      { id: "gnd_led", type: "gnd", x: 840, y: 360, label: "GND" }
    ],
    wires: [
      // LCD 4-bit bus on PORTB
      { id: "w_rs", color: "#ef4444", fromCompId: "atmega16", fromTermId: "PB0", toCompId: "lcd1", toTermId: "rs" },
      { id: "w_e", color: "#eab308", fromCompId: "atmega16", fromTermId: "PB1", toCompId: "lcd1", toTermId: "e" },
      { id: "w_d4", color: "#22c55e", fromCompId: "atmega16", fromTermId: "PB4", toCompId: "lcd1", toTermId: "d4" },
      { id: "w_d5", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PB5", toCompId: "lcd1", toTermId: "d5" },
      { id: "w_d6", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PB6", toCompId: "lcd1", toTermId: "d6" },
      { id: "w_d7", color: "#a855f7", fromCompId: "atmega16", fromTermId: "PB7", toCompId: "lcd1", toTermId: "d7" },
      // Keypad Rows (PA0..PA3)
      { id: "w_r1", color: "#f97316", fromCompId: "atmega16", fromTermId: "PA0", toCompId: "kp1", toTermId: "r1" },
      { id: "w_r2", color: "#f59e0b", fromCompId: "atmega16", fromTermId: "PA1", toCompId: "kp1", toTermId: "r2" },
      { id: "w_r3", color: "#eab308", fromCompId: "atmega16", fromTermId: "PA2", toCompId: "kp1", toTermId: "r3" },
      { id: "w_r4", color: "#84cc16", fromCompId: "atmega16", fromTermId: "PA3", toCompId: "kp1", toTermId: "r4" },
      // Keypad Columns (PA4..PA7)
      { id: "w_c1", color: "#10b981", fromCompId: "atmega16", fromTermId: "PA4", toCompId: "kp1", toTermId: "c1" },
      { id: "w_c2", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PA5", toCompId: "kp1", toTermId: "c2" },
      { id: "w_c3", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA6", toCompId: "kp1", toTermId: "c3" },
      { id: "w_c4", color: "#8b5cf6", fromCompId: "atmega16", fromTermId: "PA7", toCompId: "kp1", toTermId: "c4" },
      // Key Press Indicator LED on PC0
      { id: "w_led", color: "#22c55e", fromCompId: "atmega16", fromTermId: "PC0", toCompId: "led1", toTermId: "anode" },
      { id: "w_gnd", color: "#1f2937", fromCompId: "led1", fromTermId: "cathode", toCompId: "gnd_led", toTermId: "out" }
    ],
    learningNotes: [
      "Matrix Keypads reduce I/O pin count: 16 buttons require only 8 MCU pins (4 rows + 4 columns) instead of 16!",
      "Row pins PA0..PA3 are configured as outputs and driven LOW one at a time.",
      "Column pins PA4..PA7 are configured as inputs with internal pull-ups enabled (PORTA = 0xFF), holding them at +5V until a key is pressed.",
      "HD44780 16x2 LCD runs in 4-bit mode on PORTB, saving 4 pins compared to 8-bit mode.",
      "The indicator LED on PC0 lights up whenever a valid key contact is detected!"
    ],
    precompiledHex: `:100000000C942A000C943F000C943F000C943F0089
:100010000C943F000C943F000C943F000C943F0064
:100020000C943F000C943F000C943F000C943F0054
:100030000C943F000C943F000C943F000C943F0044
:100040000C943F000C943F000C943F000C943F0034
:100050000C943F0011241FBECFE5D4E0DEBFCDBF1E
:1000600010E0A0E6B0E0E0E6F2E002C005900D92FC
:10007000A239B107D9F70E94F6000C942E010C9416
:100080000000C19A8DE08A95F1F70000C19885E8DB
:100090008A95F1F70000089598B39F7040E1849F1E
:1000A00090011124922B98BB0C944100CF93C82F40
:1000B000C09882958F700E944C008C2F8F700E9488
:1000C0004C008FE99FE00197F1F700C00000CF914D
:1000D0000895CF93C82FC09A859585958595859568
:1000E0000E944C008C2F8F700E944C0085E88A95EE
:1000F000F1F70000CF910895CF93DF93EC01899140
:10010000811103C0DF91CF9108950E946900F7CF5C
:100110008FEF87BB2FE788E391E02150804090402C
:10012000E1F700C0000083E00E944C008FE097E2FE
:100130000197F1F700C0000083E00E944C008FE0BF
:1001400097E20197F1F700C0000083E00E944C00A5
:100150008FE097E20197F1F700C0000082E00E9473
:100160004C0088E20E9456008CE00E94560081E01C
:100170000E9456008FE99FE00197F1F700C0000050
:10018000089590E080E061E070E09B01082E01C0DE
:10019000220F0A94EAF720952BBB2AE12A95F1F762
:1001A00000C049B342954F7030E020E050E0FA01C2
:1001B000022E02C0F595E7950A94E2F7E0FD0BC028
:1001C000FC01EE0FFF1FEE0FFF1FE05AFF4FE20F83
:1001D000F31F808108952F5F3F4F2430310539F799
:1001E00001968430910589F680E008958FE08ABBFE
:1001F0008FEF8BBBA09AA8980E94880080E790E0C0
:100200000E947C0080EC0E94560080E890E00E94F2
:100210007C00D0E00E94C100C82F8823A1F0A89ADA
:10022000D81749F086EC0E9456008C2F0E94690076
:1002300080E20E9469008FE59AEE0197F1F700C015
:100240000000DC2FE7CFA898DD23A9F386EC0E94FD
:1002500056008CE890E00E947C00EDCFF894FFCF30
:100260003132334134353642373839432A3023442A
:10027000347834204B6579706164205363616E007B
:100280004B65793A205B4E6F6E655D004E6F6E6513
:0202900000006C
:00000001FF
`,
    flashUsed: 658,
    sramUsed: 50
  },
  {
    id: "lcd-8bit-led-demo",
    title: "17. 16x2 LCD in 8-Bit Mode + 8-Bit LED Bus",
    category: "Displays",
    description: "Drive the HD44780 16x2 LCD using full 8-bit parallel bus (D0-D7) alongside an 8-bit digital LED module displaying binary & hex values.",
    language: "c",
    code: `/*
 * ATmega16 16x2 LCD in 8-Bit Mode + 8-Bit LED Display
 *
 * Microcontroller Connections:
 * - 16x2 LCD in 8-Bit Bus Mode:
 *     PA0..PA7 -> D0..D7 (Full 8-bit byte written in one cycle!)
 *     PB0 -> RS (Register Select: 0=Cmd, 1=Data)
 *     PB1 -> E  (Enable Clock Pulse)
 * - 8-Bit LED Display:
 *     PC0..PC7 -> D0..D7 (Visualizes 8-bit binary, hex & decimal count)
 */
#include <avr/io.h>
#include <util/delay.h>

void lcd_pulse_e(void) {
    PORTB |= (1 << PB1);
    _delay_us(5);
    PORTB &= ~(1 << PB1);
    _delay_us(50);
}

// In 8-bit mode, an entire command byte is transferred directly to PORTA
void lcd_cmd(uint8_t cmd) {
    PORTB &= ~(1 << PB0); // RS = 0 (Command)
    PORTA = cmd;          // Full 8-bit bus output
    lcd_pulse_e();
    _delay_ms(2);
}

// In 8-bit mode, an ASCII character is transferred in a single clock pulse
void lcd_char(char c) {
    PORTB |= (1 << PB0);  // RS = 1 (Data)
    PORTA = c;            // Full 8-bit bus output
    lcd_pulse_e();
    _delay_us(50);
}

void lcd_print(const char* str) {
    while (*str) lcd_char(*str++);
}

int main(void) {
    // 1. Configure Port A (LCD Data Bus D0-D7) as OUTPUT
    DDRA = 0xFF;

    // 2. Configure Port B pins PB0 (RS) and PB1 (E) as OUTPUT
    DDRB |= (1 << PB0) | (1 << PB1);

    // 3. Configure Port C as OUTPUT for 8-Bit LED Display
    DDRC = 0xFF;

    _delay_ms(50);

    // HD44780 8-Bit Initialization:
    // 0x38 = Function Set: 8-bit interface, 2 display lines, 5x8 font
    lcd_cmd(0x38);
    lcd_cmd(0x0C); // Display ON, Cursor OFF
    lcd_cmd(0x01); // Clear display
    _delay_ms(2);

    lcd_print("8-Bit Bus Active");
    lcd_cmd(0xC0); // Move cursor to Row 2
    lcd_print("Count: ");

    uint8_t counter = 0;
    const char hexDigits[] = "0123456789ABCDEF";

    while (1) {
        // Output binary count directly to 8-Bit LED Display on PORTC
        PORTC = counter;

        // Display current count as Hex on 16x2 LCD
        lcd_cmd(0xC7); // Row 2, column 7
        lcd_char('0');
        lcd_char('x');
        lcd_char(hexDigits[(counter >> 4) & 0x0F]);
        lcd_char(hexDigits[counter & 0x0F]);

        counter++;
        _delay_ms(250);
    }

    return 0;
}
`,
    components: [
      { id: "atmega16", type: "atmega16", x: 260, y: 120, label: "ATmega16" },
      { id: "lcd1", type: "lcd1602", x: 620, y: 60, label: "16x2 LCD (8-Bit)" },
      { id: "ledbar1", type: "led-bar", x: 620, y: 260, label: "8-Bit LED Display" },
      { id: "gnd_bar", type: "gnd", x: 860, y: 260, label: "GND" }
    ],
    wires: [
      // LCD Control Lines (PORTB)
      { id: "w_rs", color: "#f59e0b", fromCompId: "atmega16", fromTermId: "PB0", toCompId: "lcd1", toTermId: "rs" },
      { id: "w_e", color: "#eab308", fromCompId: "atmega16", fromTermId: "PB1", toCompId: "lcd1", toTermId: "e" },
      // LCD 8-Bit Data Bus (PORTA: PA0..PA7 -> D0..D7)
      { id: "w_d0", color: "#ef4444", fromCompId: "atmega16", fromTermId: "PA0", toCompId: "lcd1", toTermId: "d0" },
      { id: "w_d1", color: "#f97316", fromCompId: "atmega16", fromTermId: "PA1", toCompId: "lcd1", toTermId: "d1" },
      { id: "w_d2", color: "#f59e0b", fromCompId: "atmega16", fromTermId: "PA2", toCompId: "lcd1", toTermId: "d2" },
      { id: "w_d3", color: "#84cc16", fromCompId: "atmega16", fromTermId: "PA3", toCompId: "lcd1", toTermId: "d3" },
      { id: "w_d4", color: "#10b981", fromCompId: "atmega16", fromTermId: "PA4", toCompId: "lcd1", toTermId: "d4" },
      { id: "w_d5", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PA5", toCompId: "lcd1", toTermId: "d5" },
      { id: "w_d6", color: "#3b82f6", fromCompId: "atmega16", fromTermId: "PA6", toCompId: "lcd1", toTermId: "d6" },
      { id: "w_d7", color: "#8b5cf6", fromCompId: "atmega16", fromTermId: "PA7", toCompId: "lcd1", toTermId: "d7" },
      // 8-Bit LED Display Bus (PORTC: PC0..PC7 -> D0..D7)
      { id: "w_b0", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC0", toCompId: "ledbar1", toTermId: "d0" },
      { id: "w_b1", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC1", toCompId: "ledbar1", toTermId: "d1" },
      { id: "w_b2", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC2", toCompId: "ledbar1", toTermId: "d2" },
      { id: "w_b3", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC3", toCompId: "ledbar1", toTermId: "d3" },
      { id: "w_b4", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC4", toCompId: "ledbar1", toTermId: "d4" },
      { id: "w_b5", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC5", toCompId: "ledbar1", toTermId: "d5" },
      { id: "w_b6", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC6", toCompId: "ledbar1", toTermId: "d6" },
      { id: "w_b7", color: "#06b6d4", fromCompId: "atmega16", fromTermId: "PC7", toCompId: "ledbar1", toTermId: "d7" },
      { id: "w_bg", color: "#1f2937", fromCompId: "ledbar1", fromTermId: "com", toCompId: "gnd_bar", toTermId: "out" }
    ],
    learningNotes: [
      "In 8-bit mode, an entire instruction or ASCII byte is transmitted in a single write operation (cmd 0x38 = 8-bit, 2 lines, 5x8).",
      "8-bit mode offers the fastest refresh rate and simplest C code because no nibble splitting or bit-shifting is required.",
      "The 8-Bit LED Display visualizes the raw binary byte (bits 7 to 0) along with computed hexadecimal and decimal values in real time."
    ],
    precompiledHex: `:100000000C942A000C943F000C943F000C943F0089
:100010000C943F000C943F000C943F000C943F0064
:100020000C943F000C943F000C943F000C943F0054
:100030000C943F000C943F000C943F000C943F0044
:100040000C943F000C943F000C943F000C943F0034
:100050000C943F0011241FBECFE5D4E0DEBFCDBF1E
:1000600010E0A0E6B0E0E2EBF1E002C005900D92F6
:10007000AA38B107D9F70E946C000C94D7000C94F1
:100080000000C19A8DE08A95F1F70000C19885E8DB
:100090008A95F1F700000895C0988BBB0E9441003B
:1000A0008FE99FE00197F1F700C000000895C09A22
:1000B0008BBB0E94410085E88A95F1F70000089506
:1000C000CF93DF93EC018991811103C0DF91CF9130
:1000D00008950E945700F7CFCF93DF93CDB7DEB7D7
:1000E00061970FB6F894DEBF0FBECDBF9FEF9ABBEE
:1000F00087B3836087BB94BB2FE788E391E02150EF
:1001000080409040E1F700C0000088E30E944C006E
:100110008CE00E944C0081E00E944C008FE99FE03F
:100120000197F1F700C0000080E690E00E946000B7
:1001300080EC0E944C0081E790E00E94600081E129
:10014000E9E7F0E0DE01119601900D928A95E1F762
:1001500010E015BB87EC0E944C0080E30E94570022
:1001600088E70E945700E12FE295EF7081E090E070
:100170008C0F9D1F8E0F911DFC0180810E945700E6
:10018000E12FEF7081E090E08C0F9D1F8E0F911D8D
:10019000FC0180810E9457001F5F9FE72AE186E0F3
:1001A000915020408040E1F700C00000D2CFF89489
:0201B000FFCF7F
:1001B200382D4269742042757320416374697665F3
:1001C20000436F756E743A20003031323334353665
:0A01D20037383941424344454600E6
:00000001FF
`,
    flashUsed: 476,
    sramUsed: 42
  }
];
console.log("--- TESTING LCD 4-BIT AND 8-BIT IN SIMULATOR ---");
const p7 = EXAMPLE_PROJECTS.find((p) => p.id === "lcd-hello");
console.log("Project 7:", p7.title);
const mcu7 = new Atmega16Simulator();
const engine7 = new CircuitEngine(mcu7);
engine7.setComponentsAndWires(p7.components, p7.wires);
const hex7 = parseIntelHex(p7.precompiledHex);
mcu7.loadProgram(hex7.progMem);
for (let frame = 0; frame < 100; frame++) {
  mcu7.stepCount(1e4);
  engine7.updateCircuit();
}
const lcd7 = engine7.lcdStates.get("lcd1");
console.log("Lesson 7 LCD Line 0:", JSON.stringify(lcd7 == null ? void 0 : lcd7.lines[0]));
console.log("Lesson 7 LCD Line 1:", JSON.stringify(lcd7 == null ? void 0 : lcd7.lines[1]));
if ((lcd7 == null ? void 0 : lcd7.lines[0].includes("ATmega16 Ready!")) && (lcd7 == null ? void 0 : lcd7.lines[1].includes("Learning AVR C"))) {
  console.log(">>> TEST 1 (4-BIT LCD) PASSED! <<<");
} else {
  console.error(">>> TEST 1 FAILED! <<<");
  process.exit(1);
}
const p17 = EXAMPLE_PROJECTS.find((p) => p.id === "lcd-8bit-led-demo");
console.log("\nProject 17:", p17.title);
const mcu17 = new Atmega16Simulator();
const engine17 = new CircuitEngine(mcu17);
engine17.setComponentsAndWires(p17.components, p17.wires);
const hex17 = parseIntelHex(p17.precompiledHex);
mcu17.loadProgram(hex17.progMem);
for (let frame = 0; frame < 100; frame++) {
  mcu17.stepCount(1e4);
  engine17.updateCircuit();
}
const lcd17 = engine17.lcdStates.get("lcd1");
console.log("Lesson 17 LCD Line 0:", JSON.stringify(lcd17 == null ? void 0 : lcd17.lines[0]));
console.log("Lesson 17 LCD Line 1:", JSON.stringify(lcd17 == null ? void 0 : lcd17.lines[1]));
if ((lcd17 == null ? void 0 : lcd17.lines[0].includes("8-Bit Bus Active")) && (lcd17 == null ? void 0 : lcd17.lines[1].includes("Count:"))) {
  console.log(">>> TEST 2 (8-BIT LCD) PASSED! <<<");
} else {
  console.error(">>> TEST 2 FAILED! <<<");
  process.exit(1);
}
const p16 = EXAMPLE_PROJECTS.find((p) => p.id === "keypad-lcd-demo");
console.log("\nProject 16:", p16.title);
const mcu16 = new Atmega16Simulator();
const engine16 = new CircuitEngine(mcu16);
engine16.setComponentsAndWires(p16.components, p16.wires);
const hex16 = parseIntelHex(p16.precompiledHex);
mcu16.loadProgram(hex16.progMem);
for (let frame = 0; frame < 100; frame++) {
  mcu16.stepCount(1e4);
  engine16.updateCircuit();
}
const lcd16 = engine16.lcdStates.get("lcd1");
console.log("Lesson 16 LCD Line 0:", JSON.stringify(lcd16 == null ? void 0 : lcd16.lines[0]));
console.log("Lesson 16 LCD Line 1:", JSON.stringify(lcd16 == null ? void 0 : lcd16.lines[1]));
if ((lcd16 == null ? void 0 : lcd16.lines[0].includes("4x4 Keypad")) && (lcd16 == null ? void 0 : lcd16.lines[1].includes("Key:"))) {
  console.log(">>> TEST 3 (KEYPAD + LCD) PASSED! <<<");
} else {
  console.error(">>> TEST 3 FAILED! <<<");
  process.exit(1);
}
console.log("\nALL LCD TESTS PASSED PERFECTLY!");
