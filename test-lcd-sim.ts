import { Atmega16Simulator } from './src/simulator/atmega16Core';
import { CircuitEngine } from './src/simulator/circuitEngine';
import { parseIntelHex } from './src/simulator/hexParser';
import { EXAMPLE_PROJECTS } from './src/examples/exampleProjects';

console.log('--- TESTING LCD 4-BIT AND 8-BIT IN SIMULATOR ---');

// Test 1: Lesson 7 (16x2 LCD Character Display)
const p7 = EXAMPLE_PROJECTS.find(p => p.id === 'lcd-hello')!;
console.log('Project 7:', p7.title);
const mcu7 = new Atmega16Simulator();
const engine7 = new CircuitEngine(mcu7);
engine7.setComponentsAndWires(p7.components, p7.wires);
const hex7 = parseIntelHex(p7.precompiledHex!);
mcu7.loadProgram(hex7.progMem);

// 8MHz clock: 50ms delay = 400k cycles. Run 100 frames of 10,000 instructions (1,000,000 cycles)
for (let frame = 0; frame < 100; frame++) {
  mcu7.stepCount(10000);
  engine7.updateCircuit();
}

const lcd7 = engine7.lcdStates.get('lcd1');
console.log('Lesson 7 LCD Line 0:', JSON.stringify(lcd7?.lines[0]));
console.log('Lesson 7 LCD Line 1:', JSON.stringify(lcd7?.lines[1]));

if (lcd7?.lines[0].includes('ATmega16 Ready!') && lcd7?.lines[1].includes('Learning AVR C')) {
  console.log('>>> TEST 1 (4-BIT LCD) PASSED! <<<');
} else {
  console.error('>>> TEST 1 FAILED! <<<');
  process.exit(1);
}

// Test 2: Lesson 17 (8-Bit LCD + LED Display)
const p17 = EXAMPLE_PROJECTS.find(p => p.id === 'lcd-8bit-led-demo')!;
console.log('\nProject 17:', p17.title);
const mcu17 = new Atmega16Simulator();
const engine17 = new CircuitEngine(mcu17);
engine17.setComponentsAndWires(p17.components, p17.wires);
const hex17 = parseIntelHex(p17.precompiledHex!);
mcu17.loadProgram(hex17.progMem);

for (let frame = 0; frame < 100; frame++) {
  mcu17.stepCount(10000);
  engine17.updateCircuit();
}

const lcd17 = engine17.lcdStates.get('lcd1');
console.log('Lesson 17 LCD Line 0:', JSON.stringify(lcd17?.lines[0]));
console.log('Lesson 17 LCD Line 1:', JSON.stringify(lcd17?.lines[1]));

if (lcd17?.lines[0].includes('8-Bit Bus Active') && lcd17?.lines[1].includes('Count:')) {
  console.log('>>> TEST 2 (8-BIT LCD) PASSED! <<<');
} else {
  console.error('>>> TEST 2 FAILED! <<<');
  process.exit(1);
}

// Test 3: Lesson 16 (Keypad 4x4 + LCD)
const p16 = EXAMPLE_PROJECTS.find(p => p.id === 'keypad-lcd-demo')!;
console.log('\nProject 16:', p16.title);
const mcu16 = new Atmega16Simulator();
const engine16 = new CircuitEngine(mcu16);
engine16.setComponentsAndWires(p16.components, p16.wires);
const hex16 = parseIntelHex(p16.precompiledHex!);
mcu16.loadProgram(hex16.progMem);

for (let frame = 0; frame < 100; frame++) {
  mcu16.stepCount(10000);
  engine16.updateCircuit();
}

const lcd16 = engine16.lcdStates.get('lcd1');
console.log('Lesson 16 LCD Line 0:', JSON.stringify(lcd16?.lines[0]));
console.log('Lesson 16 LCD Line 1:', JSON.stringify(lcd16?.lines[1]));

if (lcd16?.lines[0].includes('4x4 Keypad') && lcd16?.lines[1].includes('Key:')) {
  console.log('>>> TEST 3 (KEYPAD + LCD) PASSED! <<<');
} else {
  console.error('>>> TEST 3 FAILED! <<<');
  process.exit(1);
}

console.log('\nALL LCD TESTS PASSED PERFECTLY!');
