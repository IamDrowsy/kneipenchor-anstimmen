// build-songs.js als ES-Modul
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname Äquivalent für ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfiguration
const sourceDir = path.join(__dirname, 'songs');
const outputFile = path.join(__dirname, 'public', 'songs.json');

console.log('Start Build-Prozess für songs.json');

// Prüfen, ob Quellverzeichnis existiert
if (!fs.existsSync(sourceDir)) {
  console.error(`Quellverzeichnis ${sourceDir} existiert nicht!`);
  process.exit(1);
}

// Alle JSON-Dateien im Quellverzeichnis finden
const songFiles = fs.readdirSync(sourceDir)
  .filter(file => file.endsWith('.json'));

console.log(`Gefundene Song-Dateien: ${songFiles.length}`);

// Alle Songs einlesen und zusammenführen
const songs = [];
let errorCount = 0;

songFiles.forEach(file => {
  try {
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const song = JSON.parse(content);

    // Einfache Validierung
    if (!song.title || !song.notes) {
      console.warn(`Warnung: Song in ${file} hat nicht alle erforderlichen Felder (title, notes)`);
    }

    songs.push(song);
    console.log(`✓ ${file} (${song.title})`);
  } catch (error) {
    console.error(`× Fehler bei ${file}: ${error.message}`);
    errorCount++;
  }
});

// Songs alphabetisch nach Titel sortieren
songs.sort((a, b) => a.title.localeCompare(b.title, 'de', { sensitivity: 'base' }));

// Ausgabedatei erzeugen
const output = {
  songs: songs,
  meta: {
    count: songs.length,
    generatedAt: new Date().toISOString(),
    sourceFiles: songFiles.length
  }
};

// Ausgabeverzeichnis erstellen falls nötig
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Ausgabedatei schreiben
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(`\nBuild abgeschlossen:`);
console.log(`- ${songs.length} Songs verarbeitet`);
console.log(`- ${errorCount} Fehler aufgetreten`);
console.log(`- Ausgabe: ${outputFile}`);
