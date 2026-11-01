/**
 * Client-Side AVR Assembler for ATmega16
 * Assembles AVR assembly code directly in the browser into machine code (16-bit words)
 * with instant feedback and source-to-PC mapping.
 */

import { encodeIntelHex } from './hexParser.ts';

// Standard ATmega16 I/O Register Addresses (I/O addresses, 0x00 - 0x3F)
export const ATMEGA16_IO_SYMBOLS: Record<string, number> = {
  // Ports
  TWBR: 0x00,
  TWSR: 0x01,
  TWAR: 0x02,
  TWDR: 0x03,
  ADCL: 0x04,
  ADCH: 0x05,
  ADCSRA: 0x06,
  ADMUX: 0x07,
  ACSR: 0x08,
  UBRRL: 0x09,
  UCSRB: 0x0A,
  UCSRA: 0x0B,
  UDR: 0x0C,
  SPCR: 0x0D,
  SPSR: 0x0E,
  SPDR: 0x0F,
  PIND: 0x10,
  DDRD: 0x11,
  PORTD: 0x12,
  PINC: 0x13,
  DDRC: 0x14,
  PORTC: 0x15,
  PINB: 0x16,
  DDRB: 0x17,
  PORTB: 0x18,
  PINA: 0x19,
  DDRA: 0x1A,
  PORTA: 0x1B,
  EECR: 0x1C,
  EEDR: 0x1D,
  EEARL: 0x1E,
  EEARH: 0x1F,
  UCSRC: 0x20,
  UBRRH: 0x20,
  WDTCR: 0x21,
  ASSR: 0x22,
  OCR2: 0x23,
  TCNT2: 0x24,
  TCCR2: 0x25,
  ICR1L: 0x26,
  ICR1H: 0x27,
  OCR1BL: 0x28,
  OCR1BH: 0x29,
  OCR1AL: 0x2A,
  OCR1AH: 0x2B,
  TCNT1L: 0x2C,
  TCNT1H: 0x2D,
  TCCR1B: 0x2E,
  TCCR1A: 0x2F,
  SFIOR: 0x30,
  OSCCAL: 0x31,
  TCNT0: 0x32,
  TCCR0: 0x33,
  MCUCSR: 0x34,
  MCUCR: 0x35,
  TWCR: 0x36,
  SPMCR: 0x37,
  TIFR: 0x38,
  TIMSK: 0x39,
  GIFR: 0x3A,
  GICR: 0x3B,
  OCR0: 0x3C,
  SPL: 0x3D,
  SPH: 0x3E,
  SREG: 0x3F,

  // Port bit numbers (0..7)
  PA0: 0, PA1: 1, PA2: 2, PA3: 3, PA4: 4, PA5: 5, PA6: 6, PA7: 7,
  PB0: 0, PB1: 1, PB2: 2, PB3: 3, PB4: 4, PB5: 5, PB6: 6, PB7: 7,
  PC0: 0, PC1: 1, PC2: 2, PC3: 3, PC4: 4, PC5: 5, PC6: 6, PC7: 7,
  PD0: 0, PD1: 1, PD2: 2, PD3: 3, PD4: 4, PD5: 5, PD6: 6, PD7: 7,

  // Pin Address & Bitmask Mapping (e.g. PINA0 => 0x01, PINA4 => 0x10)
  PINA0: 0x01, PINA1: 0x02, PINA2: 0x04, PINA3: 0x08,
  PINA4: 0x10, PINA5: 0x20, PINA6: 0x40, PINA7: 0x80,

  PINB0: 0x01, PINB1: 0x02, PINB2: 0x04, PINB3: 0x08,
  PINB4: 0x10, PINB5: 0x20, PINB6: 0x40, PINB7: 0x80,

  PINC0: 0x01, PINC1: 0x02, PINC2: 0x04, PINC3: 0x08,
  PINC4: 0x10, PINC5: 0x20, PINC6: 0x40, PINC7: 0x80,

  PIND0: 0x01, PIND1: 0x02, PIND2: 0x04, PIND3: 0x08,
  PIND4: 0x10, PIND5: 0x20, PIND6: 0x40, PIND7: 0x80,

  PORTA0: 0x01, PORTA1: 0x02, PORTA2: 0x04, PORTA3: 0x08,
  PORTA4: 0x10, PORTA5: 0x20, PORTA6: 0x40, PORTA7: 0x80,

  PORTB0: 0x01, PORTB1: 0x02, PORTB2: 0x04, PORTB3: 0x08,
  PORTB4: 0x10, PORTB5: 0x20, PORTB6: 0x40, PORTB7: 0x80,

  PORTC0: 0x01, PORTC1: 0x02, PORTC2: 0x04, PORTC3: 0x08,
  PORTC4: 0x10, PORTC5: 0x20, PORTC6: 0x40, PORTC7: 0x80,

  PORTD0: 0x01, PORTD1: 0x02, PORTD2: 0x04, PORTD3: 0x08,
  PORTD4: 0x10, PORTD5: 0x20, PORTD6: 0x40, PORTD7: 0x80,

  DDRA0: 0x01, DDRA1: 0x02, DDRA2: 0x04, DDRA3: 0x08,
  DDRA4: 0x10, DDRA5: 0x20, DDRA6: 0x40, DDRA7: 0x80,

  DDRB0: 0x01, DDRB1: 0x02, DDRB2: 0x04, DDRB3: 0x08,
  DDRB4: 0x10, DDRB5: 0x20, DDRB6: 0x40, DDRB7: 0x80,

  DDRC0: 0x01, DDRC1: 0x02, DDRC2: 0x04, DDRC3: 0x08,
  DDRC4: 0x10, DDRC5: 0x20, DDRC6: 0x40, DDRC7: 0x80,

  DDRD0: 0x01, DDRD1: 0x02, DDRD2: 0x04, DDRD3: 0x08,
  DDRD4: 0x10, DDRD5: 0x20, DDRD6: 0x40, DDRD7: 0x80,

  // Interrupt Bits
  INT0: 6,
  INT1: 7,
  INT2: 5,

  // RAMEND for ATmega16 (0x045F)
  RAMEND: 0x045F,
  FLASHEND: 0x3FFF,
};

export interface AssembleOutput {
  success: boolean;
  progMem: Uint16Array;
  hex: string;
  disassembly: string;
  flashUsed: number;
  sourceMap: Map<number, number>; // PC word -> source line
  errors: string[];
}

interface IntermediateInstruction {
  lineNum: number;
  originalLine: string;
  pc: number;
  mnemonic: string;
  operands: string[];
  words: number[];
  isResolved: boolean;
}

export function assembleAvr(source: string): AssembleOutput {
  const lines = source.split(/\r?\n/);
  const progMem = new Uint16Array(8192); // 16KB ATmega16 Flash
  const sourceMap = new Map<number, number>();
  const errors: string[] = [];
  const symbols = new Map<string, number>();
  for (const [k, v] of Object.entries(ATMEGA16_IO_SYMBOLS)) {
    symbols.set(k.toLowerCase(), v);
  }
  const labels = new Map<string, number>();

  let currentPc = 0; // PC in 16-bit words
  const instructions: IntermediateInstruction[] = [];

  // Pass 1: Parse labels, directives, and instructions, calculate word sizes
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    let line = lines[lineIdx].trim();

    // Strip comments (; or //)
    const commentPos = line.search(/;|\/\//);
    if (commentPos >= 0) {
      line = line.substring(0, commentPos).trim();
    }
    if (!line) continue;

    // Check for label
    const labelMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(.*)$/);
    if (labelMatch) {
      const labelName = labelMatch[1].toLowerCase();
      labels.set(labelName, currentPc);
      line = labelMatch[2].trim();
      if (!line) continue;
    }

    // Directives
    if (line.startsWith('.')) {
      const parts = line.split(/\s+/);
      const directive = parts[0].toLowerCase();
      if (directive === '.org') {
        const addr = parseExpr(parts[1], symbols, labels, currentPc);
        currentPc = addr >> 1; // convert byte address to word address
      } else if (directive === '.equ' || directive === '.def' || directive === '.set') {
        const eqMatch = line.match(/^\.\w+\s+([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
        if (eqMatch) {
          const sym = eqMatch[1].toLowerCase();
          const val = parseExpr(eqMatch[2], symbols, labels, currentPc);
          symbols.set(sym, val);
        } else if (parts.length >= 3) {
          const sym = parts[1].replace(',', '').toLowerCase();
          const val = parseExpr(parts.slice(2).join(' '), symbols, labels, currentPc);
          symbols.set(sym, val);
        }
      } else if (directive === '.db' || directive === '.byte') {
        // Data bytes
        const byteExprs = line.substring(line.indexOf(' ')).split(',');
        let isLow = true;
        for (const be of byteExprs) {
          const b = parseExpr(be.trim(), symbols, labels, currentPc) & 0xff;
          if (isLow) {
            progMem[currentPc] = b;
          } else {
            progMem[currentPc] |= (b << 8);
            currentPc++;
          }
          isLow = !isLow;
        }
        if (!isLow) currentPc++;
      } else if (directive === '.dw') {
        const wordExprs = line.substring(line.indexOf(' ')).split(',');
        for (const we of wordExprs) {
          const w = parseExpr(we.trim(), symbols, labels, currentPc) & 0xffff;
          progMem[currentPc++] = w;
        }
      }
      continue;
    }

    // Parse instruction mnemonic and operands
    const match = line.match(/^([a-zA-Z]+)(?:\s+(.*))?$/);
    if (!match) continue;

    const mnemonic = match[1].toLowerCase();
    const operandsRaw = match[2] ? match[2].split(',').map((s) => s.trim()) : [];

    const inst: IntermediateInstruction = {
      lineNum: lineIdx + 1,
      originalLine: lines[lineIdx],
      pc: currentPc,
      mnemonic,
      operands: operandsRaw,
      words: [],
      isResolved: false,
    };

    // Calculate instruction size (1 word or 2 words)
    const isTwoWord = ['jmp', 'call', 'lds', 'sts'].includes(mnemonic);
    currentPc += isTwoWord ? 2 : 1;

    instructions.push(inst);
  }

  // Pass 2: Assemble instructions into binary words
  const disassemblyLines: string[] = [];

  for (const inst of instructions) {
    try {
      sourceMap.set(inst.pc, inst.lineNum);
      const words = encodeInstruction(inst, symbols, labels);
      inst.words = words;

      for (let i = 0; i < words.length; i++) {
        progMem[inst.pc + i] = words[i];
      }

      const hexWords = words.map((w) => w.toString(16).padStart(4, '0')).join(' ');
      const byteAddr = (inst.pc * 2).toString(16).padStart(4, '0');
      disassemblyLines.push(
        `${byteAddr}:   ${hexWords.padEnd(10)}  ${inst.originalLine.trim()}`
      );
    } catch (err: any) {
      errors.push(`Line ${inst.lineNum}: ${err.message} ("${inst.originalLine.trim()}")`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      progMem,
      hex: '',
      disassembly: errors.join('\n'),
      flashUsed: 0,
      sourceMap,
      errors,
    };
  }

  let highestWord = 0;
  for (let i = 8191; i >= 0; i--) {
    if (progMem[i] !== 0) {
      highestWord = i + 1;
      break;
    }
  }
  const flashUsed = highestWord * 2;
  const hex = encodeIntelHex(progMem, highestWord);

  return {
    success: true,
    progMem,
    hex,
    disassembly: disassemblyLines.join('\n'),
    flashUsed,
    sourceMap,
    errors: [],
  };
}

// Helper to parse register name (e.g. "r16" -> 16, "r0" -> 0, "X" -> 26, "Y" -> 28, "Z" -> 30)
function parseReg(op: string): number {
  const clean = op.trim().toLowerCase();
  if (clean === 'x') return 26;
  if (clean === 'y') return 28;
  if (clean === 'z') return 30;
  const match = clean.match(/^r([0-9]|[12][0-9]|3[01])$/);
  if (!match) {
    throw new Error(`Invalid register "${op}" (expected r0..r31)`);
  }
  return parseInt(match[1], 10);
}

// Helper to parse expression with symbols and labels
function parseExpr(
  expr: string,
  symbols: Map<string, number>,
  labels: Map<string, number>,
  currentPc: number
): number {
  let e = expr.trim();
  // Handle high/low byte operators: low(...), high(...)
  const lowMatch = e.match(/^low\((.*)\)$/i);
  if (lowMatch) return parseExpr(lowMatch[1], symbols, labels, currentPc) & 0xff;
  const highMatch = e.match(/^high\((.*)\)$/i);
  if (highMatch) return (parseExpr(highMatch[1], symbols, labels, currentPc) >> 8) & 0xff;

  // Handle bit shift: (1 << PA0)
  const shiftMatch = e.match(/^\(?\s*1\s*<<\s*([a-zA-Z0-9_]+)\s*\)?$/);
  if (shiftMatch) {
    const bitVal = parseExpr(shiftMatch[1], symbols, labels, currentPc);
    return 1 << bitVal;
  }

  // Handle addition/subtraction
  if (e.includes('+')) {
    const parts = e.split('+');
    return parts.reduce((sum, p) => sum + parseExpr(p, symbols, labels, currentPc), 0);
  }

  // Handle labels
  const lower = e.toLowerCase();
  if (labels.has(lower)) {
    return labels.get(lower)! * 2; // byte address
  }
  if (symbols.has(lower)) {
    return symbols.get(lower)!;
  }

  // Numbers (hex: 0x... or $..., binary: 0b..., decimal)
  if (e.startsWith('$')) {
    return parseInt(e.substring(1), 16);
  }
  if (e.startsWith('0x') || e.startsWith('0X')) {
    return parseInt(e.substring(2), 16);
  }
  if (e.startsWith('0b') || e.startsWith('0B')) {
    return parseInt(e.substring(2), 2);
  }
  const parsed = parseInt(e, 10);
  if (!isNaN(parsed)) return parsed;

  throw new Error(`Unknown symbol or invalid value: "${expr}"`);
}

// Encode an instruction into 1 or 2 16-bit words
function encodeInstruction(
  inst: IntermediateInstruction,
  symbols: Map<string, number>,
  labels: Map<string, number>
): number[] {
  const m = inst.mnemonic;
  const ops = inst.operands;
  const pc = inst.pc;

  // NOP
  if (m === 'nop') return [0x0000];
  // SLEEP
  if (m === 'sleep') return [0x9588];
  // WDR
  if (m === 'wdr') return [0x95a8];
  // RET
  if (m === 'ret') return [0x9508];
  // RETI
  if (m === 'reti') return [0x9518];
  // SEI / CLI
  if (m === 'sei') return [0x9478];
  if (m === 'cli') return [0x94f8];
  // SEC / CLC
  if (m === 'sec') return [0x9468];
  if (m === 'clc') return [0x94e8];

  // LDI Rd, K (d in 16..31, K in 0..255)
  if (m === 'ldi') {
    if (ops.length < 2) throw new Error('LDI requires Rd, K');
    const d = parseReg(ops[0]);
    if (d < 16) throw new Error('LDI requires upper register (r16-r31)');
    const k = parseExpr(ops[1], symbols, labels, pc) & 0xff;
    // Opcode: 1110 KKKK dddd KKKK (d is 0..15 corresponding to r16..r31)
    const dNibble = d - 16;
    const word = 0xe000 | ((k & 0xf0) << 4) | (dNibble << 4) | (k & 0x0f);
    return [word];
  }

  // MOV Rd, Rr
  if (m === 'mov') {
    const d = parseReg(ops[0]);
    const r = parseReg(ops[1]);
    // 0010 11rd dddd rrrr
    const word = 0x2c00 | ((r & 0x10) << 5) | (d << 4) | (r & 0x0f);
    return [word];
  }

  // OUT A, Rr (A in 0..63)
  if (m === 'out') {
    if (ops.length < 2) throw new Error('OUT requires Port, Rr');
    const a = parseExpr(ops[0], symbols, labels, pc);
    const r = parseReg(ops[1]);
    if (a > 63) throw new Error(`OUT address 0x${a.toString(16)} exceeds 63 (0x3F)`);
    // 1011 1AAr rrrr AAAA
    const word = 0xb800 | ((a & 0x30) << 5) | (r << 4) | (a & 0x0f);
    return [word];
  }

  // IN Rd, A (A in 0..63)
  if (m === 'in') {
    if (ops.length < 2) throw new Error('IN requires Rd, Port');
    const d = parseReg(ops[0]);
    const a = parseExpr(ops[1], symbols, labels, pc);
    if (a > 63) throw new Error(`IN address 0x${a.toString(16)} exceeds 63 (0x3F)`);
    // 1011 0AAd dddd AAAA
    const word = 0xb000 | ((a & 0x30) << 5) | (d << 4) | (a & 0x0f);
    return [word];
  }

  // SBI A, b & CBI A, b (A in 0..31, b in 0..7)
  if (m === 'sbi' || m === 'cbi') {
    const a = parseExpr(ops[0], symbols, labels, pc);
    const b = parseExpr(ops[1], symbols, labels, pc);
    if (a > 31) throw new Error(`${m.toUpperCase()} port address must be 0..31`);
    if (b > 7) throw new Error(`${m.toUpperCase()} bit index must be 0..7`);
    const base = m === 'sbi' ? 0x9a00 : 0x9800;
    return [base | (a << 3) | (b & 0x07)];
  }

  // SBIC A, b & SBIS A, b
  if (m === 'sbic' || m === 'sbis') {
    const a = parseExpr(ops[0], symbols, labels, pc);
    const b = parseExpr(ops[1], symbols, labels, pc);
    const base = m === 'sbic' ? 0x9900 : 0x9b00;
    return [base | (a << 3) | (b & 0x07)];
  }

  // RJMP k & RCALL k (k relative word offset -2048 to +2047)
  if (m === 'rjmp' || m === 'rcall') {
    const targetByte = parseExpr(ops[0], symbols, labels, pc);
    const targetWord = targetByte >> 1;
    const relOffset = targetWord - (pc + 1);
    const k = relOffset & 0x0fff;
    const base = m === 'rjmp' ? 0xc000 : 0xd000;
    return [base | k];
  }

  // JMP addr & CALL addr (32-bit instructions)
  if (m === 'jmp' || m === 'call') {
    const targetByte = parseExpr(ops[0], symbols, labels, pc);
    const targetWord = targetByte >> 1;
    const base = m === 'jmp' ? 0x940c : 0x940e;
    const w1 = base | ((targetWord & 0x1f0000) >> 13);
    const w2 = targetWord & 0xffff;
    return [w1, w2];
  }

  // Branch instructions: BREQ, BRNE, BRCS, BRCC, BRMI, BRPL
  const branchOpcodes: Record<string, { s: number; bit: number }> = {
    brcs: { s: 0, bit: 0 },
    brlo: { s: 0, bit: 0 },
    breq: { s: 1, bit: 0 },
    brmi: { s: 2, bit: 0 },
    brvs: { s: 3, bit: 0 },
    brlt: { s: 4, bit: 0 },
    brhs: { s: 5, bit: 0 },
    brts: { s: 6, bit: 0 },
    brie: { s: 7, bit: 0 },

    brcc: { s: 0, bit: 1 },
    brsh: { s: 0, bit: 1 },
    brne: { s: 1, bit: 1 },
    brpl: { s: 2, bit: 1 },
    brvc: { s: 3, bit: 1 },
    brge: { s: 4, bit: 1 },
    brhc: { s: 5, bit: 1 },
    brtc: { s: 6, bit: 1 },
    brid: { s: 7, bit: 1 },
  };

  if (branchOpcodes[m]) {
    const info = branchOpcodes[m];
    const targetByte = parseExpr(ops[0], symbols, labels, pc);
    const targetWord = targetByte >> 1;
    const rel = targetWord - (pc + 1);
    if (rel < -64 || rel > 63) {
      throw new Error(`Branch target out of range (${rel} words, max ±64)`);
    }
    const k = rel & 0x7f;
    // 1111 00kk kkkk ksss (BRBS) or 1111 01kk kkkk ksss (BRBC)
    const base = info.bit === 0 ? 0xf000 : 0xf400;
    return [base | (k << 3) | info.s];
  }

  // Arithmetic & Logic with register and immediate
  // SUBI, SBCI, ANDI, ORI, CPI (d in 16..31)
  const immAluOps: Record<string, number> = {
    cpi: 0x3000,
    sbci: 0x4000,
    subi: 0x5000,
    ori: 0x6000,
    andi: 0x7000,
  };
  if (immAluOps[m]) {
    const d = parseReg(ops[0]);
    if (d < 16) throw new Error(`${m.toUpperCase()} requires upper register (r16-r31)`);
    const k = parseExpr(ops[1], symbols, labels, pc) & 0xff;
    const dNibble = d - 16;
    return [immAluOps[m] | ((k & 0xf0) << 4) | (dNibble << 4) | (k & 0x0f)];
  }

  // Arithmetic & Logic register-register:
  // ADD, ADC, SUB, SBC, AND, OR, EOR, CP, CPC, CPSE
  const regAluOps: Record<string, number> = {
    add: 0x0c00,
    adc: 0x1c00,
    sub: 0x1800,
    sbc: 0x0800,
    and: 0x2000,
    eor: 0x2400,
    or: 0x2800,
    cp: 0x1400,
    cpc: 0x0400,
    cpse: 0x1000,
  };
  if (regAluOps[m]) {
    const d = parseReg(ops[0]);
    const r = parseReg(ops[1]);
    return [regAluOps[m] | ((r & 0x10) << 5) | (d << 4) | (r & 0x0f)];
  }

  // Single-operand register instructions:
  // INC, DEC, COM, NEG, TST, CLR, SER, PUSH, POP, LSR, ROR, ASR, SWAP
  if (m === 'inc') {
    const d = parseReg(ops[0]);
    return [0x9403 | (d << 4)];
  }
  if (m === 'dec') {
    const d = parseReg(ops[0]);
    return [0x940a | (d << 4)];
  }
  if (m === 'com') {
    const d = parseReg(ops[0]);
    return [0x9400 | (d << 4)];
  }
  if (m === 'neg') {
    const d = parseReg(ops[0]);
    return [0x9401 | (d << 4)];
  }
  if (m === 'lsr') {
    const d = parseReg(ops[0]);
    return [0x9406 | (d << 4)];
  }
  if (m === 'ror') {
    const d = parseReg(ops[0]);
    return [0x9407 | (d << 4)];
  }
  if (m === 'asr') {
    const d = parseReg(ops[0]);
    return [0x9405 | (d << 4)];
  }
  if (m === 'swap') {
    const d = parseReg(ops[0]);
    return [0x9402 | (d << 4)];
  }
  if (m === 'clr') {
    const d = parseReg(ops[0]);
    // CLR Rd is EOR Rd, Rd
    return [0x2400 | ((d & 0x10) << 5) | (d << 4) | (d & 0x0f)];
  }
  if (m === 'ser') {
    const d = parseReg(ops[0]);
    if (d < 16) throw new Error('SER requires upper register (r16-r31)');
    // SER Rd is LDI Rd, 0xFF
    return [0xef0f | ((d - 16) << 4)];
  }
  if (m === 'tst') {
    const d = parseReg(ops[0]);
    // TST Rd is AND Rd, Rd
    return [0x2000 | ((d & 0x10) << 5) | (d << 4) | (d & 0x0f)];
  }
  if (m === 'push') {
    const d = parseReg(ops[0]);
    return [0x920f | (d << 4)];
  }
  if (m === 'pop') {
    const d = parseReg(ops[0]);
    return [0x900f | (d << 4)];
  }

  // SBRC Rr, b & SBRS Rr, b
  if (m === 'sbrc' || m === 'sbrs') {
    const r = parseReg(ops[0]);
    const b = parseExpr(ops[1], symbols, labels, pc) & 0x07;
    const base = m === 'sbrc' ? 0xfc00 : 0xfe00;
    return [base | (r << 4) | b];
  }

  // LDS Rd, k & STS k, Rr (32-bit instructions)
  if (m === 'lds') {
    const d = parseReg(ops[0]);
    const k = parseExpr(ops[1], symbols, labels, pc) & 0xffff;
    return [0x9000 | (d << 4), k];
  }
  if (m === 'sts') {
    const k = parseExpr(ops[0], symbols, labels, pc) & 0xffff;
    const r = parseReg(ops[1]);
    return [0x9200 | (r << 4), k];
  }

  throw new Error(`Unsupported instruction or syntax: "${m}"`);
}
