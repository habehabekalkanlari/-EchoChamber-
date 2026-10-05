import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { EchoChamberView } from './components/EchoArena/EchoChamberView';
import { DebateStage } from './components/EchoArena/DebateStage';
import { VoiceStudioView } from './components/VoiceStudio/VoiceStudioView';
import { DejaVuView } from './components/DejaVu/DejaVuView';
import { GlobalFeedView } from './components/GlobalFeed/GlobalFeedView';
import { PersonaModal } from './components/PersonaModal';
import { Dilemma, PersonaProfile, VoiceFilterType } from './types';
import { INITIAL_DILEMMAS, PRESET_PERSONAS } from './data/presets';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'arena' | 'voice-studio' | 'dejavu' | 'feed'>('arena');
  const [selectedDilemma, setSelectedDilemma] = useState<Dilemma | null>(null);
  const [dilemmas, setDilemmas] = useState<Dilemma[]>(INITIAL_DILEMMAS);
  
  const [activePersona, setActivePersona] = useState<PersonaProfile>(PRESET_PERSONAS[0]);
  const [currentFilter, setCurrentFilter] = useState<VoiceFilterType>('robot');
  
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);
  const [isGeneratingDilemma, setIsGeneratingDilemma] = useState<boolean>(false);

  // iOS AudioContext unlock on first user touch/click
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const ctx = audioEngine.getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume();
        }
      } catch {
        // ignore
      }
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };

    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('click', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
  }, []);

  // Toggle Microphone
  const handleToggleMic = async () => {
    try {
      if (isMicActive) {
        audioEngine.stopMicrophone();
        setIsMicActive(false);
      } else {
        await audioEngine.startMicrophone();
        audioEngine.applyFilter(currentFilter);
        setIsMicActive(true);
      }
    } catch (err) {
      console.error('Microphone access error:', err);
      setIsMicActive(false);
    }
  };

  // Generate new Dilemma from AI or Fallback
  const handleGenerateDilemma = async () => {
    setIsGeneratingDilemma(true);
    try {
      const res = await fetch('/api/echo/dilemmas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.dilemma) {
        setDilemmas((prev) => [data.dilemma, ...prev]);
        setSelectedDilemma(data.dilemma);
      }
    } catch (err) {
      console.error('Generate dilemma error:', err);
    } finally {
      setIsGeneratingDilemma(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e6e8ee] flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar (Complies with Top Bar Contract) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'arena') {
            setSelectedDilemma(null);
          }
        }}
        activePersona={activePersona}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-6">
        {activeTab === 'arena' && (
          selectedDilemma ? (
            <DebateStage
              dilemma={selectedDilemma}
              onBack={() => setSelectedDilemma(null)}
              activePersona={activePersona}
              isMicActive={isMicActive}
              onToggleMic={handleToggleMic}
            />
          ) : (
            <EchoChamberView
              dilemmas={dilemmas}
              onSelectDilemma={(dilemma) => setSelectedDilemma(dilemma)}
              activePersona={activePersona}
              onGenerateDilemma={handleGenerateDilemma}
              isGeneratingDilemma={isGeneratingDilemma}
            />
          )
        )}

        {activeTab === 'voice-studio' && (
          <VoiceStudioView
            currentFilter={currentFilter}
            onSelectFilter={(filter) => {
              setCurrentFilter(filter);
              audioEngine.applyFilter(filter);
            }}
            activePersona={activePersona}
            onUpdatePersona={(persona) => setActivePersona(persona)}
            isMicActive={isMicActive}
            onToggleMic={handleToggleMic}
          />
        )}

        {activeTab === 'dejavu' && <DejaVuView />}

        {activeTab === 'feed' && (
          <GlobalFeedView
            onGoToArena={() => {
              setActiveTab('arena');
              setSelectedDilemma(null);
            }}
            onGoToDejaVu={() => setActiveTab('dejavu')}
          />
        )}
      </main>

      {/* Persona Customization Modal */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        activePersona={activePersona}
        onSavePersona={(updated) => setActivePersona(updated)}
        onSelectFilter={(f) => {
          setCurrentFilter(f);
          audioEngine.applyFilter(f);
        }}
      />

      {/* Quiet, clean site footer complying with anti-slop rules */}
      <footer className="border-t border-white/5 bg-[#090b10] py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-zinc-300">EchoChamber & Deja-Vu</span>
            <span>·</span>
            <span>Anonim Sesli Tartışma & Senkron Anı Deneyimi</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>Biyometrik Ses Koruması</span>
            <span>·</span>
            <span>Kuantum Senkronizasyon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
