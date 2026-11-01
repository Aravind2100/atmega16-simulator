import React from 'react';
import { AtmegaPinInfo } from '../types.ts';
import { ATMEGA16_DIP40_PINS } from '../simulator/atmega16Core.ts';

interface Atmega16ChipProps {
  pinInfos: AtmegaPinInfo[];
  onPinClick?: (pinName: string, event: React.MouseEvent) => void;
  selectedPin?: string | null;
  hoveredPin?: string | null;
  onPinHover?: (pinName: string | null) => void;
}

export const Atmega16Chip: React.FC<Atmega16ChipProps> = ({
  pinInfos,
  onPinClick,
  selectedPin,
  hoveredPin,
  onPinHover,
}) => {
  const pinMap = new Map<number, AtmegaPinInfo>();
  for (const p of pinInfos) {
    pinMap.set(p.pinNumber, p);
  }

  // Left Pins: 1 to 20
  const leftPins = ATMEGA16_DIP40_PINS.slice(0, 20);
  // Right Pins: 40 down to 21
  const rightPins = ATMEGA16_DIP40_PINS.slice(20, 40);

  const getPinColor = (info?: AtmegaPinInfo) => {
    if (!info) return '#475569';
    if (info.direction === 'output') {
      return info.voltage >= 2.5 ? '#22c55e' : '#334155'; // Bright Green when HIGH, Slate when LOW
    }
    if (info.direction === 'input-pullup') {
      // Amber when pull-up is active (+5V via ~30k internal pull-up), slate when pulled LOW to 0V by GND
      return info.voltage >= 2.5 ? '#f59e0b' : '#334155';
    }
    // Floating Input without Pull-Up
    if (info.isFloating || info.state === 'tristate') {
      return '#0284c7'; // Cyan indicating floating Hi-Z input
    }
    return info.voltage >= 2.5 ? '#3b82f6' : '#1e293b';
  };

  const getPinTooltip = (def: (typeof ATMEGA16_DIP40_PINS)[0], info?: AtmegaPinInfo) => {
    if (!info?.port) {
      return `Pin ${def.pinNumber}: ${def.name} (${def.altFunctions.join(', ') || 'Power/Clock'})\nVoltage: ${info?.voltage.toFixed(1) || 0}V`;
    }

    let modeText = 'Input';
    let pullUpText = 'No Pull-Up (Floating / Hi-Z)';

    if (info.direction === 'output') {
      modeText = `Output (${info.voltage >= 2.5 ? 'HIGH +5V' : 'LOW 0V'})`;
      pullUpText = 'Driver Active (MOSFET Driven Rail)';
    } else if (info.direction === 'input-pullup') {
      modeText = 'Input with Internal Pull-Up';
      pullUpText =
        info.voltage >= 2.5
          ? 'Internal Pull-Up: ACTIVE (~30kΩ to +5V) — Protected from floating!'
          : 'Internal Pull-Up: ACTIVE (Grounded externally to 0V by switch/wire)';
    } else {
      modeText = 'Input without Pull-Up (Floating / Hi-Z)';
      pullUpText = 'Pull-Up: DISABLED (PORT=0) — Pin floats if unconnected!';
    }

    return (
      `Pin ${def.pinNumber}: ${def.name} (${def.altFunctions.join(', ') || 'General GPIO'})\n` +
      `Address Mapping: ${info.pinAddressLabel}\n` +
      `Mode: ${modeText}\n` +
      `${pullUpText}\n` +
      `Pin Voltage: ${info.voltage.toFixed(2)}V (${info.voltage >= 2.5 ? 'Logic 1' : 'Logic 0'})`
    );
  };

  return (
    <div className="relative select-none bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl p-4 flex flex-col items-center w-[350px]">
      {/* IC Notch */}
      <div className="w-10 h-4 bg-slate-800 border-b-2 border-slate-700 rounded-b-full mb-3 shadow-inner flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
      </div>

      {/* Chip Label */}
      <div className="text-center mb-3">
        <div className="text-xs font-mono font-bold tracking-widest text-emerald-400">ATMEL</div>
        <div className="text-sm font-mono font-bold text-slate-100 tracking-wider">ATmega16</div>
        <div className="text-[10px] font-mono text-slate-500">16KB FLASH • 1KB SRAM • 16MHz</div>
      </div>

      {/* Pins Layout (Left and Right columns) */}
      <div className="w-full flex justify-between gap-4 font-mono text-xs">
        {/* Left Column: Pins 1 to 20 */}
        <div className="flex flex-col gap-1.5 w-1/2">
          {leftPins.map((def) => {
            const info = pinMap.get(def.pinNumber);
            const isSelected = selectedPin === def.name;
            const isHovered = hoveredPin === def.name;
            const stateColor = getPinColor(info);

            return (
              <div
                key={def.pinNumber}
                onClick={(e) => onPinClick && onPinClick(def.name, e)}
                onMouseEnter={() => onPinHover && onPinHover(def.name)}
                onMouseLeave={() => onPinHover && onPinHover(null)}
                className={`group flex items-center justify-between px-1.5 py-0.5 rounded cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-amber-500/20 border border-amber-400 shadow-md ring-1 ring-amber-400'
                    : isHovered
                    ? 'bg-slate-800 border border-slate-600'
                    : 'hover:bg-slate-800/60'
                }`}
                title={getPinTooltip(def, info)}
              >
                {/* Pin lead graphic */}
                <div className="flex items-center gap-1.5">
                  <div
                    data-term={`atmega16:${def.name}`}
                    className="w-2.5 h-2.5 rounded-full border border-slate-600 transition-colors shadow-sm"
                    style={{
                      backgroundColor: stateColor,
                      boxShadow:
                        info?.direction === 'input-pullup' && info.voltage >= 2.5
                          ? '0 0 6px #f59e0b'
                          : info?.voltage && info.voltage >= 2.5
                          ? '0 0 6px #22c55e'
                          : 'none',
                    }}
                  />
                  <span className="text-[10px] text-slate-500 w-4">{def.pinNumber}</span>
                  <span
                    className={`font-semibold text-[11px] ${
                      info?.direction === 'input-pullup'
                        ? 'text-amber-300'
                        : info?.voltage && info.voltage >= 2.5
                        ? 'text-slate-100'
                        : 'text-slate-400'
                    }`}
                  >
                    {def.name}
                  </span>
                  {info?.direction === 'input-pullup' && (
                    <span
                      className="text-[7px] font-mono px-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold"
                      title="Internal Pull-Up Active (~30k to 5V, not floating)"
                    >
                      PU
                    </span>
                  )}
                  {info?.isFloating && (
                    <span
                      className="text-[7px] font-mono px-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800"
                      title="Floating Input (Hi-Z, no pull-up)"
                    >
                      FLT
                    </span>
                  )}
                  {info?.bitmask !== undefined && (
                    <span
                      className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-bold"
                      title={info.pinAddressLabel}
                    >
                      {'0x' + info.bitmask.toString(16).padStart(2, '0').toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Alt function tag */}
                {def.altFunctions.length > 0 && (
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-300 transition-colors">
                    {def.altFunctions[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Pins 40 down to 21 */}
        <div className="flex flex-col gap-1.5 w-1/2">
          {rightPins.map((def) => {
            const info = pinMap.get(def.pinNumber);
            const isSelected = selectedPin === def.name;
            const isHovered = hoveredPin === def.name;
            const stateColor = getPinColor(info);

            return (
              <div
                key={def.pinNumber}
                onClick={(e) => onPinClick && onPinClick(def.name, e)}
                onMouseEnter={() => onPinHover && onPinHover(def.name)}
                onMouseLeave={() => onPinHover && onPinHover(null)}
                className={`group flex items-center justify-between px-1.5 py-0.5 rounded cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-amber-500/20 border border-amber-400 shadow-md ring-1 ring-amber-400'
                    : isHovered
                    ? 'bg-slate-800 border border-slate-600'
                    : 'hover:bg-slate-800/60'
                }`}
                title={getPinTooltip(def, info)}
              >
                {/* Alt function tag */}
                {def.altFunctions.length > 0 && (
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-300 transition-colors">
                    {def.altFunctions[0]}
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  {info?.direction === 'input-pullup' && (
                    <span
                      className="text-[7px] font-mono px-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold"
                      title="Internal Pull-Up Active (~30k to 5V, not floating)"
                    >
                      PU
                    </span>
                  )}
                  {info?.isFloating && (
                    <span
                      className="text-[7px] font-mono px-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800"
                      title="Floating Input (Hi-Z, no pull-up)"
                    >
                      FLT
                    </span>
                  )}
                  {info?.bitmask !== undefined && (
                    <span
                      className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-bold"
                      title={info.pinAddressLabel}
                    >
                      {'0x' + info.bitmask.toString(16).padStart(2, '0').toUpperCase()}
                    </span>
                  )}
                  <span
                    className={`font-semibold text-[11px] ${
                      info?.direction === 'input-pullup'
                        ? 'text-amber-300'
                        : info?.voltage && info.voltage >= 2.5
                        ? 'text-slate-100'
                        : 'text-slate-400'
                    }`}
                  >
                    {def.name}
                  </span>
                  <span className="text-[10px] text-slate-500 w-4 text-right">{def.pinNumber}</span>
                  <div
                    data-term={`atmega16:${def.name}`}
                    className="w-2.5 h-2.5 rounded-full border border-slate-600 transition-colors shadow-sm"
                    style={{
                      backgroundColor: stateColor,
                      boxShadow:
                        info?.direction === 'input-pullup' && info.voltage >= 2.5
                          ? '0 0 6px #f59e0b'
                          : info?.voltage && info.voltage >= 2.5
                          ? '0 0 6px #22c55e'
                          : 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pin state Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-around text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div>
          <span>HIGH (+5V)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></div>
          <span className="text-amber-300 font-semibold">Pull-Up (5V)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-sky-600 border border-dashed border-sky-400"></div>
          <span>Floating</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <span>LOW (0V)</span>
        </div>
      </div>
    </div>
  );
};
