import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Cpu,
  Terminal,
  FileCode,
  Binary,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RegisterView } from './RegisterView.tsx';
import { DisassemblyView } from './DisassemblyView.tsx';
import { CpuRegistersState, SimulatorLanguage } from '../types.ts';

interface CodingPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: SimulatorLanguage;
  onLanguageChange: (lang: SimulatorLanguage) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onCompile: () => void;
  isCompiling: boolean;
  cpuState: CpuRegistersState | null;
  prevCpuState: CpuRegistersState | null;
  disassembly: string;
  buildLogs: string;
  flashUsed: number;
  sramUsed: number;
  clockSpeed: number;
  onClockSpeedChange: (speed: number) => void;
  simSpeed: number; // 1 = Realtime, 2 = Slow, etc.
  onSimSpeedChange: (speed: number) => void;
  activeSourceLine?: number | null;
}

export const CodingPanel: React.FC<CodingPanelProps> = ({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  isRunning,
  onToggleRun,
  onStep,
  onReset,
  onCompile,
  isCompiling,
  cpuState,
  prevCpuState,
  disassembly,
  buildLogs,
  flashUsed,
  sramUsed,
  clockSpeed,
  onClockSpeedChange,
  simSpeed,
  onSimSpeedChange,
  activeSourceLine,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'registers' | 'disasm' | 'console'>('editor');

  const flashPercent = Math.min(100, (flashUsed / 16384) * 100);
  const sramPercent = Math.min(100, (sramUsed / 1024) * 100);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 select-none">
      {/* 1. Control Toolbar */}
      <div className="h-12 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between z-10 shadow-sm">
        {/* Play/Step/Reset Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleRun}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-semibold shadow transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
            }`}
            title={isRunning ? 'Pause Simulation' : 'Run Simulation'}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isRunning ? 'Pause' : 'Run'}</span>
          </button>

          <button
            onClick={onStep}
            disabled={isRunning}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 flex items-center gap-1 text-xs font-mono transition-colors"
            title="Step One Instruction (F10)"
          >
            <StepForward size={14} />
            <span>Step</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reset CPU to initial state"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Compile Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-900/40 transition-all active:scale-95"
            title="Compile code and upload firmware to ATmega16 Flash"
          >
            <Sparkles size={14} className={isCompiling ? 'animate-spin' : ''} />
            <span>{isCompiling ? 'Compiling...' : 'Compile & Flash'}</span>
          </button>
        </div>
      </div>

      {/* 2. Simulation Frequency & Execution Speed Bar */}
      <div className="h-9 bg-slate-900/80 border-b border-slate-800 px-3 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-950 rounded border border-slate-800 p-0.5">
            <button
              onClick={() => onLanguageChange('c')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                language === 'c' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C (AVR-GCC)
            </button>
            <button
              onClick={() => onLanguageChange('asm')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                language === 'asm' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Assembly (.asm)
            </button>
          </div>

          {/* Clock Frequency */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">Clock:</span>
            <select
              value={clockSpeed}
              onChange={(e) => onClockSpeedChange(parseInt(e.target.value, 10))}
              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
            >
              <option value={1000000}>1 MHz</option>
              <option value={4000000}>4 MHz</option>
              <option value={8000000}>8 MHz (Default)</option>
              <option value={16000000}>16 MHz</option>
            </select>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Speed:</span>
          <select
            value={simSpeed}
            onChange={(e) => onSimSpeedChange(parseInt(e.target.value, 10))}
            className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
          >
            <option value={100}>Slow Motion (Visual)</option>
            <option value={20}>Medium</option>
            <option value={1}>Full Speed (Realtime)</option>
          </select>
        </div>
      </div>

      {/* 3. Panel Navigation Tabs */}
      <div className="flex bg-slate-950 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors ${
            activeTab === 'editor'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode size={14} />
          <span>Code Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('registers')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors ${
            activeTab === 'registers'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu size={14} />
          <span>Registers & Ports</span>
        </button>

        <button
          onClick={() => setActiveTab('disasm')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors ${
            activeTab === 'disasm'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Binary size={14} />
          <span>Disassembly</span>
        </button>

        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors ${
            activeTab === 'console'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal size={14} />
          <span>Build Log</span>
        </button>
      </div>

      {/* 4. Tab Body Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'editor' && (
          <div className="h-full overflow-auto">
            <CodeMirror
              value={code}
              height="100%"
              theme={oneDark}
              extensions={[cpp()]}
              onChange={(value) => onCodeChange(value)}
              className="text-xs font-mono h-full"
            />
          </div>
        )}

        {activeTab === 'registers' && (
          <RegisterView cpuState={cpuState} prevCpuState={prevCpuState} />
        )}

        {activeTab === 'disasm' && (
          <DisassemblyView disassembly={disassembly} currentPc={cpuState?.pc || 0} />
        )}

        {activeTab === 'console' && (
          <div className="p-3 font-mono text-xs text-slate-300 overflow-y-auto max-h-full whitespace-pre-wrap bg-slate-950">
            {buildLogs || 'Ready to compile. Press "Compile & Flash" to build firmware.'}
          </div>
        )}
      </div>

      {/* 5. Memory Footprint Footer */}
      <div className="h-8 bg-slate-950 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          {/* Flash Usage */}
          <div className="flex items-center gap-1.5">
            <span>Flash:</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${flashPercent}%` }}
              />
            </div>
            <span>
              {flashUsed} B / 16KB ({flashPercent.toFixed(1)}%)
            </span>
          </div>

          {/* SRAM Usage */}
          <div className="flex items-center gap-1.5">
            <span>SRAM:</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${sramPercent}%` }}
              />
            </div>
            <span>
              {sramUsed} B / 1KB ({sramPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Layers size={12} />
          <span>ATmega16 DIP-40</span>
        </div>
      </div>
    </div>
  );
};
