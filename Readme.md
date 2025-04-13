# Webseite zum Anstimmen für den Dresdner Kneipenchor

## Deployment
* `npm run build` -> erzeugt `dest` ordner
* `npm run deploy` -> deployt auf webserver - configuration siehe `.env.template` (nach `.env` kopieren und ausfüllen).

## Entwicklung
* `npm install` um dependencies zu installieren
* `npm run dev` um vite Entwicklungsserver zu starten - startet Webseite auf http://localhost:3000
* Nach Abschluss PR gegen `main` stellen - Actions stellen Deployment zum überprüfen bereit

## Actions
Folgenden Actions laufen
* wenn PR gestellt wird, wird alles gebaut und auf einen eigenen Ordner deployed. Dort kann das Ergebnis überprüft werden
* wenn PR gemerged/rejected wird, wird das Deployment dazu gelöscht
* wenn in main gepushed / PR gemerged wird, wird auf die Produktiv Umgebung deployed.