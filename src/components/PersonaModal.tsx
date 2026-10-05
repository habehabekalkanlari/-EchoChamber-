import React, { useState } from 'react';
import { X, Check, ShieldCheck, Sparkles, User } from 'lucide-react';
import { PersonaProfile, VoiceFilterType } from '../types';
import { PRESET_PERSONAS, VOICE_FILTERS } from '../data/presets';
import { audioEngine } from '../utils/audioEngine';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: PersonaProfile;
  onSavePersona: (persona: PersonaProfile) => void;
  onSelectFilter: (filter: VoiceFilterType) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  activePersona,
  onSavePersona,
  onSelectFilter,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState<string>(activePersona.name);
  const [selectedFilter, setSelectedFilter] = useState<VoiceFilterType>(activePersona.filterType);
  const [selectedAccent, setSelectedAccent] = useState<string>(activePersona.accentColor);

  const colors = ['#06b6d4', '#f59e0b', '#ec4899', '#a855f7', '#10b981', '#f43f5e'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const filterDef = VOICE_FILTERS.find((f) => f.type === selectedFilter) || VOICE_FILTERS[0];

    const updated: PersonaProfile = {
      ...activePersona,
      name: name.trim() || 'Anonim Filozof',
      filterType: selectedFilter,
      filterLabel: filterDef.name,
      filterDescription: filterDef.tagline,
      accentColor: selectedAccent,
    };

    onSavePersona(updated);
    onSelectFilter(selectedFilter);
    audioEngine.applyFilter(selectedFilter);
    onClose();
  };

  const handleSelectPreset = (p: PersonaProfile) => {
    setName(p.name);
    setSelectedFilter(p.filterType);
    setSelectedAccent(p.accentColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#131622] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Biyometrik & Kimlik Koruması</span>
        </div>

        <h3 className="mt-1 font-display text-xl font-bold text-white">
          Anonim Profilini Özelleştir
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          EchoChamber arenasında bu takma ad ve ses filtresiyle tanınacaksın.
        </p>

        {/* Quick presets */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-zinc-300">Hazır Karakterler</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PRESET_PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                  name === p.name
                    ? 'border-cyan-500 bg-cyan-950/30'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                }`}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: p.accentColor }}
                >
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-zinc-400">{p.filterLabel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Custom Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Karakter Adı / Takma Ad
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Voice Filter Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Ses Filtresi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VOICE_FILTERS.map((f) => (
                <button
                  key={f.type}
                  type="button"
                  onClick={() => setSelectedFilter(f.type)}
                  className={`rounded-lg border p-2 text-left text-xs transition-all ${
                    selectedFilter === f.type
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-bold'
                      : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-[11px] font-semibold">{f.name}</div>
                  <div className="text-[9px] text-zinc-500 font-mono">{f.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Accent */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Aura Rengi
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedAccent(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    selectedAccent === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 py-3 text-xs font-extrabold text-black hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Karakteri Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};
