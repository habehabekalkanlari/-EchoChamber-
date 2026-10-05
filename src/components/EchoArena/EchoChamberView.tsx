import React, { useState } from 'react';
import { 
  Radio, 
  Sparkles, 
  MessageSquare, 
  Users, 
  ArrowRight, 
  Flame, 
  Shuffle, 
  Mic, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { Dilemma, PersonaProfile } from '../../types';
import { HERO_ECHO_IMAGE } from '../../data/presets';

interface EchoChamberViewProps {
  dilemmas: Dilemma[];
  onSelectDilemma: (dilemma: Dilemma) => void;
  activePersona: PersonaProfile;
  onGenerateDilemma: () => Promise<void>;
  isGeneratingDilemma: boolean;
}

export const EchoChamberView: React.FC<EchoChamberViewProps> = ({
  dilemmas,
  onSelectDilemma,
  activePersona,
  onGenerateDilemma,
  isGeneratingDilemma,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Hepsi');

  const categories = ['Hepsi', 'Siber Gelecek', 'Absürt Felsefe', 'Popüler Kültür', 'Zaman & Ahlak'];

  const filteredDilemmas = selectedCategory === 'Hepsi'
    ? dilemmas
    : dilemmas.filter((d) => d.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero Banner Section */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-[#12151f] shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_ECHO_IMAGE}
            alt="Echo Arena Stage"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-25 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d13] via-[#0b0d13]/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:w-3/4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>EchoChamber · Sesli Anonim Tartışma Arenası</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            Fikirlerini seslendir, <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              kimliğini gizli tut.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm sm:text-base text-zinc-300 leading-relaxed">
            Gençlerin dile getirmeye çekindiği absürt felsefi sorular ve popüler kültür ikilemleri.
            Ses değiştirme teknolojisiyle kimse senin gerçek sesini bilmez; sadece en yaratıcı argüman oylanır.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectDilemma(dilemmas[0])}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs sm:text-sm font-bold text-black shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 transition-all"
            >
              <Mic className="h-4 w-4" />
              Günün Arenasına Katıl
            </button>

            <button
              onClick={onGenerateDilemma}
              disabled={isGeneratingDilemma}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:text-sm font-semibold text-zinc-200 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 text-cyan-400 ${isGeneratingDilemma ? 'animate-spin' : ''}`} />
              {isGeneratingDilemma ? 'İkilem Üretiliyor...' : 'Yapay Zekadan Yeni İkilem İste'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter & Section Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Aktif Tartışma Arenaları</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Bir ikilem seç, tarafını belirle ve sesini modüle ederek savun.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dilemmas Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredDilemmas.map((dilemma) => (
          <div
            key={dilemma.id}
            onClick={() => onSelectDilemma(dilemma)}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#131620] p-6 transition-all hover:border-cyan-500/40 hover:bg-[#161a27] cursor-pointer shadow-lg hover:shadow-cyan-500/5"
          >
            <div>
              {/* Category & Active Users */}
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-cyan-400">{dilemma.category}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-zinc-500" />
                    {dilemma.activeDebaters} canlı
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                    {dilemma.argumentsCount} argüman
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="mt-3 font-display text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                {dilemma.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {dilemma.description}
              </p>

              {/* Opposing Stances */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-2.5">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold block mb-0.5">TARAF A</span>
                  <span className="font-medium text-zinc-200 line-clamp-2">{dilemma.stanceA}</span>
                </div>
                <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-2.5">
                  <span className="font-mono text-[10px] text-rose-400 font-bold block mb-0.5">TARAF B</span>
                  <span className="font-medium text-zinc-200 line-clamp-2">{dilemma.stanceB}</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300">
                Karakter sesinle katıl
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Arenaya Gir</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
