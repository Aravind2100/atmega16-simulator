import React, { useRef, useEffect, useState } from 'react';
import { AtmegaPinInfo } from '../types.ts';

interface LogicAnalyzerProps {
  pinInfos: AtmegaPinInfo[];
  cycles: number;
}

export const LogicAnalyzer: React.FC<LogicAnalyzerProps> = ({ pinInfos, cycles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 4 selectable channels
  const [channels, setChannels] = useState<string[]>(['PA0', 'PB0', 'PD0', 'PD5']);
  // Signal history buffer for each channel
  const historyRef = useRef<Map<string, number[]>>(new Map());

  // Record history on cycle updates
  useEffect(() => {
    const pinMap = new Map<string, AtmegaPinInfo>();
    for (const p of pinInfos) {
      pinMap.set(p.name, p);
    }

    const maxSamples = 200;
    for (const ch of channels) {
      if (!historyRef.current.has(ch)) {
        historyRef.current.set(ch, new Array(maxSamples).fill(0));
      }
      const buf = historyRef.current.get(ch)!;
      const p = pinMap.get(ch);
      const val = p ? (p.voltage >= 2.5 ? 1 : 0) : 0;
      buf.push(val);
      if (buf.length > maxSamples) {
        buf.shift();
      }
    }

    // Render Waveforms
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const channelHeight = height / channels.length;
    const chColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'];

    channels.forEach((ch, idx) => {
      const buf = historyRef.current.get(ch) || [];
      const yBase = (idx + 1) * channelHeight - 8;
      const yHigh = yBase - (channelHeight - 16);
      const color = chColors[idx % chColors.length];

      // Channel Baseline
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      ctx.lineTo(width, yBase);
      ctx.stroke();

      // Waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = width / (maxSamples - 1);
      for (let i = 0; i < buf.length; i++) {
        const x = i * step;
        const y = buf[i] === 1 ? yHigh : yBase;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Digital step
          const prevY = buf[i - 1] === 1 ? yHigh : yBase;
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Channel Label
      ctx.fillStyle = color;
      ctx.font = '10px monospace';
      ctx.fillText(`CH${idx + 1}: ${ch}`, 8, yHigh + 10);
    });
  }, [cycles, pinInfos, channels]);

  return (
    <div className="flex flex-col h-full bg-slate-950 p-2 font-mono text-xs">
      <div className="flex justify-between items-center mb-1.5 px-1">
        <span className="font-bold text-slate-300">Logic Analyzer / Signal Waveforms</span>
        {/* Channel Pin Selectors */}
        <div className="flex gap-2">
          {channels.map((ch, idx) => (
            <select
              key={idx}
              value={ch}
              onChange={(e) => {
                const next = [...channels];
                next[idx] = e.target.value;
                setChannels(next);
              }}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200"
            >
              {pinInfos
                .filter((p) => p.port)
                .map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
            </select>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={130}
        className="w-full h-full rounded border border-slate-800 shadow-inner"
      />
    </div>
  );
};
