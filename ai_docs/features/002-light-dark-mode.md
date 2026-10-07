# Feature 002: Umschalten zwischen hellem und dunklem Modus

| Feld | Wert |
|---|---|
| Status | Umgesetzt, Abnahme offen |
| Bezug | neu (nicht im PRD) |
| Priorität | Kann |
| Erstellt | 2026-10-07 |

## Problem und Ziel
Die App hat derzeit nur ein dunkles Farbschema (fest in `app/globals.css`). In heller Umgebung, z. B. tagsüber oder bei Präsentationen per Beamer, ist das schlecht lesbar. Nutzer sollen per Schalter zwischen hellem und dunklem Modus wechseln können. Beim ersten Besuch richtet sich die App nach der Systemeinstellung.

## User Story
Als Person, die den ISS-Tracker öffnet, möchte ich zwischen hellem und dunklem Modus wechseln, damit ich die Werte und die Karte in jeder Umgebung gut lesen kann.

## Anforderungen
| ID | Anforderung |
|---|---|
| 002-1 | Im Kopfbereich gibt es einen Schalter, der zwischen hellem und dunklem Modus wechselt. |
| 002-2 | Beim ersten Besuch (keine gespeicherte Wahl) folgt der Modus der Systemeinstellung (`prefers-color-scheme`). |
| 002-3 | Die gewählte Einstellung bleibt nach dem Neuladen der Seite erhalten (im Browser gespeichert). |
| 002-4 | Der Wechsel betrifft alle Bereiche: Hintergrund, Texte, Werte-Kacheln, Fehlerhinweis, Fußzeile, Karte samt Leaflet-Bedienelementen (Zoom, Attribution). |
| 002-5 | Der Wechsel erfolgt sofort, ohne Neuladen; Karte, Marker-Position und Polling laufen unverändert weiter. |
| 002-6 | Beim Laden blitzt nicht kurz das falsche Farbschema auf. |
| 002-7 | Der Schalter ist per Tastatur bedienbar und für Screenreader beschriftet (z. B. „Zum hellen Modus wechseln“). |

## Ablauf und Zustände
1. Seite wird geöffnet → gespeicherte Wahl vorhanden? Dann diese verwenden, sonst Systemeinstellung.
2. Klick (oder Enter/Leertaste) auf den Schalter → Farbschema wechselt sofort, Symbol und Beschriftung des Schalters zeigen den jeweils anderen Modus an.
3. Die Wahl wird gespeichert und beim nächsten Besuch verwendet.

Zustände: Der Schalter ist immer aktiv, auch während „Position wird geladen …“ und bei API-Ausfall. Lade-, Leer- und Fehleranzeigen müssen in beiden Modi gut lesbar sein.

## Grenz- und Fehlerfälle
- Browser-Speicher nicht verfügbar (privates Fenster, blockierte Website-Daten) → Umschalten funktioniert trotzdem, die Wahl gilt nur bis zum Neuladen; kein Absturz, kein Konsolenfehler.
- Gespeicherter Wert ungültig oder manipuliert → wie „keine Wahl gespeichert“ behandeln (Systemeinstellung).
- Systemeinstellung ändert sich während die Seite offen ist → nur berücksichtigen, solange keine eigene Wahl gespeichert ist.
- API nicht erreichbar → Fehlerhinweis ist in beiden Modi gut lesbar; Umschalten hat keinen Einfluss auf das Polling.
- Schnelles mehrfaches Klicken → jeder Klick wechselt genau einmal, kein Flackern oder Neuaufbau der Karte.

## Akzeptanzkriterien
- [ ] Im Kopfbereich ist ein Schalter sichtbar; ein Klick wechselt das Farbschema der gesamten Seite innerhalb von 0,5 s.
- [ ] Nach dem Neuladen ist der zuletzt gewählte Modus aktiv.
- [ ] Im Inkognito-Fenster mit System-Einstellung „hell“ startet die App hell, mit „dunkel“ dunkel.
- [ ] Beim Neuladen mit gespeichertem hellen Modus erscheint zu keinem Zeitpunkt der dunkle Hintergrund (und umgekehrt).
- [ ] Nach dem Umschalten bewegt sich der Marker weiter wie vorher; Zoom und Kartenausschnitt bleiben erhalten.
- [ ] Der Schalter ist per Tab erreichbar, per Enter/Leertaste auslösbar und hat einen sichtbaren Fokusrahmen.
- [ ] Texte haben in beiden Modi mindestens 4,5:1 Kontrast zum Hintergrund (geprüft mit den Browser-Entwicklertools).
- [ ] Bei simuliertem API-Ausfall (Netzwerk in den Entwicklertools auf „Offline“) ist der Fehlerhinweis in beiden Modi gut lesbar.
- [ ] Keine Mixed-Content-Fehler, keine Hydration-Warnungen und keine neuen Fehler in der Browser-Konsole.

## Betroffene Stellen
- `app/globals.css` – Farben liegen bereits als CSS-Variablen in `:root` vor (nur dunkel); ein zweiter Satz für den hellen Modus kommt hinzu, z. B. über `[data-theme="light"]` / `[data-theme="dark"]` am `<html>`-Element. Stile für Leaflet-Bedienelemente und ggf. Kartenkacheln im dunklen Modus.
- `app/layout.js` – Setzen des Modus am `<html>`-Element vor dem ersten Zeichnen (kleines Inline-Skript im `<head>`), damit nichts aufblitzt.
- `app/components/Tracker.js` – Schalter im Kopfbereich (`<header className="header">`); alternativ eigene Komponente `app/components/ThemeToggle.js`.
- `app/components/IssMap.js` – nur falls die Kartenkacheln je nach Modus unterschiedlich dargestellt werden.

## Technische Hinweise
- Die Seite wird statisch vorgerendert (Next.js App Router). Der Server kennt die Wahl nicht; deshalb muss ein Inline-Skript im `<head>` den Modus aus dem Browser-Speicher bzw. `prefers-color-scheme` lesen und am `<html>`-Element setzen, bevor die Seite gezeichnet wird. Am `<html>`-Element ist dann `suppressHydrationWarning` nötig, um Hydration-Warnungen zu vermeiden.
- Zugriff auf den Browser-Speicher (`localStorage`) in `try/catch` kapseln (siehe Grenzfälle).
- Der Zustand des Schalters gehört nicht in die Polling-Logik; die Karte darf beim Umschalten nicht neu erzeugt werden.
- Karte: Die PRD-Entscheidung lautet OpenStreetMap-Kacheln. Diese sind hell. Für den dunklen Modus bieten sich zwei Wege an, beide ohne API-Key und über HTTPS:
  1. OSM-Kacheln behalten und im dunklen Modus per CSS-Filter abdunkeln (Projektentscheidung bleibt unverändert).
  2. Auf einen Anbieter mit dunklen Kacheln wechseln (z. B. CARTO), Attribution entsprechend anpassen.
- Als Farbgrundlage können die Varianten „A · Mission Control“ (dunkel) und „B · Atlas“ (hell) aus den Design-Entwürfen dienen.

## Nicht im Umfang
- Mehr als zwei Farbschemata oder frei wählbare Akzentfarben.
- Automatischer Wechsel nach Uhrzeit oder nach ISS-Tag/Nacht (`visibility`, Bonus B3).
- Synchronisierung der Wahl zwischen Geräten.
- Ein Modus „System folgen“ als dritte Schalterstellung.

## Risiken / Konflikte
- Kein Konflikt mit PRD Abschnitt 5: kein Backend, keine API-Keys, alle Requests weiterhin über HTTPS.
- Bei Variante 2 der Karte (anderer Kachel-Anbieter) wird die PRD-Entscheidung „OpenStreetMap“ (Abschnitt 9) geändert. Das sollte bewusst entschieden werden.
- Der CSS-Filter (Variante 1) verfälscht die Farben der Karte (Wasser/Land wirken ungewohnt); Lesbarkeit der Ortsnamen im Test prüfen.
- Das Inline-Skript läuft vor React; Fehler darin würden die Seite nicht abstürzen lassen, sollten aber ebenfalls in `try/catch` stehen.

## Offene Fragen
- Annahme: Dunkle Karte über CSS-Filter auf den OSM-Kacheln (Variante 1), damit die PRD-Entscheidung bestehen bleibt. Oder lieber dunkle Kacheln eines anderen Anbieters?
- Annahme: Schalter als Symbol-Button (Sonne/Mond) oben rechts im Kopfbereich. Passt das, oder lieber mit Textbeschriftung?
- Annahme: Farben des hellen Modus orientieren sich an Design-Variante „B · Atlas“. Gewünscht?
