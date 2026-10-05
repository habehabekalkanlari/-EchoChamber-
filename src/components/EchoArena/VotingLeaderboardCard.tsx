import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Star, 
  Award, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Square,
  Users,
  Flame,
  Zap
} from 'lucide-react';
import { DebateArgument } from '../../types';

interface VotingLeaderboardCardProps {
  argumentsList: DebateArgument[];
  onOpenVotingModal: (arg: DebateArgument) => void;
  onRateStars: (argId: string, stars: number) => void;
  onToggleCrown: (argId: string) => void;
  onPlayAudio?: (argId: string, audioUrl: string) => void;
  currentlyPlayingId?: string | null;
}

export const VotingLeaderboardCard: React.FC<VotingLeaderboardCardProps> = ({
  argumentsList,
  onOpenVotingModal,
  onPlayAudio,
  currentlyPlayingId,
}) => {
  const [filterMode, setFilterMode] = useState<'stars' | 'crowns'>('stars');

  // Aggregated Real-time Stats
  const totalStarVotes = argumentsList.reduce((acc, curr) => acc + (curr.starCount || 0), 0);
  const totalCrownVotes = argumentsList.reduce((acc, curr) => acc + (curr.creativeCrownVotes || 0), 0);
  const totalCreativityScore = argumentsList.reduce((acc, curr) => acc + (curr.votes?.creativity || 0), 0);
  
  // Room average stars
  const overallAverageStars = argumentsList.length > 0
    ? (argumentsList.reduce((acc, curr) => acc + (curr.starRating || 4.5), 0) / argumentsList.length).toFixed(1)
    : '4.8';

  // Side A vs Side B Vote Split
  const sideAVotes = argumentsList
    .filter((a) => a.side === 'A')
    .reduce((acc, curr) => acc + (curr.starCount || 0) + (curr.creativeCrownVotes || 0), 0);
  
  const sideBVotes = argumentsList
    .filter((a) => a.side === 'B')
    .reduce((acc, curr) => acc + (curr.starCount || 0) + (curr.creativeCrownVotes || 0), 0);

  const totalSideVotes = Math.max(1, sideAVotes + sideBVotes);
  const sideAPercent = Math.round((sideAVotes / totalSideVotes) * 100);
  const sideBPercent = 100 - sideAPercent;

  // Sorted Top Arguments
  const sortedArguments = [...argumentsList].sort((a, b) => {
    if (filterMode === 'stars') {
      const starDiff = (b.starRating || 0) - (a.starRating || 0);
      if (starDiff !== 0) return starDiff;
      return (b.starCount || 0) - (a.starCount || 0);
    }
    return (b.creativeCrownVotes || 0) - (a.creativeCrownVotes || 0);
  });

  const podiumLeaders = sortedArguments.slice(0, 3);
  const champion = podiumLeaders[0];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#181528] via-[#12131e] to-[#0c0e15] p-5 sm:p-6 shadow-2xl mb-8">
      {/* Ambient background glow */}
      <div className="absolute -top-24 right-1/4 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header with Live Signal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30">
            <Trophy className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Canlı Liderlik Panosu
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gerçek Zamanlı
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Katılımcıların aldığı yıldızlar ve yaratıcılık taçları anlık olarak toplanır.
            </p>
          </div>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-black/40 border border-white/10 p-1 self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('stars')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === 'stars'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${filterMode === 'stars' ? 'fill-black' : ''}`} />
            <span>Yıldıza Göre</span>
          </button>
          <button
            onClick={() => setFilterMode('crowns')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === 'crowns'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crown className={`h-3.5 w-3.5 ${filterMode === 'crowns' ? 'fill-black' : ''}`} />
            <span>Taca Göre</span>
          </button>
        </div>
      </div>

      {/* Real-time Metric Aggregates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              Toplam Yıldız Oyu
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-amber-400">
            {totalStarVotes}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Dinamik Jüri Puanı</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1">
              <Crown className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              Taçlandırma Oyu
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-amber-300">
            {totalCrownVotes}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">"En Yaratıcı" Seçimleri</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              Oda Kalite Ortalaması
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-pink-400">
            ★ {overallAverageStars} <span className="text-xs text-zinc-500 font-normal">/ 5.0</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Yaratıcılık Endeksi</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              Kreatif Skor Havuzu
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-cyan-400">
            {totalCreativityScore}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Retorik Puanı Toplamı</span>
        </div>
      </div>

      {/* Side Dominance Race Bar */}
      <div className="rounded-2xl border border-white/5 bg-black/40 p-4 mb-6">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="flex items-center gap-1.5 text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Taraf A Üstünlüğü: %{sideAPercent}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">Canlı Taraf Dengesi</span>
          <span className="flex items-center gap-1.5 text-rose-300">
            Taraf B Üstünlüğü: %{sideBPercent}
            <span className="h-2 w-2 rounded-full bg-rose-400" />
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${sideAPercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
            style={{ width: `${sideBPercent}%` }}
          />
        </div>
      </div>

      {/* Podium Showcase: Top 3 Highest-Rated Arguments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Crown className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>Kürsüdeki En Yaratıcı 3 Argüman</span>
          </h4>
          <span className="text-[11px] text-zinc-400">Canlı Oy Sıralaması</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {podiumLeaders.map((arg, idx) => {
            const isFirst = idx === 0;
            const medals = ['🥇', '🥈', '🥉'];
            const rankTitles = ['Oda Şampiyonu', '2. Sıra', '3. Sıra'];
            const cardBorders = [
              'border-amber-400/60 bg-gradient-to-b from-[#241c18] to-[#141224] shadow-amber-500/10 ring-1 ring-amber-400/30',
              'border-slate-400/30 bg-gradient-to-b from-[#181924] to-[#12131e]',
              'border-amber-700/30 bg-gradient-to-b from-[#1e1518] to-[#12131e]',
            ];

            return (
              <div
                key={arg.id}
                className={`relative rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                  cardBorders[idx] || 'border-white/10 bg-[#12131e]'
                }`}
              >
                <div>
                  {/* Rank Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{medals[idx]}</span>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {rankTitles[idx]}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Taraf {arg.side} · {arg.sideText}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 font-mono text-sm font-black text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{arg.starRating?.toFixed(1) || '4.8'}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {arg.starCount || 10} oy
                      </span>
                    </div>
                  </div>

                  {/* Debater Info */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold shadow"
                      style={{ backgroundColor: arg.authorPersona.accentColor }}
                    >
                      {arg.authorPersona.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-zinc-200">
                      {arg.authorPersona.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ({arg.authorPersona.filterLabel})
                    </span>
                  </div>

                  {/* Quote Snippet */}
                  <p className="text-xs text-zinc-300 italic line-clamp-2 mb-3">
                    "{arg.argumentText}"
                  </p>
                </div>

                <div>
                  {/* Badges / Crown counter */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mb-3">
                    <div className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold">
                      <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{arg.creativeCrownVotes || 0} Taç</span>
                    </div>

                    {arg.audioUrl && onPlayAudio && (
                      <button
                        onClick={() => onPlayAudio(arg.id, arg.audioUrl!)}
                        className="flex items-center gap-1 rounded-md bg-white/5 hover:bg-white/10 px-2 py-1 text-[10px] font-semibold text-cyan-300 transition-colors"
                      >
                        {currentlyPlayingId === arg.id ? (
                          <Square className="h-2.5 w-2.5" />
                        ) : (
                          <Play className="h-2.5 w-2.5" />
                        )}
                        <span>{currentlyPlayingId === arg.id ? 'Durdur' : 'Dinle'}</span>
                      </button>
                    )}
                  </div>

                  {/* Vote Button */}
                  <button
                    onClick={() => onOpenVotingModal(arg)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 py-2 text-xs font-bold text-white transition-colors active:scale-95"
                  >
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>Bu Argümana Puan Ver</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
