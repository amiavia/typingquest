# PRP-017: Sound Effects and Music System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 4 phases, ~35 tasks

---

## Executive Summary

This PRP introduces a comprehensive audio system for TypeBit8, including 8-bit chiptune background music, typing sound effects, victory/defeat jingles, and boss battle music. The system will use the Web Audio API for high-performance playback, include volume controls and mute options, respect system audio settings, and provide a music player with track selection.

---

## Problem Statement

### Current State

1. **No audio feedback**: The game is completely silent
2. **Missing immersion**: Players lack auditory cues for their actions
3. **No atmosphere**: Background music would enhance the retro gaming experience
4. **Limited feedback**: Visual feedback alone doesn't provide complete action confirmation
5. **No celebration**: Victories and achievements feel less rewarding without sound

### Impact

| Issue | User Impact |
|-------|-------------|
| Silent gameplay | Reduced engagement and immersion |
| No typing feedback | Players can't "feel" their keystrokes audibly |
| Missing atmosphere | Game feels incomplete, less retro-authentic |
| No audio rewards | Victories and achievements feel less satisfying |
| Accessibility | Some users rely on audio cues for feedback |

### Success Criteria

- [ ] 8-bit chiptune background music plays during gameplay
- [ ] Distinct sound effects for correct typing, errors, and key presses
- [ ] Boss battle music creates tension and excitement
- [ ] Victory and defeat sounds provide clear feedback
- [ ] Volume controls allow users to adjust or mute all audio
- [ ] Music player allows track selection
- [ ] System mute settings are respected
- [ ] Audio doesn't interfere with browser performance

---

## Audio Architecture

### Technology Stack

**Web Audio API** - Primary audio engine
- Low latency playback
- Precise timing control
- Multiple simultaneous sounds
- Volume and fade controls
- Browser-native, no dependencies

**Audio Format** - MP3 or OGG
- Wide browser support
- Small file sizes for chiptune
- Fast loading and decoding

### Audio Context Management

```typescript
// src/audio/AudioEngine.ts
class AudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();

    // Chain: source -> category gain -> master gain -> destination
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
  }
}
```

---

## Phase 1: Audio Asset Creation

### 1.1 Background Music Tracks

**8-bit Chiptune Style** - NES/Game Boy inspired

| Track Name | BPM | Duration | Usage | Mood |
|------------|-----|----------|-------|------|
| Main Theme | 120 | 2:00 | Home screen, level select | Upbeat, adventurous |
| Practice Mode | 110 | 1:30 | Lesson practice stages | Focused, calm |
| Boss Battle 1 | 140 | 1:45 | Early boss fights (Levels 1-5) | Tense, exciting |
| Boss Battle 2 | 150 | 1:45 | Mid-game bosses (Levels 6-10) | Intense, challenging |
| Boss Battle 3 | 160 | 2:00 | Late-game bosses (Levels 11+) | Epic, climactic |
| Victory | 130 | 0:15 | Level complete screen | Triumphant, celebratory |
| Game Over | 90 | 0:10 | Defeat screen | Melancholy, try again |

**Musical Elements:**
- Simple square/triangle/sawtooth wave synths
- Arpeggiated chords for texture
- Punchy percussion (white noise + envelopes)
- Catchy melodic hooks
- Seamless loops (no audible start/end)

### 1.2 Sound Effects

**Typing Sounds:**
- `keypress.mp3` - Neutral key press (1-3 variations for randomization)
- `correct.mp3` - Correct letter typed (satisfying "ding" or "pop")
- `error.mp3` - Wrong letter typed (buzzer or "boop")
- `combo-build.mp3` - Combo counter increasing (ascending tones)
- `combo-break.mp3` - Combo lost (descending tone)

**UI Sounds:**
- `menu-select.mp3` - Hovering over buttons
- `menu-confirm.mp3` - Clicking buttons/starting level
- `menu-back.mp3` - Returning to previous screen
- `coin.mp3` - Earning coins
- `xp-gain.mp3` - XP bar filling
- `level-up.mp3` - Player leveling up

**Battle Sounds:**
- `boss-hit.mp3` - Damaging the boss (heavy impact)
- `player-hit.mp3` - Player taking damage
- `boss-appear.mp3` - Boss entrance warning
- `boss-defeat.mp3` - Boss defeated (extended explosion)

**Ambience:**
- `stage-clear.mp3` - Completing a practice stage
- `perfect-clear.mp3` - 100% accuracy bonus

### 1.3 Audio Generation Tools

**Option A: Commission from Chiptune Artist**
- Hire 8-bit music composer on Fiverr/Upwork
- Provide style references (Mega Man, Undertale, Shovel Knight)
- Request royalty-free commercial license

**Option B: AI Generation**
- Suno AI, Udio, or similar music generators
- Prompt: "8-bit NES chiptune, upbeat adventure theme, loop"
- Manual editing in DAW for loops and polish

**Option C: Use Existing Royalty-Free Libraries**
- OpenGameArt.org (CC0/CC-BY licenses)
- Freesound.org (filtered for chiptune)
- Incompetech.com (Kevin MacLeod library)

**Sound Effect Tools:**
- **BFXR / SFXR**: Browser-based retro sound effect generators
- **ChipTone**: More advanced chiptune SFX creator
- Manual creation in Audacity with square wave synths

---

## Phase 2: Core Audio Engine

### 2.1 AudioEngine Class

**New file: `src/audio/AudioEngine.ts`**

```typescript
export type SoundEffect =
  | 'keypress' | 'correct' | 'error'
  | 'combo-build' | 'combo-break'
  | 'menu-select' | 'menu-confirm' | 'menu-back'
  | 'coin' | 'xp-gain' | 'level-up'
  | 'boss-hit' | 'player-hit' | 'boss-appear' | 'boss-defeat'
  | 'stage-clear' | 'perfect-clear';

export type MusicTrack =
  | 'main-theme' | 'practice-mode'
  | 'boss-battle-1' | 'boss-battle-2' | 'boss-battle-3'
  | 'victory' | 'game-over';

interface AudioSettings {
  masterVolume: number;   // 0.0 - 1.0
  musicVolume: number;    // 0.0 - 1.0
  sfxVolume: number;      // 0.0 - 1.0
  muted: boolean;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private soundBuffers: Map<SoundEffect, AudioBuffer> = new Map();
  private musicBuffers: Map<MusicTrack, AudioBuffer> = new Map();

  private currentMusic: AudioBufferSourceNode | null = null;
  private currentTrack: MusicTrack | null = null;

  private settings: AudioSettings;
  private initialized = false;

  constructor() {
    this.settings = this.loadSettings();
  }

  // Initialize Web Audio Context (must be called after user interaction)
  async init(): Promise<void> {
    if (this.initialized) return;

    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    this.applySettings();
    await this.loadAssets();

    this.initialized = true;
  }

  // Load all audio assets
  private async loadAssets(): Promise<void> {
    const soundEffects: SoundEffect[] = [
      'keypress', 'correct', 'error', 'combo-build', 'combo-break',
      'menu-select', 'menu-confirm', 'menu-back',
      'coin', 'xp-gain', 'level-up',
      'boss-hit', 'player-hit', 'boss-appear', 'boss-defeat',
      'stage-clear', 'perfect-clear'
    ];

    const musicTracks: MusicTrack[] = [
      'main-theme', 'practice-mode',
      'boss-battle-1', 'boss-battle-2', 'boss-battle-3',
      'victory', 'game-over'
    ];

    // Load sound effects
    await Promise.all(
      soundEffects.map(async (name) => {
        const buffer = await this.loadAudioFile(`/audio/sfx/${name}.mp3`);
        this.soundBuffers.set(name, buffer);
      })
    );

    // Load music tracks
    await Promise.all(
      musicTracks.map(async (name) => {
        const buffer = await this.loadAudioFile(`/audio/music/${name}.mp3`);
        this.musicBuffers.set(name, buffer);
      })
    );
  }

  private async loadAudioFile(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return this.context!.decodeAudioData(arrayBuffer);
  }

  // Play sound effect
  playSFX(effect: SoundEffect, volume: number = 1.0): void {
    if (!this.context || !this.sfxGain || this.settings.muted) return;

    const buffer = this.soundBuffers.get(effect);
    if (!buffer) {
      console.warn(`Sound effect not loaded: ${effect}`);
      return;
    }

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.sfxGain);
    source.start();
  }

  // Play background music
  playMusic(track: MusicTrack, loop: boolean = true, fadeIn: number = 0.5): void {
    if (!this.context || !this.musicGain || this.settings.muted) return;

    // Stop current music if playing
    this.stopMusic();

    const buffer = this.musicBuffers.get(track);
    if (!buffer) {
      console.warn(`Music track not loaded: ${track}`);
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(this.musicGain);

    // Fade in
    if (fadeIn > 0) {
      this.musicGain.gain.setValueAtTime(0, this.context.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(
        this.settings.musicVolume,
        this.context.currentTime + fadeIn
      );
    }

    source.start();
    this.currentMusic = source;
    this.currentTrack = track;
  }

  // Stop background music
  stopMusic(fadeOut: number = 0.5): void {
    if (!this.context || !this.currentMusic || !this.musicGain) return;

    if (fadeOut > 0) {
      this.musicGain.gain.linearRampToValueAtTime(
        0,
        this.context.currentTime + fadeOut
      );
      setTimeout(() => {
        this.currentMusic?.stop();
        this.currentMusic = null;
        this.currentTrack = null;
      }, fadeOut * 1000);
    } else {
      this.currentMusic.stop();
      this.currentMusic = null;
      this.currentTrack = null;
    }
  }

  // Volume controls
  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume;
    }
    this.saveSettings();
  }

  setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.musicVolume;
    }
    this.saveSettings();
  }

  setSFXVolume(volume: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.settings.sfxVolume;
    }
    this.saveSettings();
  }

  toggleMute(): void {
    this.settings.muted = !this.settings.muted;
    if (this.settings.muted) {
      this.stopMusic(0);
    } else {
      // Resume previous track if available
      if (this.currentTrack) {
        this.playMusic(this.currentTrack);
      }
    }
    this.saveSettings();
  }

  // Settings persistence
  private loadSettings(): AudioSettings {
    const saved = localStorage.getItem('typebit8-audio-settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      masterVolume: 0.7,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      muted: false,
    };
  }

  private saveSettings(): void {
    localStorage.setItem('typebit8-audio-settings', JSON.stringify(this.settings));
  }

  private applySettings(): void {
    if (this.masterGain) this.masterGain.gain.value = this.settings.masterVolume;
    if (this.musicGain) this.musicGain.gain.value = this.settings.musicVolume;
    if (this.sfxGain) this.sfxGain.gain.value = this.settings.sfxVolume;
  }

  // Getters
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
```

### 2.2 React Hook for Audio

**New file: `src/hooks/useAudio.ts`**

```typescript
import { useEffect, useState } from 'react';
import { audioEngine, type MusicTrack, type SoundEffect } from '../audio/AudioEngine';

export function useAudio() {
  const [initialized, setInitialized] = useState(false);
  const [settings, setSettings] = useState(audioEngine.getSettings());

  useEffect(() => {
    // Initialize on first user interaction
    const initAudio = async () => {
      if (!audioEngine.isInitialized()) {
        await audioEngine.init();
        setInitialized(true);
      }
    };

    // Auto-init on any user interaction
    const handler = () => {
      initAudio();
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };

    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
  }, []);

  const playSFX = (effect: SoundEffect, volume?: number) => {
    audioEngine.playSFX(effect, volume);
  };

  const playMusic = (track: MusicTrack, loop?: boolean, fadeIn?: number) => {
    audioEngine.playMusic(track, loop, fadeIn);
  };

  const stopMusic = (fadeOut?: number) => {
    audioEngine.stopMusic(fadeOut);
  };

  const setMasterVolume = (volume: number) => {
    audioEngine.setMasterVolume(volume);
    setSettings(audioEngine.getSettings());
  };

  const setMusicVolume = (volume: number) => {
    audioEngine.setMusicVolume(volume);
    setSettings(audioEngine.getSettings());
  };

  const setSFXVolume = (volume: number) => {
    audioEngine.setSFXVolume(volume);
    setSettings(audioEngine.getSettings());
  };

  const toggleMute = () => {
    audioEngine.toggleMute();
    setSettings(audioEngine.getSettings());
  };

  return {
    initialized,
    settings,
    playSFX,
    playMusic,
    stopMusic,
    setMasterVolume,
    setMusicVolume,
    setSFXVolume,
    toggleMute,
    currentTrack: audioEngine.getCurrentTrack(),
  };
}
```

---

## Phase 3: UI Integration

### 3.1 Audio Settings Component

**New file: `src/components/AudioSettings.tsx`**

```typescript
import { useAudio } from '../hooks/useAudio';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioSettings({ isOpen, onClose }: AudioSettingsProps) {
  const { settings, setMasterVolume, setMusicVolume, setSFXVolume, toggleMute } = useAudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="pixel-box p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }}>
            AUDIO SETTINGS
          </h2>
          <button onClick={onClose} className="pixel-btn" style={{ fontSize: '10px', padding: '4px 8px' }}>
            X
          </button>
        </div>

        {/* Mute Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <label style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db' }}>
            MUTE ALL
          </label>
          <button
            onClick={toggleMute}
            className="pixel-btn"
            style={{
              background: settings.muted ? '#ff6b9d' : '#0ead69',
              padding: '8px 16px'
            }}
          >
            {settings.muted ? 'OFF' : 'ON'}
          </button>
        </div>

        {/* Master Volume */}
        <VolumeSlider
          label="MASTER"
          value={settings.masterVolume}
          onChange={setMasterVolume}
          disabled={settings.muted}
        />

        {/* Music Volume */}
        <VolumeSlider
          label="MUSIC"
          value={settings.musicVolume}
          onChange={setMusicVolume}
          disabled={settings.muted}
        />

        {/* SFX Volume */}
        <VolumeSlider
          label="SFX"
          value={settings.sfxVolume}
          onChange={setSFXVolume}
          disabled={settings.muted}
        />
      </div>
    </div>
  );
}

function VolumeSlider({
  label,
  value,
  onChange,
  disabled
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db' }}>
          {label}
        </label>
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#ffd93d' }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value * 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        disabled={disabled}
        className="w-full pixel-slider"
        style={{
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />
    </div>
  );
}
```

### 3.2 Music Player Component

**New file: `src/components/MusicPlayer.tsx`**

```typescript
import { useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import type { MusicTrack } from '../audio/AudioEngine';

const TRACKS: { id: MusicTrack; name: string }[] = [
  { id: 'main-theme', name: 'MAIN THEME' },
  { id: 'practice-mode', name: 'PRACTICE' },
  { id: 'boss-battle-1', name: 'BOSS 1' },
  { id: 'boss-battle-2', name: 'BOSS 2' },
  { id: 'boss-battle-3', name: 'BOSS 3' },
  { id: 'victory', name: 'VICTORY' },
  { id: 'game-over', name: 'GAME OVER' },
];

export function MusicPlayer() {
  const { playMusic, stopMusic, currentTrack, settings } = useAudio();
  const [expanded, setExpanded] = useState(false);

  const handleTrackSelect = (trackId: MusicTrack) => {
    if (currentTrack === trackId) {
      stopMusic(0.3);
    } else {
      playMusic(trackId, true, 0.3);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {expanded ? (
        <div className="pixel-box p-4 bg-[#1a1a2e]" style={{ minWidth: '200px' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#ffd93d' }}>
              MUSIC PLAYER
            </h3>
            <button
              onClick={() => setExpanded(false)}
              className="pixel-btn"
              style={{ fontSize: '8px', padding: '2px 6px' }}
            >
              -
            </button>
          </div>

          <div className="space-y-2">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track.id)}
                className="w-full text-left p-2 transition-colors"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  background: currentTrack === track.id ? '#3bceac' : '#2a2a4e',
                  color: currentTrack === track.id ? '#1a1a2e' : '#eef5db',
                  border: '2px solid',
                  borderColor: currentTrack === track.id ? '#ffd93d' : 'transparent',
                }}
              >
                {currentTrack === track.id && '▶ '}{track.name}
              </button>
            ))}
          </div>

          {currentTrack && (
            <button
              onClick={() => stopMusic(0.3)}
              className="pixel-btn mt-3 w-full"
              style={{
                background: '#ff6b9d',
                fontSize: '8px',
                padding: '6px'
              }}
            >
              ⏹ STOP
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="pixel-btn"
          style={{
            background: settings.muted ? '#4a4a6e' : '#3bceac',
            fontSize: '10px',
            padding: '8px 12px'
          }}
        >
          {settings.muted ? '🔇' : '🎵'}
        </button>
      )}
    </div>
  );
}
```

### 3.3 Integration into Gameplay

**Modify: `src/App.tsx`**

```typescript
import { useAudio } from './hooks/useAudio';
import { MusicPlayer } from './components/MusicPlayer';

function App() {
  const { playMusic, playSFX } = useAudio();

  useEffect(() => {
    // Play main theme on home screen
    playMusic('main-theme', true, 1.0);
  }, []);

  return (
    <>
      {/* Existing app content */}
      <MusicPlayer />
    </>
  );
}
```

**Modify: `src/components/LessonView.tsx`**

```typescript
import { useAudio } from '../hooks/useAudio';

function LessonView() {
  const { playMusic, playSFX } = useAudio();

  // Start practice music when lesson begins
  useEffect(() => {
    playMusic('practice-mode', true, 0.5);
  }, [lessonId]);

  // Play typing sounds
  const handleKeyPress = (correct: boolean) => {
    playSFX(correct ? 'correct' : 'error');
  };

  // Play stage clear sound
  const handleStageComplete = () => {
    playSFX('stage-clear');
  };

  // ...
}
```

**Modify: `src/components/Quiz.tsx`**

```typescript
import { useAudio } from '../hooks/useAudio';

function Quiz() {
  const { playMusic, stopMusic, playSFX } = useAudio();

  // Boss battle music based on level
  useEffect(() => {
    const battleTrack =
      lessonId <= 5 ? 'boss-battle-1' :
      lessonId <= 10 ? 'boss-battle-2' :
      'boss-battle-3';

    playMusic(battleTrack, true, 1.0);

    return () => stopMusic(0.5);
  }, [lessonId]);

  // Boss entrance sound
  useEffect(() => {
    playSFX('boss-appear', 1.0);
  }, []);

  // Damage sounds
  const handleBossHit = () => {
    playSFX('boss-hit', 0.9);
  };

  const handlePlayerHit = () => {
    playSFX('player-hit', 1.0);
  };

  // Victory/defeat
  const handleVictory = () => {
    stopMusic(0.3);
    playMusic('victory', false, 0.2);
    playSFX('boss-defeat', 1.0);
  };

  const handleDefeat = () => {
    stopMusic(0.3);
    playMusic('game-over', false, 0.2);
  };

  // ...
}
```

---

## Phase 4: Polish & Optimization

### 4.1 Audio Sprite System (Optional)

For better performance, combine small SFX into a single file:

```typescript
// Audio sprite map
const SFX_SPRITE = {
  keypress: { start: 0, duration: 0.1 },
  correct: { start: 0.1, duration: 0.2 },
  error: { start: 0.3, duration: 0.3 },
  // ... etc
};

// Play from sprite
playFromSprite(spriteName: string) {
  const sprite = SFX_SPRITE[spriteName];
  const source = this.context.createBufferSource();
  source.buffer = this.sfxSpriteBuffer;
  source.connect(this.sfxGain);
  source.start(this.context.currentTime, sprite.start, sprite.duration);
}
```

### 4.2 Preloading & Loading States

```typescript
// Show loading indicator while audio assets load
export function AudioLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    audioEngine.init().then(() => {
      setProgress(100);
      onComplete();
    });
  }, []);

  return (
    <div className="loading-screen">
      <p>LOADING AUDIO... {progress}%</p>
    </div>
  );
}
```

### 4.3 Respect System Mute Settings

```typescript
// Detect if user has muted their browser tab
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audioEngine.stopMusic(0.5);
  } else {
    // Resume music when tab becomes visible again
    const currentView = getCurrentView(); // app state
    const trackForView = getTrackForView(currentView);
    audioEngine.playMusic(trackForView, true, 0.5);
  }
});
```

### 4.4 Mobile Considerations

```typescript
// iOS requires user interaction before playing audio
// Show "Tap to Enable Sound" message on mobile
function iOSAudioUnlock() {
  const unlock = () => {
    const buffer = audioEngine.context.createBuffer(1, 1, 22050);
    const source = audioEngine.context.createBufferSource();
    source.buffer = buffer;
    source.connect(audioEngine.context.destination);
    source.start(0);

    document.removeEventListener('touchstart', unlock);
  };

  document.addEventListener('touchstart', unlock);
}
```

---

## File Structure

```
typingquest/
├── public/
│   └── audio/
│       ├── music/
│       │   ├── main-theme.mp3
│       │   ├── practice-mode.mp3
│       │   ├── boss-battle-1.mp3
│       │   ├── boss-battle-2.mp3
│       │   ├── boss-battle-3.mp3
│       │   ├── victory.mp3
│       │   └── game-over.mp3
│       └── sfx/
│           ├── keypress.mp3
│           ├── correct.mp3
│           ├── error.mp3
│           ├── combo-build.mp3
│           ├── combo-break.mp3
│           ├── menu-select.mp3
│           ├── menu-confirm.mp3
│           ├── menu-back.mp3
│           ├── coin.mp3
│           ├── xp-gain.mp3
│           ├── level-up.mp3
│           ├── boss-hit.mp3
│           ├── player-hit.mp3
│           ├── boss-appear.mp3
│           ├── boss-defeat.mp3
│           ├── stage-clear.mp3
│           └── perfect-clear.mp3
├── src/
│   ├── audio/
│   │   └── AudioEngine.ts        (new) - Core audio engine
│   ├── hooks/
│   │   └── useAudio.ts           (new) - React hook
│   ├── components/
│   │   ├── AudioSettings.tsx     (new) - Settings modal
│   │   ├── MusicPlayer.tsx       (new) - Music player UI
│   │   ├── LessonView.tsx        (modify) - Add typing sounds
│   │   ├── Quiz.tsx              (modify) - Add battle sounds/music
│   │   └── App.tsx               (modify) - Add music player
│   └── styles/
│       └── audio.css             (new) - Slider styling
```

---

## Implementation Order

1. **Asset Acquisition** - Commission or generate all audio files
2. **File Organization** - Place assets in public/audio/ folder
3. **Core Engine** - Build AudioEngine class
4. **React Hook** - Create useAudio hook
5. **Settings UI** - Build AudioSettings component
6. **Music Player** - Build MusicPlayer component
7. **Typing Integration** - Add sounds to LessonView
8. **Battle Integration** - Add music/sounds to Quiz
9. **Navigation Sounds** - Add UI interaction sounds
10. **Mobile Testing** - Test iOS audio unlock, respect mute
11. **Performance** - Optimize loading, consider audio sprites
12. **Polish** - Fine-tune volumes, crossfades, timing

---

## Notes

- **Web Audio API Context**: Must be initialized after user interaction (browser security)
- **Audio Budget**: Keep total audio assets under 5MB for fast loading
- **Loop Points**: Ensure seamless loops (no clicks/pops at start/end)
- **Mobile Performance**: Test battery drain, use mono files for SFX
- **Copyright**: Ensure all music is royalty-free or properly licensed
- **Accessibility**: Provide visual alternatives for audio-only feedback
- **Testing**: Test on Chrome, Firefox, Safari, iOS Safari, Android Chrome
- **Fallback**: App should work perfectly even if audio fails to load
- **Volume Defaults**: Start at 70% master to avoid startling users
- **Crossfading**: Use 0.3-0.5s fades for smooth transitions
