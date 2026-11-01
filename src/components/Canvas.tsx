import React, { useState, useRef } from 'react';
import { CircuitComponent, ComponentType, WireConnection, AtmegaPinInfo } from '../types.ts';
import { Atmega16Chip } from './Atmega16Chip.tsx';
import {
  VisualLED,
  VisualLedBar,
  VisualPushButton,
  VisualSevenSegment,
  VisualLcd1602,
  VisualPotentiometer,
  VisualLM35,
  VisualBuzzer,
  VisualDcMotor,
  VisualStepperMotor,
  VisualPowerRail,
  VisualPressSwitch,
  VisualKeypad4x4,
} from './circuit-elements/VisualElements.tsx';
import { Lcd1602State, DcMotorState, StepperMotorState } from '../simulator/circuitEngine.ts';
import { getComponentTerminals } from '../simulator/circuitEngine.ts';
import { ATMEGA16_DIP40_PINS } from '../simulator/atmega16Core.ts';
import { Trash2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CanvasProps {
  components: CircuitComponent[];
  wires: WireConnection[];
  pinInfos: AtmegaPinInfo[];
  ledStates: Map<string, boolean>;
  ledBarStates: Map<string, boolean[]>;
  segStates: Map<string, Record<string, boolean>>;
  lcdStates: Map<string, Lcd1602State>;
  buzzerActive: Map<string, boolean>;
  dcMotorStates?: Map<string, DcMotorState>;
  stepperStates?: Map<string, StepperMotorState>;
  onComponentsChange: (components: CircuitComponent[]) => void;
  onWiresChange: (wires: WireConnection[]) => void;
  onButtonPressChange: (compId: string, pressed: boolean) => void;
  onSwitchToggleChange?: (compId: string, closed: boolean) => void;
  onPotentiometerChange: (compId: string, val: number) => void;
  onTempChange?: (compId: string, temp: number) => void;
  onKeypadPress?: (compId: string, key: string | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  components,
  wires,
  pinInfos,
  ledStates,
  ledBarStates,
  segStates,
  lcdStates,
  buzzerActive,
  dcMotorStates = new Map(),
  stepperStates = new Map(),
  onComponentsChange,
  onWiresChange,
  onButtonPressChange,
  onSwitchToggleChange,
  onPotentiometerChange,
  onTempChange,
  onKeypadPress,
}) => {
  const [wireStart, setWireStart] = useState<{ compId: string; termId: string } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedWireColor, setSelectedWireColor] = useState<string>('#3b82f6');
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  // Pan & Zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging component state
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to retrieve pin definition for ATmega16
  const getAtmegaPinDef = (pinName: string) => {
    return (
      pinInfos.find((p) => p.name === pinName) ||
      ATMEGA16_DIP40_PINS.find((p) => p.name === pinName)
    );
  };

  // Calculate terminal anchor position in canvas coordinates
  const getTerminalPos = (compId: string, termId: string): { x: number; y: number } => {
    // If this component is not actively being dragged, query the DOM for exact sub-pixel center
    if (draggingCompId !== compId && containerRef.current) {
      let el = containerRef.current.querySelector<HTMLElement>(`[data-term="${compId}:${termId}"]`);
      if (!el && termId.startsWith('a')) {
        el = containerRef.current.querySelector<HTMLElement>(`[data-term="${compId}:${termId.replace('a', 'd')}"]`);
      } else if (!el && termId.startsWith('d')) {
        el = containerRef.current.querySelector<HTMLElement>(`[data-term="${compId}:${termId.replace('d', 'a')}"]`);
      }
      if (el) {
        const elRect = el.getBoundingClientRect();
        const cRect = containerRef.current.getBoundingClientRect();
        if (elRect.width > 0 && elRect.height > 0) {
          return {
            x: (elRect.left + elRect.width / 2 - cRect.left - pan.x) / zoom,
            y: (elRect.top + elRect.height / 2 - cRect.top - pan.y) / zoom,
          };
        }
      }
    }

    // Precise mathematical fallback (also used during dragging for zero-latency 60fps tracking)
    if (compId === 'atmega16') {
      const chip = components.find((c) => c.type === 'atmega16');
      const chipX = chip ? chip.x : 260;
      const chipY = chip ? chip.y : 120;

      const info = getAtmegaPinDef(termId);
      if (!info) return { x: chipX + 175, y: chipY + 120 };

      // Pin 1-20 are left column, 40-21 are right column
      // Header offset is ~121px, row pitch is 26.5px
      if (info.pinNumber <= 20) {
        const row = info.pinNumber - 1;
        return { x: chipX + 29, y: chipY + 121 + row * 26.5 };
      } else {
        const row = 40 - info.pinNumber;
        return { x: chipX + 321, y: chipY + 121 + row * 26.5 };
      }
    }

    const comp = components.find((c) => c.id === compId);
    if (!comp) return { x: 0, y: 0 };

    const terms = getComponentTerminals(comp.type);
    const term = terms.find((t) => t.id === termId);
    if (term) {
      return { x: comp.x + term.x, y: comp.y + term.y };
    }
    return { x: comp.x + 20, y: comp.y + 20 };
  };

  // Calculate smooth natural Bézier curve path for wire connections
  const getWirePath = (wire: WireConnection) => {
    const p1 = getTerminalPos(wire.fromCompId, wire.fromTermId);
    const p2 = getTerminalPos(wire.toCompId, wire.toTermId);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Exit vector from terminal 1
    let dir1 = 1;
    if (wire.fromCompId === 'atmega16') {
      const pin = getAtmegaPinDef(wire.fromTermId);
      dir1 = pin && pin.pinNumber <= 20 ? -1 : 1;
    } else {
      dir1 = dx >= 0 ? 1 : -1;
    }

    // Entry vector to terminal 2
    let dir2 = -1;
    if (wire.toCompId === 'atmega16') {
      const pin = getAtmegaPinDef(wire.toTermId);
      dir2 = pin && pin.pinNumber <= 20 ? -1 : 1;
    } else {
      dir2 = dx >= 0 ? -1 : 1;
    }

    // Lead lengths: scale proportionally to distance for organic circuit curves
    const lead1 = Math.max(24, Math.min(90, Math.abs(dx) * 0.45));
    const lead2 = Math.max(24, Math.min(90, Math.abs(dx) * 0.45));

    const cx1 = p1.x + dir1 * lead1;
    const cy1 = p1.y + Math.min(35, Math.abs(dy) * 0.15) * (dy > 0 ? 0.3 : -0.3);
    const cx2 = p2.x + dir2 * lead2;
    const cy2 = p2.y - Math.min(35, Math.abs(dy) * 0.15) * (dy > 0 ? 0.3 : -0.3);

    const d = `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
    return { d, p1, p2 };
  };

  // Handle terminal click (starts or finishes wire)
  const handleTerminalClick = (compId: string, termId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!wireStart) {
      // Start wire
      setWireStart({ compId, termId });
    } else {
      // Don't connect pin to itself
      if (wireStart.compId === compId && wireStart.termId === termId) {
        setWireStart(null);
        return;
      }
      // Add wire
      const newWire: WireConnection = {
        id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        color: selectedWireColor,
        fromCompId: wireStart.compId,
        fromTermId: wireStart.termId,
        toCompId: compId,
        toTermId: termId,
      };
      onWiresChange([...wires, newWire]);
      setWireStart(null);
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x: rawX, y: rawY });

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingCompId) {
      const updated = components.map((c) => {
        if (c.id === draggingCompId) {
          return {
            ...c,
            x: Math.round(rawX - dragOffset.x),
            y: Math.round(rawY - dragOffset.y),
          };
        }
        return c;
      });
      onComponentsChange(updated);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey || e.target === containerRef.current) {
      // Middle click or Alt+drag or background click -> Pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingCompId(null);
  };

  // Handle component dragging start
  const handleCompMouseDown = (compId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const comp = components.find((c) => c.id === compId);
    if (!comp || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingCompId(compId);
    setDragOffset({ x: rawX - comp.x, y: rawY - comp.y });
  };

  // Delete selected wire
  const handleDeleteWire = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onWiresChange(wires.filter((w) => w.id !== id));
    if (selectedWireId === id) setSelectedWireId(null);
  };

  // Add new component from toolbox
  const handleAddComponent = (type: ComponentType) => {
    const id = `${type}-${Date.now().toString(36)}`;
    const newComp: CircuitComponent = {
      id,
      type,
      x: 350 - pan.x + (Math.random() * 60 - 30),
      y: 200 - pan.y + (Math.random() * 60 - 30),
      label:
        type === 'toggle-switch' || type === 'press-switch'
          ? 'PRESS SWITCH'
          : type.toUpperCase(),
      props:
        type === 'potentiometer'
          ? { value: 0.5 }
          : type === 'lm35'
          ? { temp: 25.0 }
          : type === 'toggle-switch' || type === 'press-switch'
          ? { closed: false }
          : {},
    };
    onComponentsChange([...components, newComp]);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col select-none">
      {/* Top Breadboard Action Toolbar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs font-mono z-20 shadow-md">
        {/* Component Add Palette */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Add:</span>
          <button
            onClick={() => handleAddComponent('led')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 flex items-center gap-1"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500"></div> LED
          </button>
          <button
            onClick={() => handleAddComponent('led-bar')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1"
            title="8-Bit Digital LED Display with Hex/Dec values (D0-D7)"
          >
            <div className="flex gap-0.5">
              <div className="w-1 h-2 rounded-sm bg-cyan-400"></div>
              <div className="w-1 h-2 rounded-sm bg-cyan-400"></div>
              <div className="w-1 h-2 rounded-sm bg-cyan-400"></div>
              <div className="w-1 h-2 rounded-sm bg-cyan-400"></div>
            </div>
            8-Bit LED
          </button>
          <button
            onClick={() => handleAddComponent('push-button')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
            title="Momentary Push Button (Active while held)"
          >
            Button
          </button>
          <button
            onClick={() => handleAddComponent('toggle-switch')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 flex items-center gap-1 font-semibold"
            title="Latching Press Switch (Click to toggle ON/OFF)"
          >
            <div className="w-2 h-2 rounded-full bg-teal-400"></div> Press Switch
          </button>
          <button
            onClick={() => handleAddComponent('seven-segment')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700"
          >
            7-Seg
          </button>
          <button
            onClick={() => handleAddComponent('lcd1602')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
            title="HD44780 16x2 LCD Display (8-Bit & 4-Bit Bus)"
          >
            LCD 16x2
          </button>
          <button
            onClick={() => handleAddComponent('keypad4x4')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1 font-semibold"
            title="4x4 Matrix Keypad (16 keys: 0-9, A-D, *, #)"
          >
            <div className="grid grid-cols-2 gap-0.5 w-2.5 h-2.5">
              <div className="bg-amber-400 rounded-[1px]"></div>
              <div className="bg-amber-400 rounded-[1px]"></div>
              <div className="bg-amber-400 rounded-[1px]"></div>
              <div className="bg-amber-400 rounded-[1px]"></div>
            </div>
            Keypad 4x4
          </button>
          <button
            onClick={() => handleAddComponent('potentiometer')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
          >
            Potentiometer
          </button>
          <button
            onClick={() => handleAddComponent('lm35')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
          >
            LM35 Temp
          </button>
          <button
            onClick={() => handleAddComponent('dc-motor')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
          >
            DC Motor
          </button>
          <button
            onClick={() => handleAddComponent('stepper-motor')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
          >
            Stepper
          </button>
          <button
            onClick={() => handleAddComponent('buzzer')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700"
          >
            Buzzer
          </button>
          <button
            onClick={() => handleAddComponent('vcc')}
            className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800"
          >
            +5V
          </button>
          <button
            onClick={() => handleAddComponent('gnd')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            GND
          </button>
        </div>

        {/* Wire Color Picker & Canvas Tools */}
        <div className="flex items-center gap-3">
          {/* Wire Color Swatches */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 mr-1">Wire:</span>
            {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#06b6d4', '#1f2937'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedWireColor(c)}
                className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                  selectedWireColor === c ? 'scale-125 ring-2 ring-white border-transparent' : 'border-slate-700'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => {
                setZoom(1.0);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Reset View"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Delete Wire button */}
          {selectedWireId && (
            <button
              onClick={(e) => handleDeleteWire(selectedWireId, e)}
              className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 flex items-center gap-1 text-[11px]"
            >
              <Trash2 size={12} /> Delete Wire
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="flex-1 relative overflow-hidden cursor-crosshair"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(51, 65, 85, 0.4) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* World container affected by Pan & Zoom */}
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* SVG Layer for Wires */}
          <svg className="absolute inset-0 w-[4000px] h-[4000px] pointer-events-none z-10">
            {/* Render all existing wires */}
            {wires.map((wire) => {
              const { d, p1, p2 } = getWirePath(wire);
              const isSelected = selectedWireId === wire.id;

              return (
                <g key={wire.id} className="pointer-events-auto cursor-pointer">
                  {/* Thick invisible path for easy clicking */}
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWireId(wire.id);
                    }}
                  />
                  {/* Visual wire path */}
                  <path
                    d={d}
                    fill="none"
                    stroke={wire.color}
                    strokeWidth={isSelected ? '4' : '2.5'}
                    strokeLinecap="round"
                    className="transition-all duration-100"
                    style={{
                      filter: isSelected ? 'drop-shadow(0 0 6px white)' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWireId(wire.id);
                    }}
                  />
                  {/* End node dots */}
                  <circle cx={p1.x} cy={p1.y} r="3" fill={wire.color} />
                  <circle cx={p2.x} cy={p2.y} r="3" fill={wire.color} />
                </g>
              );
            })}

            {/* Render in-progress wire being drawn */}
            {wireStart && (
              <path
                d={`M ${getTerminalPos(wireStart.compId, wireStart.termId).x} ${
                  getTerminalPos(wireStart.compId, wireStart.termId).y
                } L ${mousePos.x} ${mousePos.y}`}
                fill="none"
                stroke={selectedWireColor}
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Render Components */}
          {components.map((comp) => {
            const isChip = comp.type === 'atmega16';

            return (
              <div
                key={comp.id}
                onMouseDown={(e) => handleCompMouseDown(comp.id, e)}
                style={{
                  position: 'absolute',
                  left: comp.x,
                  top: comp.y,
                  cursor: isChip ? 'grab' : 'move',
                  zIndex: isChip ? 5 : 8,
                }}
              >
                {/* Delete button on hover for auxiliary components */}
                {!isChip && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComponentsChange(components.filter((c) => c.id !== comp.id));
                      onWiresChange(
                        wires.filter((w) => w.fromCompId !== comp.id && w.toCompId !== comp.id)
                      );
                    }}
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity z-30"
                    title="Remove component"
                  >
                    ×
                  </button>
                )}

                {/* Component specific visual renderer */}
                {comp.type === 'atmega16' && (
                  <Atmega16Chip
                    pinInfos={pinInfos}
                    onPinClick={(pinName, e) => handleTerminalClick('atmega16', pinName, e)}
                    selectedPin={wireStart?.compId === 'atmega16' ? wireStart.termId : null}
                    hoveredPin={hoveredPin}
                    onPinHover={setHoveredPin}
                  />
                )}

                {comp.type === 'led' && (
                  <VisualLED
                    comp={comp}
                    isLit={!!ledStates.get(comp.id)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'led-bar' && (
                  <VisualLedBar
                    comp={comp}
                    bars={ledBarStates.get(comp.id)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'push-button' && (
                  <VisualPushButton
                    comp={comp}
                    onPressChange={(pressed) => onButtonPressChange(comp.id, pressed)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {(comp.type === 'toggle-switch' || comp.type === 'press-switch') && (
                  <VisualPressSwitch
                    comp={comp}
                    onToggle={(closed) => onSwitchToggleChange && onSwitchToggleChange(comp.id, closed)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'seven-segment' && (
                  <VisualSevenSegment
                    comp={comp}
                    segments={segStates.get(comp.id)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'lcd1602' && (
                  <VisualLcd1602
                    comp={comp}
                    state={lcdStates.get(comp.id)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'potentiometer' && (
                  <VisualPotentiometer
                    comp={comp}
                    onValueChange={(val) => onPotentiometerChange(comp.id, val)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'lm35' && (
                  <VisualLM35
                    comp={comp}
                    onTempChange={(temp) => onTempChange && onTempChange(comp.id, temp)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'dc-motor' && (
                  <VisualDcMotor
                    comp={comp}
                    state={dcMotorStates.get(comp.id)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'stepper-motor' && (
                  <VisualStepperMotor
                    comp={comp}
                    state={stepperStates.get(comp.id)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'keypad4x4' && (
                  <VisualKeypad4x4
                    comp={comp}
                    onKeyPress={(key) => onKeypadPress && onKeypadPress(comp.id, key)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {comp.type === 'buzzer' && (
                  <VisualBuzzer
                    comp={comp}
                    isActive={!!buzzerActive.get(comp.id)}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}

                {(comp.type === 'vcc' || comp.type === 'gnd') && (
                  <VisualPowerRail
                    comp={comp}
                    onTerminalClick={(t, e) => handleTerminalClick(comp.id, t, e)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Helper Banner at bottom */}
      <div className="h-6 bg-slate-900 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 z-20">
        <span>
          {wireStart
            ? `Click any terminal to complete wire from ${wireStart.compId} (${wireStart.termId})`
            : 'Click any terminal (+/- or pin) to start wiring. Drag components to position.'}
        </span>
        <span>Wires: {wires.length} | Components: {components.length}</span>
      </div>
    </div>
  );
};
