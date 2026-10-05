import React, { useState, useEffect, useRef } from 'react';
import { Flame, Zap, Activity, Volume2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface DebateTensionMeterProps {
  isMicActive: boolean;
  activeSide: 'A' | 'B';
  argumentsCount: number;
}

export const DebateTensionMeter: React.FC<DebateTensionMeterProps> = ({
  isMicActive,
  activeSide,
  argumentsCount,
}) => {
  const [tensionLevel, setTensionLevel] = useState<number>(48); // 0 - 100
  const [acousticDecibels, setAcousticDecibels] = useState<number>(38);
  const [tensionState, setTensionState] = useState<{
    label: string;
    color: string;
    bgBadge: string;
    borderBadge: string;
    icon: string;
  }>({
    label: 'Kızışan Fikir Çatışması',
    color: 'text-amber-400',
    bgBadge: 'bg-amber-950/40',
    borderBadge: 'border-amber-500/30',
    icon: '⚡',
  });

  const animFrameRef = useRef<number | null>(null);
  const smoothedTensionRef = useRef<number>(48);

  useEffect(() => {
    // Base ambient room tension based on arguments count
    const baseRoomTension = Math.min(65, 40 + argumentsCount * 2.5);

    const updateMeter = () => {
      let targetTension = baseRoomTension;
      let calculatedDb = 35;

      if (isMicActive) {
        const freqData = audioEngine.getFrequencyData();
        if (freqData && freqData.length > 0) {
          // Average volume from FFT
          let sum = 0;
          for (let i = 0; i < freqData.length; i++) {
            sum += freqData[i];
          }
          const avgAmp = sum / freqData.length;
          
          // Map amplitude (0-255) to dynamic tension boost
          const voiceBoost = (avgAmp / 255) * 60;
          targetTension = Math.min(100, baseRoomTension + voiceBoost + (avgAmp > 40 ? 15 : 0));
          calculatedDb = Math.round(35 + (avgAmp / 255) * 55);
        }
      } else {
        // Natural gentle organic oscillation when mic is idle
        const time = Date.now() / 1500;
        targetTension = baseRoomTension + Math.sin(time) * 4;
      }

      // Smooth lerp for visual elegance
      smoothedTensionRef.current += (targetTension - smoothedTensionRef.current) * 0.12;
      const current = Math.round(smoothedTensionRef.current);
      setTensionLevel(current);
      setAcousticDecibels(calculatedDb);

      // Categorize Tension State
      if (current < 35) {
        setTensionState({
          label: 'Sakin Felsefi Diyalog',
          color: 'text-cyan-400',
          bgBadge: 'bg-cyan-950/40',
          borderBadge: 'border-cyan-500/30',
          icon: '🧘‍♂️',
        });
      } else if (current < 65) {
        setTensionState({
          label: 'Kızışan Fikir Çatışması',
          color: 'text-amber-400',
          bgBadge: 'bg-amber-950/40',
          borderBadge: 'border-amber-500/30',
          icon: '⚡',
        });
      } else if (current < 85) {
        setTensionState({
          label: 'Yüksek Retorik Tansiyonu',
          color: 'text-orange-400',
          bgBadge: 'bg-orange-950/40',
          borderBadge: 'border-orange-500/30',
          icon: '🔥',
        });
      } else {
        setTensionState({
          label: 'Kritik Zirve & Saf Kaos!',
          color: 'text-rose-400',
          bgBadge: 'bg-rose-950/40',
          borderBadge: 'border-rose-500/30',
          icon: '💥',
        });
      }

      animFrameRef.current = requestAnimationFrame(updateMeter);
    };

    animFrameRef.current = requestAnimationFrame(updateMeter);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isMicActive, argumentsCount]);

  // Color gradient for the bar based on tension
  const getGradientByTension = (level: number) => {
    if (level < 35) return 'from-cyan-500 to-blue-500 shadow-cyan-500/30';
    if (level < 65) return 'from-cyan-400 via-amber-400 to-amber-500 shadow-amber-500/30';
    if (level < 85) return 'from-amber-400 via-orange-500 to-rose-500 shadow-orange-500/30';
    return 'from-orange-500 via-rose-500 to-red-600 shadow-rose-500/40 animate-pulse';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121420] p-4 sm:p-5 shadow-xl mb-6">
      {/* Background audio flame glow if high tension */}
      {tensionLevel > 70 && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-red-500/10 pointer-events-none animate-pulse" />
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${tensionState.bgBadge} border ${tensionState.borderBadge}`}>
            <Activity className={`h-4 w-4 ${tensionState.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-white tracking-wide">
                Tartışma Tansiyonu & Heyecan Seviyesi
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${tensionState.bgBadge} ${tensionState.borderBadge} ${tensionState.color}`}>
                <span>{tensionState.icon}</span>
                <span>{tensionState.label}</span>
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 block mt-0.5">
              {isMicActive
                ? `Canlı mikrofon girişi işleniyor (${activeSide === 'A' ? 'Taraf A' : 'Taraf B'} konuşuyor)`
                : 'Oda genelindeki argüman ve ses dinleme ritmine göre ölçülüyor'}
            </span>
          </div>
        </div>

        {/* Real-time Decibel & Score Metric */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/40 border border-white/5 px-2.5 py-1 text-xs font-mono">
            <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-400">Akustik:</span>
            <span className="font-bold text-white">{acousticDecibels} dB</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-base font-black">
            <span className={tensionState.color}>%{tensionLevel}</span>
            <span className="text-[10px] text-zinc-500 font-normal">Tansiyon</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Segment Glowing Tension Meter Bar */}
      <div className="relative">
        {/* Track Bar */}
        <div className="relative h-4 w-full rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5 shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getGradientByTension(
              tensionLevel
            )} transition-all duration-150 ease-out shadow-lg`}
            style={{ width: `${tensionLevel}%` }}
          />

          {/* Segment ticks overlay */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
            {[20, 40, 60, 80].map((tick) => (
              <div key={tick} className="w-0.5 h-full bg-black/50" />
            ))}
          </div>
        </div>

        {/* Dynamic Scale Markers */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1.5 px-0.5">
          <span className="text-cyan-400/80">Sakin (%0)</span>
          <span className="text-amber-400/80">Dengeli (%50)</span>
          <span className="text-orange-400/80">Kızışma (%75)</span>
          <span className="text-rose-400/80">Kritik Zirve (%100)</span>
        </div>
      </div>

      {/* Voice Activity Warning Banner if mic is hot */}
      {isMicActive && tensionLevel > 75 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs text-rose-200 animate-in fade-in">
          <Flame className="h-3.5 w-3.5 text-rose-400 animate-bounce" />
          <span className="font-semibold">
            Kürsü hararetlendi! Yüksek ses modülasyonu tartışmanın heyecanını zirveye taşıdı.
          </span>
        </div>
      )}
    </div>
  );
};
