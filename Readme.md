# Webseite zum Anstimmen für den Kneipenchor


## Deployment
* `npm run build` -> erzeugt `dest` ordner
* `npm run deploy` -> deployt auf webserver via ftp (`.ftpconfig.json`) muss eingerichtet sein. - ACHTUNG - löscht den kompletten ftp Ordner und legt ihn neu an.
## Entwicklung
* `npm install` um dependencies zu installieren
* `npm run dev` um vite Entwicklungsserver zu starten - startet Webseite auf http://localhost:3000