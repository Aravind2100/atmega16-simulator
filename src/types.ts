// Types for the ATmega16 Simulator

export type SimulatorLanguage = 'c' | 'asm';

export interface CompilationResult {
  success: boolean;
  hex?: string;
  disassembly?: string;
  flashUsed?: number;
  flashMax?: number;
  sramUsed?: number;
  sramMax?: number;
  message?: string;
  errors?: string;
  sourceMap?: Map<number, number>; // PC word offset -> source line index
}

export type PinDirection = 'input' | 'output' | 'input-pullup';
export type PinElectricalState = 'high' | 'low' | 'pullup' | 'tristate';

export interface AtmegaPinInfo {
  pinNumber: number; // 1 to 40
  name: string;      // e.g. "PB0", "RESET", "VCC", "PA0"
  port?: 'A' | 'B' | 'C' | 'D';
  portBit?: number;  // 0 to 7
  bitmask?: number;  // e.g. 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80
  pinAddressLabel?: string; // e.g. "PINA0 => 0x01", "PINA4 => 0x10"
  altFunctions: string[]; // e.g. ["XCK", "T0"]
  direction: PinDirection;
  state: PinElectricalState;
  voltage: number;   // 0.0 to 5.0 V
  pullUpEnabled?: boolean; // true when DDR=0 and PORT=1 (internal ~30k pull-up active)
  isFloating?: boolean;    // true when DDR=0 and PORT=0 and unconnected
}

export type ComponentType =
  | 'atmega16'
  | 'led'
  | 'led-bar'
  | 'push-button'
  | 'toggle-switch'
  | 'press-switch'
  | 'seven-segment'
  | 'lcd1602'
  | 'potentiometer'
  | 'lm35'
  | 'buzzer'
  | 'dc-motor'
  | 'stepper-motor'
  | 'keypad4x4'
  | 'vcc'
  | 'gnd';

export interface ComponentTerminal {
  id: string;        // e.g. "anode", "cathode", "pin-1"
  label: string;     // display label
  x: number;         // relative x inside component
  y: number;         // relative y inside component
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  label: string;
  props?: Record<string, any>; // color, rotation, potentiometer value, button state, etc.
}

export interface WireConnection {
  id: string;
  color: string;
  fromCompId: string;
  fromTermId: string;
  toCompId: string;
  toTermId: string;
}

export interface CpuRegistersState {
  r: number[];         // R0 - R31 (32 registers)
  sreg: number;        // SREG status register
  sregFlags: {
    I: boolean; // Global Interrupt
    T: boolean; // Bit Copy Storage
    H: boolean; // Half Carry
    S: boolean; // Sign (N ^ V)
    V: boolean; // Overflow
    N: boolean; // Negative
    Z: boolean; // Zero
    C: boolean; // Carry
  };
  pc: number;          // Program Counter (words)
  sp: number;          // Stack Pointer
  cycles: number;      // Total CPU cycles
  // ATmega16 I/O Registers
  ports: {
    A: { port: number; ddr: number; pin: number };
    B: { port: number; ddr: number; pin: number };
    C: { port: number; ddr: number; pin: number };
    D: { port: number; ddr: number; pin: number };
  };
  timers: {
    tcnt0: number;
    tccr0: number;
    ocr0: number;
  };
  adc: {
    admux: number;
    adcsra: number;
    value: number;
  };
}

export interface ExampleProject {
  id: string;
  title: string;
  category: 'Beginner' | 'GPIO' | 'Displays' | 'Analog & Sensors' | 'Interrupts' | 'Assembly' | 'Inputs';
  description: string;
  language: SimulatorLanguage;
  code: string;
  components: CircuitComponent[];
  wires: WireConnection[];
  learningNotes: string[];
  precompiledHex?: string;
  precompiledDisassembly?: string;
  flashUsed?: number;
  sramUsed?: number;
}
