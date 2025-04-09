import * as Tone from 'tone';

class AudioManager {
  constructor() {
    this.initialized = false;
    this.synth = null;
    this.currentlyPlayingButtons = new Set();
  }

  // Audio-Kontext initialisieren
  async initialize() {
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
        },
        volume: -6        // Etwas leiser für angenehmere Lautstärke
      });

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Fehler beim Initialisieren des Audio-Kontexts:', error);
      return false;
    }
  }

  // Ton abspielen
  async playNote(noteString, duration = "0.8") { // In sekunden
    // Bei erstem Aufruf initialisieren
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        return false;
      }
    }

    try {
      // Note in Tone.js-Format umwandeln
      const formattedNote = this.formatNote(noteString);
      if (!formattedNote) {
        console.error(`Note ${noteString} konnte nicht formatiert werden`);
        return false;
      }

      // Ton abspielen
      this.synth.triggerAttackRelease(formattedNote, duration);
      return true;
    } catch (error) {
      console.error('Fehler beim Abspielen der Note:', error);
      return false;
    }
  }

  // Notennamen formatieren
  formatNote(noteString) {
    // Entferne Leerzeichen und Standardisiere
    const cleanNote = noteString.trim();
    // Einfaches Regex-Pattern für gängige Notennamen prüfen: C4, A#3, Bb5 usw.
    const standardNotePattern = /^([A-H])([#b]?)(\d?)$/;
    const match = cleanNote.match(standardNotePattern);
    if (!match) {
      console.error(`Invalid noteString ${noteString}.`);
      return;
    }

      // Deutsche Notenbezeichnungen umwandeln
      const germanMappings = {
        'H': 'B',
        'B': 'Bb',
      };

    const [_, inputNote, accidental, inputOctave] = match;
    const octave = inputOctave || '4';
    const note = germanMappings[inputNote] || inputNote;
    return note + accidental + octave;
  }

  // Wiedergabestatus für einen Button aktualisieren
  updatePlayingStatus(button, isPlaying) {
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
