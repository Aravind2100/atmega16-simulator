/**
 * Circuit Simulation Engine
 * Manages components, terminals, wires, and electrical state propagation
 * between the ATmega16 microcontroller and external hardware.
 */

import {
  CircuitComponent,
  ComponentTerminal,
  ComponentType,
  WireConnection,
} from '../types.ts';
import { Atmega16Simulator } from './atmega16Core.ts';
import { buzzerAudio } from './audioDriver.ts';

// HD44780 LCD Controller Simulation State
export interface Lcd1602State {
  lines: [string, string];
  cursorRow: number;
  cursorCol: number;
  displayOn: boolean;
  nibbleBuffer: number | null;
  lastE: boolean;
  backlight: boolean;
  initialized?: boolean;
  is8BitMode?: boolean;
}

// Stepper Motor Live State
export interface StepperMotorState {
  angle: number; // 0 to 360 degrees
  stepCount: number;
  coils: [boolean, boolean, boolean, boolean]; // IN1, IN2, IN3, IN4
  lastStepPattern: number;
}

// DC Motor Live State
export interface DcMotorState {
  speed: number;     // 0.0 to 1.0
  direction: 1 | -1; // 1 = CW, -1 = CCW
  angle: number;     // 0 to 360 degrees (for visual spinning propeller)
  rpm: number;       // calculated visual RPM
}

// Get terminal definitions for any component type (precise pixel centers relative to comp.x, comp.y)
export const KEYPAD_4X4_MAP: Record<string, { row: string; col: string }> = {
  '1': { row: 'r1', col: 'c1' },
  '2': { row: 'r1', col: 'c2' },
  '3': { row: 'r1', col: 'c3' },
  'A': { row: 'r1', col: 'c4' },
  '4': { row: 'r2', col: 'c1' },
  '5': { row: 'r2', col: 'c2' },
  '6': { row: 'r2', col: 'c3' },
  'B': { row: 'r2', col: 'c4' },
  '7': { row: 'r3', col: 'c1' },
  '8': { row: 'r3', col: 'c2' },
  '9': { row: 'r3', col: 'c3' },
  'C': { row: 'r3', col: 'c4' },
  '*': { row: 'r4', col: 'c1' },
  '0': { row: 'r4', col: 'c2' },
  '#': { row: 'r4', col: 'c3' },
  'D': { row: 'r4', col: 'c4' },
};

export function getComponentTerminals(type: ComponentType): ComponentTerminal[] {
  switch (type) {
    case 'led':
      return [
        { id: 'anode', label: 'A (+)', x: 21, y: 80 },
        { id: 'cathode', label: 'K (-)', x: 35, y: 80 },
      ];
    case 'led-bar':
      return [
        { id: 'd0', label: 'D0', x: 23, y: 96 },
        { id: 'd1', label: 'D1', x: 43, y: 96 },
        { id: 'd2', label: 'D2', x: 63, y: 96 },
        { id: 'd3', label: 'D3', x: 83, y: 96 },
        { id: 'd4', label: 'D4', x: 103, y: 96 },
        { id: 'd5', label: 'D5', x: 123, y: 96 },
        { id: 'd6', label: 'D6', x: 143, y: 96 },
        { id: 'd7', label: 'D7', x: 163, y: 96 },
        { id: 'a0', label: 'A0', x: 23, y: 96 },
        { id: 'a1', label: 'A1', x: 43, y: 96 },
        { id: 'a2', label: 'A2', x: 63, y: 96 },
        { id: 'a3', label: 'A3', x: 83, y: 96 },
        { id: 'a4', label: 'A4', x: 103, y: 96 },
        { id: 'a5', label: 'A5', x: 123, y: 96 },
        { id: 'a6', label: 'A6', x: 143, y: 96 },
        { id: 'a7', label: 'A7', x: 163, y: 96 },
        { id: 'com', label: 'GND', x: 162, y: 20 },
      ];
    case 'push-button':
      return [
        { id: 'pin1', label: '1', x: 23, y: 88 },
        { id: 'pin2', label: '2', x: 73, y: 88 },
      ];
    case 'toggle-switch':
    case 'press-switch':
      return [
        { id: 'pin1', label: '1', x: 23, y: 93 },
        { id: 'pin2', label: '2', x: 89, y: 93 },
      ];
    case 'seven-segment':
      return [
        { id: 'com', label: 'COM', x: 90, y: 18 },
        { id: 'a', label: 'a', x: 19, y: 148 },
        { id: 'b', label: 'b', x: 43, y: 148 },
        { id: 'c', label: 'c', x: 68, y: 148 },
        { id: 'd', label: 'd', x: 93, y: 148 },
        { id: 'e', label: 'e', x: 19, y: 168 },
        { id: 'f', label: 'f', x: 43, y: 168 },
        { id: 'g', label: 'g', x: 68, y: 168 },
        { id: 'dp', label: 'dp', x: 93, y: 168 },
      ];
    case 'lcd1602':
      return [
        { id: 'rs', label: 'RS', x: 20, y: 110 },
        { id: 'rw', label: 'RW', x: 42, y: 110 },
        { id: 'e', label: 'E', x: 64, y: 110 },
        { id: 'd0', label: 'D0', x: 92, y: 110 },
        { id: 'd1', label: 'D1', x: 114, y: 110 },
        { id: 'd2', label: 'D2', x: 136, y: 110 },
        { id: 'd3', label: 'D3', x: 158, y: 110 },
        { id: 'd4', label: 'D4', x: 184, y: 110 },
        { id: 'd5', label: 'D5', x: 206, y: 110 },
        { id: 'd6', label: 'D6', x: 228, y: 110 },
        { id: 'd7', label: 'D7', x: 250, y: 110 },
      ];
    case 'potentiometer':
      return [
        { id: 'vcc', label: 'VCC', x: 19, y: 107 },
        { id: 'wiper', label: 'WIP', x: 64, y: 107 },
        { id: 'gnd', label: 'GND', x: 109, y: 107 },
      ];
    case 'lm35':
      return [
        { id: 'vcc', label: 'VCC', x: 22, y: 115 },
        { id: 'vout', label: 'OUT', x: 72, y: 115 },
        { id: 'gnd', label: 'GND', x: 122, y: 115 },
      ];
    case 'buzzer':
      return [
        { id: 'pos', label: '(+)', x: 22, y: 91 },
        { id: 'neg', label: '(-)', x: 74, y: 91 },
      ];
    case 'dc-motor':
      return [
        { id: 'pos', label: '(+)', x: 22, y: 125 },
        { id: 'neg', label: '(-)', x: 106, y: 125 },
      ];
    case 'stepper-motor':
      return [
        { id: 'in1', label: '1', x: 20, y: 143 },
        { id: 'in2', label: '2', x: 46, y: 143 },
        { id: 'in3', label: '3', x: 72, y: 143 },
        { id: 'in4', label: '4', x: 98, y: 143 },
        { id: 'com', label: 'GND', x: 124, y: 143 },
      ];
    case 'keypad4x4':
      return [
        { id: 'r1', label: 'R1', x: 18, y: 220 },
        { id: 'r2', label: 'R2', x: 40, y: 220 },
        { id: 'r3', label: 'R3', x: 62, y: 220 },
        { id: 'r4', label: 'R4', x: 84, y: 220 },
        { id: 'c1', label: 'C1', x: 110, y: 220 },
        { id: 'c2', label: 'C2', x: 132, y: 220 },
        { id: 'c3', label: 'C3', x: 154, y: 220 },
        { id: 'c4', label: 'C4', x: 176, y: 220 },
      ];
    case 'vcc':
      return [{ id: 'out', label: '+5V', x: 15, y: 13 }];
    case 'gnd':
      return [{ id: 'out', label: 'GND', x: 15, y: 13 }];
    default:
      return [];
  }
}

export class CircuitEngine {
  public mcu: Atmega16Simulator;
  public components: CircuitComponent[] = [];
  public wires: WireConnection[] = [];

  // Component Live States
  public ledStates: Map<string, boolean> = new Map();
  public ledBarStates: Map<string, boolean[]> = new Map();
  public segStates: Map<string, Record<string, boolean>> = new Map();
  public lcdStates: Map<string, Lcd1602State> = new Map();
  public motorSpeeds: Map<string, number> = new Map();
  public dcMotorStates: Map<string, DcMotorState> = new Map();
  public stepperStates: Map<string, StepperMotorState> = new Map();
  public buzzerActive: Map<string, boolean> = new Map();

  constructor(mcu: Atmega16Simulator) {
    this.mcu = mcu;
  }

  public setComponentsAndWires(components: CircuitComponent[], wires: WireConnection[]) {
    this.components = components;
    this.wires = wires;

    // Initialize LCD states if any
    for (const comp of components) {
      if (comp.type === 'lcd1602' && !this.lcdStates.has(comp.id)) {
        this.lcdStates.set(comp.id, {
          lines: ['                ', '                '],
          cursorRow: 0,
          cursorCol: 0,
          displayOn: true,
          nibbleBuffer: null,
          lastE: false,
          backlight: true,
        });
      }
      if (comp.type === 'led-bar' && !this.ledBarStates.has(comp.id)) {
        this.ledBarStates.set(comp.id, [false, false, false, false, false, false, false, false]);
      }
    }
  }

  /**
   * Update electrical nets and propagate signals between MCU & components
   */
  public updateCircuit(): void {
    const pinInfos = this.mcu.getAllPinInfos();
    const pinMap = new Map<string, typeof pinInfos[0]>();
    for (const p of pinInfos) {
      pinMap.set(p.name, p);
    }

    // Map: terminalKey "compId:termId" -> voltage (number)
    const termVoltages = new Map<string, number>();

    // 1. Establish initial power sources
    for (const comp of this.components) {
      if (comp.type === 'vcc') {
        termVoltages.set(`${comp.id}:out`, 5.0);
      } else if (comp.type === 'gnd') {
        termVoltages.set(`${comp.id}:out`, 0.0);
      } else if (comp.type === 'potentiometer') {
        const val = typeof comp.props?.value === 'number' ? comp.props.value : 0.5;
        termVoltages.set(`${comp.id}:vcc`, 5.0);
        termVoltages.set(`${comp.id}:gnd`, 0.0);
        termVoltages.set(`${comp.id}:wiper`, val * 5.0);
      } else if (comp.type === 'lm35') {
        const temp = typeof comp.props?.temp === 'number' ? comp.props.temp : 25.0;
        // LM35 outputs 10mV/°C = 0.010V/°C (e.g. 25°C = 0.25V, 50°C = 0.50V, 100°C = 1.00V)
        const vOut = Math.max(0, temp * 0.010);
        termVoltages.set(`${comp.id}:vcc`, 5.0);
        termVoltages.set(`${comp.id}:gnd`, 0.0);
        termVoltages.set(`${comp.id}:vout`, vOut);
      }
    }

    // 2. Set MCU output and pull-up pin voltages
    for (const p of pinInfos) {
      if (p.direction === 'output') {
        termVoltages.set(`atmega16:${p.name}`, p.voltage);
      } else if (p.direction === 'input-pullup') {
        // Internal pull-up resistor (~30kΩ to +5V) provides a 5.0V reference
        termVoltages.set(`atmega16:${p.name}`, 5.0);
      }
    }

    // 3. Multi-pass electrical solver: propagate across wires and closed switches/buttons
    for (let pass = 0; pass < 4; pass++) {
      // Equalize closed switches and buttons
      for (const comp of this.components) {
        if (comp.type === 'push-button' || comp.type === 'toggle-switch' || comp.type === 'press-switch') {
          const isClosed = !!comp.props?.pressed || !!comp.props?.closed;
          if (isClosed) {
            const v1 = termVoltages.get(`${comp.id}:pin1`);
            const v2 = termVoltages.get(`${comp.id}:pin2`);
            if (v1 !== undefined && v2 === undefined) {
              termVoltages.set(`${comp.id}:pin2`, v1);
            } else if (v2 !== undefined && v1 === undefined) {
              termVoltages.set(`${comp.id}:pin1`, v2);
            } else if (v1 !== undefined && v2 !== undefined) {
              if (v1 === 0.0 || v2 === 0.0) {
                termVoltages.set(`${comp.id}:pin1`, 0.0);
                termVoltages.set(`${comp.id}:pin2`, 0.0);
              } else {
                const maxV = Math.max(v1, v2);
                termVoltages.set(`${comp.id}:pin1`, maxV);
                termVoltages.set(`${comp.id}:pin2`, maxV);
              }
            }
          }
        } else if (comp.type === 'keypad4x4') {
          // Matrix Keypad: pressing a key connects its row and column lines
          const pressedKey = comp.props?.pressedKey;
          if (pressedKey && KEYPAD_4X4_MAP[pressedKey]) {
            const { row, col } = KEYPAD_4X4_MAP[pressedKey];
            const rKey = `${comp.id}:${row}`;
            const cKey = `${comp.id}:${col}`;
            const vR = termVoltages.get(rKey);
            const vC = termVoltages.get(cKey);
            if (vR !== undefined && vC === undefined) {
              termVoltages.set(cKey, vR);
            } else if (vC !== undefined && vR === undefined) {
              termVoltages.set(rKey, vC);
            } else if (vR !== undefined && vC !== undefined) {
              if (vR === 0.0 || vC === 0.0) {
                // Ground dominates (pull-down or active-low row drive)
                termVoltages.set(rKey, 0.0);
                termVoltages.set(cKey, 0.0);
              } else {
                const maxV = Math.max(vR, vC);
                termVoltages.set(rKey, maxV);
                termVoltages.set(cKey, maxV);
              }
            }
          }
        }
      }

      // Propagate across wires
      for (const wire of this.wires) {
        const fromKey = `${wire.fromCompId}:${wire.fromTermId}`;
        const toKey = `${wire.toCompId}:${wire.toTermId}`;

        const vFrom = termVoltages.get(fromKey);
        const vTo = termVoltages.get(toKey);

        if (vFrom !== undefined && vTo === undefined) {
          termVoltages.set(toKey, vFrom);
        } else if (vTo !== undefined && vFrom === undefined) {
          termVoltages.set(fromKey, vTo);
        } else if (vFrom !== undefined && vTo !== undefined) {
          // If one is GND (0V), GND dominates in pull-up circuit
          if (vFrom === 0.0 || vTo === 0.0) {
            termVoltages.set(fromKey, 0.0);
            termVoltages.set(toKey, 0.0);
          } else {
            const high = Math.max(vFrom, vTo);
            termVoltages.set(fromKey, high);
            termVoltages.set(toKey, high);
          }
        }
      }
    }

    // 5. Feed signals back into ATmega16 inputs
    for (const p of pinInfos) {
      if (!p.port) continue;
      const key = `atmega16:${p.name}`;
      const vNet = termVoltages.get(key);

      if (p.direction === 'input-pullup') {
        // Internal pull-up is active (+5V). If connected to GND (0V), goes LOW (false)
        if (vNet !== undefined && vNet < 1.5) {
          this.mcu.setDigitalInput(p.port, p.portBit!, false);
        } else {
          // Internal pull-up keeps pin solidly at HIGH (+5V) - does NOT float!
          this.mcu.setDigitalInput(p.port, p.portBit!, true);
        }
      } else if (p.direction === 'input') {
        if (vNet !== undefined) {
          this.mcu.setDigitalInput(p.port, p.portBit!, vNet >= 2.2);
        } else {
          // Floating input without pull-up (DDR=0, PORT=0)
          this.mcu.setDigitalInput(p.port, p.portBit!, false);
        }
      }

      // Check ADC input
      if (p.port === 'A') {
        const channel = p.portBit!;
        if (vNet !== undefined) {
          this.mcu.setAnalogInput(channel, vNet);
        }
      }
    }

    // 6. Update visual states of all attached components
    for (const comp of this.components) {
      if (comp.type === 'led') {
        const vAnode = termVoltages.get(`${comp.id}:anode`) ?? 0;
        const vCathode = termVoltages.get(`${comp.id}:cathode`) ?? 0;
        const isLit = vAnode > vCathode + 1.6;
        this.ledStates.set(comp.id, isLit);
      } else if (comp.type === 'led-bar') {
        const vCom = termVoltages.get(`${comp.id}:com`) ?? 0;
        const bars: boolean[] = [];
        for (let i = 0; i < 8; i++) {
          const vAnode =
            termVoltages.get(`${comp.id}:d${i}`) ??
            termVoltages.get(`${comp.id}:a${i}`) ??
            0;
          bars.push(vAnode > vCom + 1.6);
        }
        this.ledBarStates.set(comp.id, bars);
      } else if (comp.type === 'seven-segment') {
        const vCom = termVoltages.get(`${comp.id}:com`) ?? 0;
        const segs: Record<string, boolean> = {};
        for (const s of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp']) {
          const vPin = termVoltages.get(`${comp.id}:${s}`) ?? 0;
          segs[s] = vPin > vCom + 1.6;
        }
        this.segStates.set(comp.id, segs);
      } else if (comp.type === 'buzzer') {
        const vPos = termVoltages.get(`${comp.id}:pos`) ?? 0;
        const vNeg = termVoltages.get(`${comp.id}:neg`) ?? 0;
        const active = vPos > vNeg + 2.0;
        this.buzzerActive.set(comp.id, active);
        if (active) {
          buzzerAudio.pulse(true);
        }
      } else if (comp.type === 'dc-motor') {
        const vPos = termVoltages.get(`${comp.id}:pos`) ?? 0;
        const vNeg = termVoltages.get(`${comp.id}:neg`) ?? 0;
        const diff = vPos - vNeg;
        const speed = Math.abs(diff) > 1.0 ? Math.min(1.0, Math.abs(diff) / 5.0) : 0;
        const direction: 1 | -1 = diff >= 0 ? 1 : -1;
        const current = this.dcMotorStates.get(comp.id) || { speed: 0, direction: 1, angle: 0, rpm: 0 };
        const newAngle = (current.angle + speed * direction * 25) % 360;
        const rpm = Math.round(speed * 2400);
        this.dcMotorStates.set(comp.id, { speed, direction, angle: newAngle, rpm });
        this.motorSpeeds.set(comp.id, speed);
      } else if (comp.type === 'stepper-motor') {
        const v1 = (termVoltages.get(`${comp.id}:in1`) ?? 0) > 2.0;
        const v2 = (termVoltages.get(`${comp.id}:in2`) ?? 0) > 2.0;
        const v3 = (termVoltages.get(`${comp.id}:in3`) ?? 0) > 2.0;
        const v4 = (termVoltages.get(`${comp.id}:in4`) ?? 0) > 2.0;
        const pattern = (v1 ? 1 : 0) | (v2 ? 2 : 0) | (v3 ? 4 : 0) | (v4 ? 8 : 0);

        const current = this.stepperStates.get(comp.id) || {
          angle: 0,
          stepCount: 0,
          coils: [false, false, false, false],
          lastStepPattern: 0,
        };

        if (pattern !== current.lastStepPattern && pattern !== 0) {
          // Detect step direction (CW or CCW) based on standard 4-step sequence
          let stepDir = 1;
          const last = current.lastStepPattern;
          if (
            (last === 1 && pattern === 2) || (last === 2 && pattern === 4) ||
            (last === 4 && pattern === 8) || (last === 8 && pattern === 1) ||
            (last === 9 && pattern === 3) || (last === 3 && pattern === 6) ||
            (last === 6 && pattern === 12) || (last === 12 && pattern === 9)
          ) {
            stepDir = 1; // CW
          } else if (
            (last === 2 && pattern === 1) || (last === 4 && pattern === 2) ||
            (last === 8 && pattern === 4) || (last === 1 && pattern === 8) ||
            (last === 3 && pattern === 9) || (last === 6 && pattern === 3) ||
            (last === 12 && pattern === 6) || (last === 9 && pattern === 12)
          ) {
            stepDir = -1; // CCW
          }

          const stepAngle = 7.5; // degrees per step
          current.angle = (current.angle + stepDir * stepAngle + 360) % 360;
          current.stepCount += stepDir;
          current.lastStepPattern = pattern;
        }

        current.coils = [v1, v2, v3, v4];
        this.stepperStates.set(comp.id, current);
      } else if (comp.type === 'lcd1602') {
        this.processLcd(comp, termVoltages);
      }
    }
  }

  // Helper to execute an 8-bit instruction or data byte on HD44780
  private executeLcdByte(lcd: Lcd1602State, rs: boolean, byteVal: number): void {
    if (!rs) {
      // Command mode
      if (byteVal === 0x01) {
        // Clear Display
        lcd.lines = ['                ', '                '];
        lcd.cursorRow = 0;
        lcd.cursorCol = 0;
      } else if (byteVal === 0x02 || byteVal === 0x03) {
        // Return Home
        lcd.cursorRow = 0;
        lcd.cursorCol = 0;
      } else if ((byteVal & 0x80) !== 0) {
        // Set DDRAM Address
        const addr = byteVal & 0x7f;
        if (addr >= 0x40) {
          lcd.cursorRow = 1;
          lcd.cursorCol = Math.min(15, Math.max(0, addr - 0x40));
        } else {
          lcd.cursorRow = 0;
          lcd.cursorCol = Math.min(15, Math.max(0, addr));
        }
      } else if ((byteVal & 0x20) !== 0) {
        // Function Set: bit 4 is DL (Data Length: 1 = 8-bit mode, 0 = 4-bit mode)
        const is8Bit = !!(byteVal & 0x10);
        lcd.is8BitMode = is8Bit;
      }
    } else {
      // Data mode (Character)
      const char = byteVal >= 32 && byteVal <= 126 ? String.fromCharCode(byteVal) : ' ';
      const r = lcd.cursorRow;
      const c = lcd.cursorCol;
      const lineArr = lcd.lines[r].split('');
      lineArr[c] = char;
      lcd.lines[r] = lineArr.join('');

      lcd.cursorCol = (c + 1) % 16;
      if (lcd.cursorCol === 0) {
        lcd.cursorRow = (r + 1) % 2;
      }
    }
  }

  // Handle HD44780 8-bit and 4-bit protocol for the 16x2 LCD
  private processLcd(comp: CircuitComponent, termVoltages: Map<string, number>): void {
    const lcd = this.lcdStates.get(comp.id);
    if (!lcd) return;

    const rs = (termVoltages.get(`${comp.id}:rs`) ?? 0) > 2.0;
    const e = (termVoltages.get(`${comp.id}:e`) ?? 0) > 2.0;

    const d0 = (termVoltages.get(`${comp.id}:d0`) ?? 0) > 2.0 ? 1 : 0;
    const d1 = (termVoltages.get(`${comp.id}:d1`) ?? 0) > 2.0 ? 1 : 0;
    const d2 = (termVoltages.get(`${comp.id}:d2`) ?? 0) > 2.0 ? 1 : 0;
    const d3 = (termVoltages.get(`${comp.id}:d3`) ?? 0) > 2.0 ? 1 : 0;
    const d4 = (termVoltages.get(`${comp.id}:d4`) ?? 0) > 2.0 ? 1 : 0;
    const d5 = (termVoltages.get(`${comp.id}:d5`) ?? 0) > 2.0 ? 1 : 0;
    const d6 = (termVoltages.get(`${comp.id}:d6`) ?? 0) > 2.0 ? 1 : 0;
    const d7 = (termVoltages.get(`${comp.id}:d7`) ?? 0) > 2.0 ? 1 : 0;

    // Detect if lower 4 bits are wired (auto-detect 8-bit wiring) or explicitly configured
    const hasLowerBitsWired = this.wires.some(
      (w) =>
        (w.toCompId === comp.id && ['d0', 'd1', 'd2', 'd3'].includes(w.toTermId)) ||
        (w.fromCompId === comp.id && ['d0', 'd1', 'd2', 'd3'].includes(w.fromTermId))
    );

    const is8Bit = hasLowerBitsWired || lcd.is8BitMode === true || comp.props?.is8BitMode === true;
    lcd.is8BitMode = is8Bit;

    // Detect Enable Falling Edge (E goes from HIGH to LOW)
    if (lcd.lastE && !e) {
      if (is8Bit) {
        // --- 8-BIT MODE ---
        // Complete 8-bit byte sampled directly on single E pulse
        const byteVal =
          (d7 << 7) | (d6 << 6) | (d5 << 5) | (d4 << 4) | (d3 << 3) | (d2 << 2) | (d1 << 1) | d0;
        this.executeLcdByte(lcd, rs, byteVal);
      } else {
        // --- 4-BIT MODE ---
        const nibble = (d7 << 3) | (d6 << 2) | (d5 << 1) | d4;

        if (!rs && lcd.nibbleBuffer === null && !lcd.initialized && (nibble === 0x02 || nibble === 0x03)) {
          // HD44780 4-bit initialization single-nibble sequence:
          // 0x03: Wakeup pulse; 0x02: Switch interface to 4-bit mode
          if (nibble === 0x02) {
            lcd.initialized = true;
          }
          lcd.nibbleBuffer = null;
        } else if (lcd.nibbleBuffer === null) {
          // High nibble received
          lcd.nibbleBuffer = nibble;
        } else {
          // Low nibble received -> combine into 8-bit byte
          const byteVal = (lcd.nibbleBuffer << 4) | nibble;
          lcd.nibbleBuffer = null;
          lcd.initialized = true;
          this.executeLcdByte(lcd, rs, byteVal);
        }
      }
    }

    lcd.lastE = e;
  }
}
