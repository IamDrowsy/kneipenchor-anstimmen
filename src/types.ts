

// Define interfaces for your data structures
export interface VoiceType {
    key: Voice;
    label: string;
    class: Voice;
  }
  
export interface SongNoteMap {
    [key: string]: SongNote; // For high/low notes
  }
  
export  type SongNotes = {
    [K in Voice]: SongNote | SongNoteMap;
  }
  
 export interface Song {
    title: string;
    notes: SongNotes;
  }

export type Voice = 'soprano' | 'alto' | 'tenor' | 'bass';

type SongNoteLetter = 
  | "C" | "C#" | "Cb" 
  | "D" | "D#" | "Db" 
  | "E" | "E#" | "Eb" 
  | "F" | "F#" | "Fb" 
  | "G" | "G#" | "Gb" 
  | "A" | "A#" | "Ab" 
  | "B" | "H"  | "Bb"
  | '-' ; // no Note 
type SongNoteOctave = "0" | "1" | "2" | "3" | "4" | "" | "5" | "6" ;

export function isSongNote(value: SongNote | SongNoteMap): value is SongNote {
    return typeof value === 'string';
}

export type SongNote = `${SongNoteLetter}${SongNoteOctave}`;

