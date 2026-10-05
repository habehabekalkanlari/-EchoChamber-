import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone native PWA, suppress button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 rounded-lg">
        <CheckCircle className="h-3 w-3" />
        <span>Yüklü (Native Mod)</span>
      </div>
    );
  }

  // Android / Chromium / Desktop Install
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all active:scale-95"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Uygulamayı Yükle</span>
        <span className="sm:hidden">Yükle</span>
      </button>
    );
  }

  // iOS Safari Guide trigger (or Android fallback)
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors active:scale-95"
      >
        <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
        <span>{isIOS ? "iOS'a Ekle" : isAndroid ? "Android'e Ekle" : "Telefona Ekle"}</span>
      </button>

      {/* Mobile Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#131622] p-6 shadow-2xl">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase">
              <Smartphone className="h-4 w-4" />
              <span>{isIOS ? 'iPhone / iPad Kurulumu' : 'Android & Mobil Kurulum'}</span>
            </div>

            <h3 className="mt-1 font-display text-lg font-bold text-white">
              Ana Ekrana Ekle & Native Kullan
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              EchoChamber & Deja-Vu'yu tarayıcı çubuğu olmadan, tam ekran ve sıfır gecikmeli bir mobil uygulama gibi kullanın.
            </p>

            <div className="mt-5 space-y-3 text-xs text-zinc-200">
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold">
                  1
                </div>
                <div>
                  <span className="font-semibold text-white">Paylaş Butonuna Basın</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                    {isIOS ? 'Safari alt çubuğundaki' : 'Tarayıcı menüsündeki'} <Share2 className="h-3.5 w-3.5 text-cyan-400 inline" /> ikonuna dokunun.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-bold">
                  2
                </div>
                <div>
                  <span className="font-semibold text-white">Ana Ekrana Ekle</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                    Menüden <PlusSquare className="h-3.5 w-3.5 text-purple-400 inline" /> <strong>"Ana Ekrana Ekle"</strong> seçeneğine dokunun.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">
                  3
                </div>
                <div>
                  <span className="font-semibold text-white">Tam Ekran Deneyimi</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Artık ana ekranınızdaki ikona tıklayarak mikrofon ve kamera ile tam uyumlu deneyim yaşayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-bold text-white transition-colors"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
};
