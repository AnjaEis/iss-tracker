# Feature 001: Spur der letzten Positionen

| Feld | Wert |
|---|---|
| Status | Entwurf |
| PRD-Bezug | B1 |
| Priorität | Bonus |
| Erstellt | 2026-10-07 |

## Ziel
Auf der Karte ist neben dem ISS-Marker eine Linie durch die zuletzt gemessenen Positionen zu sehen. So erkennt man auf einen Blick, aus welcher Richtung die ISS kommt und wie schnell sie sich bewegt.

## Anforderungen
| ID | Anforderung |
|---|---|
| 001-1 | Jede erfolgreich abgerufene Position wird an die Spur angehängt. |
| 001-2 | Die Spur wird als Linie auf der Karte gezeichnet und endet am aktuellen Marker. |
| 001-3 | Die Spur enthält höchstens die letzten 120 Positionen (≈ 10 Minuten bei 5-s-Polling); ältere Punkte fallen weg. |
| 001-4 | Überquert die ISS die Datumsgrenze (±180° Länge), wird die Linie dort unterbrochen statt quer über die ganze Karte gezogen. |
| 001-5 | Fehlgeschlagene Abrufe fügen keinen Punkt hinzu und löschen die Spur nicht. |

## Akzeptanzkriterien
- [ ] Nach ca. 30 Sekunden ist hinter dem Marker eine Linie aus mindestens 5 Punkten sichtbar.
- [ ] Die Linie endet genau am Marker und wächst bei jeder Aktualisierung mit.
- [ ] Nach über 10 Minuten wird die Linie hinten kürzer (nicht unbegrenzt länger).
- [ ] Beim Überqueren der Datumsgrenze erscheint keine waagerechte Linie quer über die Karte.
- [ ] Keine Mixed-Content-Fehler und keine neuen Fehler in der Browser-Konsole.
- [ ] Bei API-Ausfall bleibt die bisherige Spur sichtbar; sobald die API wieder antwortet, wird sie weiter verlängert.

## Betroffene Stellen
- `app/components/Tracker.js` – Liste der letzten Positionen im Zustand halten (begrenzt auf 120) und an die Karte übergeben.
- `app/components/IssMap.js` – Leaflet-Polyline einmalig anlegen und bei neuen Punkten aktualisieren; Aufteilung an der Datumsgrenze.
- `app/globals.css` – ggf. Farbe/Stil der Linie, falls nicht direkt über Leaflet-Optionen gesetzt.

## Technische Hinweise
- Datenquelle bleibt `https://api.wheretheiss.at/v1/satellites/25544`; es werden nur `latitude` und `longitude` gebraucht, die bereits abgefragt werden.
- Leaflet-Code bleibt in `IssMap.js`, das nur clientseitig geladen wird (PRD Abschnitt 5).
- Datumsgrenze: Springt die Länge zwischen zwei Punkten um mehr als 180°, beginnt ein neues Teilstück. Leaflet-`L.polyline` akzeptiert dafür ein Array von Teilstücken.
- Die Spur lebt nur im Browser-Speicher der Sitzung; nach Neuladen beginnt sie leer.

## Nicht im Umfang
- Speichern der Spur über das Neuladen hinaus.
- Vorhersage der künftigen Bahn.
- Einstellbare Spurlänge in der Oberfläche.

## Risiken / Konflikte
- Keine Konflikte mit dem PRD.
- Die Option `worldCopyJump` der Karte kann dazu führen, dass Marker und Linie auf unterschiedlichen Weltkopien liegen; beim Test auf hohem Zoom-Out prüfen.

## Offene Fragen
- Annahme: 120 Punkte (≈ 10 Minuten). Länger oder kürzer gewünscht?
- Annahme: Linie in der Akzentfarbe des gewählten Designs, leicht transparent. Passt das?
