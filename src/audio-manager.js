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
          attack: 0.01,   // Schneller Einsatz
          decay: 0.1,     // Kurzer Decay für klaren Ton  
          sustain: 0.8,   // Hoher Sustain für gutes Hören
          release: 1.5    // Längeres Ausklingen für natürlicheren Klang
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
  async playNote(noteString, duration = "1n") {
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
    const standardNotePattern = /^[A-Ga-g][#b]?\d$/;
    if (standardNotePattern.test(cleanNote)) {
      // Note ist bereits im richtigen Format
      return cleanNote;
    }

    // Deutsche Notenbezeichnungen umwandeln
    const germanMappings = {
      'H': 'B',
      'h': 'B',
      'B': 'Bb',
      'b': 'Bb',
      'Es': 'Eb',
      'es': 'Eb',
      'As': 'Ab',
      'as': 'Ab'
    };

    // Prüfen auf Notennamen ohne Oktave (C, D, E, etc.) - Default-Oktave 4 hinzufügen
    if (/^[A-Ha-h][#b]?$/.test(cleanNote)) {
      let noteLetter = cleanNote.charAt(0).toUpperCase();
      const accidental = cleanNote.length > 1 ? cleanNote.charAt(1) : '';

      // Deutsche Noten umwandeln
      if (germanMappings[noteLetter]) {
        noteLetter = germanMappings[noteLetter];
      }

      // Deutsche Akkord-Symbole umwandeln
      const noteWithAccidental = noteLetter + accidental;
      if (germanMappings[noteWithAccidental]) {
        return germanMappings[noteWithAccidental] + '4';
      }

      return noteLetter + accidental + '4'; // Oktave 4 hinzufügen
    }

    // Versuche aus komplexeren Formaten zu extrahieren (z.B. "C-Dur", "a-moll")
    const complexMatch = cleanNote.match(/^([A-Ha-h][#b]?)[-\s]?(dur|moll|major|minor)?$/i);
    if (complexMatch) {
      let noteLetter = complexMatch[1].charAt(0).toUpperCase();
      const accidental = complexMatch[1].length > 1 ? complexMatch[1].charAt(1) : '';

      // Deutsche Noten umwandeln
      if (germanMappings[noteLetter]) {
        noteLetter = germanMappings[noteLetter];
      }

      // Deutsche Akkord-Symbole umwandeln
      const noteWithAccidental = noteLetter + accidental;
      if (germanMappings[noteWithAccidental]) {
        return germanMappings[noteWithAccidental] + '4';
      }

      return noteLetter + accidental + '4'; // Oktave 4 hinzufügen
    }

    // Wenn nichts passt, gib C4 zurück
    console.warn(`Unbekanntes Notenformat: "${noteString}", verwende C4 als Fallback`);
    return 'C4';
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
