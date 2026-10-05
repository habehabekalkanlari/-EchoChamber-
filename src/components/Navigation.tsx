import React from 'react';
import { Mic, Radio, Sparkles, Volume2, Globe } from 'lucide-react';
import { PersonaProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavigationProps {
  activeTab: 'arena' | 'voice-studio' | 'dejavu' | 'feed';
  setActiveTab: (tab: 'arena' | 'voice-studio' | 'dejavu' | 'feed') => void;
  activePersona: PersonaProfile;
  isMicActive: boolean;
  onToggleMic: () => void;
  onOpenPersonaModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  activePersona,
  isMicActive,
  onToggleMic,
  onOpenPersonaModal,
}) => {
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
  };

  const handleTabChange = (tab: 'arena' | 'voice-studio' | 'dejavu' | 'feed') => {
    triggerHaptic();
    setActiveTab(tab);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0d13]/90 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabChange('arena')}
              className="flex items-center gap-2 text-left transition-opacity hover:opacity-90 active:scale-95"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
                <Radio className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                Echo // Deja
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/5">
            <button
              onClick={() => handleTabChange('arena')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'arena'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              Echo Arenası
            </button>

            <button
              onClick={() => handleTabChange('voice-studio')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'voice-studio'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              Ses Modülatörü
            </button>

            <button
              onClick={() => handleTabChange('dejavu')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'dejavu'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Deja-Vu Radarı
            </button>

            <button
              onClick={() => handleTabChange('feed')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'feed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Global Akış
            </button>
          </nav>

          {/* Zone 3: Actions (PWA install + mic + persona) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install PWA Button for Android & iOS */}
            <PWAInstallButton />

            {/* Mic quick toggle */}
            <button
              onClick={() => {
                triggerHaptic();
                onToggleMic();
              }}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                isMicActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                  : 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10'
              }`}
              title={isMicActive ? 'Mikrofon Açık (Kapat)' : 'Mikrofonu Başlat'}
            >
              <div className={`h-2 w-2 rounded-full ${isMicActive ? 'bg-rose-400 animate-pulse' : 'bg-zinc-500'}`} />
              <Mic className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isMicActive ? 'Yayında' : 'Mikrofon'}</span>
            </button>

            {/* Active Persona Badge */}
            <button
              onClick={() => {
                triggerHaptic();
                onOpenPersonaModal();
              }}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-900/40 transition-colors active:scale-95"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: activePersona.accentColor }}
              />
              <span className="max-w-[70px] sm:max-w-[120px] truncate">{activePersona.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Native Bottom Navigation Bar (iOS & Android thumb friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-white/10 bg-[#0b0d13]/95 backdrop-blur-lg px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl">
        <button
          onClick={() => handleTabChange('arena')}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-transform active:scale-90 ${
            activeTab === 'arena' ? 'text-cyan-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'arena' ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>
            <Radio className="h-4 w-4" />
          </div>
          <span>Echo</span>
        </button>

        <button
          onClick={() => handleTabChange('voice-studio')}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-transform active:scale-90 ${
            activeTab === 'voice-studio' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'voice-studio' ? 'bg-amber-500/20 text-amber-300' : ''}`}>
            <Volume2 className="h-4 w-4" />
          </div>
          <span>Modülatör</span>
        </button>

        <button
          onClick={() => handleTabChange('dejavu')}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-transform active:scale-90 ${
            activeTab === 'dejavu' ? 'text-purple-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'dejavu' ? 'bg-purple-500/20 text-purple-300' : ''}`}>
            <Sparkles className="h-4 w-4" />
          </div>
          <span>Deja-Vu</span>
        </button>

        <button
          onClick={() => handleTabChange('feed')}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-transform active:scale-90 ${
            activeTab === 'feed' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'feed' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>
            <Globe className="h-4 w-4" />
          </div>
          <span>Akış</span>
        </button>
      </nav>
    </>
  );
};

