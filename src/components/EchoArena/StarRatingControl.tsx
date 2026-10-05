import React, { useState } from 'react';
import { Star, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../../utils/audioEngine';

interface StarRatingControlProps {
  argId: string;
  currentStars: number;
  totalStarCount: number;
  userGivenStars?: number;
  creativeCrownVotes: number;
  isChosenAsMostCreativeByMe?: boolean;
  onRateStars: (argId: string, stars: number) => void;
  onToggleCrown: (argId: string) => void;
}

interface FloatingScoreParticle {
  id: number;
  text: string;
  stars: number;
}

export const StarRatingControl: React.FC<StarRatingControlProps> = ({
  argId,
  currentStars,
  totalStarCount,
  userGivenStars,
  creativeCrownVotes,
  isChosenAsMostCreativeByMe,
  onRateStars,
  onToggleCrown,
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isGlowing, setIsGlowing] = useState<boolean>(false);
  const [floatingParticles, setFloatingParticles] = useState<FloatingScoreParticle[]>([]);

  const handleStarClick = (starIndex: number) => {
    onRateStars(argId, starIndex);
    audioEngine.playReactionSound('bell');

    // Trigger visual glow & rising animation
    setIsGlowing(true);
    const newParticleId = Date.now() + Math.random();
    const texts = [
      `+${starIndex}★ Harika Puan!`,
      `+${starIndex}★ Yaratıcı Kıvılcım!`,
      `+${starIndex}★ Yüksek Zeka!`,
      `+${starIndex}★ Saf Retorik!`,
    ];
    const chosenText = texts[starIndex - 1] || `+${starIndex}★`;

    setFloatingParticles((prev) => [
      ...prev,
      { id: newParticleId, text: chosenText, stars: starIndex },
    ]);

    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 20]);
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      setIsGlowing(false);
    }, 1200);

    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newParticleId));
    }, 1400);
  };

  const handleCrownClick = () => {
    onToggleCrown(argId);
    if (!isChosenAsMostCreativeByMe) {
      audioEngine.playReactionSound('applause');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#ec4899', '#06b6d4'],
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 mt-3 transition-all duration-300 ${
        isGlowing
          ? 'border-amber-400/80 bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50 animate-golden-glow'
          : 'border-white/5 bg-black/30'
      }`}
    >
      {/* Expanding Ping Wave during voting */}
      {isGlowing && (
        <div className="absolute inset-0 rounded-xl bg-amber-400/15 animate-ping pointer-events-none" />
      )}

      {/* Floating Rising Score Badges ("Yükselme" Animasyonu) */}
      <div className="absolute -top-3 left-8 pointer-events-none z-20 flex flex-col items-center">
        {floatingParticles.map((particle) => (
          <div
            key={particle.id}
            className="animate-rise-fade flex items-center gap-1 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-black text-black shadow-lg shadow-amber-500/40"
          >
            <Sparkles className="h-3 w-3 fill-black text-black animate-spin" />
            <span>{particle.text}</span>
          </div>
        ))}
      </div>

      {/* 5-Star Interactive Rating */}
      <div className="flex items-center gap-2 relative z-10">
        <span className="text-[11px] font-semibold text-zinc-400">Yıldız Puanı:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled =
              (hoveredStar !== null
                ? hoveredStar
                : userGivenStars || Math.round(currentStars)) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => handleStarClick(star)}
                className="p-0.5 text-zinc-600 hover:scale-130 transition-transform focus:outline-none active:scale-90"
                title={`${star} Yıldız Ver`}
              >
                <Star
                  className={`h-4 w-4 transition-all duration-200 ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-105'
                      : 'text-zinc-600 hover:text-amber-300'
                  } ${isGlowing && isFilled ? 'animate-pulse' : ''}`}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 ml-1">
          <span className={`font-bold transition-colors ${isGlowing ? 'text-amber-300 scale-110' : 'text-amber-400'}`}>
            {currentStars.toFixed(1)}
          </span>
          <span className="text-zinc-500">({totalStarCount} oy)</span>
          {userGivenStars && (
            <span className="ml-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.2 rounded transition-all">
              Puanınız: {userGivenStars}★
            </span>
          )}
        </div>
      </div>

      {/* 'En Yaratıcı Argümanı Seç' Crown Action Button */}
      <button
        type="button"
        onClick={handleCrownClick}
        className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
          isChosenAsMostCreativeByMe
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50'
            : 'border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30'
        }`}
        title="Bu argümanı odanın en yaratıcı argümanı olarak taçlandır"
      >
        <Crown
          className={`h-3.5 w-3.5 ${
            isChosenAsMostCreativeByMe ? 'fill-black text-black' : 'text-amber-400'
          }`}
        />
        <span>
          {isChosenAsMostCreativeByMe ? 'En Yaratıcı Seçiminiz' : 'En Yaratıcı Argümanı Seç'}
        </span>
        <span
          className={`text-[10px] font-mono ml-0.5 px-1.5 py-0.2 rounded-full ${
            isChosenAsMostCreativeByMe ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-200'
          }`}
        >
          {creativeCrownVotes}
        </span>
      </button>
    </div>
  );
};

