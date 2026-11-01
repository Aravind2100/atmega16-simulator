import React, { useEffect, useRef } from 'react';

interface DisassemblyViewProps {
  disassembly: string;
  currentPc: number; // in 16-bit words
}

export const DisassemblyView: React.FC<DisassemblyViewProps> = ({ disassembly, currentPc }) => {
  const activeLineRef = useRef<HTMLDivElement>(null);

  const lines = disassembly.split('\n');
  const currentByteAddr = (currentPc * 2).toString(16).padStart(4, '0').toLowerCase();

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentPc]);

  if (!disassembly) {
    return (
      <div className="p-4 text-slate-500 font-mono text-xs text-center">
        No disassembly available yet. Compile your code first.
      </div>
    );
  }

  return (
    <div className="p-2 font-mono text-xs bg-slate-950 overflow-y-auto max-h-full space-y-0.5">
      {lines.map((line, idx) => {
        // Match address like "  1c:  0c 94 ..." or "0000: ef0f ..."
        const match = line.match(/^\s*([0-9a-fA-F]+):/);
        const lineAddr = match ? match[1].toLowerCase().padStart(4, '0') : null;
        const isActive = lineAddr === currentByteAddr;

        return (
          <div
            key={idx}
            ref={isActive ? activeLineRef : null}
            className={`flex items-center px-2 py-0.5 rounded transition-colors ${
              isActive
                ? 'bg-amber-950/60 border border-amber-500/50 text-amber-200 font-bold shadow-sm'
                : 'hover:bg-slate-900 text-slate-400'
            }`}
          >
            {/* Arrow indicator */}
            <span className="w-4 text-amber-400 font-bold">{isActive ? '▶' : ''}</span>
            <span className="whitespace-pre flex-1">{line}</span>
          </div>
        );
      })}
    </div>
  );
};
