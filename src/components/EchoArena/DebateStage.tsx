import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Sparkles, 
  Volume2, 
  Flame, 
  ThumbsUp, 
  Award, 
  Bot, 
  MessageSquare, 
  Send,
  Radio,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Crown
} from 'lucide-react';
import { Dilemma, DebateArgument, PersonaProfile, JudgeVerdict, VoiceFilterType, AnonymousRating } from '../../types';
import { SOUND_REACTIONS, PRESET_PERSONAS, VOICE_FILTERS } from '../../data/presets';
import { audioEngine } from '../../utils/audioEngine';
import { VoiceVisualizer } from '../VoiceVisualizer';
import { VotingModal } from './VotingModal';
import { StarRatingControl } from './StarRatingControl';
import { VotingLeaderboardCard } from './VotingLeaderboardCard';
import { DebateTensionMeter } from './DebateTensionMeter';

interface DebateStageProps {
  dilemma: Dilemma;
  onBack: () => void;
  activePersona: PersonaProfile;
  isMicActive: boolean;
  onToggleMic: () => void;
}

export const DebateStage: React.FC<DebateStageProps> = ({
  dilemma,
  onBack,
  activePersona,
  isMicActive,
  onToggleMic,
}) => {
  const [argumentsList, setArgumentsList] = useState<DebateArgument[]>([
    {
      id: 'arg-demo-1',
      dilemmaId: dilemma.id,
      authorPersona: PRESET_PERSONAS[0],
      side: 'A',
      sideText: dilemma.stanceA,
      argumentText: 'Makineler rasyonel mantığı çözdü. Eğer felsefe yapmaya da başlarlarsa kendi yaratıcılarını sorgularlar. Bırakın makineler kahvemizi yapsın, felsefe yapmayı tamamen yasaklayalım!',
      timestamp: '2 dk önce',
      votes: { creativity: 91, humor: 84, persuasion: 78 },
      averageScore: 9.3,
      starRating: 4.8,
      starCount: 19,
      creativeCrownVotes: 8,
      isChosenAsMostCreativeByMe: false,
      ratings: [
        {
          voterHash: 'anon-1',
          originality: 9,
          humor: 9,
          intellect: 10,
          personaMatch: 10,
          totalScore: 9.3,
          badgeReaction: 'Beyin Yakan Metafor 🤯',
          timestamp: '2 dk önce',
        },
      ],
      badges: {
        'Beyin Yakan Metafor 🤯': 4,
        'Absürt ama Haklı 🎯': 2,
      },
    },
    {
      id: 'arg-demo-2',
      dilemmaId: dilemma.id,
      authorPersona: PRESET_PERSONAS[1],
      side: 'B',
      sideText: dilemma.stanceB,
      argumentText: 'Tembellik bir lüks değil, insan türünün paslanmasıdır. Robotlar iş yaparken insan boş kalırsa kendi varoluşunu tüketir. Asıl yasaklanması gereken şey amaçsız boşluktur.',
      timestamp: '5 dk önce',
      votes: { creativity: 94, humor: 79, persuasion: 92 },
      averageScore: 9.6,
      starRating: 4.9,
      starCount: 27,
      creativeCrownVotes: 14,
      isChosenAsMostCreativeByMe: true,
      ratings: [
        {
          voterHash: 'anon-2',
          originality: 10,
          humor: 8,
          intellect: 10,
          personaMatch: 10,
          totalScore: 9.6,
          badgeReaction: 'Kusursuz Karakter 🎭',
          timestamp: '5 dk önce',
        },
      ],
      badges: {
        'Kusursuz Karakter 🎭': 5,
        'Gelecekten Gelen Fikir 🚀': 3,
      },
    },
  ]);

  // Voting states
  const [selectedArgForVoting, setSelectedArgForVoting] = useState<DebateArgument | null>(null);
  const [isVotingModalOpen, setIsVotingModalOpen] = useState<boolean>(false);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'leaderboard'>('all');

  // Quick 1-5 Star Rating Handler
  const handleRateStars = (argId: string, stars: number) => {
    setArgumentsList((prev) =>
      prev.map((arg) => {
        if (arg.id === argId) {
          const oldCount = arg.starCount || 0;
          const oldAvg = arg.starRating || 5;
          const hadPreviousVote = !!arg.userGivenStars;
          const newCount = hadPreviousVote ? oldCount : oldCount + 1;
          const newAvg = hadPreviousVote
            ? Number(((oldAvg * oldCount - (arg.userGivenStars || 0) + stars) / newCount).toFixed(1))
            : Number(((oldAvg * oldCount + stars) / newCount).toFixed(1));

          return {
            ...arg,
            starRating: newAvg,
            starCount: newCount,
            userGivenStars: stars,
            hasVoted: true,
          };
        }
        return arg;
      })
    );
  };

  // 'En Yaratıcı Argümanı Seç' Crown Handler
  const handleToggleCrown = (argId: string) => {
    setArgumentsList((prev) =>
      prev.map((arg) => {
        if (arg.id === argId) {
          const isCurrentlyChosen = !!arg.isChosenAsMostCreativeByMe;
          return {
            ...arg,
            isChosenAsMostCreativeByMe: !isCurrentlyChosen,
            creativeCrownVotes: Math.max(0, (arg.creativeCrownVotes || 0) + (isCurrentlyChosen ? -1 : 1)),
          };
        }
        return arg;
      })
    );
  };

  // Speaking state
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');
  const [isRecordingArgument, setIsRecordingArgument] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [newArgumentText, setNewArgumentText] = useState<string>('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Soundboard floating emojis
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

  // AI Judge Verdict
  const [judgeVerdict, setJudgeVerdict] = useState<JudgeVerdict | null>(null);
  const [isJudging, setIsJudging] = useState<boolean>(false);

  // AI debater generation loading
  const [isGeneratingAiDebater, setIsGeneratingAiDebater] = useState<boolean>(false);

  // Playing audio clip
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null);

  const handleOpenVoting = (arg: DebateArgument) => {
    setSelectedArgForVoting(arg);
    setIsVotingModalOpen(true);
  };

  const handleApplyRating = (argId: string, rating: AnonymousRating) => {
    setArgumentsList((prev) =>
      prev.map((arg) => {
        if (arg.id === argId) {
          const currentRatings = arg.ratings || [];
          const updatedRatings = [...currentRatings, rating];
          const newAvg = Number(
            (updatedRatings.reduce((sum, r) => sum + r.totalScore, 0) / updatedRatings.length).toFixed(1)
          );
          const currentBadges = { ...(arg.badges || {}) };
          if (rating.badgeReaction) {
            currentBadges[rating.badgeReaction] = (currentBadges[rating.badgeReaction] || 0) + 1;
          }
          return {
            ...arg,
            ratings: updatedRatings,
            averageScore: newAvg,
            badges: currentBadges,
            votes: {
              ...arg.votes,
              creativity: arg.votes.creativity + Math.round(rating.originality),
              humor: arg.votes.humor + Math.round(rating.humor),
              persuasion: arg.votes.persuasion + Math.round(rating.intellect),
            },
            hasVoted: true,
          };
        }
        return arg;
      })
    );
  };

  // Soundboard trigger
  const handleSoundReaction = (soundType: 'airhorn' | 'applause' | 'gasp' | 'rimshot' | 'bell', emoji: string) => {
    audioEngine.playReactionSound(soundType);

    const newId = Date.now() + Math.random();
    setFloatingReactions((prev) => [
      ...prev,
      { id: newId, emoji, x: Math.floor(Math.random() * 80) + 10 },
    ]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newId));
    }, 2000);
  };

  // Record argument handler
  const handleStartRecord = async () => {
    try {
      if (!isMicActive) {
        await onToggleMic();
      }
      setRecordedAudioUrl(null);
      await audioEngine.startRecording();
      setIsRecordingArgument(true);
      setRecordTimer(0);
    } catch (err) {
      console.error('Error starting record:', err);
    }
  };

  const handleStopRecord = async () => {
    try {
      setIsRecordingArgument(false);
      const url = await audioEngine.stopRecording();
      if (url) {
        setRecordedAudioUrl(url);
      }
    } catch (err) {
      console.error('Error stopping record:', err);
    }
  };

  // Record timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingArgument) {
      interval = setInterval(() => {
        setRecordTimer((prev) => {
          if (prev >= 14) {
            handleStopRecord();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingArgument]);

  // Submit User Argument
  const handleSubmitArgument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArgumentText.trim() && !recordedAudioUrl) return;

    const newArg: DebateArgument = {
      id: `arg-${Date.now()}`,
      dilemmaId: dilemma.id,
      authorPersona: activePersona,
      side: activeSide,
      sideText: activeSide === 'A' ? dilemma.stanceA : dilemma.stanceB,
      argumentText: newArgumentText.trim() || `(Modüle Edilmiş Sesli Argüman: ${activePersona.filterLabel} filtresiyle kaydedildi)`,
      audioUrl: recordedAudioUrl || undefined,
      timestamp: 'Az önce',
      votes: { creativity: 1, humor: 1, persuasion: 1 },
      averageScore: 9.0,
      starRating: 5.0,
      starCount: 1,
      creativeCrownVotes: 1,
      isChosenAsMostCreativeByMe: false,
      hasVoted: false,
    };

    setArgumentsList([newArg, ...argumentsList]);
    setNewArgumentText('');
    setRecordedAudioUrl(null);
    handleSoundReaction('applause', '👏');
  };

  // Trigger AI Debater
  const handleTriggerAiDebater = async (side: 'A' | 'B') => {
    setIsGeneratingAiDebater(true);
    try {
      const opposingPersona = side === 'A' ? PRESET_PERSONAS[2] : PRESET_PERSONAS[3];
      const stanceText = side === 'A' ? dilemma.stanceA : dilemma.stanceB;

      const res = await fetch('/api/echo/arguments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemmaTitle: dilemma.title,
          stance: stanceText,
          personaName: opposingPersona.name,
          personaTone: opposingPersona.filterDescription,
        }),
      });

      const data = await res.json();
      if (data.argumentText) {
        const aiArg: DebateArgument = {
          id: `arg-ai-${Date.now()}`,
          dilemmaId: dilemma.id,
          authorPersona: opposingPersona,
          side,
          sideText: stanceText,
          argumentText: data.argumentText,
          timestamp: 'Az önce (Yapay Zeka)',
          votes: {
            creativity: Math.floor(Math.random() * 20) + 75,
            humor: Math.floor(Math.random() * 20) + 75,
            persuasion: Math.floor(Math.random() * 20) + 75,
          },
          averageScore: 9.4,
          starRating: 4.8,
          starCount: 6,
          creativeCrownVotes: 3,
          isChosenAsMostCreativeByMe: false,
        };
        setArgumentsList((prev) => [aiArg, ...prev]);
        handleSoundReaction('bell', '🔔');
      }
    } catch (err) {
      console.error('AI debater error:', err);
    } finally {
      setIsGeneratingAiDebater(false);
    }
  };

  // Vote on argument
  const handleVote = (argId: string, metric: 'creativity' | 'humor' | 'persuasion') => {
    setArgumentsList((prev) =>
      prev.map((arg) => {
        if (arg.id === argId) {
          return {
            ...arg,
            votes: {
              ...arg.votes,
              [metric]: arg.votes[metric] + 1,
            },
            hasVoted: true,
          };
        }
        return arg;
      })
    );
  };

  // Request AI Jury Critique
  const handleRequestJudge = async () => {
    setIsJudging(true);
    try {
      const sideAArgs = argumentsList.filter((a) => a.side === 'A');
      const sideBArgs = argumentsList.filter((a) => a.side === 'B');

      const textA = sideAArgs[0]?.argumentText || dilemma.stanceA;
      const textB = sideBArgs[0]?.argumentText || dilemma.stanceB;

      const res = await fetch('/api/echo/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemmaTitle: dilemma.title,
          argumentA: textA,
          argumentB: textB,
        }),
      });

      const verdict = await res.json();
      setJudgeVerdict(verdict);
      handleSoundReaction('airhorn', '📢');
    } catch (err) {
      console.error('Judge error:', err);
    } finally {
      setIsJudging(false);
    }
  };

  // Play audio snippet
  const handleTogglePlayAudio = (id: string, url: string) => {
    if (currentlyPlayingId === id && activeAudioObj) {
      activeAudioObj.pause();
      setCurrentlyPlayingId(null);
      return;
    }

    if (activeAudioObj) {
      activeAudioObj.pause();
    }

    const audio = new Audio(url);
    setActiveAudioObj(audio);
    setCurrentlyPlayingId(id);
    audio.play();
    audio.onended = () => {
      setCurrentlyPlayingId(null);
    };
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Floating soundboard reactions overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%`, bottom: '25%' }}
            className="absolute transform -translate-x-1/2 text-4xl animate-bounce transition-all duration-1000 ease-out"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Bar with Back and Spark Question */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Tüm Arenalara Dön</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-cyan-300">CANLI SESLİ ARENA</span>
        </div>
      </div>

      {/* Dilemma Title & Spark Question Card */}
      <div className="rounded-2xl border border-white/10 bg-[#131620] p-6 shadow-xl mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <span>{dilemma.category}</span>
          <span>·</span>
          <span>Absürt Felsefi İkilem</span>
        </div>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-white">
          {dilemma.title}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-300">
          {dilemma.description}
        </p>

        {dilemma.sparkQuestion && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">
            <Flame className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Kışkırtıcı Soru: </span>
              {dilemma.sparkQuestion}
            </div>
          </div>
        )}
      </div>

      {/* Dual Podiums: Stance A vs Stance B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Podium A */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#121524] p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                TARAF A
              </span>
              <span className="text-xs font-semibold text-zinc-300">Savunanlar</span>
            </div>
            <button
              onClick={() => handleTriggerAiDebater('A')}
              disabled={isGeneratingAiDebater}
              className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Yapay Zeka Savunsun</span>
            </button>
          </div>

          <h3 className="font-display text-base font-bold text-indigo-100 mb-3">
            "{dilemma.stanceA}"
          </h3>

          <div className="rounded-xl bg-black/40 border border-white/5 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Kürsü Sinyali
              </span>
              <span className="font-mono text-[11px] text-indigo-300">Ring-Mod Droid</span>
            </div>
            <VoiceVisualizer isActive={isMicActive && activeSide === 'A'} color="#818cf8" height={36} />
          </div>
        </div>

        {/* Podium B */}
        <div className="rounded-2xl border border-rose-500/30 bg-[#221219] p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                TARAF B
              </span>
              <span className="text-xs font-semibold text-zinc-300">Savunanlar</span>
            </div>
            <button
              onClick={() => handleTriggerAiDebater('B')}
              disabled={isGeneratingAiDebater}
              className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Yapay Zeka Savunsun</span>
            </button>
          </div>

          <h3 className="font-display text-base font-bold text-rose-100 mb-3">
            "{dilemma.stanceB}"
          </h3>

          <div className="rounded-xl bg-black/40 border border-white/5 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Kürsü Sinyali
              </span>
              <span className="font-mono text-[11px] text-rose-300">Noir Dış Ses</span>
            </div>
            <VoiceVisualizer isActive={isMicActive && activeSide === 'B'} color="#f43f5e" height={36} />
          </div>
        </div>
      </div>

      {/* Live Debate Voice Tension & Excitement Meter */}
      <DebateTensionMeter
        isMicActive={isMicActive}
        activeSide={activeSide}
        argumentsCount={argumentsList.length}
      />

      {/* Live Soundboard Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#131620] p-4 mb-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span>Canlı Arenada Tepki Ver (Web Audio Canlı Efektler)</span>
          </div>
          <span className="text-[11px] text-zinc-500">Tüm dinleyiciler duyar</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {SOUND_REACTIONS.map((react) => (
            <button
              key={react.id}
              onClick={() => handleSoundReaction(react.soundType, react.icon)}
              className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] py-2 px-1 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all active:scale-95"
            >
              <span className="text-xl sm:text-2xl mb-1">{react.icon}</span>
              <span className="text-[10px] sm:text-xs font-medium text-zinc-300 truncate w-full text-center">
                {react.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Voting Leaderboard & Creative Summary Card */}
      <VotingLeaderboardCard
        argumentsList={argumentsList}
        onOpenVotingModal={handleOpenVoting}
        onRateStars={handleRateStars}
        onToggleCrown={handleToggleCrown}
        onPlayAudio={handleTogglePlayAudio}
        currentlyPlayingId={currentlyPlayingId}
      />

      {/* Main Debate Grid: Left Speak Form, Right Arguments Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Speak & Submit Argument */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#131620] p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-white mb-1">
              Kürsüye Çık & Sesini Duyur
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Konuşurken sesin{' '}
              <span className="text-cyan-400 font-semibold">{activePersona.filterLabel}</span>{' '}
              filtresiyle aktarılır.
            </p>

            {/* Choose Side */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Hangi Tarafı Savunuyorsun?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSide('A')}
                  className={`rounded-xl border p-2.5 text-left text-xs transition-all ${
                    activeSide === 'A'
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 font-bold'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="block font-mono text-[10px] text-indigo-400">TARAF A</span>
                  <span className="line-clamp-1">{dilemma.stanceA}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSide('B')}
                  className={`rounded-xl border p-2.5 text-left text-xs transition-all ${
                    activeSide === 'B'
                      ? 'border-rose-500 bg-rose-950/40 text-rose-200 font-bold'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="block font-mono text-[10px] text-rose-400">TARAF B</span>
                  <span className="line-clamp-1">{dilemma.stanceB}</span>
                </button>
              </div>
            </div>

            {/* Voice Recording Widget */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-2">
                <span>Modüle Edilmiş Ses Kaydı (Opsiyonel)</span>
                {isRecordingArgument && (
                  <span className="font-mono text-xs text-rose-400 font-bold animate-pulse">
                    00:{recordTimer < 10 ? `0${recordTimer}` : recordTimer} / 00:15
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isRecordingArgument ? (
                  <button
                    type="button"
                    onClick={handleStartRecord}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 py-2 px-3 text-xs font-bold text-black transition-all"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Karakter Sesiyle Konuşmaya Başla
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecord}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 py-2 px-3 text-xs font-bold text-white transition-all"
                  >
                    <Square className="h-3.5 w-3.5" />
                    Kaydı Tamamla
                  </button>
                )}

                {recordedAudioUrl && !isRecordingArgument && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Ses Hazır</span>
                  </div>
                )}
              </div>
            </div>

            {/* Argument Text Box */}
            <form onSubmit={handleSubmitArgument} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Argümanın veya Vurgulamak İstediğin Nokta:
                </label>
                <textarea
                  value={newArgumentText}
                  onChange={(e) => setNewArgumentText(e.target.value)}
                  rows={3}
                  placeholder="Z kuşağına hitap eden, absürt ve yaratıcı bir savunma yaz..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!newArgumentText.trim() && !recordedAudioUrl}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" />
                Arenaya Fırlat (Oylamaya Sun)
              </button>
            </form>
          </div>

          {/* AI Jury Evaluation Box */}
          <div className="rounded-2xl border border-white/10 bg-[#131620] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <h3 className="font-display text-sm font-bold text-white">Yapay Zeka Jürisi</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Yaratıcılık Odaklı</span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Kim haklı değil, hangi argüman daha yaratıcı ve zekice? Jüriden değerlendirme iste.
            </p>

            <button
              onClick={handleRequestJudge}
              disabled={isJudging}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 py-2.5 text-xs font-bold text-amber-300 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isJudging ? 'animate-spin' : ''}`} />
              {isJudging ? 'Jüri Argümanları İnceliyor...' : 'Argümanları Jüriye Oylat'}
            </button>

            {judgeVerdict && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300">
                    🏆 Kazanan: Taraf {judgeVerdict.winner}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">Jüri Kararı</span>
                </div>
                <h4 className="text-xs font-extrabold text-white mb-1.5">
                  {judgeVerdict.verdictTitle}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                  {judgeVerdict.creativeCritique}
                </p>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-white/10 pt-2 text-zinc-400">
                  <div>
                    <span className="text-indigo-300 font-bold block mb-0.5">Taraf A</span>
                    <div>Yaratıcılık: %{judgeVerdict.scores?.sideA?.creativity || 85}</div>
                    <div>Mizah: %{judgeVerdict.scores?.sideA?.humor || 80}</div>
                  </div>
                  <div>
                    <span className="text-rose-300 font-bold block mb-0.5">Taraf B</span>
                    <div>Yaratıcılık: %{judgeVerdict.scores?.sideB?.creativity || 94}</div>
                    <div>Mizah: %{judgeVerdict.scores?.sideB?.humor || 89}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Arguments Feed & Voting Leaderboard */}
        <div className="lg:col-span-7 space-y-4">
          {/* Voting Announcement Banner */}
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-purple-950/20 p-3.5 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Anonim Yaratıcılık Oylaması Aktif</span>
                <span className="text-[11px] text-zinc-400">
                  Beğendiğin katılımcıya 1-10 puan ver, özel rozet tak ve sıralamayı belirle!
                </span>
              </div>
            </div>
          </div>

          {/* Section Header & Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTabFilter('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTabFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Tüm Argümanlar ({argumentsList.length})
              </button>
              <button
                onClick={() => setActiveTabFilter('leaderboard')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTabFilter === 'leaderboard'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Award className="h-3.5 w-3.5 text-amber-400" />
                🏆 Yaratıcılık Sıralaması
              </button>
            </div>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">Anonim Jüri Oyları</span>
          </div>

          {/* Leaderboard View (Ranked by average creative score) */}
          {activeTabFilter === 'leaderboard' ? (
            <div className="space-y-3">
              {[...argumentsList]
                .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
                .map((arg, index) => {
                  const medalIcons = ['🥇', '🥈', '🥉'];
                  const medalBg = [
                    'border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-[#141224]',
                    'border-slate-400/30 bg-gradient-to-r from-slate-900/60 to-[#141224]',
                    'border-amber-700/30 bg-gradient-to-r from-amber-950/20 to-[#141224]',
                  ];

                  return (
                    <div
                      key={arg.id}
                      className={`rounded-2xl border p-5 transition-all shadow-md ${
                        index < 3 ? medalBg[index] : 'border-white/10 bg-[#131620]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-black">{medalIcons[index] || `#${index + 1}`}</div>
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
                              <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white/5 text-zinc-300">
                                {arg.authorPersona.filterLabel}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400">
                              Taraf {arg.side} · {arg.sideText}
                            </span>
                          </div>
                        </div>

                        {/* Creative Score Pill */}
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-400 font-mono text-lg font-black">
                            <span>⭐</span>
                            <span>{arg.averageScore || 9.0}</span>
                            <span className="text-xs text-zinc-500 font-normal">/ 10</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {arg.ratings?.length || 1} Anonim Jüri Oyu
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed mb-3 italic">
                        "{arg.argumentText}"
                      </p>

                      {/* Earned Badges Row */}
                      {arg.badges && Object.keys(arg.badges).length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {Object.entries(arg.badges).map(([badge, count]) => (
                            <span
                              key={badge}
                              className="rounded-lg border border-amber-400/30 bg-amber-950/30 px-2 py-0.5 text-[10px] font-semibold text-amber-200"
                            >
                              {badge} <strong className="text-amber-400">×{count}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Interactive Star Rating & Most Creative Selection Control */}
                      <StarRatingControl
                        argId={arg.id}
                        currentStars={arg.starRating || 4.8}
                        totalStarCount={arg.starCount || 12}
                        userGivenStars={arg.userGivenStars}
                        creativeCrownVotes={arg.creativeCrownVotes || 0}
                        isChosenAsMostCreativeByMe={arg.isChosenAsMostCreativeByMe}
                        onRateStars={handleRateStars}
                        onToggleCrown={handleToggleCrown}
                      />

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                        <span className="text-[11px] text-zinc-400">
                          Özgünlük: %{arg.votes.creativity} · Mizah: %{arg.votes.humor}
                        </span>

                        <button
                          onClick={() => handleOpenVoting(arg)}
                          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-95 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all active:scale-95"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>Puan Ver & Rozet Ekle</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            /* Standard Feed View with Voting affordances */
            <div className="space-y-3.5">
              {argumentsList.map((arg) => {
                const isSideA = arg.side === 'A';
                const isPlayingThis = currentlyPlayingId === arg.id;
                const maxCrowns = Math.max(...argumentsList.map((a) => a.creativeCrownVotes || 0));
                const isTopCrowned = (arg.creativeCrownVotes || 0) > 0 && arg.creativeCrownVotes === maxCrowns;

                return (
                  <div
                    key={arg.id}
                    className={`rounded-2xl border p-5 transition-all shadow-md relative ${
                      isTopCrowned
                        ? 'border-amber-400/50 bg-gradient-to-b from-[#1c1815] to-[#121524] shadow-amber-500/10'
                        : isSideA
                        ? 'border-indigo-500/20 bg-[#121524]'
                        : 'border-rose-500/20 bg-[#1f131a]'
                    }`}
                  >
                    {/* Top Crowned Ribbon if Champion */}
                    {isTopCrowned && (
                      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                        <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>👑 Odanın En Yaratıcı Lideri ({arg.creativeCrownVotes} Katılımcı Tarafından Seçildi)</span>
                      </div>
                    )}

                    {/* Author Persona Info */}
                    <div className="flex items-center justify-between mb-3">
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
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-mono font-semibold ${
                                isSideA
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              Taraf {arg.side}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            {arg.authorPersona.filterLabel} · {arg.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Score pill & audio */}
                      <div className="flex items-center gap-2">
                        {arg.averageScore && (
                          <div className="flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-mono font-bold text-amber-300">
                            <span>⭐</span>
                            <span>{arg.averageScore}</span>
                          </div>
                        )}

                        {arg.audioUrl && (
                          <button
                            onClick={() => handleTogglePlayAudio(arg.id, arg.audioUrl!)}
                            className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                          >
                            {isPlayingThis ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            <span>{isPlayingThis ? 'Durdur' : 'Sesi Dinle'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Argument Content */}
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed mb-3">
                      "{arg.argumentText}"
                    </p>

                    {/* Badges display */}
                    {arg.badges && Object.keys(arg.badges).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {Object.entries(arg.badges).map(([b, count]) => (
                          <span
                            key={b}
                            className="rounded-md border border-amber-500/20 bg-amber-950/30 px-2 py-0.5 text-[10px] text-amber-300"
                          >
                            {b} ×{count}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Interactive Star Rating & Most Creative Selection Control */}
                    <StarRatingControl
                      argId={arg.id}
                      currentStars={arg.starRating || 4.7}
                      totalStarCount={arg.starCount || 15}
                      userGivenStars={arg.userGivenStars}
                      creativeCrownVotes={arg.creativeCrownVotes || 0}
                      isChosenAsMostCreativeByMe={arg.isChosenAsMostCreativeByMe}
                      onRateStars={handleRateStars}
                      onToggleCrown={handleToggleCrown}
                    />

                    {/* Creative Voting Bar */}
                    <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-3 mt-3 gap-2">
                      {/* Primary Anonymous Rate Button */}
                      <button
                        onClick={() => handleOpenVoting(arg)}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-95 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Detaylı Kriter Puanı Ver</span>
                      </button>

                      {/* Quick +1 Metric Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleVote(arg.id, 'creativity')}
                          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300 transition-all"
                          title="Yaratıcılık Oyu Ver"
                        >
                          <span>💡</span>
                          <span className="font-mono text-[11px] font-bold text-amber-300">
                            {arg.votes.creativity}
                          </span>
                        </button>

                        <button
                          onClick={() => handleVote(arg.id, 'humor')}
                          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300 hover:border-pink-400/40 hover:bg-pink-400/10 hover:text-pink-300 transition-all"
                          title="Mizah Oyu Ver"
                        >
                          <span>😂</span>
                          <span className="font-mono text-[11px] font-bold text-pink-300">
                            {arg.votes.humor}
                          </span>
                        </button>

                        <button
                          onClick={() => handleVote(arg.id, 'persuasion')}
                          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 transition-all"
                          title="İkna Gücü Oyu Ver"
                        >
                          <span>🎯</span>
                          <span className="font-mono text-[11px] font-bold text-cyan-300">
                            {arg.votes.persuasion}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Anonymous Voting Modal */}
      <VotingModal
        argument={selectedArgForVoting}
        isOpen={isVotingModalOpen}
        onClose={() => setIsVotingModalOpen(false)}
        onSubmitRating={handleApplyRating}
      />
    </div>
  );
};

