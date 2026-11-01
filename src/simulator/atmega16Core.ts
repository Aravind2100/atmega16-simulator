/**
 * ATmega16 Microcontroller Core Engine
 * Integrates AVR8js CPU with exact ATmega16 memory map, 40-pin DIP package,
 * Timer0/1, ADC, and GPIO Ports A, B, C, D.
 */

import {
  CPU,
  avrInstruction,
  AVRIOPort,
  AVRPortConfig,
} from 'avr8js';
import { AtmegaPinInfo, CpuRegistersState, PinDirection, PinElectricalState } from '../types.ts';

// ATmega16 Data Memory Addresses (I/O addresses + 0x20)
export const ATMEGA16_ADDR = {
  // Ports
  PINA: 0x39,
  DDRA: 0x3a,
  PORTA: 0x3b,

  PINB: 0x36,
  DDRB: 0x37,
  PORTB: 0x38,

  PINC: 0x33,
  DDRC: 0x34,
  PORTC: 0x35,

  PIND: 0x30,
  DDRD: 0x31,
  PORTD: 0x32,

  // Timers
  TCNT0: 0x52,
  TCCR0: 0x53,
  OCR0: 0x5c,
  TIMSK: 0x59,
  TIFR: 0x58,

  TCNT1L: 0x4c,
  TCNT1H: 0x4d,
  TCCR1A: 0x4f,
  TCCR1B: 0x4e,
  OCR1AL: 0x4a,
  OCR1AH: 0x4b,
  OCR1BL: 0x48,
  OCR1BH: 0x49,

  // ADC
  ADCL: 0x24,
  ADCH: 0x25,
  ADCSRA: 0x26,
  ADMUX: 0x27,

  // CPU Status & Stack
  SPL: 0x5d,
  SPH: 0x5e,
  SREG: 0x5f,
  MCUCR: 0x55,
  MCUCSR: 0x54,
  GICR: 0x5b,
  GIFR: 0x5a,
  SFIOR: 0x50, // Special Function IO Register (bit 2 = PUD Pull-Up Disable)
};

// 40-pin DIP layout definition with pin names and alternative functions
export interface Dip40PinDef {
  pinNumber: number;
  name: string;
  port?: 'A' | 'B' | 'C' | 'D';
  portBit?: number;
  altFunctions: string[];
}

export const ATMEGA16_DIP40_PINS: Dip40PinDef[] = [
  // Left side: Pins 1 to 20 (top to bottom)
  { pinNumber: 1, name: 'PB0', port: 'B', portBit: 0, altFunctions: ['XCK', 'T0'] },
  { pinNumber: 2, name: 'PB1', port: 'B', portBit: 1, altFunctions: ['T1'] },
  { pinNumber: 3, name: 'PB2', port: 'B', portBit: 2, altFunctions: ['AIN0', 'INT2'] },
  { pinNumber: 4, name: 'PB3', port: 'B', portBit: 3, altFunctions: ['AIN1', 'OC0'] },
  { pinNumber: 5, name: 'PB4', port: 'B', portBit: 4, altFunctions: ['SS'] },
  { pinNumber: 6, name: 'PB5', port: 'B', portBit: 5, altFunctions: ['MOSI'] },
  { pinNumber: 7, name: 'PB6', port: 'B', portBit: 6, altFunctions: ['MISO'] },
  { pinNumber: 8, name: 'PB7', port: 'B', portBit: 7, altFunctions: ['SCK'] },
  { pinNumber: 9, name: 'RESET', altFunctions: [] },
  { pinNumber: 10, name: 'VCC', altFunctions: ['+5V'] },
  { pinNumber: 11, name: 'GND', altFunctions: ['0V'] },
  { pinNumber: 12, name: 'XTAL2', altFunctions: ['OSC2'] },
  { pinNumber: 13, name: 'XTAL1', altFunctions: ['OSC1'] },
  { pinNumber: 14, name: 'PD0', port: 'D', portBit: 0, altFunctions: ['RXD'] },
  { pinNumber: 15, name: 'PD1', port: 'D', portBit: 1, altFunctions: ['TXD'] },
  { pinNumber: 16, name: 'PD2', port: 'D', portBit: 2, altFunctions: ['INT0'] },
  { pinNumber: 17, name: 'PD3', port: 'D', portBit: 3, altFunctions: ['INT1'] },
  { pinNumber: 18, name: 'PD4', port: 'D', portBit: 4, altFunctions: ['OC1B'] },
  { pinNumber: 19, name: 'PD5', port: 'D', portBit: 5, altFunctions: ['OC1A'] },
  { pinNumber: 20, name: 'PD6', port: 'D', portBit: 6, altFunctions: ['ICP1'] },

  // Right side: Pins 40 down to 21 (top to bottom)
  { pinNumber: 40, name: 'PA0', port: 'A', portBit: 0, altFunctions: ['ADC0'] },
  { pinNumber: 39, name: 'PA1', port: 'A', portBit: 1, altFunctions: ['ADC1'] },
  { pinNumber: 38, name: 'PA2', port: 'A', portBit: 2, altFunctions: ['ADC2'] },
  { pinNumber: 37, name: 'PA3', port: 'A', portBit: 3, altFunctions: ['ADC3'] },
  { pinNumber: 36, name: 'PA4', port: 'A', portBit: 4, altFunctions: ['ADC4'] },
  { pinNumber: 35, name: 'PA5', port: 'A', portBit: 5, altFunctions: ['ADC5'] },
  { pinNumber: 34, name: 'PA6', port: 'A', portBit: 6, altFunctions: ['ADC6'] },
  { pinNumber: 33, name: 'PA7', port: 'A', portBit: 7, altFunctions: ['ADC7'] },
  { pinNumber: 32, name: 'AREF', altFunctions: ['Vref'] },
  { pinNumber: 31, name: 'GND', altFunctions: ['0V'] },
  { pinNumber: 30, name: 'AVCC', altFunctions: ['+5V'] },
  { pinNumber: 29, name: 'PC7', port: 'C', portBit: 7, altFunctions: ['TOSC2'] },
  { pinNumber: 28, name: 'PC6', port: 'C', portBit: 6, altFunctions: ['TOSC1'] },
  { pinNumber: 27, name: 'PC5', port: 'C', portBit: 5, altFunctions: ['TDI'] },
  { pinNumber: 26, name: 'PC4', port: 'C', portBit: 4, altFunctions: ['TDO'] },
  { pinNumber: 25, name: 'PC3', port: 'C', portBit: 3, altFunctions: ['TMS'] },
  { pinNumber: 24, name: 'PC2', port: 'C', portBit: 2, altFunctions: ['TCK'] },
  { pinNumber: 23, name: 'PC1', port: 'C', portBit: 1, altFunctions: ['SDA'] },
  { pinNumber: 22, name: 'PC0', port: 'C', portBit: 0, altFunctions: ['SCL'] },
  { pinNumber: 21, name: 'PD7', port: 'D', portBit: 7, altFunctions: ['OC2'] },
];

export class Atmega16Simulator {
  public cpu: CPU;
  public portA: AVRIOPort;
  public portB: AVRIOPort;
  public portC: AVRIOPort;
  public portD: AVRIOPort;

  // External analog voltages applied to PA0-PA7 (0..5V)
  public analogInputs: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

  // Callback notified when pins change
  private onPinChangeCallbacks: Array<(pins: AtmegaPinInfo[]) => void> = [];

  constructor(progMem?: Uint16Array) {
    const memory = progMem || new Uint16Array(8192); // 16KB ATmega16 flash
    // ATmega16 Data memory: 32 registers + 64 IO + 1024 bytes SRAM = 1120 bytes
    this.cpu = new CPU(memory, 1024 + 32 + 64);

    // Set Stack Pointer initial value to RAMEND (0x045F)
    this.cpu.data[ATMEGA16_ADDR.SPL] = 0x5f;
    this.cpu.data[ATMEGA16_ADDR.SPH] = 0x04;

    // Initialize GPIO Ports
    const configA: AVRPortConfig = {
      PIN: ATMEGA16_ADDR.PINA,
      DDR: ATMEGA16_ADDR.DDRA,
      PORT: ATMEGA16_ADDR.PORTA,
      externalInterrupts: [],
    };
    const configB: AVRPortConfig = {
      PIN: ATMEGA16_ADDR.PINB,
      DDR: ATMEGA16_ADDR.DDRB,
      PORT: ATMEGA16_ADDR.PORTB,
      externalInterrupts: [],
    };
    const configC: AVRPortConfig = {
      PIN: ATMEGA16_ADDR.PINC,
      DDR: ATMEGA16_ADDR.DDRC,
      PORT: ATMEGA16_ADDR.PORTC,
      externalInterrupts: [],
    };
    const configD: AVRPortConfig = {
      PIN: ATMEGA16_ADDR.PIND,
      DDR: ATMEGA16_ADDR.DDRD,
      PORT: ATMEGA16_ADDR.PORTD,
      externalInterrupts: [],
    };

    this.portA = new AVRIOPort(this.cpu, configA);
    this.portB = new AVRIOPort(this.cpu, configB);
    this.portC = new AVRIOPort(this.cpu, configC);
    this.portD = new AVRIOPort(this.cpu, configD);

    // Listeners for GPIO updates
    const notifyChange = (portName: 'A' | 'B' | 'C' | 'D') => {
      this.syncPortPullUps(portName);
      if (this.onPinChangeCallbacks.length > 0) {
        const pinInfos = this.getAllPinInfos();
        for (const cb of this.onPinChangeCallbacks) {
          cb(pinInfos);
        }
      }
    };

    this.portA.addListener(() => notifyChange('A'));
    this.portB.addListener(() => notifyChange('B'));
    this.portC.addListener(() => notifyChange('C'));
    this.portD.addListener(() => notifyChange('D'));

    // Setup ADC hooks
    this.setupAdcSimulation();

    // Setup Timer0 / Timer1 compare hooks
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
  public syncPortPullUps(portName: 'A' | 'B' | 'C' | 'D') {
    const ddrAddr = ATMEGA16_ADDR[`DDR${portName}` as keyof typeof ATMEGA16_ADDR];
    const portAddr = ATMEGA16_ADDR[`PORT${portName}` as keyof typeof ATMEGA16_ADDR];
    const ddr = this.cpu.data[ddrAddr];
    const port = this.cpu.data[portAddr];
    const pud = !!(this.cpu.data[ATMEGA16_ADDR.SFIOR] & 0x04); // SFIOR bit 2: PUD (Pull-up Disable)

    const portObj =
      portName === 'A' ? this.portA : portName === 'B' ? this.portB : portName === 'C' ? this.portC : this.portD;

    for (let bit = 0; bit < 8; bit++) {
      const isOutput = !!(ddr & (1 << bit));
      const portBitVal = !!(port & (1 << bit));

      if (!isOutput) {
        if (portBitVal && !pud) {
          // Internal Pull-Up is active (~30kΩ to +5V)
          // Default ungrounded input to HIGH (true / 5V)
          portObj.setPin(bit, true);
        } else {
          // Pull-up disabled: Floating / Tri-state input (Hi-Z)
          portObj.setPin(bit, false);
        }
      }
    }
  }

  public syncAllPullUps() {
    this.syncPortPullUps('A');
    this.syncPortPullUps('B');
    this.syncPortPullUps('C');
    this.syncPortPullUps('D');
  }

  public subscribePinChange(cb: (pins: AtmegaPinInfo[]) => void) {
    this.onPinChangeCallbacks.push(cb);
  }

  public setAnalogInput(channel: number, voltage: number) {
    if (channel >= 0 && channel < 8) {
      this.analogInputs[channel] = Math.max(0, Math.min(5.0, voltage));
    }
  }

  /**
   * Set an external digital input signal on a specific port bit
   */
  public setDigitalInput(port: 'A' | 'B' | 'C' | 'D', bit: number, value: boolean) {
    const targetPort =
      port === 'A' ? this.portA : port === 'B' ? this.portB : port === 'C' ? this.portC : this.portD;
    targetPort.setPin(bit, value);
  }

  /**
   * Execute single instruction
   */
  public step(): void {
    avrInstruction(this.cpu);
    this.cpu.tick();
    this.syncAllPullUps();
    this.tickInternalPeripherals();
  }

  /**
   * Execute N clock cycles or instructions
   */
  public stepCount(count: number): void {
    for (let i = 0; i < count; i++) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }
    this.syncAllPullUps();
    this.tickInternalPeripherals();
  }

  public reset(): void {
    this.cpu.reset();
    this.cpu.data[ATMEGA16_ADDR.SPL] = 0x5f;
    this.cpu.data[ATMEGA16_ADDR.SPH] = 0x04;
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

  public loadProgram(progMem: Uint16Array): void {
    for (let i = 0; i < 8192; i++) {
      this.cpu.progMem[i] = i < progMem.length ? progMem[i] : 0;
    }
    this.reset();
  }

  /**
   * Get complete CPU state snapshot for Register Inspector
   */
  public getCpuState(): CpuRegistersState {
    const r: number[] = [];
    for (let i = 0; i < 32; i++) {
      r.push(this.cpu.data[i]);
    }

    const sreg = this.cpu.data[ATMEGA16_ADDR.SREG];
    const sregFlags = {
      I: !!(sreg & 0x80),
      T: !!(sreg & 0x40),
      H: !!(sreg & 0x20),
      S: !!(sreg & 0x10),
      V: !!(sreg & 0x08),
      N: !!(sreg & 0x04),
      Z: !!(sreg & 0x02),
      C: !!(sreg & 0x01),
    };

    const sp = this.cpu.data[ATMEGA16_ADDR.SPL] | (this.cpu.data[ATMEGA16_ADDR.SPH] << 8);

    const ports = {
      A: {
        port: this.cpu.data[ATMEGA16_ADDR.PORTA],
        ddr: this.cpu.data[ATMEGA16_ADDR.DDRA],
        pin: this.cpu.data[ATMEGA16_ADDR.PINA],
      },
      B: {
        port: this.cpu.data[ATMEGA16_ADDR.PORTB],
        ddr: this.cpu.data[ATMEGA16_ADDR.DDRB],
        pin: this.cpu.data[ATMEGA16_ADDR.PINB],
      },
      C: {
        port: this.cpu.data[ATMEGA16_ADDR.PORTC],
        ddr: this.cpu.data[ATMEGA16_ADDR.DDRC],
        pin: this.cpu.data[ATMEGA16_ADDR.PINC],
      },
      D: {
        port: this.cpu.data[ATMEGA16_ADDR.PORTD],
        ddr: this.cpu.data[ATMEGA16_ADDR.DDRD],
        pin: this.cpu.data[ATMEGA16_ADDR.PIND],
      },
    };

    const timers = {
      tcnt0: this.cpu.data[ATMEGA16_ADDR.TCNT0],
      tccr0: this.cpu.data[ATMEGA16_ADDR.TCCR0],
      ocr0: this.cpu.data[ATMEGA16_ADDR.OCR0],
    };

    const adc = {
      admux: this.cpu.data[ATMEGA16_ADDR.ADMUX],
      adcsra: this.cpu.data[ATMEGA16_ADDR.ADCSRA],
      value: this.cpu.data[ATMEGA16_ADDR.ADCL] | (this.cpu.data[ATMEGA16_ADDR.ADCH] << 8),
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
      adc,
    };
  }

  /**
   * Get electrical & logical state of all 40 DIP pins
   */
  public getAllPinInfos(): AtmegaPinInfo[] {
    const list: AtmegaPinInfo[] = [];

    for (const def of ATMEGA16_DIP40_PINS) {
      if (!def.port) {
        // Power, GND, Reset, XTAL, AREF pins
        let voltage = 0.0;
        let state: PinElectricalState = 'low';
        let direction: PinDirection = 'input';

        if (def.name === 'VCC' || def.name === 'AVCC') {
          voltage = 5.0;
          state = 'high';
          direction = 'output';
        } else if (def.name === 'RESET') {
          voltage = 5.0; // Pulled high internally
          state = 'pullup';
          direction = 'input-pullup';
        } else if (def.name === 'AREF') {
          voltage = 5.0;
          state = 'high';
          direction = 'input';
        }

        list.push({
          pinNumber: def.pinNumber,
          name: def.name,
          altFunctions: def.altFunctions,
          direction,
          state,
          voltage,
        });
        continue;
      }

      // Port Pin
      const portName = def.port;
      const bit = def.portBit!;
      const ddrAddr =
        portName === 'A'
          ? ATMEGA16_ADDR.DDRA
          : portName === 'B'
          ? ATMEGA16_ADDR.DDRB
          : portName === 'C'
          ? ATMEGA16_ADDR.DDRC
          : ATMEGA16_ADDR.DDRD;
      const portAddr =
        portName === 'A'
          ? ATMEGA16_ADDR.PORTA
          : portName === 'B'
          ? ATMEGA16_ADDR.PORTB
          : portName === 'C'
          ? ATMEGA16_ADDR.PORTC
          : ATMEGA16_ADDR.PORTD;
      const pinAddr =
        portName === 'A'
          ? ATMEGA16_ADDR.PINA
          : portName === 'B'
          ? ATMEGA16_ADDR.PINB
          : portName === 'C'
          ? ATMEGA16_ADDR.PINC
          : ATMEGA16_ADDR.PIND;

      const ddrBit = !!(this.cpu.data[ddrAddr] & (1 << bit));
      const portBitVal = !!(this.cpu.data[portAddr] & (1 << bit));
      const pinBitVal = !!(this.cpu.data[pinAddr] & (1 << bit));

      const pud = !!(this.cpu.data[ATMEGA16_ADDR.SFIOR] & 0x04);
      let direction: PinDirection = 'input';
      let state: PinElectricalState = 'tristate';
      let voltage = 0.0;
      let pullUpEnabled = false;
      let isFloating = false;

      if (ddrBit) {
        // Output pin (driver active)
        direction = 'output';
        pullUpEnabled = false;
        isFloating = false;
        if (portBitVal) {
          state = 'high';
          voltage = 5.0;
        } else {
          state = 'low';
          voltage = 0.0;
        }
      } else {
        // Input pin
        if (portBitVal && !pud) {
          // Internal Pull-Up enabled (DDR=0, PORT=1, PUD=0)
          // Solidly pulled to +5V through internal ~30k resistor (does NOT float!)
          direction = 'input-pullup';
          pullUpEnabled = true;
          isFloating = false;
          if (pinBitVal) {
            state = 'pullup';
            voltage = 5.0;
          } else {
            state = 'low'; // Grounded externally by switch or GND wire
            voltage = 0.0;
          }
        } else {
          // Tri-state / Floating / Hi-Z input (DDR=0, PORT=0 or PUD=1)
          direction = 'input';
          pullUpEnabled = false;
          if (pinBitVal) {
            state = 'high';
            voltage = 5.0;
            isFloating = false;
          } else {
            state = 'tristate';
            voltage = 0.0;
            isFloating = true; // Floating without pull-up!
          }
        }
      }

      const bitmask = 1 << bit;
      const maskHex = '0x' + bitmask.toString(16).padStart(2, '0').toUpperCase();
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
        isFloating,
      });
    }

    return list;
  }

  // ADC conversion simulation
  private setupAdcSimulation() {
    this.cpu.writeHooks[ATMEGA16_ADDR.ADCSRA] = (value: number) => {
      this.cpu.data[ATMEGA16_ADDR.ADCSRA] = value;
      // If ADEN (bit 7) and ADSC (bit 6 - Start Conversion) are set
      if (value & 0x40 && value & 0x80) {
        this.runAdcConversion(value);
      }
      return true;
    };
  }

  private runAdcConversion(adcsraVal: number) {
    const admux = this.cpu.data[ATMEGA16_ADDR.ADMUX];
    const channel = admux & 0x07; // Single-ended channel 0-7 (PA0 - PA7)
    const vInput = this.analogInputs[channel] ?? 0;

    // Decode Voltage Reference (bits 7:6 of ADMUX)
    // 00 = AREF, 01 = AVCC (5.0V), 11 = Internal 2.56V
    const refs = (admux >> 6) & 0x03;
    let vRef = 5.0;
    if (refs === 0x03) {
      vRef = 2.56; // Internal 2.56V Reference
    } else if (refs === 0x01) {
      vRef = 5.0; // AVCC (+5V)
    }

    const rawDigital = Math.min(1023, Math.max(0, Math.round((vInput / vRef) * 1023)));

    const adlar = !!(admux & 0x20); // Left adjust result
    if (adlar) {
      this.cpu.data[ATMEGA16_ADDR.ADCL] = (rawDigital << 6) & 0xc0;
      this.cpu.data[ATMEGA16_ADDR.ADCH] = (rawDigital >> 2) & 0xff;
    } else {
      this.cpu.data[ATMEGA16_ADDR.ADCL] = rawDigital & 0xff;
      this.cpu.data[ATMEGA16_ADDR.ADCH] = (rawDigital >> 8) & 0x03;
    }

    // Conversion done: clear ADSC bit 6, set ADIF bit 4
    this.cpu.data[ATMEGA16_ADDR.ADCSRA] = (adcsraVal & ~0x40) | 0x10;

    // If ADIE (bit 3) is enabled, queue ADC interrupt (Vector 15: 0x001C)
    if (adcsraVal & 0x08) {
      this.cpu.queueInterrupt({
        address: 0x1c >> 1, // word address 14
        flagRegister: ATMEGA16_ADDR.ADCSRA,
        flagMask: 0x10,
        enableRegister: ATMEGA16_ADDR.ADCSRA,
        enableMask: 0x08,
      });
    }
  }

  // Timer simulation hooks
  private setupTimerSimulation() {
    // When code writes to TCCR0 or OCR0
    this.cpu.writeHooks[ATMEGA16_ADDR.OCR0] = (val) => {
      this.cpu.data[ATMEGA16_ADDR.OCR0] = val;
      return true;
    };
  }

  private tickInternalPeripherals() {
    // Timer0 clocking and PWM generation on PB3 (OC0)
    const tccr0 = this.cpu.data[ATMEGA16_ADDR.TCCR0];
    const cs0 = tccr0 & 0x07;
    if (cs0 !== 0) {
      // Timer0 running
      const oldTcnt = this.cpu.data[ATMEGA16_ADDR.TCNT0];
      const newTcnt = (oldTcnt + 1) & 0xff;
      this.cpu.data[ATMEGA16_ADDR.TCNT0] = newTcnt;

      const ocr0 = this.cpu.data[ATMEGA16_ADDR.OCR0];
      if (newTcnt === ocr0) {
        // Compare match
        this.cpu.data[ATMEGA16_ADDR.TIFR] |= 0x02; // OCF0 bit 1
      }
      if (newTcnt === 0 && oldTcnt === 0xff) {
        // Overflow
        this.cpu.data[ATMEGA16_ADDR.TIFR] |= 0x01; // TOV0 bit 0

        // If ADC Auto-trigger is enabled and in Free Running mode, start new conversion
        const adcsra = this.cpu.data[ATMEGA16_ADDR.ADCSRA];
        if ((adcsra & 0x80) && (adcsra & 0x20)) {
          this.runAdcConversion(adcsra);
        }
      }

      // Check Fast PWM mode on OC0 (PB3, pin 4)
      // Fast PWM: WGM01:WGM00 = 11 (TCCR0 bits 3 and 6)
      // Non-inverting PWM: COM01:COM00 = 10 (TCCR0 bit 5 set, bit 4 clear)
      const isFastPwm = (tccr0 & 0x48) === 0x48;
      const isNonInverting = (tccr0 & 0x30) === 0x20;
      if (isFastPwm && isNonInverting) {
        const ddrB = this.cpu.data[ATMEGA16_ADDR.DDRB];
        if (ddrB & (1 << 3)) { // PB3 configured as output
          const isHigh = newTcnt < ocr0;
          if (isHigh) {
            this.cpu.data[ATMEGA16_ADDR.PORTB] |= (1 << 3);
          } else {
            this.cpu.data[ATMEGA16_ADDR.PORTB] &= ~(1 << 3);
          }
        }
      }
    }
  }
}
