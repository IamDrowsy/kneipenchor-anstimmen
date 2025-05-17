import * as Tone from 'tone';
import { Note }  from 'tone/Tone/core/type/NoteUnits'
import { SongNote } from './types';

// Define dB range for volume control
const MIN_DB = -60; // For 0% volume
const MAX_DB = 0;   // For 100% volume

class AudioManager {
  initialized: boolean;
  synth: Tone.PolySynth | null;
  currentlyPlayingButtons: Set<HTMLButtonElement>;
  currentVolumePercent: number; // Store as 0-100

  constructor() {
    this.initialized = false;
    this.synth = null;
    this.currentlyPlayingButtons = new Set();
    this.currentVolumePercent = 90; // Default volume, maps to approx -6dB
  }

  // Convert percentage (0-100) to dB
  private convertPercentToDb(percent: number): number {
    if (percent === 0) {
      return -Infinity; // Tone.js handles -Infinity as mute
    }
    return MIN_DB + (percent / 100) * (MAX_DB - MIN_DB);
  }

  // Audio-Kontext initialisieren
  async initialize(): Promise<boolean> { // No longer needs initialVolumePercent parameter
    if (this.initialized) return true;

    try {
      // Audio-Kontext starten (erforderlich bei vielen Browsern)
      await Tone.start();
      console.log('Audio-Kontext gestartet');

      // Synth erstellen
      this.synth = new Tone.PolySynth(Tone.Synth).toDestination();

      // Optimierte Einstellungen für Klarheit
      this.synth.set({
        oscillator: {
          type: 'triangle' // Klar und weniger aggressiv als 'square' oder 'sawtooth'
        },
        envelope: {
          attack: 0.05,   // Schneller Einsatz
          decay: 0.1,     // Kurzer Decay für klaren Ton  
          sustain: 0.4,   // Hoher Sustain für gutes Hören
          release: 0.5    // Längeres Ausklingen für natürlicheren Klang
        }
        // Volume will be set by setVolume method right after this
      });
      this.setVolume(this.currentVolumePercent); // Apply the current/initial volume
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Fehler beim Initialisieren des Audio-Kontexts:', error);
      return false;
    }
  }

  // Set volume (input is 0-100 percent)
  setVolume(percent: number): void {
    this.currentVolumePercent = Math.max(0, Math.min(100, percent)); // Clamp to 0-100
    const dbValue = this.convertPercentToDb(this.currentVolumePercent);

    if (this.synth) {
      this.synth.volume.value = dbValue;
      console.log(`AudioManager: Volume set to ${this.currentVolumePercent}% (${dbValue.toFixed(2)} dB)`);
    } else {
      // If synth is not yet initialized, this.currentVolumePercent will be used during initialization.
      console.log(`AudioManager: Synth not initialized. Volume ${this.currentVolumePercent}% will be applied upon initialization.`);
    }
  }

  // Ton abspielen
  async playNote(songNote: SongNote, durationMs: number): Promise<boolean> {
    if (!this.initialized) {
      const success = await this.initialize(); // Initialize will use this.currentVolumePercent
      if (!success) {
        return false;
      }
    }

    try {
      // Note in Tone.js-Format umwandeln
      const formattedNote = this.formatNote(songNote);
      if (!formattedNote) {
        console.error(`Note ${songNote} konnte nicht formatiert werden`);
        return false;
      }

      // Ton abspielen
      if (this.synth) {
        const durationSeconds = durationMs / 1000; // Convert ms to seconds
        this.synth.triggerAttackRelease(formattedNote, durationSeconds);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Fehler beim Abspielen der Note:', error);
      return false;
    }
  }

  // Notennamen formatieren
  formatNote(songNote: SongNote): Note | undefined {
    // Entferne Leerzeichen und Standardisiere
    const cleanNote = songNote.trim();
    // Einfaches Regex-Pattern für gängige Notennamen prüfen: C4, A#3, Bb5 usw.
    const standardNotePattern = /^([A-H])([#b]?)(\d?)$/;
    const match = cleanNote.match(standardNotePattern);
    if (!match) {
      console.error(`Invalid noteString ${songNote}.`);
      return undefined;
    }

    // Deutsche Notenbezeichnungen umwandeln
    const germanMappings: Record<string, string> = {
      'H': 'B',
      'B': 'Bb',
    };

    const [_, inputNote, accidental, inputOctave] = match;
    const octave = inputOctave || '4';
    const note = germanMappings[inputNote] || inputNote;
    // TODO Mehr Type Check wie aus SongNote eine Note wird?
    return note + accidental + octave as Note ;
  }

  // Wiedergabestatus für einen Button aktualisieren
  updatePlayingStatus(button: HTMLButtonElement, isPlaying: boolean): void {
    if (isPlaying) {
      this.currentlyPlayingButtons.add(button);
      button.classList.add('playing');
    } else {
      this.currentlyPlayingButtons.delete(button);
      button.classList.remove('playing');
    }
  }
}

// Singleton-Instanz exportieren
export default new AudioManager();
