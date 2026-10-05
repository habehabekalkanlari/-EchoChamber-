import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface VoiceVisualizerProps {
  isActive: boolean;
  color?: string; // hex or rgb
  height?: number;
  barCount?: number;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isActive,
  color = '#06b6d4',
  height = 54,
  barCount = 32,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const freqData = isActive ? audioEngine.getFrequencyData() : new Uint8Array(barCount);
      const barWidth = width / barCount;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        let val = freqData[i] || 0;
        
        // If inactive or quiet, show subtle idle harmonic wave
        if (!isActive || val < 10) {
          const idleWave = Math.sin(phase + i * 0.25) * 0.5 + 0.5;
          val = 15 + idleWave * 20;
        }

        const barH = Math.max(4, (val / 255) * (h - 8));
        const x = i * barWidth;
        const y = (h - barH) / 2; // Center-aligned waveform

        // Gradient for sleek cyber look
        const gradient = ctx.createLinearGradient(0, y, 0, y + barH);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}44`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + gap / 2, y, barWidth - gap, barH, 2);
        ctx.fill();
      }

      phase += 0.04;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, color, barCount]);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden rounded-lg bg-black/40 border border-white/5 px-2 py-1">
      <canvas
        ref={canvasRef}
        width={360}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
