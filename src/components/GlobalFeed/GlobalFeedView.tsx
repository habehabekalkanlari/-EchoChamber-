import React, { useState } from 'react';
import { Radio, Sparkles, Play, Square, ThumbsUp, MapPin, MessageSquare, Volume2 } from 'lucide-react';
import { INITIAL_ARGUMENTS, PAST_DEJAVU_FEED } from '../../data/presets';
import { DebateArgument } from '../../types';

interface GlobalFeedViewProps {
  onGoToArena: () => void;
  onGoToDejaVu: () => void;
}

export const GlobalFeedView: React.FC<GlobalFeedViewProps> = ({
  onGoToArena,
  onGoToDejaVu,
}) => {
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'arguments' | 'dejavu'>('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null);

  const handlePlayAudio = (id: string, url?: string) => {
    if (!url) return;
    if (currentlyPlaying === id && activeAudioObj) {
      activeAudioObj.pause();
      setCurrentlyPlaying(null);
      return;
    }
    if (activeAudioObj) {
      activeAudioObj.pause();
    }
    const audio = new Audio(url);
    setActiveAudioObj(audio);
    setCurrentlyPlaying(id);
    audio.play();
    audio.onended = () => {
      setCurrentlyPlaying(null);
    };
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase">
            <span>EchoChamber & Deja-Vu</span>
            <span>·</span>
            <span>Z Kuşağı Sosyal Laboratuvarı</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-white">
            Canlı Topluluk Akışı
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Modüle edilmiş sesli argümanlar ve dünyanın dört bir yanından senkronize Deja-Vu anları.
          </p>
        </div>

        {/* Feed tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#131620] p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveFeedTab('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeFeedTab === 'all'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tüm Akış
          </button>
          <button
            onClick={() => setActiveFeedTab('arguments')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeFeedTab === 'arguments'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sesli Argümanlar
          </button>
          <button
            onClick={() => setActiveFeedTab('dejavu')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeFeedTab === 'dejavu'
                ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Deja-Vu Anları
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Render Arguments */}
        {(activeFeedTab === 'all' || activeFeedTab === 'arguments') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Radio className="h-4 w-4" />
                Öne Çıkan Sesli Argümanlar
              </span>
              <button
                onClick={onGoToArena}
                className="text-cyan-400 hover:underline text-xs"
              >
                Arenaya Katıl →
              </button>
            </div>

            {INITIAL_ARGUMENTS.map((arg) => (
              <div
                key={arg.id}
                className="rounded-2xl border border-white/10 bg-[#131620] p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shadow"
                      style={{ backgroundColor: arg.authorPersona.accentColor }}
                    >
                      {arg.authorPersona.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {arg.authorPersona.name}
                        </span>
                        <span className="text-[10px] rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-zinc-400">
                          {arg.authorPersona.filterLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {arg.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 px-2 py-0.5 rounded">
                    Taraf {arg.side}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  "{arg.argumentText}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span>💡 {arg.votes.creativity} Yaratıcı</span>
                    <span>😂 {arg.votes.humor} Mizahi</span>
                    <span>🎯 {arg.votes.persuasion} İkna</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">Ses Korumalı</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render Deja-Vu Feed */}
        {(activeFeedTab === 'all' || activeFeedTab === 'dejavu') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Sparkles className="h-4 w-4" />
                Senkronize Deja-Vu Patlamaları
              </span>
              <button
                onClick={onGoToDejaVu}
                className="text-purple-400 hover:underline text-xs"
              >
                Yeni Eşleşme Başlat →
              </button>
            </div>

            {PAST_DEJAVU_FEED.map((dj) => (
              <div
                key={dj.id}
                className="rounded-2xl border border-purple-500/20 bg-[#141224] p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{dj.actionText}</span>
                  <span className="font-mono text-[10px] text-purple-400 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded">
                    %{dj.score} Senkron
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={dj.imageA}
                      alt={dj.userCity}
                      referrerPolicy="no-referrer"
                      className="aspect-video w-full object-cover"
                    />
                    <div className="p-2 text-center text-xs font-medium text-zinc-300">
                      {dj.userCity}
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-black/40">
                    <img
                      src={dj.imageB}
                      alt={dj.partnerCity}
                      referrerPolicy="no-referrer"
                      className="aspect-video w-full object-cover"
                    />
                    <div className="p-2 text-center text-xs font-medium text-purple-300">
                      {dj.partnerCity}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 italic">
                  "{dj.snippet}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
