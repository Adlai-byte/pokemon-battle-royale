// js/music.js - Multi-track chiptune music using Web Audio API

const TRACKS = {
    menu: {
        tempo: 100,
        loop: true,
        stepsPerLoop: 64,
        bassWaveform: 'triangle',
        melodyWaveform: 'sine',
        bassVolume: 0.10,
        melodyVolume: 0.06,
        bassLine: [
            55.00, 0, 55.00, 0,  55.00, 0, 0, 0,
            65.41, 0, 65.41, 0,  65.41, 0, 0, 0,
            73.42, 0, 73.42, 0,  73.42, 0, 0, 0,
            65.41, 0, 65.41, 0,  65.41, 0, 0, 0,
            55.00, 0, 55.00, 0,  55.00, 0, 0, 0,
            49.00, 0, 49.00, 0,  49.00, 0, 0, 0,
            55.00, 0, 55.00, 0,  55.00, 0, 0, 0,
            65.41, 0, 0, 0,      55.00, 0, 0, 0,
        ],
        melodyLine: [
            220.0, 0, 261.6, 0, 329.6, 0, 0, 0,
            349.2, 0, 329.6, 0, 261.6, 0, 0, 0,
            293.7, 0, 329.6, 0, 349.2, 0, 0, 0,
            329.6, 0, 261.6, 0, 220.0, 0, 0, 0,
            220.0, 0, 261.6, 0, 329.6, 0, 0, 0,
            196.0, 0, 220.0, 0, 261.6, 0, 0, 0,
            220.0, 0, 261.6, 0, 293.7, 0, 0, 0,
            329.6, 0, 0, 0,     261.6, 0, 0, 0,
        ],
        drums: {
            kick: [],
            snare: [],
            hihat: [0, 8, 16, 24, 32, 40, 48, 56],
        },
    },

    betting: {
        tempo: 120,
        loop: true,
        stepsPerLoop: 64,
        bassWaveform: 'triangle',
        melodyWaveform: 'square',
        bassVolume: 0.10,
        melodyVolume: 0.06,
        bassLine: [
            55.00, 55.00, 0, 55.00,  0, 55.00, 0, 0,
            58.27, 58.27, 0, 58.27,  0, 58.27, 0, 0,
            65.41, 65.41, 0, 65.41,  0, 65.41, 0, 0,
            61.74, 61.74, 0, 61.74,  0, 61.74, 0, 0,
            55.00, 55.00, 0, 55.00,  0, 55.00, 0, 0,
            49.00, 49.00, 0, 49.00,  0, 49.00, 0, 0,
            46.25, 46.25, 0, 46.25,  0, 49.00, 0, 0,
            55.00, 0, 0, 0,          0, 0, 0, 0,
        ],
        melodyLine: [
            220.0, 0, 0, 233.1, 0, 0, 220.0, 0,
            207.7, 0, 0, 220.0, 0, 0, 0, 0,
            261.6, 0, 0, 246.9, 0, 0, 233.1, 0,
            220.0, 0, 0, 0,     0, 0, 0, 0,
            220.0, 0, 0, 207.7, 0, 0, 196.0, 0,
            185.0, 0, 0, 196.0, 0, 0, 0, 0,
            174.6, 0, 0, 185.0, 0, 0, 196.0, 0,
            220.0, 0, 0, 0,     0, 0, 0, 0,
        ],
        drums: {
            kick: [0, 16, 32, 48],
            snare: [12, 28, 44, 60],
            hihat: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60],
        },
    },

    battle: {
        tempo: 140,
        loop: true,
        stepsPerLoop: 64,
        bassWaveform: 'square',
        melodyWaveform: 'square',
        bassVolume: 0.12,
        melodyVolume: 0.08,
        bassLine: [
            65.41, 65.41, 0, 65.41,  82.41, 82.41, 0, 82.41,
            73.42, 73.42, 0, 73.42,  87.31, 87.31, 0, 87.31,
            65.41, 65.41, 0, 65.41,  82.41, 82.41, 0, 82.41,
            98.00, 98.00, 0, 87.31,  82.41, 0, 73.42, 0,
            55.00, 55.00, 0, 55.00,  69.30, 69.30, 0, 69.30,
            61.74, 61.74, 0, 61.74,  73.42, 73.42, 0, 73.42,
            55.00, 55.00, 0, 55.00,  69.30, 69.30, 0, 69.30,
            82.41, 82.41, 0, 73.42,  69.30, 0, 65.41, 0,
        ],
        melodyLine: [
            261.6, 0, 329.6, 0, 392.0, 0, 329.6, 0,
            349.2, 0, 293.7, 0, 349.2, 0, 392.0, 0,
            261.6, 0, 329.6, 0, 440.0, 0, 392.0, 0,
            349.2, 0, 329.6, 0, 293.7, 0, 261.6, 0,
            220.0, 0, 277.2, 0, 329.6, 0, 277.2, 0,
            293.7, 0, 246.9, 0, 293.7, 0, 329.6, 0,
            220.0, 0, 277.2, 0, 370.0, 0, 329.6, 0,
            293.7, 0, 277.2, 0, 246.9, 0, 220.0, 0,
        ],
        drums: {
            kick: [0, 8, 16, 24, 32, 40, 48, 56],
            snare: [4, 12, 20, 28, 36, 44, 52, 60],
            hihat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30,
                    32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62],
        },
    },

    victory: {
        tempo: 160,
        loop: false,
        stepsPerLoop: 32,
        bassWaveform: 'triangle',
        melodyWaveform: 'square',
        bassVolume: 0.12,
        melodyVolume: 0.10,
        bassLine: [
            130.8, 130.8, 0, 0, 164.8, 164.8, 0, 0,
            196.0, 196.0, 0, 0, 261.6, 261.6, 0, 0,
            196.0, 196.0, 0, 0, 261.6, 261.6, 0, 0,
            329.6, 329.6, 329.6, 329.6, 329.6, 0, 0, 0,
        ],
        melodyLine: [
            523.3, 0, 587.3, 0, 659.3, 0, 784.0, 0,
            659.3, 0, 784.0, 0, 1047, 0, 0, 0,
            784.0, 0, 1047, 0, 1175, 0, 1319, 0,
            1047, 1047, 1047, 1047, 1047, 0, 0, 0,
        ],
        drums: {
            kick: [0, 4, 8, 12, 16, 20, 24, 28],
            snare: [2, 6, 10, 14, 18, 22, 26, 30],
            hihat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
        },
    },
};

export class MusicManager {
    constructor() {
        this.ctx = null;
        this.playing = false;
        this.muted = false;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.nextNoteTime = 0;
        this.currentStep = 0;
        this.schedulerTimer = null;
        this.currentTrack = null;
        this.currentTrackName = null;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : 0.15;
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 1.0;
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 1.0;
        this.sfxGain.connect(this.masterGain);
    }

    playTrack(name) {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const track = TRACKS[name];
        if (!track) return;

        // Stop current playback
        this._stopScheduler();

        this.currentTrack = track;
        this.currentTrackName = name;
        this.playing = true;
        this.currentStep = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this._schedule();
    }

    stop() {
        this.playing = false;
        this._stopScheduler();
        this.currentTrack = null;
        this.currentTrackName = null;
    }

    _stopScheduler() {
        this.playing = false;
        if (this.schedulerTimer) {
            clearTimeout(this.schedulerTimer);
            this.schedulerTimer = null;
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 0.15;
        }
        return this.muted;
    }

    _schedule() {
        if (!this.playing || !this.currentTrack) return;
        const track = this.currentTrack;
        const stepDuration = 60 / track.tempo / 2; // 16th notes

        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this._playStep(this.currentStep, this.nextNoteTime, stepDuration);
            this.nextNoteTime += stepDuration;
            this.currentStep++;

            if (this.currentStep >= track.stepsPerLoop) {
                if (track.loop) {
                    this.currentStep = 0;
                } else {
                    // One-shot track finished
                    this.playing = false;
                    this.schedulerTimer = null;
                    return;
                }
            }
        }

        this.schedulerTimer = setTimeout(() => this._schedule(), 25);
    }

    _playStep(step, time, dur) {
        const track = this.currentTrack;
        if (!track) return;

        const bassFreq = track.bassLine[step % track.bassLine.length];
        if (bassFreq > 0) {
            this._playTone(bassFreq, time, dur * 0.8, track.bassWaveform, track.bassVolume);
        }

        const melodyFreq = track.melodyLine[step % track.melodyLine.length];
        if (melodyFreq > 0 && step % 2 === 0) {
            this._playTone(melodyFreq, time, dur * 1.5, track.melodyWaveform, track.melodyVolume);
        }

        // Drums
        if (track.drums.kick.includes(step % track.stepsPerLoop)) {
            this._playDrum(time, 'kick');
        }
        if (track.drums.snare.includes(step % track.stepsPerLoop)) {
            this._playDrum(time, 'snare');
        }
        if (track.drums.hihat.includes(step % track.stepsPerLoop)) {
            this._playDrum(time, 'hihat');
        }
    }

    _playTone(freq, time, duration, type, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + duration + 0.01);
    }

    _playDrum(time, type) {
        if (type === 'kick') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(time);
            osc.stop(time + 0.15);
        } else if (type === 'snare') {
            const bufferSize = this.ctx.sampleRate * 0.08;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
            noise.connect(gain);
            gain.connect(this.musicGain);
            noise.start(time);
            noise.stop(time + 0.08);
        } else if (type === 'hihat') {
            const bufferSize = this.ctx.sampleRate * 0.03;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 8000;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.04, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            noise.start(time);
            noise.stop(time + 0.03);
        }
    }

    playSFX(type) {
        if (!this.ctx || this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const t = this.ctx.currentTime;
        switch (type) {
            case 'hit': this._sfxHit(t); break;
            case 'superEffective': this._sfxSuperEffective(t); break;
            case 'crit': this._sfxCrit(t); break;
            case 'elimination': this._sfxElimination(t); break;
            case 'evolution': this._sfxEvolution(t); break;
            case 'itemPickup': this._sfxItemPickup(t); break;
        }
    }

    _sfxHit(t) {
        const bufSize = this.ctx.sampleRate * 0.06;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        src.connect(g);
        g.connect(this.sfxGain);
        src.start(t);
        src.stop(t + 0.06);
    }

    _sfxSuperEffective(t) {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    _sfxCrit(t) {
        const bufSize = this.ctx.sampleRate * 0.04;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        src.connect(g);
        g.connect(this.sfxGain);
        src.start(t);
        src.stop(t + 0.04);
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        const g2 = this.ctx.createGain();
        g2.gain.setValueAtTime(0.15, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(g2);
        g2.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    _sfxElimination(t) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.35);
    }

    _sfxEvolution(t) {
        const notes = [261.6, 329.6, 392.0];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = freq;
            const g = this.ctx.createGain();
            const start = t + i * 0.15;
            g.gain.setValueAtTime(0.1, start);
            g.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.2);
        });
    }

    _sfxItemPickup(t) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.3, t);
        osc.frequency.setValueAtTime(784.0, t + 0.05);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    setMusicVolume(value) {
        if (this.musicGain) this.musicGain.gain.value = value;
    }

    setSfxVolume(value) {
        if (this.sfxGain) this.sfxGain.gain.value = value;
    }
}
