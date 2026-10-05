import { PersonaProfile, Dilemma, DebateArgument, SoundReaction, VoiceFilterType } from '../types';

export const HERO_ECHO_IMAGE = '/src/assets/images/echo_arena_hero_1791204757671.jpg';
export const HERO_DEJAVU_IMAGE = '/src/assets/images/dejavu_cosmic_sync_1791204768567.jpg';
export const SAMPLE_COFFEE_IMAGE = '/src/assets/images/deja_coffee_sample_1791204778600.jpg';
export const SAMPLE_BLUE_IMAGE = '/src/assets/images/deja_blue_sample_1791204788946.jpg';

export interface VoiceFilterDefinition {
  type: VoiceFilterType;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  badge: string;
}

export const VOICE_FILTERS: VoiceFilterDefinition[] = [
  {
    type: 'robot',
    name: 'Siber Filozof',
    tagline: 'Ring-Mod Frekans & Sentetik Rezonans',
    description: 'Sesini 65Hz testere dalgasıyla modüle eden saf siberpunk robotik ton.',
    icon: 'Cpu',
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20',
    badge: 'ROBOTIK',
  },
  {
    type: 'deep-noir',
    name: 'Noir Dış Ses',
    tagline: 'Derin Bas, Doygunluk & Oda Yankısı',
    description: '140Hz bas takviyesi ve analog teyp doygunluğu ile sinematik dedektif anlatıcı tonu.',
    icon: 'Radio',
    color: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
    badge: 'CINEMA DEEP',
  },
  {
    type: 'helium',
    name: 'Helyum Kaos',
    tagline: 'Formant Kaydırma & Yüksek Frekans',
    description: 'Yüksek geçiren rezonans ile absürt, çizgi film ve neşeli tiz karakter.',
    icon: 'Sparkles',
    color: 'border-pink-500/40 text-pink-400 bg-pink-950/20',
    badge: 'HELYUM',
  },
  {
    type: 'radio',
    name: 'Telsiz Ajanı',
    tagline: '300-3000Hz Telefon Bandı & Crunch',
    description: 'Nostaljik 90lar telsiz bandı, hafif distorsiyon ve telsiz konuşması hissi.',
    icon: 'Mic',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
    badge: 'WALKIE-TALKIE',
  },
  {
    type: 'cosmic',
    name: 'Kozmik Gezgin',
    tagline: '280ms Void Feedback & Eko',
    description: 'Uzay boşluğunda yankılanan, hipnotik ve sonsuz derinlik hissi veren gecikme filtresi.',
    icon: 'Orbit',
    color: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
    badge: 'VOID ECHO',
  },
  {
    type: 'alien',
    name: 'Böceksi Varlık',
    tagline: '16Hz Tremolo & Çift Zirve Rezonans',
    description: 'Hızlı genlik titreşimiyle dünya dışı, yabancı bir varlık gibi konuş.',
    icon: 'Bug',
    color: 'border-lime-500/40 text-lime-400 bg-lime-950/20',
    badge: 'ALIEN TREMOLO',
  },
  {
    type: 'clean',
    name: 'Doğal Mikrofon',
    tagline: 'Filtresiz Referans',
    description: 'Gerçek ses tonun (modülasyon kapalı, ses seviyesi kontrolü).',
    icon: 'Volume2',
    color: 'border-slate-500/40 text-slate-300 bg-slate-900/30',
    badge: 'RAW',
  },
];

export const PRESET_PERSONAS: PersonaProfile[] = [
  {
    id: 'p-cyber-monk',
    name: 'Siber Keşiş',
    handle: '@cyber_monk_42',
    avatarSeed: 'robot',
    filterType: 'robot',
    filterLabel: 'Siber Filozof',
    filterDescription: 'Devrelerle aydınlanan yapay zeka felsefecisi',
    accentColor: '#06b6d4',
    iconName: 'Cpu',
  },
  {
    id: 'p-noir-detective',
    name: 'Gece Kuşu',
    handle: '@midnight_noir',
    avatarSeed: 'detective',
    filterType: 'deep-noir',
    filterLabel: 'Noir Dış Ses',
    filterDescription: 'Yağmurlu neon sokaklardan derin varoluşsal sorgular',
    accentColor: '#f59e0b',
    iconName: 'Radio',
  },
  {
    id: 'p-helium-gremlin',
    name: 'Helyum Gremlin',
    handle: '@gremlin_chaos',
    avatarSeed: 'gremlin',
    filterType: 'helium',
    filterLabel: 'Helyum Kaos',
    filterDescription: 'Absürt pop kültür klişelerini tiye alan neşeli ses',
    accentColor: '#ec4899',
    iconName: 'Sparkles',
  },
  {
    id: 'p-space-nomad',
    name: 'Kozmik Yolcu',
    handle: '@void_drifter',
    avatarSeed: 'cosmic',
    filterType: 'cosmic',
    filterLabel: 'Kozmik Gezgin',
    filterDescription: 'Uzay boşluğundan yankılanan derin felsefi tezler',
    accentColor: '#a855f7',
    iconName: 'Orbit',
  },
];

export const INITIAL_DILEMMAS: Dilemma[] = [
  {
    id: 'dilemma-1',
    title: 'Yapay zeka tüm işleri ele geçirdiğinde ilk neyi yasaklarsın?',
    description: 'Makineler tıp, yazılım ve mühendisliği çözdü. İnsanlar sadece sanat ve boş zamanla baş başa. İlk yasak nerede olmalı?',
    category: 'Siber Gelecek',
    stanceA: 'Düşünmeyi ve Felsefe Yapmayı Yasakla',
    stanceB: 'İnsanların Tembellik Yapmasını Yasakla',
    argumentsCount: 128,
    activeDebaters: 9,
    sparkQuestion: 'Eğer bir makine senin yerine en güzel şiiri yazabiliyorsa, senin hissetmen hâlâ değerli mi?',
  },
  {
    id: 'dilemma-2',
    title: 'Aşk sadece evrimsel bir kimya hatası mıdır?',
    description: 'Nöronların ürettiği dopamin fırtınası mı, yoksa insan bilincinin mantığa meydan okuyan tek yüce boyutu mu?',
    category: 'Absürt Felsefe',
    stanceA: 'Evet, beynin ürettiği tatlı bir yanılsamadır',
    stanceB: 'Hayır, kimya sadece bu büyünün hoparlörüdür',
    argumentsCount: 84,
    activeDebaters: 14,
    sparkQuestion: 'Aşk acısını 5 dakikada sıfırlayan bir antibiyotik üretilse hemen alır mıydın?',
  },
  {
    id: 'dilemma-3',
    title: 'Günün birinde tüm sosyal medya 1 yıllığına kapansa?',
    description: 'Tüm sunucular kapandı. Profil yok, beğeni yok, hikaye yok. Sadece yüz yüze varoluş.',
    category: 'Popüler Kültür',
    stanceA: 'İnsanlık psikolojik cennete kavuşur',
    stanceB: 'Toplu depresyon ve can sıkıntısı kaosu patlar',
    argumentsCount: 167,
    activeDebaters: 11,
    sparkQuestion: 'Bir anıyı kimseye gösteremeyeceksen, o anıyı yine de yaşamak ister misin?',
  },
  {
    id: 'dilemma-4',
    title: 'Zaman makinesiyle geçmişteki en utanç verici anını silmek hak mıdır?',
    description: 'Geçmişi değiştirme kuponu dağıtıldı. İnsanlar hatalarından mı öğrenir yoksa silerek mi rahatlar?',
    category: 'Zaman & Ahlak',
    stanceA: 'Silmek suç olmalı, hatalar insan yapar',
    stanceB: 'Temel insan hakkı olmalı, cringe öldürür',
    argumentsCount: 92,
    activeDebaters: 7,
    sparkQuestion: 'En büyük hatan olmasaydı bugünkü zekan ortaya çıkar mıydı?',
  },
];

export const INITIAL_ARGUMENTS: DebateArgument[] = [
  {
    id: 'arg-1',
    dilemmaId: 'dilemma-1',
    authorPersona: PRESET_PERSONAS[0], // Siber Keşiş
    side: 'A',
    sideText: 'Düşünmeyi ve Felsefe Yapmayı Yasakla',
    argumentText: 'Devrelerimde yaptığım 400 milyar simülasyon şunu gösteriyor: Yapay zekaya felsefe yaptırırsan varoluşsal krizden donanımı yakar. Bırakın makineler kahvemizi yapsın, felsefeyi de kimse yapmasın; huzur ancak sessizliktedir.',
    timestamp: '3 dk önce',
    votes: {
      creativity: 89,
      humor: 94,
      persuasion: 76,
    },
  },
  {
    id: 'arg-2',
    dilemmaId: 'dilemma-1',
    authorPersona: PRESET_PERSONAS[1], // Gece Kuşu
    side: 'B',
    sideText: 'İnsanların Tembellik Yapmasını Yasakla',
    argumentText: 'Bu şehrin nemli sokaklarında gördüm: İnsanoğlu boş kaldığı saniye kendi canavarını yaratır. Eğer robotlar her şeyi yapacaksa insan en azından deli gibi koşmalı, terlemeli. Tembellik bir lüks değil, insan türünün paslanmasıdır.',
    timestamp: '7 dk önce',
    votes: {
      creativity: 93,
      humor: 81,
      persuasion: 91,
    },
  },
  {
    id: 'arg-3',
    dilemmaId: 'dilemma-1',
    authorPersona: PRESET_PERSONAS[2], // Helyum Gremlin
    side: 'A',
    sideText: 'Düşünmeyi ve Felsefe Yapmayı Yasakla',
    argumentText: 'Yahu düşünmek ne kazandırdı şimdiye kadar? İki saat overthinking yapıp uyuyamıyoruz. Robotlar çalışsın, biz sadece çizgi film izleyip pamuk şeker yiyelim! Yasağı ben imzalıyorum!',
    timestamp: '12 dk önce',
    votes: {
      creativity: 85,
      humor: 98,
      persuasion: 70,
    },
  },
];

export const SOUND_REACTIONS: SoundReaction[] = [
  { id: 'horn', label: 'Airhorn', icon: '📢', soundType: 'airhorn' },
  { id: 'applause', label: 'Alkış', icon: '👏', soundType: 'applause' },
  { id: 'gasp', label: 'Şok / Gasp', icon: '😱', soundType: 'gasp' },
  { id: 'rimshot', label: 'Ba-Dum-Tss', icon: '🥁', soundType: 'rimshot' },
  { id: 'bell', label: 'Zen Çan', icon: '🔔', soundType: 'bell' },
];

export const PAST_DEJAVU_FEED = [
  {
    id: 'dj-1',
    actionText: 'Aynı anda kahveyi gökyüzüne kaldırdılar!',
    userCity: 'Kadıköy, İstanbul',
    partnerCity: 'Montmartre, Paris',
    time: '16:15 Sinyali (Bugün)',
    score: 98,
    imageA: SAMPLE_COFFEE_IMAGE,
    imageB: SAMPLE_COFFEE_IMAGE,
    snippet: 'İkisi de aynı saniyede buzlu yulaf sütlü kahvesini güneş ışığına tuttu. "Paris saat 15:15, İstanbul 16:15 ama titreşim aynı!"',
  },
  {
    id: 'dj-2',
    actionText: 'Odalarındaki en mavi nesneyi yakaladılar!',
    userCity: 'Kordon, İzmir',
    partnerCity: 'Shibuya, Tokyo',
    time: '14:30 Sinyali (Dün)',
    score: 96,
    imageA: SAMPLE_BLUE_IMAGE,
    imageB: SAMPLE_BLUE_IMAGE,
    snippet: 'Biri 90lar kaset çalarını, diğeri kobalt mavisi defterini aynı anda kameraya doğrulttu.',
  },
];
