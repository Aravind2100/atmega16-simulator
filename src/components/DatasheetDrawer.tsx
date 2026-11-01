import React from 'react';
import { BookOpen, HelpCircle, X } from 'lucide-react';

interface DatasheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatasheetDrawer: React.FC<DatasheetDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-[420px] bg-slate-900 border-l border-slate-700 shadow-2xl z-40 flex flex-col font-mono text-xs text-slate-300">
      {/* Header */}
      <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <BookOpen size={16} />
          <span>ATmega16 Reference & Guide</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Architecture Overview */}
        <div className="bg-slate-950 p-3 rounded border border-slate-800">
          <div className="font-bold text-slate-100 text-sm mb-1">ATmega16 Specs</div>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            <li><strong className="text-slate-200">Flash Memory:</strong> 16 KB (8,192 16-bit words)</li>
            <li><strong className="text-slate-200">SRAM:</strong> 1 KB (1,024 bytes) internal data</li>
            <li><strong className="text-slate-200">EEPROM:</strong> 512 bytes non-volatile</li>
            <li><strong className="text-slate-200">Operating Voltage:</strong> 4.5V - 5.5V (Standard 5V)</li>
            <li><strong className="text-slate-200">I/O Pins:</strong> 32 programmable I/O lines (Ports A, B, C, D)</li>
            <li><strong className="text-slate-200">Timers:</strong> Timer0 (8-bit), Timer1 (16-bit), Timer2 (8-bit)</li>
            <li><strong className="text-slate-200">ADC:</strong> 8-channel 10-bit Successive Approximation</li>
          </ul>
        </div>

        {/* Pin Address & Bitmask Mapping */}
        <div className="bg-slate-950 p-3 rounded border border-slate-800">
          <div className="font-bold text-cyan-400 text-sm mb-1.5 flex items-center justify-between">
            <span>Pin Address &amp; Bitmask Mapping</span>
            <span className="text-[10px] text-slate-500 font-mono">1 &lt;&lt; bit</span>
          </div>
          <p className="text-slate-400 text-[11px] mb-2">
            Each port pin corresponds to an exact bit position and hexadecimal mask in registers:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-1 px-1.5">Pin</th>
                  <th className="py-1 px-1.5">Bit</th>
                  <th className="py-1 px-1.5 text-cyan-300">Hex Mask</th>
                  <th className="py-1 px-1.5 text-emerald-300">Binary Mask</th>
                  <th className="py-1 px-1.5">Usage in Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                <tr>
                  <td className="py-1 px-1.5 font-bold text-white">PA0 / PB0</td>
                  <td className="py-1 px-1.5">0</td>
                  <td className="py-1 px-1.5 font-bold text-cyan-400">0x01</td>
                  <td className="py-1 px-1.5 text-emerald-400">0b00000001</td>
                  <td className="py-1 px-1.5 text-amber-300">PORTA |= 0x01;</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 font-bold text-white">PA1 / PB1</td>
                  <td className="py-1 px-1.5">1</td>
                  <td className="py-1 px-1.5 font-bold text-cyan-400">0x02</td>
                  <td className="py-1 px-1.5 text-emerald-400">0b00000010</td>
                  <td className="py-1 px-1.5 text-amber-300">PORTA |= 0x02;</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 font-bold text-white">PA2 / PB2</td>
                  <td className="py-1 px-1.5">2</td>
                  <td className="py-1 px-1.5 font-bold text-cyan-400">0x04</td>
                  <td className="py-1 px-1.5 text-emerald-400">0b00000100</td>
                  <td className="py-1 px-1.5 text-amber-300">PORTA |= 0x04;</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 font-bold text-white">PA3 / PB3</td>
                  <td className="py-1 px-1.5">3</td>
                  <td className="py-1 px-1.5 font-bold text-cyan-400">0x08</td>
                  <td className="py-1 px-1.5 text-emerald-400">0b00001000</td>
                  <td className="py-1 px-1.5 text-amber-300">PORTA |= 0x08;</td>
                </tr>
                <tr className="bg-cyan-950/20">
                  <td className="py-1 px-1.5 font-bold text-white">PA4 / PB4</td>
                  <td className="py-1 px-1.5">4</td>
                  <td className="py-1 px-1.5 font-bold text-cyan-400">0x10</td>
                  <td className="py-1 px-1.5 text-emerald-400">0b00010000</td>
                  <td className="py-1 px-1.5 text-amber-300">PORTA |= 0x10;</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 font-bold text-white">PA5 / PB5</td>
                  <td className="py-1 px-1.5">5</td>
                  <td className="py-1 px-1.5 font-bold text-cyan-400">0x20</td>
                  <td className="py-1 px-1.5 text-emerald-400">0b00100000</td>
                  <td className="py-1 px-1.5 text-amber-300">PORTA |= 0x20;</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 font-bold text-white">PA6 / PB6</td>
                  <td className="py-1 px-1.5">6</td>
                  <td className="py-1 px-1.5 font-bold text-cyan-400">0x40</td>
                  <td className="py-1 px-1.5 text-emerald-400">0b01000000</td>
                  <td className="py-1 px-1.5 text-amber-300">PORTA |= 0x40;</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 font-bold text-white">PA7 / PB7</td>
                  <td className="py-1 px-1.5">7</td>
                  <td className="py-1 px-1.5 font-bold text-cyan-400">0x80</td>
                  <td className="py-1 px-1.5 text-emerald-400">0b10000000</td>
                  <td className="py-1 px-1.5 text-amber-300">PORTA |= 0x80;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 space-y-1">
            <div>• <strong className="text-white">PINA0 =&gt; 0x01:</strong> Bit 0 of Port A (Pin 40)</div>
            <div>• <strong className="text-white">PINA4 =&gt; 0x10:</strong> Bit 4 of Port A (Pin 36)</div>
            <div>• Testing input: <code className="text-amber-300">if (PINA &amp; 0x10) &#123; /* High */ &#125;</code></div>
          </div>
        </div>

        {/* The 3 Holy Registers of AVR GPIO */}
        <div className="bg-slate-950 p-3 rounded border border-slate-800">
          <div className="font-bold text-amber-400 text-sm mb-1.5 flex items-center gap-1.5">
            <HelpCircle size={14} /> The 3 Key Port Registers
          </div>
          <div className="space-y-2 text-[11px]">
            <div>
              <span className="text-emerald-400 font-bold">1. DDRx (Data Direction Register):</span>
              <p className="text-slate-400 mt-0.5">
                Configures each pin as Input (0) or Output (1).
                <br />
                <code className="text-amber-300">DDRA |= (1 &lt;&lt; PA0);</code> // PA0 is Output
              </p>
            </div>
            <div>
              <span className="text-blue-400 font-bold">2. PORTx (Data Register):</span>
              <p className="text-slate-400 mt-0.5">
                • If Output (DDR=1): writing 1 drives +5V HIGH, writing 0 drives 0V LOW.
                <br />
                • If Input (DDR=0): writing 1 activates the internal ~30kΩ pull-up resistor to +5V!
              </p>
            </div>
            <div>
              <span className="text-purple-400 font-bold">3. PINx (Input Pins Address):</span>
              <p className="text-slate-400 mt-0.5">
                Always read digital state from PINx!
                <br />
                <code className="text-amber-300">if (PINB &amp; (1 &lt;&lt; PB0))</code>
              </p>
            </div>
          </div>
        </div>

        {/* Internal Pull-Up Resistor & Floating Pin Prevention */}
        <div className="bg-slate-950 p-3 rounded border border-amber-900/60 shadow-sm">
          <div className="font-bold text-amber-400 text-sm mb-1.5 flex items-center justify-between">
            <span>Internal Pull-Up Resistors &amp; Floating Pins</span>
            <span className="text-[10px] text-amber-300 font-mono bg-amber-950 px-1 rounded border border-amber-800">~30kΩ - 50kΩ</span>
          </div>
          
          <div className="space-y-2 text-[11px] text-slate-300">
            <p>
              When a microcontroller CMOS input pin is left disconnected (or connected to an open switch with no resistor), it <strong className="text-sky-300">floats (Hi-Z)</strong>. Electrostatic noise causes it to randomly flip between 0 and 1, drawing excessive switching current.
            </p>

            <div className="bg-slate-900 p-2 rounded border border-slate-800 text-[10px]">
              <div className="font-bold text-slate-200 mb-1">How to Enable Internal Pull-Ups in C:</div>
              <pre className="text-amber-300 font-mono leading-relaxed">
{`// 1. Configure Port A as INPUT (DDR = 0)
DDRA = 0x00;

// 2. Enable internal pull-ups on PA4..PA7 (high nibble)
// High nibble gets ~30kΩ to +5V; low nibble PA0..PA3 floats!
PORTA = 0xF0; // (0b11110000)`}
              </pre>
            </div>

            <div className="text-[10px] text-slate-400 space-y-1">
              <div>• <strong className="text-slate-200">Switch Wiring:</strong> Connect one terminal of your switch to the pin (<code className="text-cyan-300">PA4</code>) and the other to <strong className="text-white">GND</strong>.</div>
              <div>• <strong className="text-slate-200">Switch OPEN:</strong> Pin is held stably at <strong className="text-emerald-400">+5V (HIGH)</strong> by internal pull-up.</div>
              <div>• <strong className="text-slate-200">Switch CLOSED:</strong> Pin is pulled solidly to <strong className="text-slate-200">0V (LOW)</strong>.</div>
              <div>• <strong className="text-slate-200">SFIOR.PUD:</strong> Bit 2 of <code className="text-slate-300">SFIOR</code> is Pull-Up Disable. If set to 1, all pull-ups on all ports are overridden and disabled.</div>
            </div>
          </div>
        </div>

        {/* 4x4 Matrix Keypad & 16x2 LCD in 4-bit Mode */}
        <div className="bg-slate-950 p-3 rounded border border-cyan-900/60 shadow-sm">
          <div className="font-bold text-cyan-400 text-sm mb-1.5 flex items-center justify-between">
            <span>4x4 Matrix Keypad &amp; 16x2 LCD (4-bit)</span>
            <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-1 rounded border border-cyan-800">HD44780</span>
          </div>
          <div className="space-y-2 text-[11px] text-slate-300">
            <div>
              <span className="text-white font-bold">1. 4x4 Matrix Keypad Scanning:</span>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Rows <code className="text-amber-300">R1-R4 (PA0-PA3)</code> are configured as OUTPUT.
                Columns <code className="text-cyan-300">C1-C4 (PA4-PA7)</code> are INPUT with internal pull-ups (<code className="text-amber-300">PORTA = 0xFF</code>).
                To scan: drive each row LOW one at a time and read the 4 column bits on <code className="text-slate-200">PINA</code>!
              </p>
            </div>
            <div>
              <span className="text-white font-bold">2. HD44780 16x2 LCD 4-bit Mode:</span>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Uses only 6 wires (<code className="text-rose-300">RS</code>, <code className="text-yellow-300">E</code>, and data bus <code className="text-emerald-300">D4-D7</code>).
                Each 8-bit command or ASCII char is sent in two consecutive 4-bit nibbles (high nibble first, then low nibble), pulsing E HIGH-to-LOW for each nibble!
              </p>
            </div>
          </div>
        </div>

        {/* Pinout Map */}
        <div className="bg-slate-950 p-3 rounded border border-slate-800">
          <div className="font-bold text-slate-100 text-sm mb-2">Key Pin Functions</div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="font-bold text-cyan-400">PORT A (Pins 40-33)</span>
              <p className="text-slate-400 mt-1">PA0 - PA7: 8 ADC Analog inputs (ADC0 to ADC7).</p>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="font-bold text-blue-400">PORT B (Pins 1-8)</span>
              <p className="text-slate-400 mt-1">PB0-PB3: Timers/OC0. PB4-PB7: SPI Bus (SS, MOSI, MISO, SCK).</p>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="font-bold text-emerald-400">PORT C (Pins 22-29)</span>
              <p className="text-slate-400 mt-1">PC0-PC1: I2C (SCL, SDA). PC2-PC5: JTAG debugging.</p>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="font-bold text-rose-400">PORT D (Pins 14-21)</span>
              <p className="text-slate-400 mt-1">PD0-PD1: USART RX/TX. PD2-PD3: INT0/INT1 external interrupts.</p>
            </div>
          </div>
        </div>

        {/* Assembly Quick Reference */}
        <div className="bg-slate-950 p-3 rounded border border-slate-800">
          <div className="font-bold text-slate-100 text-sm mb-2">AVR Assembly Cheat Sheet</div>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div><strong className="text-slate-200">LDI Rd, K:</strong> Load 8-bit constant into R16..R31</div>
            <div><strong className="text-slate-200">OUT A, Rr:</strong> Write register to I/O port (e.g. PORTA)</div>
            <div><strong className="text-slate-200">IN Rd, A:</strong> Read I/O port into register</div>
            <div><strong className="text-slate-200">SBI / CBI A, b:</strong> Set / Clear single bit in I/O port</div>
            <div><strong className="text-slate-200">RJMP / RCALL:</strong> Relative jump or function call</div>
            <div><strong className="text-slate-200">DEC & BRNE:</strong> Decrement and branch if not zero</div>
          </div>
        </div>
      </div>
    </div>
  );
};
