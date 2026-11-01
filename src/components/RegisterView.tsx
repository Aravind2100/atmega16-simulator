import React from 'react';
import { CpuRegistersState } from '../types.ts';

interface RegisterViewProps {
  cpuState: CpuRegistersState | null;
  prevCpuState?: CpuRegistersState | null;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ cpuState, prevCpuState }) => {
  if (!cpuState) {
    return (
      <div className="p-4 text-slate-500 font-mono text-xs text-center">
        CPU registers will be displayed here once simulation runs.
      </div>
    );
  }

  const sregFlags = [
    { name: 'I', label: 'Interrupt', val: cpuState.sregFlags.I },
    { name: 'T', label: 'Transfer', val: cpuState.sregFlags.T },
    { name: 'H', label: 'Half Carry', val: cpuState.sregFlags.H },
    { name: 'S', label: 'Sign', val: cpuState.sregFlags.S },
    { name: 'V', label: 'Overflow', val: cpuState.sregFlags.V },
    { name: 'N', label: 'Negative', val: cpuState.sregFlags.N },
    { name: 'Z', label: 'Zero', val: cpuState.sregFlags.Z },
    { name: 'C', label: 'Carry', val: cpuState.sregFlags.C },
  ];

  const formatBin8 = (val: number) => val.toString(2).padStart(8, '0');
  const formatHex2 = (val: number) => '0x' + val.toString(16).padStart(2, '0').toUpperCase();

  return (
    <div className="p-3 text-xs font-mono text-slate-300 flex flex-col gap-4 overflow-y-auto max-h-full">
      {/* 1. SREG Status Register Flags */}
      <div className="bg-slate-900 border border-slate-800 rounded p-2.5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-slate-200">SREG (Status Register)</span>
          <span className="text-slate-400 font-semibold">{formatHex2(cpuState.sreg)}</span>
        </div>
        <div className="grid grid-cols-8 gap-1 text-center">
          {sregFlags.map((flag) => (
            <div
              key={flag.name}
              className={`p-1 rounded border transition-colors ${
                flag.val
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
              title={`${flag.name} Flag (${flag.label}): ${flag.val ? 'SET (1)' : 'CLEARED (0)'}`}
            >
              <div className="text-[10px]">{flag.name}</div>
              <div className="text-xs">{flag.val ? '1' : '0'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Core Counters (PC, SP, Cycles) */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 rounded p-2.5">
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">Program Counter (PC)</div>
          <div className="text-sm font-bold text-cyan-400">
            0x{(cpuState.pc * 2).toString(16).padStart(4, '0').toUpperCase()}
          </div>
          <div className="text-[10px] text-slate-500">Word: {cpuState.pc}</div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">Stack Pointer (SP)</div>
          <div className="text-sm font-bold text-purple-400">
            0x{cpuState.sp.toString(16).padStart(4, '0').toUpperCase()}
          </div>
          <div className="text-[10px] text-slate-500">{cpuState.sp}</div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">CPU Cycles</div>
          <div className="text-sm font-bold text-emerald-400">{cpuState.cycles.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">
            {(cpuState.cycles / 8000).toFixed(2)} ms @ 8MHz
          </div>
        </div>
      </div>

      {/* 3. ATmega16 I/O Ports (PORTx, DDRx, PINx) */}
      <div className="bg-slate-900 border border-slate-800 rounded p-2.5">
        <div className="font-bold text-slate-200 mb-2">I/O Ports (Direction & Output)</div>
        <div className="space-y-2">
          {(['A', 'B', 'C', 'D'] as const).map((pName) => {
            const p = cpuState.ports[pName];
            return (
              <div key={pName} className="p-2 bg-slate-950 rounded border border-slate-800/80">
                <div className="flex justify-between font-bold text-slate-300 text-[11px] mb-1">
                  <span className="text-amber-400">Port {pName}</span>
                  <span className="text-[10px] text-slate-500">
                    PORT: {formatHex2(p.port)} | DDR: {formatHex2(p.ddr)} | PIN: {formatHex2(p.pin)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-500">DDR{pName}: </span>
                    <span className="text-slate-300 font-mono">{formatBin8(p.ddr)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">PORT{pName}: </span>
                    <span className="text-slate-300 font-mono">{formatBin8(p.port)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">PIN{pName}: </span>
                    <span className="text-emerald-400 font-mono">{formatBin8(p.pin)}</span>
                  </div>
                </div>

                {/* Pin Address & Bitmask Mapping: PINA0 => 0x01 ... PINA7 => 0x80 */}
                <div className="mt-2 pt-1.5 border-t border-slate-900 grid grid-cols-8 gap-1">
                  {[7, 6, 5, 4, 3, 2, 1, 0].map((b) => {
                    const mask = 1 << b;
                    const maskHex = '0x' + mask.toString(16).padStart(2, '0').toUpperCase();
                    const isHigh = !!(p.pin & mask);
                    const isOut = !!(p.ddr & mask);
                    const isPullUp = !isOut && !!(p.port & mask);
                    const isFloating = !isOut && !isPullUp;

                    return (
                      <div
                        key={b}
                        className={`flex flex-col items-center p-1 rounded border text-center transition-colors ${
                          isOut && isHigh
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-sm'
                            : isPullUp && isHigh
                            ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 shadow-sm'
                            : isPullUp && !isHigh
                            ? 'bg-slate-900 border-amber-700/60 text-amber-200'
                            : isHigh
                            ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                        title={`PIN${pName}${b} => ${maskHex} (Bit ${b})\nMode: ${
                          isOut ? 'OUTPUT' : isPullUp ? 'INPUT (PULL-UP ~30kΩ)' : 'INPUT (FLOATING / Hi-Z)'
                        }\nPORT Bit: ${p.port & mask ? '1' : '0'}\nState: ${isHigh ? 'HIGH (1)' : 'LOW (0)'}`}
                      >
                        <span className="text-[9px] font-bold text-slate-300">P{pName}{b}</span>
                        <span className="text-[8px] font-mono text-cyan-400">{maskHex}</span>
                        <span className="text-[10px] font-mono font-bold mt-0.5">{isHigh ? '1' : '0'}</span>
                        <span
                          className={`text-[7px] font-mono px-0.5 mt-0.5 rounded ${
                            isOut
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isPullUp
                              ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold'
                              : 'bg-slate-900 text-sky-400 border border-slate-800'
                          }`}
                        >
                          {isOut ? 'OUT' : isPullUp ? 'PU' : 'FLT'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ATmega16 Internal Pull-Up Resistor Hardware Logic Truth Table */}
        <div className="mt-3 p-2 bg-slate-950 rounded border border-slate-800 text-[10px]">
          <div className="font-bold text-amber-400 flex items-center justify-between mb-1.5">
            <span>ATmega16 Internal Pull-Up Logic</span>
            <span className="text-[9px] text-slate-500">DDRx + PORTx Truth Table</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center border-b border-slate-800 pb-1 text-slate-400">
            <div>DDRxn</div>
            <div>PORTxn</div>
            <div>I/O Mode</div>
            <div>Electrical State</div>
          </div>
          <div className="divide-y divide-slate-900/60 font-mono text-[9px] pt-1 space-y-1">
            <div className="grid grid-cols-4 gap-1 text-center py-0.5 items-center">
              <span className="text-slate-300">0</span>
              <span className="text-amber-300 font-bold">1</span>
              <span className="text-amber-400 font-bold">INPUT + PULL-UP</span>
              <span className="text-amber-300">~30kΩ to 5V (No Float!)</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center py-0.5 items-center">
              <span className="text-slate-300">0</span>
              <span className="text-slate-500">0</span>
              <span className="text-sky-400">INPUT (Tri-State)</span>
              <span className="text-sky-400">Floating / Hi-Z</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center py-0.5 items-center">
              <span className="text-emerald-400 font-bold">1</span>
              <span className="text-emerald-300 font-bold">1</span>
              <span className="text-emerald-400">OUTPUT</span>
              <span className="text-emerald-300">Driven HIGH (+5V)</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center py-0.5 items-center">
              <span className="text-emerald-400 font-bold">1</span>
              <span className="text-slate-500">0</span>
              <span className="text-emerald-400">OUTPUT</span>
              <span className="text-slate-400">Driven LOW (GND, 0V)</span>
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-900 text-[9px] text-slate-400 font-sans">
            <code className="text-amber-300 font-mono">PORTA = 0xF0;</code> enables pull-ups on <code className="text-cyan-300 font-mono">PA4..PA7</code>, holding them securely at +5V unless grounded by a switch.
          </div>
        </div>
      </div>

      {/* 4. 32 General Purpose Registers R0 to R31 */}
      <div className="bg-slate-900 border border-slate-800 rounded p-2.5">
        <div className="font-bold text-slate-200 mb-2">Working Registers (R0 - R31)</div>
        <div className="grid grid-cols-4 gap-1.5">
          {cpuState.r.map((val, idx) => {
            const prevVal = prevCpuState?.r[idx];
            const changed = prevVal !== undefined && prevVal !== val;

            return (
              <div
                key={idx}
                className={`flex justify-between items-center px-1.5 py-0.5 rounded border transition-colors ${
                  changed
                    ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400'
                }`}
                title={`Register R${idx}: ${val} (0x${val.toString(16).padStart(2, '0').toUpperCase()})`}
              >
                <span className="text-[10px] text-slate-500">R{idx}</span>
                <span className="text-[11px] font-semibold text-slate-200">
                  {val.toString(16).padStart(2, '0').toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
