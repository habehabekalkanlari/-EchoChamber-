import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  RotateCcw, 
  Check, 
  Radio, 
  Info,
  Sparkles,
  Cpu,
  Orbit,
  Headphones
} from 'lucide-react';
import { VoiceFilterType, PersonaProfile } from '../../types';
import { VOICE_FILTERS, PRESET_PERSONAS } from '../../data/presets';
import { audioEngine } from '../../utils/audioEngine';
import { VoiceVisualizer } from '../VoiceVisualizer';

interface VoiceStudioViewProps {
  currentFilter: VoiceFilterType;
  onSelectFilter: (filter: VoiceFilterType) => void;
  activePersona: PersonaProfile;
  onUpdatePersona: (persona: PersonaProfile) => void;
  isMicActive: boolean;
  onToggleMic: () => void;
}

export const VoiceStudioView: React.FC<VoiceStudioViewProps> = ({
  currentFilter,
  onSelectFilter,
  activePersona,
  onUpdatePersona,
  isMicActive,
  onToggleMic,
}) => {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Monitor toggle
  const handleToggleMonitor = () => {
    const nextState = !isMonitoring;
    setIsMonitoring(nextState);
    audioEngine.setMonitoring(nextState);
  };

  // Start test recording
  const handleStartRecord = async () => {
    try {
      if (!isMicActive) {
        await onToggleMic();
      }
      setRecordedAudioUrl(null);
      await audioEngine.startRecording();
      setIsRecording(true);
      setRecordTimer(0);
    } catch (err) {
      console.error('Record error:', err);
    }
  };

  // Stop test recording
  const handleStopRecord = async () => {
    try {
      setIsRecording(false);
      const url = await audioEngine.stopRecording();
      if (url) {
        setRecordedAudioUrl(url);
      }
    } catch (err) {
      console.error('Stop record error:', err);
    }
  };

  // Timer while recording (max 12 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTimer((prev) => {
          if (prev >= 11) {
            handleStopRecord();
            return 12;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Audio playback handler
  const handlePlayRecording = () => {
    if (!recordedAudioUrl) return;
    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlayingAudio(false);
      return;
    }

    const audio = new Audio(recordedAudioUrl);
    setAudioElement(audio);
    setIsPlayingAudio(true);
    audio.play();
    audio.onended = () => {
      setIsPlayingAudio(false);
    };
  };

  const selectedDef = VOICE_FILTERS.find((f) => f.type === currentFilter) || VOICE_FILTERS[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Studio Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
          <span>Web Audio DSP Engine</span>
          <span>·</span>
          <span>Sıfır Gecikmeli Ses Modülasyonu</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ses Karakter Değiştirme Stüdyosu
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400 leading-relaxed">
          EchoChamber arenasında kimse kimsenin gerçek sesini bilmez. Sesini anlık olarak robotik bir yapay zekaya,
          eski bir dedektif dış sesine ya da komik bir helyum gremlinine dönüştür; test et ve arenaya hazır ol.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Filter Selector Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">
              Karakter Ses Filtreleri ({VOICE_FILTERS.length})
            </h2>
            <span className="text-xs text-zinc-500">Seçili: {selectedDef.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VOICE_FILTERS.map((filter) => {
              const isSelected = filter.type === currentFilter;
              return (
                <button
                  key={filter.type}
                  onClick={() => {
                    onSelectFilter(filter.type);
                    audioEngine.applyFilter(filter.type);
                  }}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? `${filter.color} border-current shadow-lg shadow-black/40`
                      : 'border-white/10 bg-[#131620] hover:border-white/20 hover:bg-[#181d2a]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold tracking-wider text-zinc-400 group-hover:text-zinc-300">
                        {filter.badge}
                      </span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="mt-2 font-display text-lg font-bold text-white">
                      {filter.name}
                    </div>
                    <div className="text-xs font-medium text-zinc-400 mt-0.5">
                      {filter.tagline}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                    {filter.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Persona Mapping Quick Preset */}
          <div className="rounded-xl border border-white/10 bg-[#12151f] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-zinc-300">
                Hazır Anonim Personalar (Hızlı Karakter Seçimi)
              </h3>
              <span className="text-[11px] text-zinc-500">Profilini özelleştir</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRESET_PERSONAS.map((persona) => {
                const isCurrent = activePersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      onUpdatePersona(persona);
                      onSelectFilter(persona.filterType);
                      audioEngine.applyFilter(persona.filterType);
                    }}
                    className={`flex flex-col items-center rounded-lg border p-3 text-center transition-all ${
                      isCurrent
                        ? 'border-cyan-500/50 bg-cyan-950/30'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                    }`}
                  >
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2 shadow"
                      style={{ backgroundColor: persona.accentColor }}
                    >
                      {persona.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-zinc-200 truncate w-full">{persona.name}</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 truncate w-full">{persona.filterLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Audio Test Bench & Oscilloscope */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#131620] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-500">Ses Laboratuvarı</span>
                <h3 className="font-display text-lg font-bold text-white">Canlı Frekans & Test</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    isMicActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'
                  }`}
                />
                <span className="text-xs font-mono text-zinc-400">
                  {isMicActive ? 'GİRİŞ AKTİF' : 'BEKLEMEDE'}
                </span>
              </div>
            </div>

            {/* Oscilloscope Waveform */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Ses Spektrumu</span>
                <span className="font-mono text-cyan-400">{selectedDef.badge}</span>
              </div>
              <VoiceVisualizer isActive={isMicActive} height={64} barCount={40} />
            </div>

            {/* Mic & Monitor Controls */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={onToggleMic}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold tracking-wide transition-all ${
                  isMicActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-cyan-500 text-black font-extrabold hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                }`}
              >
                {isMicActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMicActive ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
              </button>

              <button
                onClick={handleToggleMonitor}
                disabled={!isMicActive}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold tracking-wide border transition-all ${
                  !isMicActive
                    ? 'opacity-40 border-white/5 bg-white/5 text-zinc-500 cursor-not-allowed'
                    : isMonitoring
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {isMonitoring ? <Headphones className="h-4 w-4 text-amber-400" /> : <Volume2 className="h-4 w-4" />}
                {isMonitoring ? 'Monitör Açık' : 'Kendi Sesini Duy'}
              </button>
            </div>

            {/* Headphone Advisory Note */}
            {isMonitoring && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-950/20 border border-amber-500/30 p-2.5 text-[11px] text-amber-200/90">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Kulaklık takmanız önerilir. Hoparlör yankılanmasını önlemek için ses seviyesini dengeli tutun.
                </span>
              </div>
            )}

            {/* Test Snippet Recording Box */}
            <div className="mt-6 rounded-xl border border-white/5 bg-black/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-300">10 Saniyelik Test Kaydı</span>
                {isRecording && (
                  <span className="flex items-center gap-1.5 font-mono text-xs text-rose-400 animate-pulse font-bold">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    00:{recordTimer < 10 ? `0${recordTimer}` : recordTimer} / 00:12
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecord}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 py-2.5 text-xs font-medium text-zinc-200 transition-colors"
                  >
                    <Mic className="h-3.5 w-3.5 text-cyan-400" />
                    Kayıt Al & Modülasyonu Dene
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecord}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    <Square className="h-3.5 w-3.5" />
                    Kaydı Bitir
                  </button>
                )}

                {recordedAudioUrl && !isRecording && (
                  <button
                    onClick={handlePlayRecording}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 px-4 py-2.5 text-xs font-semibold transition-all"
                  >
                    {isPlayingAudio ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {isPlayingAudio ? 'Durdur' : 'Dinle'}
                  </button>
                )}
              </div>

              {recordedAudioUrl && (
                <p className="mt-2.5 text-[11px] text-zinc-400 text-center">
                  Modüle edilmiş ses kaydın hazır! Arenada argüman sunarken bu ses karakteriyle konuşacaksın.
                </p>
              )}
            </div>

            {/* Technical DSP Breakdown */}
            <div className="mt-5 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-400 space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">DSP Filter:</span>
                <span className="text-zinc-300">{selectedDef.name}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Audio Pipeline:</span>
                <span className="text-cyan-400">Mic → Biquad → Shaper → Analyser</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Anonimlik Durumu:</span>
                <span className="text-emerald-400 font-semibold">%100 Biyometrik Koruma</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
