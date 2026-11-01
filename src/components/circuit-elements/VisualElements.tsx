import React from 'react';
import { CircuitComponent } from '../../types.ts';
import { Lcd1602State, DcMotorState, StepperMotorState } from '../../simulator/circuitEngine.ts';

// 1. Single LED Component
export const VisualLED: React.FC<{
  comp: CircuitComponent;
  isLit: boolean;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, isLit, onTerminalClick }) => {
  const color = comp.props?.color || 'red';
  const colorMap: Record<string, { off: string; on: string; glow: string }> = {
    red: { off: '#450a0a', on: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' },
    green: { off: '#052e16', on: '#22c55e', glow: 'rgba(34, 197, 94, 0.7)' },
    blue: { off: '#082f49', on: '#3b82f6', glow: 'rgba(59, 130, 246, 0.7)' },
    yellow: { off: '#422006', on: '#eab308', glow: 'rgba(234, 179, 8, 0.7)' },
  };
  const theme = colorMap[color] || colorMap.red;

  return (
    <div className="relative flex flex-col items-center p-2 bg-slate-900/90 border border-slate-800 rounded-lg shadow-xl w-14 select-none">
      <div className="text-[10px] font-mono text-slate-400 mb-1">{comp.label}</div>
      {/* LED Dome */}
      <div
        className="w-8 h-8 rounded-full border-2 border-slate-700 transition-all duration-150 flex items-center justify-center"
        style={{
          backgroundColor: isLit ? theme.on : theme.off,
          boxShadow: isLit ? `0 0 16px 4px ${theme.glow}` : 'none',
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-white/40 blur-[1px]"></div>
      </div>
      {/* Terminals */}
      <div className="flex justify-between w-full mt-3 px-1 text-[9px] font-mono">
        <button
          data-term={`${comp.id}:anode`}
          onClick={(e) => onTerminalClick && onTerminalClick('anode', e)}
          className="w-4 h-4 rounded-full bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-center hover:scale-125 transition-transform"
          title="Anode (+)"
        >
          +
        </button>
        <button
          data-term={`${comp.id}:cathode`}
          onClick={(e) => onTerminalClick && onTerminalClick('cathode', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125 transition-transform"
          title="Cathode (-)"
        >
          -
        </button>
      </div>
    </div>
  );
};

// 2. 8-Bit LED Display Component
export const VisualLedBar: React.FC<{
  comp: CircuitComponent;
  bars?: boolean[];
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, bars = [false, false, false, false, false, false, false, false], onTerminalClick }) => {
  let byteVal = 0;
  for (let i = 0; i < 8; i++) {
    if (bars[i]) byteVal |= 1 << i;
  }
  const hexVal = '0x' + byteVal.toString(16).padStart(2, '0').toUpperCase();
  const decVal = byteVal.toString();
  const binVal = byteVal.toString(2).padStart(8, '0');

  return (
    <div className="relative flex flex-col p-2.5 bg-slate-900/95 border-2 border-slate-700 rounded-xl shadow-2xl select-none w-[225px]">
      {/* Header & Numerical Readouts */}
      <div className="flex justify-between items-center w-full mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-cyan-300 font-bold">8-BIT LED</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
            {hexVal}
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            {decVal}
          </span>
        </div>
        <button
          data-term={`${comp.id}:com`}
          onClick={(e) => onTerminalClick && onTerminalClick('com', e)}
          className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          title="Common Cathode (GND)"
        >
          GND
        </button>
      </div>

      {/* Binary indicator bits (MSB 7 to LSB 0) */}
      <div className="flex justify-between items-center gap-1 p-1.5 bg-slate-950 rounded-lg border border-slate-800">
        {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
          const lit = bars[bitIdx];
          return (
            <div key={bitIdx} className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] font-mono text-slate-500">{bitIdx}</span>
              <div
                className="w-4 h-7 rounded border border-slate-800 transition-all duration-100 flex items-center justify-center"
                style={{
                  backgroundColor: lit ? '#06b6d4' : '#0f172a',
                  boxShadow: lit ? '0 0 10px 2px rgba(6, 182, 212, 0.8)' : 'none',
                }}
              >
                {lit && <div className="w-1.5 h-3 bg-white/60 rounded-full blur-[0.5px]"></div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 8 Terminals D0-D7 at bottom */}
      <div className="mt-2 pt-1.5 border-t border-slate-800 flex justify-between items-center px-0.5">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <button
            key={i}
            data-term={`${comp.id}:d${i}`}
            data-term-alt={`${comp.id}:a${i}`}
            onClick={(e) => onTerminalClick && onTerminalClick(`d${i}`, e)}
            className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-600 text-[8px] font-mono text-cyan-300 flex items-center justify-center hover:scale-125 transition-transform"
            title={`Data Bit ${i} (D${i})`}
          >
            D{i}
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. Tactile Push Button
export const VisualPushButton: React.FC<{
  comp: CircuitComponent;
  onPressChange: (pressed: boolean) => void;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, onPressChange, onTerminalClick }) => {
  const isPressed = !!comp.props?.pressed;

  return (
    <div className="relative flex flex-col items-center p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-24 select-none">
      <div className="text-[10px] font-mono text-slate-300 mb-1">{comp.label}</div>
      {/* Round tactile button with click interaction */}
      <button
        onMouseDown={() => onPressChange(true)}
        onMouseUp={() => onPressChange(false)}
        onMouseLeave={() => onPressChange(false)}
        onTouchStart={() => onPressChange(true)}
        onTouchEnd={() => onPressChange(false)}
        className={`w-10 h-10 rounded-full border-2 transition-all duration-75 flex items-center justify-center shadow-lg active:scale-95 ${
          isPressed
            ? 'bg-rose-600 border-rose-400 translate-y-0.5 shadow-inner'
            : 'bg-rose-500 border-rose-300 hover:bg-rose-400'
        }`}
      >
        <div className="w-5 h-5 rounded-full bg-rose-700/60 shadow-inner"></div>
      </button>
      {/* Pin 1 & Pin 2 */}
      <div className="flex justify-between w-full mt-2.5 px-1 font-mono text-[9px]">
        <button
          data-term={`${comp.id}:pin1`}
          onClick={(e) => onTerminalClick && onTerminalClick('pin1', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125"
          title="Terminal 1"
        >
          1
        </button>
        <button
          data-term={`${comp.id}:pin2`}
          onClick={(e) => onTerminalClick && onTerminalClick('pin2', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125"
          title="Terminal 2"
        >
          2
        </button>
      </div>
    </div>
  );
};

// 3b. Latching Press Switch / Toggle Switch (Click to Lock ON / Lock OFF)
export const VisualPressSwitch: React.FC<{
  comp: CircuitComponent;
  onToggle: (closed: boolean) => void;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, onToggle, onTerminalClick }) => {
  const isClosed = !!comp.props?.closed || !!comp.props?.pressed;

  return (
    <div className="relative flex flex-col items-center p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-28 select-none">
      {/* Header: Label and ON/OFF indicator */}
      <div className="flex justify-between items-center w-full mb-1">
        <span className="text-[10px] font-mono text-slate-300 font-bold truncate max-w-[55px]">
          {comp.label || 'SWITCH'}
        </span>
        <span
          className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border transition-colors ${
            isClosed
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              : 'bg-slate-950 border-slate-700 text-slate-500'
          }`}
        >
          {isClosed ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Realistic Latching Press Switch Cap */}
      <button
        type="button"
        onClick={() => onToggle(!isClosed)}
        className={`w-14 h-12 rounded-lg border-2 transition-all duration-100 flex flex-col items-center justify-center my-1 cursor-pointer select-none ${
          isClosed
            ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 border-emerald-400 translate-y-1 shadow-inner shadow-black/80'
            : 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-500 hover:border-slate-400 shadow-md hover:brightness-110'
        }`}
        title={isClosed ? 'Switch is CLOSED (ON). Click to release/open.' : 'Switch is OPEN (OFF). Click to press/close.'}
      >
        {/* Neon Indicator Dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full border mb-1 transition-all ${
            isClosed
              ? 'bg-white border-emerald-200 shadow-[0_0_8px_#34d399]'
              : 'bg-slate-900 border-slate-600'
          }`}
        />
        <span className={`text-[10px] font-mono font-bold tracking-wider ${isClosed ? 'text-white' : 'text-slate-300'}`}>
          {isClosed ? 'CLOSED' : 'PRESS'}
        </span>
      </button>

      {/* Pin 1 & Pin 2 Terminals */}
      <div className="flex justify-between w-full mt-2 px-1 font-mono text-[9px]">
        <button
          data-term={`${comp.id}:pin1`}
          onClick={(e) => onTerminalClick && onTerminalClick('pin1', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125 transition-transform"
          title="Terminal 1"
        >
          1
        </button>
        <span className="text-[8px] text-slate-500 font-mono self-center">SPST</span>
        <button
          data-term={`${comp.id}:pin2`}
          onClick={(e) => onTerminalClick && onTerminalClick('pin2', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125 transition-transform"
          title="Terminal 2"
        >
          2
        </button>
      </div>
    </div>
  );
};

export const VisualToggleSwitch = VisualPressSwitch;

// 4. Common-Cathode 7-Segment Display
export const VisualSevenSegment: React.FC<{
  comp: CircuitComponent;
  segments?: Record<string, boolean>;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, segments = {}, onTerminalClick }) => {
  const litColor = '#ef4444';
  const offColor = '#3f1111';

  return (
    <div className="relative flex flex-col items-center p-2.5 bg-slate-950 border-2 border-slate-800 rounded-lg shadow-2xl w-28 select-none">
      <div className="flex justify-between items-center w-full mb-1">
        <span className="text-[10px] font-mono text-slate-400 font-bold">{comp.label}</span>
        <button
          data-term={`${comp.id}:com`}
          onClick={(e) => onTerminalClick && onTerminalClick('com', e)}
          className="px-1 text-[8px] font-mono bg-slate-800 border border-slate-600 rounded text-slate-300 hover:bg-slate-700"
          title="Common Cathode (GND)"
        >
          COM
        </button>
      </div>

      {/* SVG 7-segment display graphic */}
      <svg viewBox="0 0 80 120" className="w-16 h-24 my-1">
        {/* Segment a (top) */}
        <polygon
          points="18,12 62,12 54,20 26,20"
          fill={segments.a ? litColor : offColor}
          filter={segments.a ? 'drop-shadow(0px 0px 4px rgba(239,68,68,0.9))' : 'none'}
        />
        {/* Segment b (top right) */}
        <polygon
          points="63,14 71,22 67,54 59,48"
          fill={segments.b ? litColor : offColor}
          filter={segments.b ? 'drop-shadow(0px 0px 4px rgba(239,68,68,0.9))' : 'none'}
        />
        {/* Segment c (bottom right) */}
        <polygon
          points="67,58 71,66 63,98 57,92"
          fill={segments.c ? litColor : offColor}
          filter={segments.c ? 'drop-shadow(0px 0px 4px rgba(239,68,68,0.9))' : 'none'}
        />
        {/* Segment d (bottom) */}
        <polygon
          points="26,92 54,92 62,100 18,100"
          fill={segments.d ? litColor : offColor}
          filter={segments.d ? 'drop-shadow(0px 0px 4px rgba(239,68,68,0.9))' : 'none'}
        />
        {/* Segment e (bottom left) */}
        <polygon
          points="15,58 23,64 19,92 11,98"
          fill={segments.e ? litColor : offColor}
          filter={segments.e ? 'drop-shadow(0px 0px 4px rgba(239,68,68,0.9))' : 'none'}
        />
        {/* Segment f (top left) */}
        <polygon
          points="19,22 23,26 19,54 11,48"
          fill={segments.f ? litColor : offColor}
          filter={segments.f ? 'drop-shadow(0px 0px 4px rgba(239,68,68,0.9))' : 'none'}
        />
        {/* Segment g (center) */}
        <polygon
          points="22,54 58,54 52,60 28,60"
          fill={segments.g ? litColor : offColor}
          filter={segments.g ? 'drop-shadow(0px 0px 4px rgba(239,68,68,0.9))' : 'none'}
        />
        {/* Decimal point (dp) */}
        <circle
          cx="72"
          cy="98"
          r="4"
          fill={segments.dp ? litColor : offColor}
          filter={segments.dp ? 'drop-shadow(0px 0px 4px rgba(239,68,68,0.9))' : 'none'}
        />
      </svg>

      {/* Segment Terminals a through dp */}
      <div className="grid grid-cols-4 gap-1 w-full mt-1">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].map((seg) => (
          <button
            key={seg}
            data-term={`${comp.id}:${seg}`}
            onClick={(e) => onTerminalClick && onTerminalClick(seg, e)}
            className="w-4 h-4 rounded-full bg-slate-900 border border-slate-600 text-[8px] font-mono text-slate-300 flex items-center justify-center hover:scale-125"
            title={`Segment ${seg}`}
          >
            {seg}
          </button>
        ))}
      </div>
    </div>
  );
};

// 5. HD44780 16x2 Character LCD Display (8-Bit & 4-Bit Modes)
export const VisualLcd1602: React.FC<{
  comp: CircuitComponent;
  state?: Lcd1602State;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({
  comp,
  state = {
    lines: ['                ', '                '],
    cursorRow: 0,
    cursorCol: 0,
    displayOn: true,
    nibbleBuffer: null,
    lastE: false,
    backlight: true,
    is8BitMode: false,
  },
  onTerminalClick,
}) => {
  const is8Bit = !!state.is8BitMode;

  return (
    <div className="relative flex flex-col p-3 bg-emerald-950 border-2 border-emerald-800 rounded-lg shadow-2xl w-[320px] select-none">
      <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-emerald-300 font-bold">
        <span>HD44780 16x2 LCD</span>
        <span
          className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${
            is8Bit
              ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]'
              : 'bg-emerald-900 text-emerald-300 border-emerald-600'
          }`}
        >
          {is8Bit ? '8-Bit Bus' : '4-Bit Bus'}
        </span>
      </div>

      {/* Dot-Matrix Liquid Crystal Screen */}
      <div className="bg-[#8ec07c] border-2 border-emerald-900 rounded p-2 shadow-inner font-mono text-xs font-bold text-slate-900 tracking-wider">
        <div className="whitespace-pre h-4 leading-4">{state.lines[0]}</div>
        <div className="whitespace-pre h-4 leading-4">{state.lines[1]}</div>
      </div>

      {/* Control & Data Terminals */}
      <div className="mt-2.5 pt-1.5 border-t border-emerald-900/80">
        <div className="flex justify-between items-center text-[7px] font-mono text-emerald-400/80 mb-1 px-0.5">
          <span>CTRL (RS, RW, E)</span>
          <span>8-BIT DATA BUS (D0 - D7)</span>
        </div>

        <div className="flex justify-between items-center gap-1 px-0.5">
          {/* Control terminals: RS, RW, E */}
          {['rs', 'rw', 'e'].map((term) => (
            <button
              key={term}
              data-term={`${comp.id}:${term}`}
              onClick={(e) => onTerminalClick && onTerminalClick(term, e)}
              className="w-4 h-4 rounded-full bg-amber-950 border border-amber-500 text-[7px] font-mono text-amber-300 flex items-center justify-center hover:scale-125 transition-transform"
              title={`Pin ${term.toUpperCase()}`}
            >
              {term.toUpperCase()}
            </button>
          ))}

          <div className="w-px h-3.5 bg-emerald-800 self-center mx-0.5"></div>

          {/* Lower 4 bits: D0..D3 */}
          {['d0', 'd1', 'd2', 'd3'].map((term) => (
            <button
              key={term}
              data-term={`${comp.id}:${term}`}
              onClick={(e) => onTerminalClick && onTerminalClick(term, e)}
              className={`w-4 h-4 rounded-full border text-[7px] font-mono flex items-center justify-center hover:scale-125 transition-transform ${
                is8Bit
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-emerald-950 border-emerald-700/60 text-emerald-500'
              }`}
              title={`Pin ${term.toUpperCase()} (Lower Nibble)`}
            >
              {term.toUpperCase()}
            </button>
          ))}

          <div className="w-px h-3.5 bg-emerald-800 self-center mx-0.5"></div>

          {/* Upper 4 bits: D4..D7 */}
          {['d4', 'd5', 'd6', 'd7'].map((term) => (
            <button
              key={term}
              data-term={`${comp.id}:${term}`}
              onClick={(e) => onTerminalClick && onTerminalClick(term, e)}
              className="w-4 h-4 rounded-full bg-emerald-900 border border-emerald-400 text-[7px] font-mono text-emerald-200 flex items-center justify-center hover:scale-125 transition-transform"
              title={`Pin ${term.toUpperCase()} (Upper Nibble)`}
            >
              {term.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Rotary Potentiometer (0 to 5V Analog)
export const VisualPotentiometer: React.FC<{
  comp: CircuitComponent;
  onValueChange: (val: number) => void;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, onValueChange, onTerminalClick }) => {
  const val = typeof comp.props?.value === 'number' ? comp.props.value : 0.5;
  const voltage = (val * 5.0).toFixed(2);
  const rotDeg = val * 270 - 135;

  return (
    <div className="relative flex flex-col items-center p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-32 select-none">
      <div className="flex justify-between w-full text-[10px] font-mono text-slate-300 mb-1">
        <span>{comp.label}</span>
        <span className="text-cyan-400 font-bold">{voltage}V</span>
      </div>

      {/* Rotating Dial Knob */}
      <div className="relative w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 shadow-md flex items-center justify-center my-1">
        <div
          className="w-1.5 h-4 bg-cyan-400 rounded-full transition-transform"
          style={{ transform: `rotate(${rotDeg}deg) translateY(-8px)` }}
        />
        <div className="w-4 h-4 rounded-full bg-slate-700"></div>
      </div>

      {/* Range Slider for smooth voltage control */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={val}
        onChange={(e) => onValueChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 my-1"
      />

      {/* Terminals: VCC, Wiper, GND */}
      <div className="flex justify-between w-full mt-1 text-[8px] font-mono">
        <button
          data-term={`${comp.id}:vcc`}
          onClick={(e) => onTerminalClick && onTerminalClick('vcc', e)}
          className="w-4 h-4 rounded-full bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-center hover:scale-125"
          title="VCC (+5V)"
        >
          +
        </button>
        <button
          data-term={`${comp.id}:wiper`}
          onClick={(e) => onTerminalClick && onTerminalClick('wiper', e)}
          className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-200 flex items-center justify-center hover:scale-125"
          title="Wiper Output"
        >
          W
        </button>
        <button
          data-term={`${comp.id}:gnd`}
          onClick={(e) => onTerminalClick && onTerminalClick('gnd', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125"
          title="GND (0V)"
        >
          -
        </button>
      </div>
    </div>
  );
};

// 7. Piezo Buzzer Component
export const VisualBuzzer: React.FC<{
  comp: CircuitComponent;
  isActive: boolean;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, isActive, onTerminalClick }) => {
  return (
    <div className="relative flex flex-col items-center p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-24 select-none">
      <div className="text-[10px] font-mono text-slate-300 mb-1">{comp.label}</div>
      {/* Buzzer sound disc with wave animation */}
      <div
        className={`w-10 h-10 rounded-full border-2 transition-all duration-150 flex items-center justify-center shadow-md ${
          isActive
            ? 'bg-amber-500/30 border-amber-400 animate-pulse ring-4 ring-amber-400/30'
            : 'bg-slate-800 border-slate-600'
        }`}
      >
        <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-700"></div>
      </div>
      {/* Terminals (+) and (-) */}
      <div className="flex justify-between w-full mt-2.5 px-1 font-mono text-[9px]">
        <button
          data-term={`${comp.id}:pos`}
          onClick={(e) => onTerminalClick && onTerminalClick('pos', e)}
          className="w-4 h-4 rounded-full bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-center hover:scale-125"
          title="Positive (+)"
        >
          +
        </button>
        <button
          data-term={`${comp.id}:neg`}
          onClick={(e) => onTerminalClick && onTerminalClick('neg', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125"
          title="Negative (-)"
        >
          -
        </button>
      </div>
    </div>
  );
};

// 8. Power Supply Terminals (+5V and GND)
export const VisualPowerRail: React.FC<{
  comp: CircuitComponent;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, onTerminalClick }) => {
  const isVcc = comp.type === 'vcc';

  return (
    <div
      data-term={`${comp.id}:out`}
      onClick={(e) => onTerminalClick && onTerminalClick('out', e)}
      className={`px-2.5 py-1 rounded-full border cursor-pointer hover:scale-110 transition-transform flex items-center gap-1.5 shadow-md select-none font-mono text-xs font-bold ${
        isVcc
          ? 'bg-rose-950/80 border-rose-500 text-rose-300'
          : 'bg-slate-800/90 border-slate-500 text-slate-300'
      }`}
      title={isVcc ? '+5V DC Power Source' : 'Ground (0V Reference)'}
    >
      <div className={`w-2 h-2 rounded-full ${isVcc ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
      <span>{isVcc ? '+5V' : 'GND'}</span>
    </div>
  );
};

// 9. LM35 Precision Centigrade Temperature Sensor (TO-92 Package)
export const VisualLM35: React.FC<{
  comp: CircuitComponent;
  onTempChange: (temp: number) => void;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, onTempChange, onTerminalClick }) => {
  const temp = typeof comp.props?.temp === 'number' ? comp.props.temp : 25.0;
  // 10 mV / °C -> e.g. 25.0 °C = 0.250 V
  const vOut = (temp * 0.01).toFixed(3);

  // Dynamic heat badge color based on temperature
  const tempColor =
    temp < 15
      ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
      : temp < 35
      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
      : temp < 60
      ? 'text-amber-400 bg-amber-950/60 border-amber-800'
      : 'text-rose-400 bg-rose-950/60 border-rose-800';

  return (
    <div className="relative flex flex-col items-center p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-36 select-none">
      <div className="flex justify-between items-center w-full mb-1">
        <span className="text-[10px] font-mono text-slate-300 font-bold">LM35DZ</span>
        <span className={`px-1.5 py-0.2 rounded border text-[9px] font-mono font-bold ${tempColor}`}>
          {temp.toFixed(1)}°C
        </span>
      </div>

      {/* TO-92 Transistor Package Graphic */}
      <div className="relative w-14 h-12 bg-slate-800 border-2 border-slate-600 rounded-t-full shadow-inner flex flex-col items-center justify-center my-1">
        <span className="text-[8px] font-mono font-bold text-slate-400">LM35</span>
        <span className="text-[7px] font-mono text-emerald-400">{vOut}V</span>
      </div>

      {/* Temperature Slider (-10°C to 110°C) */}
      <div className="w-full my-1">
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={temp}
          onChange={(e) => onTempChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-[7px] font-mono text-slate-500">
          <span>0°C</span>
          <span>50°C</span>
          <span>100°C</span>
        </div>
      </div>

      {/* Terminals: 1=VCC, 2=VOUT, 3=GND */}
      <div className="flex justify-between w-full mt-1 px-1 text-[8px] font-mono">
        <button
          data-term={`${comp.id}:vcc`}
          onClick={(e) => onTerminalClick && onTerminalClick('vcc', e)}
          className="w-4 h-4 rounded-full bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-center hover:scale-125"
          title="Pin 1: VCC (+5V)"
        >
          +
        </button>
        <button
          data-term={`${comp.id}:vout`}
          onClick={(e) => onTerminalClick && onTerminalClick('vout', e)}
          className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-200 flex items-center justify-center hover:scale-125 font-bold"
          title={`Pin 2: VOUT (${vOut}V to ADC)`}
        >
          V
        </button>
        <button
          data-term={`${comp.id}:gnd`}
          onClick={(e) => onTerminalClick && onTerminalClick('gnd', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125"
          title="Pin 3: GND (0V)"
        >
          -
        </button>
      </div>
    </div>
  );
};

// 10. DC Motor with Spinning Fan Rotor & Speed Gauge
export const VisualDcMotor: React.FC<{
  comp: CircuitComponent;
  state?: DcMotorState;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({
  comp,
  state = { speed: 0, direction: 1, angle: 0, rpm: 0 },
  onTerminalClick,
}) => {
  const isSpinning = state.speed > 0;

  return (
    <div className="relative flex flex-col items-center p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-32 select-none">
      <div className="flex justify-between items-center w-full text-[10px] font-mono text-slate-300 mb-1">
        <span>DC Motor</span>
        <span className={`text-[9px] font-bold ${isSpinning ? 'text-cyan-400' : 'text-slate-500'}`}>
          {state.rpm} RPM
        </span>
      </div>

      {/* Motor Cylinder & Rotating Fan Blades */}
      <div className="relative w-16 h-16 rounded-full bg-slate-950 border-2 border-slate-600 shadow-inner flex items-center justify-center my-1 overflow-hidden">
        {/* Animated Propeller Fan */}
        <div
          className="absolute w-14 h-14 flex items-center justify-center transition-transform"
          style={{ transform: `rotate(${state.angle}deg)` }}
        >
          {/* Fan Blade 1 */}
          <div className="absolute w-2 h-12 bg-cyan-500/80 rounded-full shadow-sm"></div>
          {/* Fan Blade 2 */}
          <div className="absolute w-12 h-2 bg-cyan-500/80 rounded-full shadow-sm"></div>
          {/* Fan Blade 3 (diagonal) */}
          <div className="absolute w-2 h-12 bg-cyan-400/80 rounded-full rotate-45 shadow-sm"></div>
          {/* Fan Blade 4 (diagonal) */}
          <div className="absolute w-12 h-2 bg-cyan-400/80 rounded-full rotate-45 shadow-sm"></div>
          {/* Central Motor Hub */}
          <div className="w-5 h-5 rounded-full bg-slate-300 border border-slate-500 shadow z-10"></div>
        </div>
      </div>

      {/* Speed & Direction Indicator */}
      <div className="text-[9px] font-mono text-slate-400 text-center my-0.5">
        {isSpinning ? (state.direction === 1 ? '▶ Clockwise (CW)' : '◀ Counter-CW') : 'Stopped (0V)'}
      </div>

      {/* Terminals (+) and (-) */}
      <div className="flex justify-between w-full mt-1 px-1 font-mono text-[9px]">
        <button
          data-term={`${comp.id}:pos`}
          onClick={(e) => onTerminalClick && onTerminalClick('pos', e)}
          className="w-4 h-4 rounded-full bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-center hover:scale-125"
          title="Terminal (+)"
        >
          +
        </button>
        <button
          data-term={`${comp.id}:neg`}
          onClick={(e) => onTerminalClick && onTerminalClick('neg', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125"
          title="Terminal (-)"
        >
          -
        </button>
      </div>
    </div>
  );
};

// 11. 4-Phase Stepper Motor (28BYJ-48 / NEMA Style)
export const VisualStepperMotor: React.FC<{
  comp: CircuitComponent;
  state?: StepperMotorState;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({
  comp,
  state = { angle: 0, stepCount: 0, coils: [false, false, false, false], lastStepPattern: 0 },
  onTerminalClick,
}) => {
  return (
    <div className="relative flex flex-col items-center p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-36 select-none">
      <div className="flex justify-between items-center w-full text-[10px] font-mono text-slate-300 mb-1">
        <span className="font-bold">Stepper Motor</span>
        <span className="text-amber-400 font-bold text-[9px]">{state.angle.toFixed(1)}°</span>
      </div>

      {/* Stepper Motor Dial & Pointer */}
      <div className="relative w-16 h-16 rounded-full bg-slate-950 border-2 border-slate-600 shadow-inner flex items-center justify-center my-1">
        {/* Step Angle Degree Markings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-dashed border-slate-700"></div>
        </div>

        {/* Pointer Needle */}
        <div
          className="absolute w-12 h-1 flex items-center justify-end transition-transform duration-75"
          style={{ transform: `rotate(${state.angle}deg)` }}
        >
          <div className="w-6 h-1.5 bg-amber-400 rounded-r-full shadow-md"></div>
        </div>

        {/* Center Pivot */}
        <div className="w-4 h-4 rounded-full bg-slate-400 border border-slate-200 z-10 shadow"></div>
      </div>

      {/* 4 Coil Indicator LEDs (Phases A, B, C, D) */}
      <div className="flex gap-1.5 my-1">
        {state.coils.map((active, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border text-[8px] font-mono font-bold flex items-center justify-center transition-all ${
              active
                ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}
            title={`Coil Phase ${i + 1}: ${active ? 'ENERGIZED' : 'OFF'}`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Step Counter */}
      <div className="text-[8px] font-mono text-slate-500 text-center">
        Steps: {state.stepCount}
      </div>

      {/* Terminals: IN1, IN2, IN3, IN4, GND */}
      <div className="flex justify-between w-full mt-1.5 px-0.5 font-mono text-[8px]">
        {['in1', 'in2', 'in3', 'in4'].map((t, idx) => (
          <button
            key={t}
            data-term={`${comp.id}:${t}`}
            onClick={(e) => onTerminalClick && onTerminalClick(t, e)}
            className="w-4 h-4 rounded-full bg-blue-950 border border-blue-500 text-blue-300 flex items-center justify-center hover:scale-125"
            title={`Coil Input ${idx + 1}`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          data-term={`${comp.id}:com`}
          onClick={(e) => onTerminalClick && onTerminalClick('com', e)}
          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500 text-slate-300 flex items-center justify-center hover:scale-125"
          title="Common GND"
        >
          G
        </button>
      </div>
    </div>
  );
};

// 12. 4x4 Matrix Membrane Keypad Component
export const VisualKeypad4x4: React.FC<{
  comp: CircuitComponent;
  onKeyPress?: (key: string | null) => void;
  onTerminalClick?: (termId: string, e: React.MouseEvent) => void;
}> = ({ comp, onKeyPress, onTerminalClick }) => {
  const currentKey = comp.props?.pressedKey || null;

  const KEYPAD_ROWS = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D'],
  ];

  const handleKeyClick = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onKeyPress) return;
    // Toggle key or press
    if (currentKey === key) {
      onKeyPress(null);
    } else {
      onKeyPress(key);
    }
  };

  const handleMouseDown = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onKeyPress) onKeyPress(key);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Momentary release if desired, but click handler also lets it stay latched
  };

  return (
    <div className="relative flex flex-col p-2.5 bg-slate-900/95 border-2 border-slate-700 rounded-xl shadow-2xl w-[190px] select-none">
      {/* Header & Status Indicator */}
      <div className="flex justify-between items-center mb-2 px-0.5">
        <span className="text-[10px] font-mono text-slate-300 font-bold tracking-tight">4x4 KEYPAD</span>
        <span
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${
            currentKey
              ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold shadow-[0_0_8px_rgba(245,158,11,0.5)]'
              : 'bg-slate-950 text-slate-500 border border-slate-800'
          }`}
        >
          {currentKey ? `Key: '${currentKey}'` : 'IDLE'}
        </span>
      </div>

      {/* 4x4 Matrix Buttons Grid */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
        {KEYPAD_ROWS.map((row, rIdx) =>
          row.map((k) => {
            const isPressed = currentKey === k;
            const isAlpha = ['A', 'B', 'C', 'D'].includes(k);
            const isSpecial = ['*', '#'].includes(k);

            return (
              <button
                key={k}
                onClick={(e) => handleKeyClick(k, e)}
                onMouseDown={(e) => handleMouseDown(k, e)}
                className={`w-9 h-8 rounded flex items-center justify-center font-mono font-bold transition-all text-xs border ${
                  isPressed
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_#f59e0b] scale-95 font-extrabold'
                    : isAlpha
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-700/40 active:scale-95'
                    : isSpecial
                    ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-700/40 active:scale-95'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
                }`}
                title={`Key ${k} (Row ${rIdx + 1})`}
              >
                {k}
              </button>
            );
          })
        )}
      </div>

      {/* Pin Headers: R1-R4 (Rows) & C1-C4 (Cols) */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mb-1 px-1">
          <span className="text-amber-400/90 font-bold">ROWS (R1-R4)</span>
          <span className="text-cyan-400/90 font-bold">COLS (C1-C4)</span>
        </div>
        <div className="flex justify-between gap-1 px-0.5">
          {/* Row terminals */}
          {['r1', 'r2', 'r3', 'r4'].map((t, i) => (
            <button
              key={t}
              data-term={`${comp.id}:${t}`}
              onClick={(e) => onTerminalClick && onTerminalClick(t, e)}
              className="w-4 h-4 rounded-full bg-amber-950 border border-amber-600 text-amber-300 text-[8px] font-mono flex items-center justify-center hover:scale-125 transition-transform"
              title={`Row ${i + 1} Terminal (${t.toUpperCase()})`}
            >
              R{i + 1}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-700 self-center mx-0.5"></div>
          {/* Column terminals */}
          {['c1', 'c2', 'c3', 'c4'].map((t, i) => (
            <button
              key={t}
              data-term={`${comp.id}:${t}`}
              onClick={(e) => onTerminalClick && onTerminalClick(t, e)}
              className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-600 text-cyan-300 text-[8px] font-mono flex items-center justify-center hover:scale-125 transition-transform"
              title={`Column ${i + 1} Terminal (${t.toUpperCase()})`}
            >
              C{i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
