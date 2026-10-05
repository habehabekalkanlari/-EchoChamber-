import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini client init warning:', err);
  }
}

// Fallback dilemma catalog for offline/immediate speed
const FALLBACK_DILEMMAS = [
  {
    id: 'dilemma-ai-jobs',
    title: 'Yapay zeka tüm meslekleri ele geçirdiğinde ilk neyi yasaklarsın?',
    description: 'Tüm robotlar işleri devraldı. İnsanlar sadece boş vakit geçiriyor. İlk yasak ne olmalı?',
    category: 'Teknoloji & Gelecek',
    stanceA: 'Düşünmeyi ve Felsefe Yapmayı Yasakla',
    stanceB: 'İnsanların Tembellik Yapmasını Yasakla',
    argumentsCount: 142,
    activeDebaters: 8,
    sparkQuestion: 'Eğer yapay zeka her şeyi bizden iyi yapıyorsa, insanın varoluşsal çabası sadece nostalji midir?',
  },
  {
    id: 'dilemma-love-chemistry',
    title: 'Aşk sadece evrimsel bir kimya hatası mıdır?',
    description: 'Dopamin ve serotonin kokteyli mi, yoksa evrenin rasyonel mantığı aşan en derin gerçeği mi?',
    category: 'Absürt Felsefe',
    stanceA: 'Evet, nörokimyasal bir hayal ürünüdür',
    stanceB: 'Hayır, kimya sadece bu büyünün hoparlörüdür',
    argumentsCount: 96,
    activeDebaters: 12,
    sparkQuestion: 'Eğer bir hap alıp aşk acısını 5 dakikada silebilseydin, o ilacı içer miydin?',
  },
  {
    id: 'dilemma-social-media',
    title: 'Yarın tüm sosyal medya çökse insanlık daha mı mutlu olur?',
    description: 'Algoritmalar, bildirimler ve sonsuz kaydırma yok olsa hayat nasıl bir şeye dönüşürdü?',
    category: 'Popüler Kültür',
    stanceA: 'Kesinlikle evet, gerçek hayata döneriz',
    stanceB: 'Hayır, yalnızlık ve can sıkıntısı kaosa sürükler',
    argumentsCount: 215,
    activeDebaters: 15,
    sparkQuestion: 'Hikayene kimin baktığını bilmeden yaşamak özgürlük mü yoksa kopuş mu?',
  },
  {
    id: 'dilemma-time-travel',
    title: 'Geçmişi değiştirmek evrensel bir insan hakkı mı yoksa suç mu?',
    description: 'Zaman makinesi ucuzladı ve herkes alabildi. Hayatındaki en utanç verici anı silmek serbest olmalı mı?',
    category: 'Zaman & Etik',
    stanceA: 'Suç olmalı, kelebek etkisi evreni çökertir',
    stanceB: 'Temel hak olmalı, kimse cringe anılarıyla yaşamak zorunda değil',
    argumentsCount: 88,
    activeDebaters: 6,
    sparkQuestion: 'Hataların olmadan bugünkü sen olabilir miydin?',
  },
];

// Fallback flash challenges for Deja-Vu
const FALLBACK_SYNC_CHALLENGES = [
  {
    id: 'sync-coffee',
    actionText: 'Şu an elindeki bardağı/kahveyi gökyüzüne doğru havaya kaldır!',
    category: 'İçecek & Ritüel',
    hint: 'Bardağını ışığa tut ve bir yabancıyla aynı anda şerefe de.',
    icon: 'coffee',
    targetObject: 'Bardak / Kupa / Kahve',
  },
  {
    id: 'sync-blue',
    actionText: 'Şu an bulunduğun yerdeki en mavi objeyi bul ve kameraya göster!',
    category: 'Renk & Algı',
    hint: 'Bir kalem, defter, kupa veya çorap olabilir.',
    icon: 'palette',
    targetObject: 'Mavi Obje',
  },
  {
    id: 'sync-window',
    actionText: 'En yakın pencereye veya dışarıya bakıp iki parmağınla zafer/barış işareti yap!',
    category: 'Mekan & Özgürlük',
    hint: 'Aynı saniyede başka bir şehirde biri de aynı göğe bakıyor.',
    icon: 'sun',
    targetObject: 'Pencere / Gökyüzü / Barış İşareti',
  },
  {
    id: 'sync-shoe',
    actionText: 'Ayağındaki ayakkabıyı veya çorabı kameraya doğru uzat!',
    category: 'Spontan Spatula',
    hint: 'Z kuşağı absürt senkronizasyon testi.',
    icon: 'footprints',
    targetObject: 'Ayakkabı / Çorap',
  },
  {
    id: 'sync-weird-object',
    actionText: 'Masandaki veya çantandaki en saçma nesneyi havaya kaldır!',
    category: 'Absürt Koleksiyon',
    hint: 'Eski bir fiş, garip bir anahtarlık ya da kırık cetvel.',
    icon: 'sparkles',
    targetObject: 'Garip Nesne',
  },
];

// Endpoint: Generate dynamic Dilemma
app.post('/api/echo/dilemmas/generate', async (req, res) => {
  try {
    const { categoryPrompt } = req.body || {};
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Sen EchoChamber adında, gençlerin (Z kuşağı) absürt felsefi, popüler kültür ve toplumsal klişe ikilemlerini anonim olarak ses değiştirme filtreleriyle tartıştığı bir sesli arenanın kuratörüsün.
        Bize Türkçe, aşırı merak uyandıran, düşündüren ve eğlenceli TEK BİR yeni ikilem üret.
        Kategori ipucu (varsa): "${categoryPrompt || 'Herhangi bir absürt veya derin Z kuşağı konusu'}".
        Format sadece saf JSON olmalı:
        {
          "title": "Kısa ve çarpıcı ikilem başlığı (soru formatında)",
          "description": "1-2 cümlelik açıklama",
          "category": "Kategori adı (örn: Absürt Felsefe, Popüler Kültür, Siber Gelecek, Z Kuşağı İlişkileri)",
          "stanceA": "Taraf 1 savunusu (kısa ve net)",
          "stanceB": "Taraf 2 savunusu (kısa ve net)",
          "sparkQuestion": "Tartışmayı alevlendirecek kışkırtıcı soru"
        }`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.9,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title) {
        return res.json({
          dilemma: {
            id: `dilemma-${Date.now()}`,
            title: parsed.title,
            description: parsed.description,
            category: parsed.category || 'Absürt Felsefe',
            stanceA: parsed.stanceA,
            stanceB: parsed.stanceB,
            argumentsCount: Math.floor(Math.random() * 50) + 12,
            activeDebaters: Math.floor(Math.random() * 10) + 4,
            sparkQuestion: parsed.sparkQuestion,
          },
        });
      }
    }
  } catch (error) {
    console.error('Gemini dilemma error:', error);
  }

  // Fallback random dilemma
  const randomDilemma = FALLBACK_DILEMMAS[Math.floor(Math.random() * FALLBACK_DILEMMAS.length)];
  return res.json({ dilemma: { ...randomDilemma, id: `dilemma-${Date.now()}` } });
});

// Endpoint: Generate simulated AI argument in persona
app.post('/api/echo/arguments/generate', async (req, res) => {
  try {
    const { dilemmaTitle, stance, personaName, personaTone } = req.body;
    if (ai && dilemmaTitle) {
      const prompt = `Sen EchoChamber sesli arenasında anonim bir tartışmacısın.
      Karakterin: "${personaName || 'Siber Filozof'}" (${personaTone || 'Robotik, mantıklı, hafif iğneleyici ve yaratıcı'}).
      Tartışma konusu: "${dilemmaTitle}".
      Savunduğun taraf: "${stance || 'Taraf A'}".
      Lütfen 2-3 cümlelik, Z kuşağı tarzında, metafor dolu, zekice ve çok yaratıcı bir sesli argüman yaz.
      Doğrudan karakterin ağzından konuş (örn: "Bakın dostlar...", "Devrelerim bana söylüyor ki...").
      Sadece argüman metnini döndür.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({ argumentText: text });
      }
    }
  } catch (err) {
    console.error('Gemini argument error:', err);
  }

  // Fallback argument
  const fallbacks = [
    'Bakın mesele kimin haklı olduğu değil; rasyonel olarak bu argüman çökmeye mahkum. Çünkü geleceğin kodları bu yanılsamanın üstüne yazılamaz!',
    'Devrelerim ve sezgilerim aynı noktada birleşiyor: Bu iddia sadece nostaljik bir avuntudan ibaret. Yaratıcı zeka burada bambaşka bir ufuk görüyor.',
    'Bunu sokakta kime sorsan ezbere cevap verir, ama gerçek şu ki: Asıl kaos bunu kabul etmediğimiz anda başlayacak.',
  ];
  const argumentText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return res.json({ argumentText });
});

// Endpoint: AI Judge / Jury review
app.post('/api/echo/judge', async (req, res) => {
  try {
    const { dilemmaTitle, argumentA, argumentB } = req.body;
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `EchoChamber jürisisin. İki anonim karakterin argümanlarını değerlendir.
        Burada kimin 'haklı' olduğu değil, HANGİ ARGÜMANIN DAHA YARATICI, ZEKİCE VE ÖZGÜN olduğu oylanır.
        
        Konu: "${dilemmaTitle}"
        1. Argüman: "${argumentA}"
        2. Argüman: "${argumentB}"
        
        Lütfen JSON formatında döndür:
        {
          "winner": "A" veya "B" veya "Berabere",
          "verdictTitle": "Jüri Kararı (Kısa, esprili Z kuşağı başlığı)",
          "creativeCritique": "2 cümlelik zekice, samimi yorum",
          "scores": {
            "sideA": { "creativity": 88, "humor": 92, "persuasion": 80 },
            "sideB": { "creativity": 94, "humor": 85, "persuasion": 89 }
          }
        }`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.verdictTitle) {
        return res.json(parsed);
      }
    }
  } catch (err) {
    console.error('Gemini judge error:', err);
  }

  return res.json({
    winner: 'B',
    verdictTitle: 'Metaforik Üstünlük ve Kaotik Yaratıcılık Kazandı!',
    creativeCritique: 'Taraf B kurduğu sıra dışı analojiyle dinleyicileri ters köşe yaptı. A tarafı sağlamdı ancak B tarafının absürt cesareti oyları topladı.',
    scores: {
      sideA: { creativity: 84, humor: 78, persuasion: 85 },
      sideB: { creativity: 96, humor: 91, persuasion: 88 },
    },
  });
});

// Endpoint: Generate TTS speech if requested
app.post('/api/echo/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (ai && text) {
      const voiceName = voice || 'Fenrir'; // Puck, Charon, Kore, Fenrir, Zephyr
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audioDataUrl: `data:audio/wav;base64,${base64Audio}` });
      }
    }
  } catch (err) {
    console.error('Gemini TTS error:', err);
  }
  return res.json({ audioDataUrl: null });
});

// Endpoint: Generate Deja-Vu challenge
app.post('/api/dejavu/challenge', async (req, res) => {
  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Deja-Vu adlı senkronize anı oyunu için anlık, heyecan verici, Z kuşağı tarzı bir aksiyon sinyali üret.
        İki yabancı dünyanın farklı yerlerinde aynı saniyede bu hareketi yapacak.
        Örnekler: "Şu an elindeki kahveyi havaya kaldır", "Bulunduğun odadaki en mavi nesneyi göster", "Pencereden bakıp barış işareti yap".
        Format JSON:
        {
          "actionText": "Eylem çağrısı",
          "category": "Kategori",
          "hint": "Kısa ipucu",
          "targetObject": "Hedef obje/hareket"
        }`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.95,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.actionText) {
        return res.json({
          challenge: {
            id: `sync-${Date.now()}`,
            ...parsed,
          },
        });
      }
    }
  } catch (err) {
    console.error('Gemini Deja-Vu challenge error:', err);
  }

  const randomChallenge = FALLBACK_SYNC_CHALLENGES[Math.floor(Math.random() * FALLBACK_SYNC_CHALLENGES.length)];
  return res.json({ challenge: { ...randomChallenge, id: `sync-${Date.now()}` } });
});

// Endpoint: Verify Deja-Vu match & generate story
app.post('/api/dejavu/verify', async (req, res) => {
  try {
    const { actionText, partnerCity, userCity } = req.body;
    const score = Math.floor(Math.random() * 8) + 92; // 92% - 99%

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Deja-Vu oyununda iki yabancı (${userCity || 'İstanbul'} ve ${partnerCity || 'Tokyo'}) aynı anda "${actionText}" eylemini gerçekleştirdi ve Deja-Vu patlaması yaşandı!
        Senkronizasyon skoru: %${score}.
        Lütfen bu iki kişi için 2 cümlelik büyüleyici, tatlı ve Z kuşağına hitap eden gizemli bir evrensel tesadüf hikayesi ve bir buz kırıcı sohbet sorusu yaz.
        Format JSON:
        {
          "story": "Evrensel bağ hikayesi",
          "icebreaker": "Buz kırıcı sohbet sorusu"
        }`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.story) {
        return res.json({
          score,
          story: parsed.story,
          icebreaker: parsed.icebreaker,
        });
      }
    }
  } catch (err) {
    console.error('Gemini Deja-Vu verify error:', err);
  }

  return res.json({
    score: 97,
    story: 'Farklı zaman dilimlerinde, bambaşka sokaklarda aynı anda bu anı yakaladınız. Kuantum fiziği buna rastlantı diyemez.',
    icebreaker: 'Şu an çalan şarkı veya aklındaki en absürt düşünce neydi?',
  });
});

// Vite middleware mounting or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
