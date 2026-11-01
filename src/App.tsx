import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header.tsx';
import { CodingPanel } from './components/CodingPanel.tsx';
import { Canvas } from './components/Canvas.tsx';
import { LogicAnalyzer } from './components/LogicAnalyzer.tsx';
import { DatasheetDrawer } from './components/DatasheetDrawer.tsx';
import { Atmega16Simulator } from './simulator/atmega16Core.ts';
import { CircuitEngine } from './simulator/circuitEngine.ts';
import { assembleAvr } from './simulator/assembler.ts';
import { parseIntelHex } from './simulator/hexParser.ts';
import { EXAMPLE_PROJECTS } from './examples/exampleProjects.ts';
import { RotateCcw, RefreshCw, Wand2, CheckCircle2, X } from 'lucide-react';
import {
  CircuitComponent,
  WireConnection,
  CpuRegistersState,
  ExampleProject,
  SimulatorLanguage,
  AtmegaPinInfo,
} from './types.ts';

const STORAGE_KEY = 'atmega16_sim_saved_state_v1';

interface SavedState {
  version: number;
  projectId?: string;
  code: string;
  language: SimulatorLanguage;
  components: CircuitComponent[];
  wires: WireConnection[];
  splitWidth?: number;
  clockSpeed?: number;
  simSpeed?: number;
}

const loadSavedState = (): SavedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.code === 'string' &&
      Array.isArray(parsed.components) &&
      Array.isArray(parsed.wires)
    ) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load saved state from localStorage:', e);
  }
  return null;
};

export const App: React.FC = () => {
  // Load saved state once on initial mount
  const [initialSaved] = useState<SavedState | null>(() => loadSavedState());

  // Current active project
  const [currentProject, setCurrentProject] = useState<ExampleProject>(() => {
    if (initialSaved?.projectId) {
      const found = EXAMPLE_PROJECTS.find((p) => p.id === initialSaved.projectId);
      if (found) return found;
    }
    return EXAMPLE_PROJECTS[0];
  });

  // Editor code & language
  const [code, setCode] = useState<string>(() => initialSaved?.code ?? EXAMPLE_PROJECTS[0].code);
  const [language, setLanguage] = useState<SimulatorLanguage>(
    () => initialSaved?.language ?? EXAMPLE_PROJECTS[0].language
  );

  // Split-panel width (percentage for left panel, default 45%)
  const [splitWidth, setSplitWidth] = useState<number>(() => initialSaved?.splitWidth ?? 45);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Circuit components & wires
  const [components, setComponents] = useState<CircuitComponent[]>(
    () => initialSaved?.components ?? EXAMPLE_PROJECTS[0].components
  );
  const [wires, setWires] = useState<WireConnection[]>(
    () => initialSaved?.wires ?? EXAMPLE_PROJECTS[0].wires
  );

  // Simulation parameters
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [clockSpeed, setClockSpeed] = useState<number>(() => initialSaved?.clockSpeed ?? 8000000); // 8 MHz
  const [simSpeed, setSimSpeed] = useState<number>(() => initialSaved?.simSpeed ?? 1); // 1 = realtime, 20 = medium, 100 = slow
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Local storage auto-save state & modals
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulator & Circuit Engine instances
  const mcuRef = useRef<Atmega16Simulator>(new Atmega16Simulator());
  const engineRef = useRef<CircuitEngine>(new CircuitEngine(mcuRef.current));

  // Live state snapshots for UI
  const [pinInfos, setPinInfos] = useState<AtmegaPinInfo[]>(mcuRef.current.getAllPinInfos());
  const [cpuState, setCpuState] = useState<CpuRegistersState | null>(null);
  const [prevCpuState, setPrevCpuState] = useState<CpuRegistersState | null>(null);

  // Component Live Visual States
  const [ledStates, setLedStates] = useState<Map<string, boolean>>(new Map());
  const [ledBarStates, setLedBarStates] = useState<Map<string, boolean[]>>(new Map());
  const [segStates, setSegStates] = useState<Map<string, Record<string, boolean>>>(new Map());
  const [lcdStates, setLcdStates] = useState(engineRef.current.lcdStates);
  const [buzzerActive, setBuzzerActive] = useState<Map<string, boolean>>(new Map());
  const [dcMotorStates, setDcMotorStates] = useState(engineRef.current.dcMotorStates);
  const [stepperStates, setStepperStates] = useState(engineRef.current.stepperStates);

  // Compiler output state
  const [disassembly, setDisassembly] = useState<string>('');
  const [buildLogs, setBuildLogs] = useState<string>('');
  const [flashUsed, setFlashUsed] = useState<number>(0);
  const [sramUsed, setSramUsed] = useState<number>(0);

  // Drawer toggles
  const [isDatasheetOpen, setIsDatasheetOpen] = useState<boolean>(false);
  const [isOscilloscopeOpen, setIsOscilloscopeOpen] = useState<boolean>(false);

  // Sync circuit engine with components and wires
  useEffect(() => {
    engineRef.current.setComponentsAndWires(components, wires);
    engineRef.current.updateCircuit();
    setPinInfos(mcuRef.current.getAllPinInfos());
  }, [components, wires]);

  // Compile & Upload Routine
  const handleCompile = useCallback(async () => {
    setIsCompiling(true);
    setBuildLogs('Compiling firmware for ATmega16...\n');

    try {
      if (language === 'asm') {
        // Use fast built-in client-side assembler
        const asmRes = assembleAvr(code);
        if (asmRes.success) {
          mcuRef.current.loadProgram(asmRes.progMem);
          setDisassembly(asmRes.disassembly);
          setFlashUsed(asmRes.flashUsed);
          setSramUsed(0);
          setBuildLogs(
            `Build Succeeded!\nFlash used: ${asmRes.flashUsed} bytes / 16,384 bytes (${(
              (asmRes.flashUsed / 16384) *
              100
            ).toFixed(1)}%)\nProgram flashed to ATmega16. Press "Run" or "Step" to execute!`
          );

          confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
          setCpuState(mcuRef.current.getCpuState());
        } else {
          setBuildLogs(`Assembly Errors:\n${asmRes.errors.join('\n')}`);
        }
      } else {
        // C Code: Compile via backend avr-gcc toolchain API
        try {
          const res = await fetch('/api/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: 'c', fCpu: clockSpeed }),
          });

          const contentType = res.headers.get('content-type') || '';
          if (!res.ok || !contentType.includes('application/json')) {
            throw new Error(`Compiler API unavailable on static host (HTTP ${res.status})`);
          }

          const data = await res.json();

          if (data.success && data.hex) {
            const parsed = parseIntelHex(data.hex);
            mcuRef.current.loadProgram(parsed.progMem);

            setDisassembly(data.disassembly || '');
            setFlashUsed(data.flashUsed || parsed.bytesUsed);
            setSramUsed(data.sramUsed || 0);
            setBuildLogs(data.message || 'Build Succeeded! Program loaded into ATmega16 Flash memory.');

            confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
            setCpuState(mcuRef.current.getCpuState());
          } else {
            setBuildLogs(`Compilation Error:\n${data.errors || 'Unknown compiler error'}`);
          }
        } catch (fetchErr: any) {
          // Fallback to pre-compiled firmware when backend compiler is offline (e.g. hosted on Vercel)
          if (currentProject?.precompiledHex) {
            const parsed = parseIntelHex(currentProject.precompiledHex);
            mcuRef.current.loadProgram(parsed.progMem);
            setDisassembly(currentProject.precompiledDisassembly || '');
            setFlashUsed(currentProject.flashUsed || parsed.bytesUsed);
            setSramUsed(currentProject.sramUsed || 0);
            setBuildLogs(
              `Build Succeeded (Precompiled Cloud Firmware)!\nFlash used: ${
                currentProject.flashUsed || parsed.bytesUsed
              } bytes / 16,384 bytes.\nProgram loaded into ATmega16 Flash memory. Press "Run" or "Step" to simulate!`
            );

            confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
            setCpuState(mcuRef.current.getCpuState());
          } else {
            setBuildLogs(
              `Backend compiler unreachable: ${fetchErr.message}.\n\n` +
              `• All 17 built-in project presets include pre-compiled firmware and run 100% in-browser!\n` +
              `• Pure AVR Assembly also compiles client-side in the browser.\n` +
              `• To compile custom C code, run the local compiler server (npm run server).`
            );
          }
        }
      }
    } catch (e: any) {
      setBuildLogs(`Error during build: ${e.message}`);
    } finally {
      setIsCompiling(false);
    }
  }, [code, language, clockSpeed]);

  // Load a learning project
  const handleSelectProject = (proj: ExampleProject) => {
    setCurrentProject(proj);
    setCode(proj.code);
    setLanguage(proj.language);
    setComponents(proj.components);
    setWires(proj.wires);
    setIsRunning(false);
    mcuRef.current.reset();
    engineRef.current.reset();
    engineRef.current.setComponentsAndWires(proj.components, proj.wires);
    engineRef.current.updateCircuit();
    setPinInfos(mcuRef.current.getAllPinInfos());
    const clonedLcd = new Map<string, Lcd1602State>();
    for (const [id, st] of engineRef.current.lcdStates.entries()) {
      clonedLcd.set(id, { ...st, lines: [st.lines[0], st.lines[1]] });
    }
    setLcdStates(clonedLcd);
    if (proj.precompiledHex) {
      const parsed = parseIntelHex(proj.precompiledHex);
      mcuRef.current.loadProgram(parsed.progMem);
      setFlashUsed(proj.flashUsed || parsed.bytesUsed);
      setSramUsed(proj.sramUsed || 0);
      setBuildLogs(
        `Loaded preset: ${proj.title}.\nFlash: ${
          proj.flashUsed || parsed.bytesUsed
        } bytes. Firmware ready in ATmega16 Flash memory. Press "Run" to simulate!`
      );
    }
    setCpuState(mcuRef.current.getCpuState());
  };

  // Show toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Save state to localStorage
  const saveToStorage = useCallback(() => {
    try {
      const stateToSave: SavedState = {
        version: 1,
        projectId: currentProject.id,
        code,
        language,
        components,
        wires,
        splitWidth,
        clockSpeed,
        simSpeed,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      setSaveStatus('saved');
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [currentProject.id, code, language, components, wires, splitWidth, clockSpeed, simSpeed]);

  // Debounced auto-save
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveToStorage();
    }, 350);

    return () => clearTimeout(timer);
  }, [saveToStorage]);

  // Save immediately on beforeunload in case of unexpected refresh or browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveToStorage]);

  // Reset Everything to Factory Default (Lesson 1: LED Blinker)
  const handleResetFactoryDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    const def = EXAMPLE_PROJECTS[0];
    setCurrentProject(def);
    setCode(def.code);
    setLanguage(def.language);
    setComponents(def.components);
    setWires(def.wires);
    setClockSpeed(8000000);
    setSimSpeed(1);
    setIsRunning(false);
    mcuRef.current.reset();
    engineRef.current.reset();
    engineRef.current.setComponentsAndWires(def.components, def.wires);
    engineRef.current.updateCircuit();
    setPinInfos(mcuRef.current.getAllPinInfos());
    const clonedLcd = new Map<string, Lcd1602State>();
    for (const [id, st] of engineRef.current.lcdStates.entries()) {
      clonedLcd.set(id, { ...st, lines: [st.lines[0], st.lines[1]] });
    }
    setLcdStates(clonedLcd);
    setIsResetModalOpen(false);
    showToast('Reset to Factory Default (LED Blinker)');
  };

  // Reset to Current Lesson Preset
  const handleResetCurrentLesson = () => {
    setCode(currentProject.code);
    setLanguage(currentProject.language);
    setComponents(currentProject.components);
    setWires(currentProject.wires);
    setIsRunning(false);
    mcuRef.current.reset();
    engineRef.current.reset();
    engineRef.current.setComponentsAndWires(currentProject.components, currentProject.wires);
    engineRef.current.updateCircuit();
    setPinInfos(mcuRef.current.getAllPinInfos());
    const clonedLcd = new Map<string, Lcd1602State>();
    for (const [id, st] of engineRef.current.lcdStates.entries()) {
      clonedLcd.set(id, { ...st, lines: [st.lines[0], st.lines[1]] });
    }
    setLcdStates(clonedLcd);
    setIsResetModalOpen(false);
    showToast(`Reset to ${currentProject.title} preset`);
  };

  // Restore preset circuit for current lesson
  const handleAutoWire = () => {
    setComponents(currentProject.components);
    setWires(currentProject.wires);
    showToast('Preset circuit re-applied');
  };

  // Step single instruction
  const handleStep = useCallback(() => {
    setPrevCpuState(mcuRef.current.getCpuState());
    mcuRef.current.step();
    engineRef.current.updateCircuit();

    setCpuState(mcuRef.current.getCpuState());
    setPinInfos(mcuRef.current.getAllPinInfos());
    setLedStates(new Map(engineRef.current.ledStates));
    setLedBarStates(new Map(engineRef.current.ledBarStates));
    setSegStates(new Map(engineRef.current.segStates));
    const clonedLcd = new Map<string, Lcd1602State>();
    for (const [id, st] of engineRef.current.lcdStates.entries()) {
      clonedLcd.set(id, { ...st, lines: [st.lines[0], st.lines[1]] });
    }
    setLcdStates(clonedLcd);
    setBuzzerActive(new Map(engineRef.current.buzzerActive));
    setDcMotorStates(new Map(engineRef.current.dcMotorStates));
    setStepperStates(new Map(engineRef.current.stepperStates));
  }, []);

  // Reset CPU
  const handleReset = useCallback(() => {
    setIsRunning(false);
    mcuRef.current.reset();
    engineRef.current.reset();
    engineRef.current.updateCircuit();
    setCpuState(mcuRef.current.getCpuState());
    setPinInfos(mcuRef.current.getAllPinInfos());
    setLedStates(new Map(engineRef.current.ledStates));
    setLedBarStates(new Map(engineRef.current.ledBarStates));
    setSegStates(new Map(engineRef.current.segStates));
    const clonedLcd = new Map<string, Lcd1602State>();
    for (const [id, st] of engineRef.current.lcdStates.entries()) {
      clonedLcd.set(id, { ...st, lines: [st.lines[0], st.lines[1]] });
    }
    setLcdStates(clonedLcd);
    setBuzzerActive(new Map(engineRef.current.buzzerActive));
    setDcMotorStates(new Map(engineRef.current.dcMotorStates));
    setStepperStates(new Map(engineRef.current.stepperStates));
  }, []);

  // Continuous Simulation Loop via requestAnimationFrame
  useEffect(() => {
    if (!isRunning) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(50, time - lastTime); // elapsed ms, cap to prevent large jumps
      lastTime = time;

      // Instructions per frame:
      // In realtime (simSpeed === 1), clockSpeed (e.g. 8MHz) -> 8,000 instructions per ms (~130k instructions per frame).
      // Capped at 60,000 instructions/frame for silky smooth 60 FPS animation across all devices.
      const instructionsToRun =
        simSpeed === 1
          ? Math.max(100, Math.min(60000, Math.round((clockSpeed / 1000) * dt)))
          : simSpeed === 20
          ? Math.max(20, Math.round((clockSpeed / 1000) * (dt / 15)))
          : 50;

      mcuRef.current.stepCount(instructionsToRun);
      engineRef.current.updateCircuit();

      // Update UI state snapshots
      setCpuState(mcuRef.current.getCpuState());
      setPinInfos(mcuRef.current.getAllPinInfos());
      setLedStates(new Map(engineRef.current.ledStates));
      setLedBarStates(new Map(engineRef.current.ledBarStates));
      setSegStates(new Map(engineRef.current.segStates));
      const clonedLcd = new Map<string, Lcd1602State>();
      for (const [id, st] of engineRef.current.lcdStates.entries()) {
        clonedLcd.set(id, { ...st, lines: [st.lines[0], st.lines[1]] });
      }
      setLcdStates(clonedLcd);
      setBuzzerActive(new Map(engineRef.current.buzzerActive));
      setDcMotorStates(new Map(engineRef.current.dcMotorStates));
      setStepperStates(new Map(engineRef.current.stepperStates));

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, clockSpeed, simSpeed]);

  // Load initial preset firmware into ATmega16 Flash memory immediately on mount
  useEffect(() => {
    if (currentProject.precompiledHex) {
      const parsed = parseIntelHex(currentProject.precompiledHex);
      mcuRef.current.loadProgram(parsed.progMem);
      setDisassembly(currentProject.precompiledDisassembly || '');
      setFlashUsed(currentProject.flashUsed || parsed.bytesUsed);
      setSramUsed(currentProject.sramUsed || 0);
      setBuildLogs(
        `Preset ready: ${currentProject.title} (${
          currentProject.flashUsed || parsed.bytesUsed
        } bytes Flash).\nFirmware loaded in ATmega16 memory. Click "Run" to simulate in real-time!`
      );
      setCpuState(mcuRef.current.getCpuState());
    } else {
      handleCompile();
    }
  }, []);

  // Resizable split-pane handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth >= 25 && newWidth <= 75) {
        setSplitWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Button press handler (momentary push-button)
  const handleButtonPressChange = (compId: string, pressed: boolean) => {
    const updated = components.map((c) => {
      if (c.id === compId) {
        return { ...c, props: { ...c.props, pressed } };
      }
      return c;
    });
    setComponents(updated);
    engineRef.current.setComponentsAndWires(updated, wires);
    engineRef.current.updateCircuit();
  };

  // Switch toggle handler (latching press-switch / toggle-switch)
  const handleSwitchToggleChange = (compId: string, closed: boolean) => {
    const updated = components.map((c) => {
      if (c.id === compId) {
        return { ...c, props: { ...c.props, closed } };
      }
      return c;
    });
    setComponents(updated);
    engineRef.current.setComponentsAndWires(updated, wires);
    engineRef.current.updateCircuit();
    setPinInfos(mcuRef.current.getAllPinInfos());
  };

  // Potentiometer value handler
  const handlePotentiometerChange = (compId: string, val: number) => {
    const updated = components.map((c) => {
      if (c.id === compId) {
        return { ...c, props: { ...c.props, value: val } };
      }
      return c;
    });
    setComponents(updated);
    engineRef.current.setComponentsAndWires(updated, wires);
    engineRef.current.updateCircuit();
  };

  // Temperature sensor handler (LM35)
  const handleTempChange = (compId: string, temp: number) => {
    const updated = components.map((c) => {
      if (c.id === compId) {
        return { ...c, props: { ...c.props, temp } };
      }
      return c;
    });
    setComponents(updated);
    engineRef.current.setComponentsAndWires(updated, wires);
    engineRef.current.updateCircuit();
  };

  // 4x4 Keypad press handler
  const handleKeypadPress = (compId: string, key: string | null) => {
    const updated = components.map((c) => {
      if (c.id === compId) {
        return { ...c, props: { ...c.props, pressedKey: key } };
      }
      return c;
    });
    setComponents(updated);
    engineRef.current.setComponentsAndWires(updated, wires);
    engineRef.current.updateCircuit();
    setPinInfos(mcuRef.current.getAllPinInfos());
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 overflow-hidden font-sans">
      {/* 1. Top Navbar Header */}
      <Header
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
        onAutoWire={handleAutoWire}
        onToggleDatasheet={() => setIsDatasheetOpen(!isDatasheetOpen)}
        isDatasheetOpen={isDatasheetOpen}
        onToggleOscilloscope={() => setIsOscilloscopeOpen(!isOscilloscopeOpen)}
        isOscilloscopeOpen={isOscilloscopeOpen}
        saveStatus={saveStatus}
        onResetWorkspace={() => setIsResetModalOpen(true)}
      />

      {/* 2. Main Two-Panel Split Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Panel: Coding Section */}
        <div
          style={{ width: `${splitWidth}%` }}
          className="h-full flex-shrink-0 flex flex-col z-10"
        >
          <CodingPanel
            code={code}
            onCodeChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            isRunning={isRunning}
            onToggleRun={() => setIsRunning(!isRunning)}
            onStep={handleStep}
            onReset={handleReset}
            onCompile={handleCompile}
            isCompiling={isCompiling}
            cpuState={cpuState}
            prevCpuState={prevCpuState}
            disassembly={disassembly}
            buildLogs={buildLogs}
            flashUsed={flashUsed}
            sramUsed={sramUsed}
            clockSpeed={clockSpeed}
            onClockSpeedChange={setClockSpeed}
            simSpeed={simSpeed}
            onSimSpeedChange={setSimSpeed}
          />
        </div>

        {/* Resizer Divider Handle */}
        <div
          onMouseDown={handleResizeMouseDown}
          className={`w-1.5 hover:w-2 bg-slate-800 hover:bg-blue-500 cursor-col-resize transition-all duration-75 flex items-center justify-center z-20 ${
            isResizing ? 'bg-blue-500 w-2' : ''
          }`}
          title="Drag to resize coding and circuit panels"
        >
          <div className="w-0.5 h-8 bg-slate-600 rounded-full"></div>
        </div>

        {/* Right Side Panel: Circuit Section & Oscilloscope */}
        <div
          style={{ width: `${100 - splitWidth}%` }}
          className="h-full flex-1 flex flex-col relative overflow-hidden"
        >
          {/* Main Circuit Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <Canvas
              components={components}
              wires={wires}
              pinInfos={pinInfos}
              ledStates={ledStates}
              ledBarStates={ledBarStates}
              segStates={segStates}
              lcdStates={lcdStates}
              buzzerActive={buzzerActive}
              dcMotorStates={dcMotorStates}
              stepperStates={stepperStates}
              onComponentsChange={setComponents}
              onWiresChange={setWires}
              onButtonPressChange={handleButtonPressChange}
              onSwitchToggleChange={handleSwitchToggleChange}
              onPotentiometerChange={handlePotentiometerChange}
              onTempChange={handleTempChange}
              onKeypadPress={handleKeypadPress}
            />
          </div>

          {/* Logic Analyzer Drawer (Bottom of Circuit Panel) */}
          {isOscilloscopeOpen && (
            <div className="h-44 border-t-2 border-slate-800 z-20">
              <LogicAnalyzer pinInfos={pinInfos} cycles={cpuState?.cycles || 0} />
            </div>
          )}

          {/* Datasheet Reference Drawer */}
          <DatasheetDrawer
            isOpen={isDatasheetOpen}
            onClose={() => setIsDatasheetOpen(false)}
          />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-100 flex flex-col gap-4 border border-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Reset Workspace</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Restore code & circuit presets</span>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Your code and circuit layout are automatically saved locally in this browser.
              Choose an option to reset your workspace:
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleResetFactoryDefault}
                className="w-full text-left p-3 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/60 transition-all flex items-start gap-3 group"
              >
                <RefreshCw size={18} className="text-rose-400 mt-0.5 group-hover:rotate-180 transition-transform duration-300" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200">
                    Reset to Factory Default (LED Blinker)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Clears local browser storage and resets back to Lesson 1 default code & circuit.
                  </div>
                </div>
              </button>

              <button
                onClick={handleResetCurrentLesson}
                className="w-full text-left p-3 rounded-lg bg-slate-800/80 hover:bg-blue-950/40 border border-slate-700 hover:border-blue-500/60 transition-all flex items-start gap-3 group"
              >
                <Wand2 size={18} className="text-blue-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-300 group-hover:text-blue-200">
                    Reset Current Lesson Preset
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Restores the original starter code and circuit for <span className="text-slate-200 font-semibold">{currentProject.title}</span>.
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-mono transition-all">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
