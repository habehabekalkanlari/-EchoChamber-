import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Camera, 
  Clock, 
  Send, 
  MapPin, 
  RefreshCw, 
  CheckCircle2, 
  MessageCircle, 
  Zap, 
  Flame, 
  ArrowRight,
  ShieldAlert,
  Coffee,
  Palette,
  Compass,
  SwitchCamera,
  Upload
} from 'lucide-react';
import { DejaVuChallenge, DejaVuMatch } from '../../types';
import { 
  HERO_DEJAVU_IMAGE, 
  SAMPLE_COFFEE_IMAGE, 
  SAMPLE_BLUE_IMAGE, 
  PAST_DEJAVU_FEED 
} from '../../data/presets';
import { audioEngine } from '../../utils/audioEngine';

export const DejaVuView: React.FC = () => {
  // Radar state
  const [isSearchingPartner, setIsSearchingPartner] = useState<boolean>(false);
  const [partnerFound, setPartnerFound] = useState<boolean>(false);
  const [partnerInfo, setPartnerInfo] = useState<{ name: string; city: string }>({
    name: 'Gizemli Yabancı',
    city: 'Montmartre, Paris',
  });

  // Current challenge
  const [currentChallenge, setCurrentChallenge] = useState<DejaVuChallenge>({
    id: 'challenge-1',
    actionText: 'Şu an elindeki bardağı/kahveyi gökyüzüne doğru havaya kaldır!',
    category: 'İçecek & Ritüel',
    hint: 'Bardağını ışığa tut ve bir yabancıyla aynı saniyede şerefe yap.',
    icon: 'coffee',
    targetObject: 'Kahve / Bardak',
  });

  // Countdown timer (30 seconds)
  const [countdown, setCountdown] = useState<number>(30);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Camera & Capture
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Deja-Vu Explosion state
  const [showExplosion, setShowExplosion] = useState<boolean>(false);
  const [activeMatch, setActiveMatch] = useState<DejaVuMatch | null>(null);

  // Ephemeral Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'partner'; text: string; time: string }>>([]);
  const [inputMessage, setInputMessage] = useState<string>('');

  // Start Camera
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setCameraError(null);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 640 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setFacingMode(mode);
      }
    } catch (err) {
      console.warn('Camera access fallback:', err);
      setCameraError('Kamera erişimi açılamadı. Simüle edilmiş çekim modu aktif.');
    }
  };

  const toggleCameraDirection = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  };

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleCaptureAction(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Start Search / Radar
  const handleStartSyncRadar = async () => {
    setIsSearchingPartner(true);
    setPartnerFound(false);
    setShowExplosion(false);
    setActiveMatch(null);
    setCapturedImage(null);

    // Fetch dynamic challenge from API
    try {
      const res = await fetch('/api/dejavu/challenge', { method: 'POST' });
      const data = await res.json();
      if (data.challenge) {
        setCurrentChallenge(data.challenge);
      }
    } catch {
      // fallback
    }

    // Simulate Radar searching delay (2.5s)
    setTimeout(() => {
      const cities = [
        { name: 'Gizemli Yabancı #404', city: 'Montmartre, Paris' },
        { name: 'Kuantum Yolcusu', city: 'Shibuya, Tokyo' },
        { name: 'Gece Kuşu', city: 'Kreuzberg, Berlin' },
        { name: 'Kafe Filozofu', city: 'Alsancak, İzmir' },
        { name: 'Siber Göçebe', city: 'Mile End, Montreal' },
      ];
      const randomPartner = cities[Math.floor(Math.random() * cities.length)];
      setPartnerInfo(randomPartner);
      setIsSearchingPartner(false);
      setPartnerFound(true);
      setIsTimerActive(true);
      setCountdown(30);

      // Try camera
      startCamera();
    }, 2200);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0 && isTimerActive) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, countdown]);

  // Capture Image & Trigger Deja-Vu Explosion
  const handleCaptureAction = async (sampleOverride?: string) => {
    setIsTimerActive(false);
    let userImg = sampleOverride || SAMPLE_COFFEE_IMAGE;

    if (!sampleOverride && videoRef.current && cameraActive) {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 480, 480);
        userImg = canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    setCapturedImage(userImg);
    stopCamera();

    // Trigger celestial sound and confetti!
    audioEngine.playReactionSound('bell');
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    // Call verify API for story and icebreaker
    try {
      const res = await fetch('/api/dejavu/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionText: currentChallenge.actionText,
          partnerCity: partnerInfo.city,
          userCity: 'Kadıköy, İstanbul',
        }),
      });
      const data = await res.json();

      const partnerImage = currentChallenge.actionText.includes('mavi')
        ? SAMPLE_BLUE_IMAGE
        : SAMPLE_COFFEE_IMAGE;

      const newMatch: DejaVuMatch = {
        id: `match-${Date.now()}`,
        challenge: currentChallenge,
        userImage: userImg,
        partnerImage,
        partnerName: partnerInfo.name,
        partnerCity: partnerInfo.city,
        userCity: 'Kadıköy, İstanbul',
        syncScore: data.score || 98,
        timestamp: 'Şu an',
        story: data.story || 'Dünyanın iki farklı ucunda aynı saniyede aynı hareketi yaptınız. Kuantum fiziği buna tesadüf diyemez!',
        icebreaker: data.icebreaker || 'Şu an bulunduğun yerde çalan müzik ya da havadaki koku ne?',
        messages: [
          {
            id: 'msg-init-1',
            sender: 'partner',
            text: `Selam! İnanamıyorum, ${partnerInfo.city}'den tam aynı anda yaptım!`,
            time: 'Az önce',
          },
        ],
      };

      setActiveMatch(newMatch);
      setChatMessages(newMatch.messages);
      setShowExplosion(true);
    } catch {
      // fallback
      setShowExplosion(true);
    }
  };

  // Send message in ephemeral chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: inputMessage.trim(),
      time: 'Şimdi',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Simulate partner response
    setTimeout(() => {
      const partnerReplies = [
        'Harika bir tesadüf! Burada hava biraz kapalıydı ama bu an günümü aydınlattı.',
        'Hahaha inanılmaz! Birkaç saniye farkla kaçıracaktım neredeyse!',
        'Burada saat 15:18, sokak tam bu sırada çok hareketliydi.',
      ];
      const reply = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
      setChatMessages((prev) => [
        ...prev,
        { sender: 'partner', text: reply, time: 'Şimdi' },
      ]);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 md:pb-12 sm:px-6">
      {/* Hidden file input for native camera on iOS & Android */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeFileUpload}
        className="hidden"
      />
      {/* Hero Banner */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-[#12151f] shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_DEJAVU_IMAGE}
            alt="Deja-Vu Cosmic Sync"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-25 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d13] via-[#0b0d13]/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:w-3/4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-xs font-semibold text-purple-300">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Deja-Vu · Ortak Anı ve Senkronize Senaryo Oyunu</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            Dünyanın öbür ucunda biriyle <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
              aynı saniyede aynı hamleyi yap.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm sm:text-base text-zinc-300 leading-relaxed">
            Günün rastgele bir anında sana ve tanımadığın bir yabancıya aynı anda bir sinyal ulaşır.
            Saniyeler içinde eylemi tamamla, "Deja-Vu" patlamasını tetikle ve aranızdaki gizemli sohbet kilidini aç.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartSyncRadar}
              disabled={isSearchingPartner}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all disabled:opacity-50"
            >
              <Compass className={`h-4 w-4 ${isSearchingPartner ? 'animate-spin' : ''}`} />
              {isSearchingPartner ? 'Senkron Yabancı Aranıyor...' : 'Senkron Radarı Başlat'}
            </button>
            <span className="text-xs text-zinc-400">
              Günün Sinyali: <strong className="text-purple-300">16:15 Sinyal Saati</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Live Radar / Camera Action */}
        <div className="lg:col-span-7 space-y-6">
          {!partnerFound && !isSearchingPartner && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#131620] p-10 text-center shadow-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-4 animate-cosmic-ripple">
                <Compass className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Senkron Radarı Beklemede
              </h3>
              <p className="max-w-md text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                Butona bastığında sistem seni dünyanın başka bir şehrindeki (Paris, Tokyo, Berlin, vb.)
                rastgele bir kullanıcıyla aynı saniyede eşleştirecek ve bir aksiyon sinyali gönderecek.
              </p>
              <button
                onClick={handleStartSyncRadar}
                className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 text-xs font-bold text-white transition-all shadow-md"
              >
                <Zap className="h-4 w-4" />
                Şimdi Bir Yabancıyla Eşleş
              </button>
            </div>
          )}

          {/* Radar Searching Animation */}
          {isSearchingPartner && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-purple-500/40 bg-[#141224] p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="relative flex items-center justify-center h-28 w-28 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping opacity-60" />
                <div className="absolute inset-2 rounded-full border border-pink-500/30 animate-pulse" />
                <Compass className="h-10 w-10 text-purple-400 animate-spin" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-1">
                Kuantum Senkron Radarı Taranıyor...
              </h3>
              <p className="text-xs text-purple-300 font-mono">
                Tokyo · Paris · Montreal · Berlin · İstanbul
              </p>
            </div>
          )}

          {/* Active Partner Found & Flash Challenge */}
          {partnerFound && !showExplosion && (
            <div className="rounded-2xl border border-purple-500/40 bg-[#131622] p-6 shadow-2xl relative">
              {/* Partner Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow">
                    {partnerInfo.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{partnerInfo.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-purple-300">
                      <MapPin className="h-3 w-3" />
                      <span>{partnerInfo.city}</span>
                    </div>
                  </div>
                </div>

                {/* 30s Countdown Bar */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-pink-400 animate-pulse" />
                  <span className="font-mono text-base font-extrabold text-pink-400">
                    00:{countdown < 10 ? `0${countdown}` : countdown}
                  </span>
                </div>
              </div>

              {/* Action Signal Callout */}
              <div className="rounded-xl border border-pink-500/30 bg-pink-950/20 p-4 mb-5">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400 mb-1">
                  <span>FLASH SENKRON EYLEMİ</span>
                  <span>·</span>
                  <span>{currentChallenge.category}</span>
                </div>
                <h4 className="font-display text-lg sm:text-xl font-extrabold text-white">
                  "{currentChallenge.actionText}"
                </h4>
                <p className="text-xs text-zinc-300 mt-1">{currentChallenge.hint}</p>
              </div>

              {/* Camera / Photo Capture Area */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-4 overflow-hidden">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  />

                  {!cameraActive && (
                    <div className="text-center p-6 space-y-2">
                      <Camera className="h-10 w-10 text-purple-400 mx-auto" />
                      <p className="text-xs text-zinc-300 font-medium">
                        Kameranızı açın veya anlık senkronizasyonu test etmek için simülasyonu kullanın.
                      </p>
                      {cameraError && (
                        <p className="text-[11px] text-amber-300">{cameraError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  {cameraActive ? (
                    <>
                      <button
                        onClick={() => handleCaptureAction()}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-pink-600 hover:bg-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-pink-500/30 transition-all active:scale-95"
                      >
                        <Camera className="h-4 w-4" />
                        Anı Yakala & Senkronize Et
                      </button>

                      <button
                        type="button"
                        onClick={toggleCameraDirection}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 px-3.5 text-xs font-medium text-zinc-300 transition-colors"
                        title="Ön / Arka Kamera Değiştir"
                      >
                        <SwitchCamera className="h-4 w-4 text-purple-400" />
                        <span className="sm:hidden text-[11px]">{facingMode === 'user' ? 'Arka Kamera' : 'Ön Kamera'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCaptureAction(SAMPLE_COFFEE_IMAGE)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 py-3 text-xs font-bold text-white shadow-lg transition-all active:scale-95"
                      >
                        <Zap className="h-4 w-4" />
                        Kahveyi Kaldır & Deja-Vu Patlaması Yarat
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 py-3 px-4 text-xs font-semibold text-purple-200 transition-colors active:scale-95"
                        title="Telefon Kamerasını Aç (iOS / Android)"
                      >
                        <Camera className="h-4 w-4 text-pink-400" />
                        <span>Kamera ile Çek</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleCaptureAction(SAMPLE_BLUE_IMAGE)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 px-4 text-xs font-semibold text-zinc-200 transition-colors"
                  >
                    <Palette className="h-4 w-4 text-cyan-400" />
                    Mavi Nesneyi Göster
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Deja-Vu Explosion & Secret Chat Reveal */}
          {showExplosion && activeMatch && (
            <div className="rounded-2xl border border-purple-500/50 bg-[#141226] p-6 shadow-2xl">
              {/* Explosion Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💥</span>
                  <div>
                    <h3 className="font-display text-xl font-black text-white">
                      DEJA-VU PATLAMASI YAŞANDI!
                    </h3>
                    <span className="text-xs text-purple-300">
                      Senkronizasyon Başarılı: %{activeMatch.syncScore} Uyum
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleStartSyncRadar}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Yeni Senkron</span>
                </button>
              </div>

              {/* Side-by-Side Sync Photos */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                  <img
                    src={activeMatch.userImage}
                    alt="Senin Anın"
                    referrerPolicy="no-referrer"
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-2 text-center text-[11px] font-semibold text-zinc-300">
                    Sen ({activeMatch.userCity})
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/30 bg-black/40 overflow-hidden">
                  <img
                    src={activeMatch.partnerImage}
                    alt="Eşleşen Yabancı"
                    referrerPolicy="no-referrer"
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-2 text-center text-[11px] font-semibold text-purple-300">
                    {activeMatch.partnerName} ({activeMatch.partnerCity})
                  </div>
                </div>
              </div>

              {/* Cosmic Sync Narrative */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5 mb-5 text-xs text-purple-200 leading-relaxed">
                <p className="font-medium">"{activeMatch.story}"</p>
                <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>Buz Kırıcı Soru: <strong>{activeMatch.icebreaker}</strong></span>
                </div>
              </div>

              {/* Secret Ephemeral Mini-Chat */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-purple-400" />
                    Kilit Açıldı: 5 Dakikalık Geçici Sohbet
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Şifreli · Anonim</span>
                </div>

                {/* Messages scroll */}
                <div className="max-h-48 overflow-y-auto space-y-2 mb-3 pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`rounded-xl px-3 py-2 text-xs max-w-[85%] ${
                          msg.sender === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-zinc-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Chat input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Bir selam yaz veya buz kırıcı soruyu yanıtla..."
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Global Deja-Vu Sync Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-white">
              Global Deja-Vu Arşivi
            </h3>
            <span className="text-xs text-zinc-400">Dünya çapında ortak anlar</span>
          </div>

          <div className="space-y-4">
            {PAST_DEJAVU_FEED.map((feed) => (
              <div
                key={feed.id}
                className="rounded-2xl border border-white/10 bg-[#131620] p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-400">{feed.actionText}</span>
                  <span className="font-mono text-[10px] text-zinc-500">{feed.time}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg overflow-hidden border border-white/5">
                    <img
                      src={feed.imageA}
                      alt={feed.userCity}
                      referrerPolicy="no-referrer"
                      className="aspect-square w-full object-cover"
                    />
                    <div className="p-1.5 text-center text-[10px] font-medium text-zinc-400 bg-black/40">
                      {feed.userCity}
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-white/5">
                    <img
                      src={feed.imageB}
                      alt={feed.partnerCity}
                      referrerPolicy="no-referrer"
                      className="aspect-square w-full object-cover"
                    />
                    <div className="p-1.5 text-center text-[10px] font-medium text-purple-300 bg-black/40">
                      {feed.partnerCity}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  "{feed.snippet}"
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-white/5 pt-2">
                  <span>Senkron Uyum Skoru:</span>
                  <span className="font-bold text-emerald-400">%{feed.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
