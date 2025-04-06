import './style.css'

// Zuordnung von Voice-Keys zu Display-Namen
const voiceTypes = [
  { key: 'soprano', label: 'Sopran', class: 'soprano' },
  { key: 'alto', label: 'Alt', class: 'alto' },
  { key: 'tenor', label: 'Tenor', class: 'tenor' },
  { key: 'bass', label: 'Bass', class: 'bass' }
];

// Referenz auf alle geladenen Songs für die Suche
let allSongs = [];

document.addEventListener('DOMContentLoaded', () => {
  loadSongs();
  setupVoiceFilter();
  setupSearch();
});

// Suchfunktionalität einrichten
function setupSearch() {
  const searchInput = document.getElementById('song-search');
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
function performSearch(searchTerm) {
  const songRows = document.querySelectorAll('.title-row');
  const resultInfo = document.getElementById('search-results');

  // Alle Lieder durchsuchen
  let matchCount = 0;

  songRows.forEach(row => {
    const titleCell = row.querySelector('.song-title');
    const title = titleCell.textContent.toLowerCase();
    const nextRow = row.nextElementSibling; // Die Zeile mit den Buttons

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
        const highlightedTitle = titleCell.textContent.replace(
          regex, 
          '<span class="highlight-match">$1</span>'
        );
        titleCell.innerHTML = highlightedTitle;
      } else {
        titleCell.textContent = titleCell.textContent; // Zurücksetzen
      }
    } else if (searchTerm === '') {
      // Hervorhebungen entfernen wenn Suche leer ist
      titleCell.textContent = titleCell.textContent;
    }
  });

  // Suchinformationen anzeigen
  if (searchTerm === '') {
    resultInfo.textContent = '';
  } else if (matchCount === 0) {
    resultInfo.textContent = 'Keine Lieder gefunden.';
  } else {
    resultInfo.textContent = `${matchCount} Lied${matchCount !== 1 ? 'er' : ''} gefunden.`;
  }
}

// Hilfsfunktion zum Escapen von Sonderzeichen in RegExp
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Filter-Funktion einrichten
function setupVoiceFilter() {
  // Filter-Einstellungen aus localStorage laden (falls vorhanden)
  loadFilterSettings();

  // Event-Listener für Filtercheckboxen
  const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const voiceKey = this.dataset.voice;
      toggleVoiceVisibility(voiceKey, this.checked);

      // Einstellungen im localStorage speichern
      saveFilterSettings();
    });

    // Initial die Sichtbarkeit basierend auf Checkbox-Status setzen
    const voiceKey = checkbox.dataset.voice;
    toggleVoiceVisibility(voiceKey, checkbox.checked);
  });
}

// Sichtbarkeit einer Stimmgruppe umschalten
function toggleVoiceVisibility(voiceKey, isVisible) {
  // Spaltenüberschrift umschalten
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
function saveFilterSettings() {
  const settings = {};
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
    settings[checkbox.dataset.voice] = checkbox.checked;
  });
  localStorage.setItem('voiceFilterSettings', JSON.stringify(settings));
}

// Filter-Einstellungen aus localStorage laden
function loadFilterSettings() {
  const savedSettings = localStorage.getItem('voiceFilterSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
      const voice = checkbox.dataset.voice;
      if (voice in settings) {
        checkbox.checked = settings[voice];
      }
    });
  }
}
async function loadSongs() {
    try {
      const response = await fetch('/songs.json');
      if (!response.ok) {
        throw new Error('Konnte Lieder nicht laden');
      }
  
      const data = await response.json();
      allSongs = data.songs; // Alle Songs für die Suche speichern
      displaySongs(data.songs);
  
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('song-table').classList.remove('hidden');
    } catch (error) {
      console.error('Fehler beim Laden der Lieder:', error);
      document.getElementById('loading').textContent = 'Fehler beim Laden der Lieder. Bitte Seite neu laden.';
    }
  }
  

function displaySongs(songs) {
  const songList = document.getElementById('song-list');

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

      if (typeof noteValue === 'string') {
        // Einfacher Ton
        const button = createPlayButton(noteValue, voice.key, song.id, song.title);
        cell.appendChild(button);
      } else {
        // Mehrere Töne (Hoch/Tief)
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-group';

        // Für jeden Untertyp einen Button erstellen
        for (const [type, note] of Object.entries(noteValue)) {
          const button = createPlayButton(note, voice.key, song.id, song.title, type);
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

// Hilfsfunktion zum Erstellen eines Wiedergabe-Buttons
function createPlayButton(note, voice, songId, songTitle, voiceType = null) {
  const button = document.createElement('button');
  button.className = 'play-button';

  // Button-Text basierend auf Vorhandensein von voiceType anpassen
  if (voiceType) {
    button.textContent = `${voiceType}: ${note}`;
  } else {
    button.textContent = note;
  }

  button.dataset.note = note;
  button.dataset.voice = voice;
  button.dataset.songId = songId;

  button.addEventListener('click', () => {
    const voiceInfo = voiceType ? `${voice} (${voiceType})` : voice;
    console.log(`Spiele Ton ${note} für ${voiceInfo} in Lied "${songTitle}"`);
    // Hier wird später die Tonwiedergabe-Funktion implementiert
  });

  return button;
}
