import { VoiceFilterType } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private monitorGainNode: GainNode | null = null;
  private outputGainNode: GainNode | null = null;
  
  // Modulation nodes
  private activeFilter: VoiceFilterType = 'robot';
  private filterNodes: {
    cleanUp: () => void;
    destination: AudioNode;
  } | null = null;

  // Recording
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;

  private isMonitoring = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public async startMicrophone(): Promise<MediaStream> {
    const ctx = this.getAudioContext();
    if (!this.micStream) {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.sourceNode = ctx.createMediaStreamSource(this.micStream);
      
      // Setup Analyser
      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Monitor Gain (default 0 to prevent acoustic feedback loop)
      this.monitorGainNode = ctx.createGain();
      this.monitorGainNode.gain.value = 0;

      // Output Gain (for visualizer & recording)
      this.outputGainNode = ctx.createGain();
      this.outputGainNode.gain.value = 1.0;

      // Build initial filter graph
      this.applyFilter(this.activeFilter);
    }
    return this.micStream;
  }

  public stopMicrophone(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.filterNodes) {
      this.filterNodes.cleanUp();
      this.filterNodes = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }
  }

  public isMicActive(): boolean {
    return !!this.micStream && this.micStream.active;
  }

  public setMonitoring(enabled: boolean): void {
    this.isMonitoring = enabled;
    if (this.monitorGainNode && this.ctx) {
      this.monitorGainNode.gain.setTargetAtTime(enabled ? 0.9 : 0, this.ctx.currentTime, 0.05);
    }
  }

  public getMonitoring(): boolean {
    return this.isMonitoring;
  }

  public applyFilter(filter: VoiceFilterType): void {
    this.activeFilter = filter;
    if (!this.sourceNode || !this.ctx || !this.analyserNode || !this.monitorGainNode || !this.outputGainNode) {
      return;
    }

    // Clean up prior filter graph
    if (this.filterNodes) {
      this.filterNodes.cleanUp();
      this.filterNodes = null;
    }

    try {
      this.sourceNode.disconnect();
    } catch {
      // ignore
    }

    const ctx = this.ctx;

    // Build filter network
    if (filter === 'clean') {
      this.sourceNode.connect(this.outputGainNode);
      this.filterNodes = {
        destination: this.outputGainNode,
        cleanUp: () => {
          try {
            this.sourceNode?.disconnect();
          } catch {
            // ignore
          }
        },
      };
    } else if (filter === 'robot') {
      // Ring Modulator: multiply input signal with a carrier oscillator
      const carrier = ctx.createOscillator();
      carrier.type = 'sawtooth';
      carrier.frequency.value = 65; // Robotic modulation carrier

      const carrierGain = ctx.createGain();
      carrierGain.gain.value = 0.5;

      const ringGain = ctx.createGain();
      ringGain.gain.value = 0; // modulated by carrier

      const filterBand = ctx.createBiquadFilter();
      filterBand.type = 'bandpass';
      filterBand.frequency.value = 1400;
      filterBand.Q.value = 2.5;

      carrier.connect(ringGain.gain);
      this.sourceNode.connect(ringGain);
      ringGain.connect(filterBand);
      filterBand.connect(this.outputGainNode);

      carrier.start();

      this.filterNodes = {
        destination: this.outputGainNode,
        cleanUp: () => {
          try {
            carrier.stop();
            carrier.disconnect();
            ringGain.disconnect();
            filterBand.disconnect();
          } catch {
            // ignore
          }
        },
      };
    } else if (filter === 'deep-noir') {
      // Cinema Deep Noir: Bass boost + warm saturation + lowpass
      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf';
      bassBoost.frequency.value = 140;
      bassBoost.gain.value = 11; // Heavy cinematic deep tone

      const lowPass = ctx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 1800;

      // Soft distortion curve
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.makeDistortionCurve(15) as any;
      shaper.oversample = '2x';

      // Subtle room reflections
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.04;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.2;

      this.sourceNode.connect(bassBoost);
      bassBoost.connect(shaper);
      shaper.connect(lowPass);

      lowPass.connect(this.outputGainNode);
      lowPass.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(this.outputGainNode);

      this.filterNodes = {
        destination: this.outputGainNode,
        cleanUp: () => {
          try {
            bassBoost.disconnect();
            shaper.disconnect();
            lowPass.disconnect();
            delay.disconnect();
            delayGain.disconnect();
          } catch {
            // ignore
          }
        },
      };
    } else if (filter === 'helium') {
      // High-pitch resonance simulation
      const highPass = ctx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = 650;

      const peak1 = ctx.createBiquadFilter();
      peak1.type = 'peaking';
      peak1.frequency.value = 2200;
      peak1.gain.value = 12;
      peak1.Q.value = 3;

      const peak2 = ctx.createBiquadFilter();
      peak2.type = 'highshelf';
      peak2.frequency.value = 3400;
      peak2.gain.value = 8;

      this.sourceNode.connect(highPass);
      highPass.connect(peak1);
      peak1.connect(peak2);
      peak2.connect(this.outputGainNode);

      this.filterNodes = {
        destination: this.outputGainNode,
        cleanUp: () => {
          try {
            highPass.disconnect();
            peak1.disconnect();
            peak2.disconnect();
          } catch {
            // ignore
          }
        },
      };
    } else if (filter === 'radio') {
      // Old Walkie-talkie / 90s police radio
      const highPass = ctx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = 500;

      const lowPass = ctx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 2800;

      const crunch = ctx.createWaveShaper();
      crunch.curve = this.makeDistortionCurve(35) as any;

      this.sourceNode.connect(highPass);
      highPass.connect(lowPass);
      lowPass.connect(crunch);
      crunch.connect(this.outputGainNode);

      this.filterNodes = {
        destination: this.outputGainNode,
        cleanUp: () => {
          try {
            highPass.disconnect();
            lowPass.disconnect();
            crunch.disconnect();
          } catch {
            // ignore
          }
        },
      };
    } else if (filter === 'cosmic') {
      // Cosmic void echo with feedback
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.28;

      const feedback = ctx.createGain();
      feedback.gain.value = 0.55;

      const dampFilter = ctx.createBiquadFilter();
      dampFilter.type = 'lowpass';
      dampFilter.frequency.value = 2500;

      this.sourceNode.connect(this.outputGainNode);
      this.sourceNode.connect(delay);
      delay.connect(dampFilter);
      dampFilter.connect(feedback);
      feedback.connect(delay);
      dampFilter.connect(this.outputGainNode);

      this.filterNodes = {
        destination: this.outputGainNode,
        cleanUp: () => {
          try {
            delay.disconnect();
            feedback.disconnect();
            dampFilter.disconnect();
          } catch {
            // ignore
          }
        },
      };
    } else if (filter === 'alien') {
      // Alien tremolo & weird peak
      const tremoloOsc = ctx.createOscillator();
      tremoloOsc.frequency.value = 16; // 16Hz flutter

      const tremoloGain = ctx.createGain();
      tremoloGain.gain.value = 0.6;

      const vca = ctx.createGain();
      vca.gain.value = 0.4;

      const peakFilter = ctx.createBiquadFilter();
      peakFilter.type = 'peaking';
      peakFilter.frequency.value = 1600;
      peakFilter.gain.value = 14;
      peakFilter.Q.value = 4;

      tremoloOsc.connect(tremoloGain);
      tremoloGain.connect(vca.gain);

      this.sourceNode.connect(peakFilter);
      peakFilter.connect(vca);
      vca.connect(this.outputGainNode);

      tremoloOsc.start();

      this.filterNodes = {
        destination: this.outputGainNode,
        cleanUp: () => {
          try {
            tremoloOsc.stop();
            tremoloOsc.disconnect();
            tremoloGain.disconnect();
            peakFilter.disconnect();
            vca.disconnect();
          } catch {
            // ignore
          }
        },
      };
    }

    // Connect output to Analyser and Monitor
    this.outputGainNode.connect(this.analyserNode);
    this.outputGainNode.connect(this.monitorGainNode);
    this.monitorGainNode.connect(ctx.destination);
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  // Audio Recording (10-second debate snippets with active modulation)
  public async startRecording(): Promise<void> {
    const ctx = this.getAudioContext();
    if (!this.outputGainNode) {
      await this.startMicrophone();
    }
    if (!this.outputGainNode) return;

    // Route modulated audio through a destination stream
    const dest = ctx.createMediaStreamDestination();
    this.outputGainNode.connect(dest);

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(dest.stream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start();
    this.isRecording = true;
  }

  public stopRecording(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve('');
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        this.isRecording = false;
        resolve(url);
      };

      this.mediaRecorder.stop();
    });
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  // Procedural Soundboard effects (synthesized live via Web Audio!)
  public playReactionSound(type: 'airhorn' | 'applause' | 'gasp' | 'rimshot' | 'bell'): void {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    if (type === 'airhorn') {
      // Classic DJ Airhorn synthesis
      const freqs = [370, 466, 554];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.96, now + 0.35);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      });
    } else if (type === 'applause') {
      // Filtered white noise burst for applause
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 1.5);
    } else if (type === 'gasp') {
      // Audience Gasp: reverse-pitch airy whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'rimshot') {
      // Comedy rimshot snare/knock
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'bell') {
      // Deja-Vu celestial sync chime
      [587, 880, 1174, 1760].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + idx * 0.08;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.3);
      });
    }
  }
}

export const audioEngine = new AudioEngine();
