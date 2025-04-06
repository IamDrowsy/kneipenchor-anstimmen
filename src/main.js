import './style.css'

// Warten bis DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
  loadSongs();
});

// Lieder aus JSON laden
async function loadSongs() {
  try {
    const response = await fetch('/songs.json');
    if (!response.ok) {
      throw new Error('Konnte Lieder nicht laden');
    }

    const data = await response.json();
    displaySongs(data.songs);

    // Loading-Anzeige ausblenden, Tabelle einblenden
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('song-table').classList.remove('hidden');
  } catch (error) {
    console.error('Fehler beim Laden der Lieder:', error);
    document.getElementById('loading').textContent = 'Fehler beim Laden der Lieder. Bitte Seite neu laden.';
  }
}

// Lieder in Tabelle anzeigen
function displaySongs(songs) {
  const songList = document.getElementById('song-list');

  songs.forEach(song => {
    // Erste Zeile mit Liedtitel
    const titleRow = document.createElement('tr');
    const titleCell = document.createElement('td');
    titleCell.textContent = song.title;
    titleCell.className = 'song-title';
    titleCell.colSpan = 5;
    titleRow.appendChild(titleCell);
    songList.appendChild(titleRow);

    // Zweite Zeile mit Buttons für die Stimmlagen
    const notesRow = document.createElement('tr');

    // Leere Zelle für die Titelposition in der zweiten Zeile
    const emptyCell = document.createElement('td');
    notesRow.appendChild(emptyCell);

    // Zellen für die Stimmgruppen
    ['soprano', 'alto', 'tenor', 'bass'].forEach(voice => {
      const cell = document.createElement('td');
      const button = document.createElement('button');
      button.className = 'play-button';
      button.textContent = `${song.notes[voice]} spielen`;
      button.dataset.note = song.notes[voice];
      button.dataset.voice = voice;
      button.dataset.songId = song.id;

      // Event-Listener für Klick hinzufügen (später wird hier die Tonwiedergabe implementiert)
      button.addEventListener('click', () => {
        console.log(`Spiele Ton ${song.notes[voice]} für ${voice} in Lied "${song.title}"`);
        // Hier wird später die Tonwiedergabe-Funktion aufgerufen
      });

      cell.appendChild(button);
      notesRow.appendChild(cell);
    });

    songList.appendChild(notesRow);
  });
}
