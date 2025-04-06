import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  loadSongs();
});

async function loadSongs() {
  try {
    const response = await fetch('/songs.json');
    if (!response.ok) {
      throw new Error('Konnte Lieder nicht laden');
    }

    const data = await response.json();
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

  // Array von Stimmgruppen-Namen für Labels und Datenattribute
  const voiceTypes = [
    { key: 'soprano', label: 'Sopran' },
    { key: 'alto', label: 'Alt' },
    { key: 'tenor', label: 'Tenor' },
    { key: 'bass', label: 'Bass' }
  ];

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
    voiceTypes.forEach((voice, index) => {
      const cell = document.createElement('td');

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
