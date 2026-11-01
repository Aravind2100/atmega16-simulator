import React from 'react';
import { EXAMPLE_PROJECTS } from '../examples/exampleProjects.ts';
import { ExampleProject } from '../types.ts';
import { Cpu, BookOpen, Activity, Wand2, RotateCcw } from 'lucide-react';

interface HeaderProps {
  currentProject: ExampleProject;
  onSelectProject: (proj: ExampleProject) => void;
  onAutoWire: () => void;
  onToggleDatasheet: () => void;
  isDatasheetOpen: boolean;
  onToggleOscilloscope: () => void;
  isOscilloscopeOpen: boolean;
  saveStatus?: 'saved' | 'saving';
  onResetWorkspace: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  onSelectProject,
  onAutoWire,
  onToggleDatasheet,
  isDatasheetOpen,
  onToggleOscilloscope,
  isOscilloscopeOpen,
  saveStatus = 'saved',
  onResetWorkspace,
}) => {
  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-slate-100 z-30 select-none shadow-md">
      {/* Logo & Chip Badge */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Cpu size={18} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-wide text-white">ATmega16 Simulator</h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 border border-emerald-600 text-emerald-300">
              Learning Lab
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400">
            Interactive AVR 8-bit Microcontroller & Circuit Playground
          </p>
        </div>
      </div>

      {/* Example Projects Dropdown & Workspace Tools */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-400 font-semibold">Lesson:</span>
        <select
          value={currentProject.id}
          onChange={(e) => {
            const p = EXAMPLE_PROJECTS.find((proj) => proj.id === e.target.value);
            if (p) onSelectProject(p);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[280px]"
        >
          {EXAMPLE_PROJECTS.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.title}
            </option>
          ))}
        </select>

        {/* Auto-Wire Button */}
        <button
          onClick={onAutoWire}
          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
          title="Restore / Auto-wire preset circuit for this lesson"
        >
          <Wand2 size={13} />
          <span>Preset Circuit</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onResetWorkspace}
          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
          title="Reset code and circuit to default (clears local browser storage)"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Drawer Action Toggles & Save Indicator */}
      <div className="flex items-center gap-2">
        {/* Local Storage Auto-save Status Indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400"
          title="All code and circuit changes are automatically saved locally in your browser"
        >
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved Locally'}</span>
        </div>

        {/* Logic Waveforms */}
        <button
          onClick={onToggleOscilloscope}
          className={`px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 border transition-colors ${
            isOscilloscopeOpen
              ? 'bg-blue-950 border-blue-500 text-blue-300 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
          }`}
          title="Toggle digital oscilloscope waveform viewer"
        >
          <Activity size={14} />
          <span>Logic Analyzer</span>
        </button>

        {/* Datasheet Reference */}
        <button
          onClick={onToggleDatasheet}
          className={`px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 border transition-colors ${
            isDatasheetOpen
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
          }`}
          title="Open ATmega16 pinout diagram & architecture cheat sheet"
        >
          <BookOpen size={14} />
          <span>Datasheet</span>
        </button>
      </div>
    </header>
  );
};
