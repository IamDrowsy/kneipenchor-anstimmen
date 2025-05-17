// main.ts
import './style.css'
import audioManager from './audio-manager';
import { VoiceType, Song, SongNote, Voice, isSongNote } from './types';

// Zuordnung von Voice-Keys zu Display-Namen
const voiceTypes: VoiceType[] = [
  { key: 'soprano', label: 'Sopran', class: 'soprano' },
  { key: 'alto', label: 'Alt', class: 'alto' },
  { key: 'tenor', label: 'Tenor', class: 'tenor' },
  { key: 'bass', label: 'Bass', class: 'bass' }
];

// Referenz auf alle geladenen Songs für die Suche
let allSongs: Song[] = [];

document.addEventListener('DOMContentLoaded', () => {
  loadSongs();
  setupFilterModal();
});

// Suchfunktionalität einrichten
function setupSearch(): void {
  const searchInput = document.getElementById('song-search') as HTMLInputElement;
  const clearButton = document.getElementById('clear-search');
  const searchResults = document.getElementById('search-results');

  if (!searchInput || !clearButton || !searchResults) return;

  // Event-Listener für die Eingabe
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim().toLowerCase();

    // Clear-Button anzeigen/ausblenden
    clearButton.classList.toggle('visible', searchTerm.length > 0);

    // Suche ausführen
    performSearch(searchTerm);
  });

  // Event-Listener für das Löschen der Suche
  clearButton.addEventListener('click', function() {
    searchInput.value = '';
    clearButton.classList.remove('visible');
    performSearch('');
    searchInput.focus();
  });

  // Event-Listener für ESC-Taste zum Löschen
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchInput.value = '';
      clearButton.classList.remove('visible');
      performSearch('');
    }
  });
}

// Durchführung der Suche
function performSearch(searchTerm: string): void {
  const songRows = document.querySelectorAll('.title-row');
  const resultInfo = document.getElementById('search-results');

  // Alle Lieder durchsuchen
  let matchCount = 0;

  songRows.forEach(row => {
    const titleCell = row.querySelector('.song-title');
    if (!titleCell) return;

    const title = titleCell.textContent?.toLowerCase() || '';
    const nextRow = row.nextElementSibling as HTMLElement; // Die Zeile mit den Buttons

    // Prüfen, ob der Titel den Suchbegriff enthält
    const isMatch = title.includes(searchTerm);

    // Zeilen ein-/ausblenden
    row.classList.toggle('song-hidden', searchTerm !== '' && !isMatch);
    if (nextRow) {
      nextRow.classList.toggle('song-hidden', searchTerm !== '' && !isMatch);
    }

    // Zählen der Treffer
    if (isMatch && searchTerm !== '') {
      matchCount++;

      // Suchbegriff im Titel hervorheben (nur wenn etwas gesucht wird)
      if (searchTerm) {
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        const highlightedTitle = (titleCell.textContent || '').replace(
          regex, 
          '<span class="highlight-match">$1</span>'
        );
        titleCell.innerHTML = highlightedTitle;
      } else {
        titleCell.textContent = titleCell.textContent || ''; // Zurücksetzen
      }
    } else if (searchTerm === '') {
      // Hervorhebungen entfernen wenn Suche leer ist
      titleCell.textContent = titleCell.textContent || '';
    }
  });

  // Suchinformationen anzeigen
  if (resultInfo) {
    if (searchTerm === '') {
      resultInfo.textContent = '';
    } else if (matchCount === 0) {
      resultInfo.textContent = 'Keine Lieder gefunden.';
    } else {
      resultInfo.textContent = `${matchCount} Lied${matchCount !== 1 ? 'er' : ''} gefunden.`;
    }
  }
}

// Hilfsfunktion zum Escapen von Sonderzeichen in RegExp
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Filter-Funktion einrichten
function setupVoiceFilter(): void {
  // Filter-Einstellungen aus localStorage laden (falls vorhanden)
  loadFilterSettings();

  // Event-Listener für Filtercheckboxen
  const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function(this: HTMLInputElement) {
      const voiceKey = this.dataset.voice || '';
      toggleVoiceVisibility(voiceKey, this.checked);

      // Einstellungen im localStorage speichern
      saveFilterSettings();
    });

    // Initial die Sichtbarkeit basierend auf Checkbox-Status setzen
    const voiceKey = (checkbox as HTMLInputElement).dataset.voice || '';
    toggleVoiceVisibility(voiceKey, (checkbox as HTMLInputElement).checked);
  });
}

// Sichtbarkeit einer Stimmgruppe umschalten
function toggleVoiceVisibility(voiceKey: string, isVisible: boolean): void {
  // Spaltenüberschrift umschalten
  console.log(voiceKey, isVisible)
  const headerCell = document.querySelector(`th.voice-column.${voiceKey}`);
  if (headerCell) {
    headerCell.classList.toggle('hidden', !isVisible);
  }

  // Alle Zellen dieser Stimmgruppe umschalten (Desktop)
  const cells = document.querySelectorAll(`td.voice-column.${voiceKey}`);
  cells.forEach(cell => {
    cell.classList.toggle('hidden', !isVisible);
  });

  // Mobile Layout: Einzelne Karten umschalten
  const mobileCards = document.querySelectorAll(`.notes-row td.${voiceKey}`);
  mobileCards.forEach(card => {
    card.classList.toggle('hidden', !isVisible);
  });
}

// Filter-Einstellungen im localStorage speichern
function saveFilterSettings(): void {
  const settings: Record<string, boolean> = {};
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
    const voice = (checkbox as HTMLInputElement).dataset.voice;
    if (voice) {
      settings[voice] = (checkbox as HTMLInputElement).checked;
    }
  });
  localStorage.setItem('voiceFilterSettings', JSON.stringify(settings));
}

// Filter-Einstellungen aus localStorage laden
function loadFilterSettings(): void {
  const savedSettings = localStorage.getItem('voiceFilterSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings) as Record<string, boolean>;
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
      const voice = (checkbox as HTMLInputElement).dataset.voice;
      if (voice && voice in settings) {
        (checkbox as HTMLInputElement).checked = settings[voice];
      }
    });
  }
}

async function loadSongs(): Promise<void> {
  try {
    const response = await fetch('./songs.json');
    if (!response.ok) {
      throw new Error('Konnte Lieder nicht laden');
    }

    const data = await response.json();
    allSongs = data.songs; // Alle Songs für die Suche speichern
    displaySongs(data.songs);

    const loadingElement = document.getElementById('loading');
    const songTableElement = document.getElementById('song-table');

    if (loadingElement) loadingElement.classList.add('hidden');
    if (songTableElement) songTableElement.classList.remove('hidden');

    setupSearch();
    setupVoiceFilter();
  } catch (error) {
    console.error('Fehler beim Laden der Lieder:', error);
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.textContent = 'Fehler beim Laden der Lieder. Bitte Seite neu laden.';
    }
  }
}

function displaySongs(songs: Song[]): void {
  const songList = document.getElementById('song-list');
  if (!songList) return;

  songs.forEach(song => {
    // Erste Zeile mit Liedtitel (überspannt alle 4 Spalten)
    const titleRow = document.createElement('tr');
    titleRow.className = 'title-row';
    const titleCell = document.createElement('td');
    titleCell.textContent = song.title;
    titleCell.className = 'song-title';
    titleCell.colSpan = 4; // Überspannt alle 4 Spalten für Stimmgruppen
    titleRow.appendChild(titleCell);
    songList.appendChild(titleRow);

    // Zweite Zeile mit Buttons für die Stimmlagen
    const notesRow = document.createElement('tr');
    notesRow.className = 'notes-row';

    // Zellen für die Stimmgruppen
    voiceTypes.forEach(voice => {
      const cell = document.createElement('td');
      cell.className = `voice-column ${voice.class}`;

      // Datenattribute für mobile Ansicht hinzufügen
      cell.dataset.label = voice.label;

      // Prüfen, ob es sich um ein einfaches Note-Format oder Hoch/Tief-Format handelt
      const noteValue = song.notes[voice.key];

      if (isSongNote(noteValue)) {
        // Einfacher Ton
        const button = createPlayButton(noteValue, voice.key, song.title);
        cell.appendChild(button);
      } else {
        // Mehrere Töne (Hoch/Tief)
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-group';

        // Für jeden Untertyp einen Button erstellen
        for (const [type, note] of Object.entries(noteValue)) {
          const button = createPlayButton(note, voice.key, song.title, type);
          button.dataset.voiceType = type;
          buttonContainer.appendChild(button);
        }

        cell.appendChild(buttonContainer);
      }

      notesRow.appendChild(cell);
    });

    songList.appendChild(notesRow);
  });
}

// Filter Modal Funktionalität
function setupFilterModal(): void {
  const modal = document.getElementById('filter-modal') as HTMLElement;
  const triggerButton = document.getElementById('filter-modal-trigger') as HTMLButtonElement;
  const closeButton = document.getElementById('modal-close-button') as HTMLButtonElement;

  if (!modal || !triggerButton || !closeButton) {
    console.error('Filter modal elements not found. Modal functionality will be disabled.');
    if (triggerButton) triggerButton.style.display = 'none'; // Hide trigger if modal is broken
    return;
  }

  const openModal = () => {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    // Focus the close button or first interactive element within the modal
    closeButton.focus();
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    // Return focus to the button that opened the modal
    triggerButton.focus();
  };

  triggerButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);

  // Close modal if user clicks on the backdrop
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}


// Hilfsfunktion zum Erstellen eines Wiedergabe-Buttons
function createPlayButton(note: SongNote, voice: Voice, songTitle: string, subVoice: string | null = null): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'play-button';

  // Button-Text basierend auf Vorhandensein von voiceType anpassen
  if (subVoice) {
    button.textContent = `${subVoice}: ${note}`;
  } else {
    button.textContent = note;
  }

  button.dataset.note = note;
  button.dataset.voice = voice;
  button.disabled = (note === '-');

  button.addEventListener('click', async () => {
    // Verhindere mehrfaches Klicken
    if (button.disabled) return;

    const voiceInfo = subVoice ? `${voice} (${subVoice})` : voice;
    console.log(`Spiele Ton ${note} für ${voiceInfo} in Lied "${songTitle}"`);

    // Visuelles Feedback
    button.disabled = true;
    audioManager.updatePlayingStatus(button, true);

    // Ton abspielen
    const success = await audioManager.playNote(note);

    // Nach 800ms zurücksetzen (passend zur Animation)
    setTimeout(() => {
      button.disabled = false;
      audioManager.updatePlayingStatus(button, false);
    }, 800);

    // Fehlerbehandlung
    if (!success) {
      console.error(`Fehler beim Abspielen von ${note}`);
      alert('Tonwiedergabe nicht möglich.');
    }
  });

  return button;
}

// Audio-Initialisierung bei erster Benutzerinteraktion
document.addEventListener('click', async () => {
  if (!audioManager.initialized) {
    console.log('Initialisiere Audio nach Benutzerinteraktion');
    await audioManager.initialize();
  }
}, { once: true }); // once: true sorgt dafür, dass der Listener nur einmal ausgeführt wird
