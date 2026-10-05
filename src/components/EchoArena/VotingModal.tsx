import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Star, Sparkles, Award, ShieldCheck, Heart, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { DebateArgument, AnonymousRating } from '../../types';
import { audioEngine } from '../../utils/audioEngine';

interface VotingModalProps {
  argument: DebateArgument | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (argId: string, rating: AnonymousRating) => void;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  argument,
  isOpen,
  onClose,
  onSubmitRating,
}) => {
  if (!isOpen || !argument) return null;

  const [originality, setOriginality] = useState<number>(9);
  const [humor, setHumor] = useState<number>(8);
  const [intellect, setIntellect] = useState<number>(9);
  const [personaMatch, setPersonaMatch] = useState<number>(10);
  const [selectedBadge, setSelectedBadge] = useState<string>('Beyin Yakan Metafor 🤯');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const badges = [
    'Beyin Yakan Metafor 🤯',
    'Absürt ama Haklı 🎯',
    'Saf Kaos & Zeka 😂',
    'Gelecekten Gelen Fikir 🚀',
    'Kusursuz Karakter 🎭',
  ];

  // Calculate weighted average score (out of 10)
  const totalScore = Number(
    ((originality * 0.35 + humor * 0.25 + intellect * 0.25 + personaMatch * 0.15)).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rating: AnonymousRating = {
      voterHash: `anon-${Math.random().toString(36).substring(2, 9)}`,
      originality,
      humor,
      intellect,
      personaMatch,
      totalScore,
      badgeReaction: selectedBadge,
      timestamp: 'Şimdi',
    };

    onSubmitRating(argument.id, rating);
    setIsSubmitted(true);

    // Audio & Confetti burst
    audioEngine.playReactionSound('bell');
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#f59e0b', '#ec4899'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#131622] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Guarantee */}
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          <span>%100 Anonim Yaratıcılık Oylaması</span>
        </div>

        <h3 className="mt-1 font-display text-xl font-bold text-white">
          Katılımcıya Puan Ver & Rozet Tak
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          Kimliğin gizli kalır; puanların katılımcının yaratıcılık sıralamasına anında eklenir.
        </p>

        {/* Debater Argument Preview Card */}
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold shadow"
                style={{ backgroundColor: argument.authorPersona.accentColor }}
              >
                {argument.authorPersona.name.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {argument.authorPersona.name}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {argument.authorPersona.filterLabel} · Taraf {argument.side}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
              {argument.sideText}
            </span>
          </div>

          <p className="text-xs text-zinc-300 italic line-clamp-3">
            "{argument.argumentText}"
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-display text-lg font-bold text-white">Oyunuz Başarıyla Eklendi!</h4>
            <p className="text-xs text-zinc-400">
              {argument.authorPersona.name} için ortalama puan güncellendi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Criteria 1: Originality */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Özgünlük & Sıra Dışı Metafor
                </span>
                <span className="font-mono font-bold text-amber-400">{originality} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={originality}
                onChange={(e) => setOriginality(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Criteria 2: Humor */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">😂</span>
                  Mizah & Hiciv Gücü
                </span>
                <span className="font-mono font-bold text-pink-400">{humor} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={humor}
                onChange={(e) => setHumor(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-400"
              />
            </div>

            {/* Criteria 3: Intellectual Depth */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🧠</span>
                  Felsefi Zeka & İkna Kıvraklığı
                </span>
                <span className="font-mono font-bold text-cyan-400">{intellect} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={intellect}
                onChange={(e) => setIntellect(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Criteria 4: Persona & Voice Match */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🎙️</span>
                  Ses Filtresi & Karakter Uyumu
                </span>
                <span className="font-mono font-bold text-indigo-400">{personaMatch} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={personaMatch}
                onChange={(e) => setPersonaMatch(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>

            {/* Badges Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Özel Jüri Rozeti Hediye Et:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {badges.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBadge(b)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                      selectedBadge === b
                        ? 'border border-amber-400 bg-amber-400/20 text-amber-200 font-bold'
                        : 'border border-white/5 bg-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Calculated Score Banner */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3">
              <div>
                <span className="text-xs text-zinc-400 block">Hesaplanan Yaratıcılık Puanı</span>
                <span className="font-mono text-2xl font-black text-amber-400">
                  {totalScore} <span className="text-xs text-zinc-500 font-normal">/ 10</span>
                </span>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all active:scale-95"
              >
                Puanı Anonim Gönder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
