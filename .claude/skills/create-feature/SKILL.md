---
name: create-feature
description: Hilft, ein neues Feature sauber zu planen, und schreibt dazu eine Feature-Spezifikation als Markdown-Datei ins Projekt (z. B. ai_docs/features/ oder docs/features/) – projektunabhängig, abgeleitet aus vorhandenen Anforderungsdokumenten (PRD, README, CLAUDE.md) und dem aktuellen Code. Verwende diesen Skill immer, wenn jemand ein neues Feature planen, beschreiben, spezifizieren, durchdenken oder "anlegen" möchte – z. B. "ich will ein Login-Feature", "plane mir eine Export-Funktion", "neues Feature: Dark Mode", "schreib eine Spec für ...", "was müssen wir für Feature X bedenken?" – auch wenn das Wort "Spec" nicht fällt. Nicht verwenden, wenn ausdrücklich nur die direkte Umsetzung im Code verlangt wird oder es um einen Bugfix geht.
---

# Feature planen und spezifizieren

Ziel ist eine kurze, prüfbare Feature-Spezifikation, die später als Arbeitsauftrag für die Umsetzung dient – egal in welchem Projekt oder mit welchem Tech-Stack. Der Skill schreibt **nur** die Spec-Datei: keinen App-Code, keine Abhängigkeiten, keine Commits. Planen und Bauen bleiben getrennt, damit die Nutzerin den Plan prüfen kann, bevor Aufwand in Code fließt.

## Ablauf

### 1. Projektkontext erfassen

Lies, was vorhanden ist – nicht alles, sondern gezielt:

- **Anforderungen und Regeln:** `README.md`, `CLAUDE.md`, PRD- oder Anforderungsdokumente (häufig in `docs/`, `ai_docs/`, `specs/`, `requirements/`). Daraus ergeben sich Ziele, bereits nummerierte Anforderungen und Einschränkungen (z. B. "kein Backend", "nur HTTPS", Barrierefreiheit, Datenschutz).
- **Tech-Stack:** `package.json`, `pyproject.toml`, `requirements.txt`, `pom.xml`, `go.mod`, `Cargo.toml` o. Ä. – damit die technischen Hinweise zum Projekt passen.
- **Bestehende Specs:** Gibt es schon einen Ordner mit Feature-Beschreibungen? Dann Format, Sprache und Nummerierung übernehmen. Gibt es bereits eine Spec zum selben Thema, schlage vor, diese zu überarbeiten statt eine zweite anzulegen.
- **Relevanter Code:** Suche gezielt nach den Stellen, die das Feature berühren würde. So setzt die Spec auf dem echten Stand auf ("diese Daten sind schon vorhanden", "diese Komponente müsste erweitert werden") statt auf Vermutungen.

### 2. Feature verstehen und einordnen

Kläre für dich diese Grundfragen:

- **Problem und Nutzen:** Welches Problem löst das Feature, für wen? Was kann die Person danach, was sie vorher nicht konnte?
- **Bezug zu bestehenden Anforderungen:** Ist es schon im PRD/Backlog beschrieben? Dann ID und Formulierung übernehmen. Sonst als "neu" kennzeichnen.
- **Passt es zu den Projektregeln?** Widersprüche zu dokumentierten Einschränkungen gehören explizit unter "Risiken / Konflikte" – nicht stillschweigend auflösen, die Entscheidung liegt bei der Nutzerin.
- **Größe:** Wirkt der Wunsch wie mehrere unabhängige Features, schlage eine Aufteilung in mehrere Specs vor. Kleine Specs lassen sich besser umsetzen, testen und reviewen.

### 3. Nur nachfragen, wenn es wirklich nötig ist

Ist der Wunsch so vage, dass kein sinnvolles Ziel formulierbar ist (z. B. "mach die App besser"), stelle 1–3 gezielte Fragen und warte die Antwort ab. Kleinere Unklarheiten – Texte, Farben, Grenzwerte, Standardwerte – entscheidest du selbst als begründete Annahme und listest sie unter "Offene Fragen". So entsteht schnell ein Entwurf, und die Annahmen fallen beim Review trotzdem auf.

### 4. Die Basics durchdenken

Gehe diese Checkliste durch, bevor du schreibst. Nicht jeder Punkt braucht einen eigenen Abschnitt – aber jeder sollte bewusst bedacht sein, denn genau diese Dinge werden bei der Umsetzung sonst vergessen:

- **Normalfall:** Was passiert im typischen Ablauf, Schritt für Schritt?
- **Leere und Grenzfälle:** keine Daten, sehr viele Daten, erster Aufruf, ungültige Eingaben, Sonderzeichen, Zeitzonen.
- **Fehlerfälle:** Netzwerk/API weg, langsame Antwort, fehlende Rechte. Was sieht die Person dann, und erholt sich das Feature von selbst?
- **Zustände in der Oberfläche:** Laden, Erfolg, Fehler, leer, deaktiviert.
- **Sicherheit und Datenschutz:** Eingaben validieren, keine Secrets im Code, welche Daten werden gespeichert oder übertragen?
- **Barrierefreiheit:** Tastaturbedienung, Beschriftungen, Kontraste – sofern es eine Oberfläche gibt.
- **Performance:** große Datenmengen, häufige Aktualisierungen, Speicherwachstum.
- **Auswirkungen auf Bestehendes:** Was könnte kaputtgehen? Braucht es Migrationen oder Anpassungen anderer Teile?
- **Testbarkeit:** Wie prüft man das Feature – manuell im Browser, automatisiert?

### 5. Spec-Datei schreiben

- **Ablageort:** den vorhandenen Specs-Ordner des Projekts verwenden. Gibt es keinen, nimm `ai_docs/features/` falls `ai_docs/` existiert, sonst `docs/features/`.
- **Dateiname:** `NNN-kurzname.md` – `NNN` dreistellig und fortlaufend (erste Spec `001`), `kurzname` in kebab-case ohne Umlaute. Hat das Projekt eine andere Konvention, folge ihr.
- **Sprache:** wie die übrigen Projektdokumente; im Zweifel die Sprache der Nutzerin.
- **Inhalt:** nach der Vorlage unten. Abschnitte, die für das Feature wirklich nichts hergeben, mit "keine" füllen statt weglassen – so sieht man, dass sie bedacht wurden.

### 6. Kurz zurückmelden

Nenne den Pfad der Datei, den Kern des Features in einem Satz und die offenen Fragen bzw. Konflikte, die eine Entscheidung brauchen. Den Spec-Inhalt nicht komplett im Chat wiederholen – die Datei ist die Quelle.

## Vorlage

```markdown
# Feature NNN: <Titel>

| Feld | Wert |
|---|---|
| Status | Entwurf |
| Bezug | <ID aus PRD/Backlog> oder "neu" |
| Priorität | <Muss / Soll / Kann / offen> |
| Erstellt | <JJJJ-MM-TT> |

## Problem und Ziel
<1–3 Sätze: Welches Problem wird gelöst, für wen, und was kann die Person danach.>

## User Story
Als <Rolle> möchte ich <Fähigkeit>, damit <Nutzen>.

## Anforderungen
| ID | Anforderung |
|---|---|
| NNN-1 | <eine beobachtbare Eigenschaft pro Zeile> |

## Ablauf und Zustände
<Normalfall in wenigen Schritten; Lade-, Leer- und Fehlerzustände.>

## Grenz- und Fehlerfälle
- <Fall> → <erwartetes Verhalten>

## Akzeptanzkriterien
- [ ] <ohne Interpretation prüfbar, mit konkreter Beobachtung oder Zahl>

## Betroffene Stellen
- `<Datei oder Modul>` – <was sich voraussichtlich ändert>

## Technische Hinweise
<Datenquellen, Schnittstellen, Zustand, relevante Projektregeln. Lösungsrichtung skizzieren, keinen fertigen Code.>

## Nicht im Umfang
- <was bewusst ausgeklammert ist>

## Risiken / Konflikte
- <Widersprüche zu Projektregeln, technische Risiken, Auswirkungen auf Bestehendes – oder "keine">

## Offene Fragen
- <getroffene Annahmen und Punkte, die entschieden werden müssen – oder "keine">
```

## Worauf es ankommt

- **Akzeptanzkriterien sind das Herzstück.** Jemand anderes soll sie ohne Rückfrage abhaken können. "Funktioniert gut" ist kein Kriterium; "Nach Klick auf 'Exportieren' wird innerhalb von 2 s eine CSV mit allen sichtbaren Zeilen heruntergeladen" schon. Decke mindestens Normalfall, einen Fehlerfall und einen Grenzfall ab.
- **Konkret statt allgemein.** Lieber echte Dateinamen, Feldnamen und Zahlen aus dem Projekt als Platzhalter-Prosa.
- **Was, nicht wie.** Die Spec beschreibt beobachtbares Verhalten. Technische Hinweise dürfen eine Richtung zeigen, aber die Umsetzung bleibt offen.
- **Keine Code-Änderungen.** Auch wenn die Umsetzung trivial wirkt: Dieser Skill endet mit der Spec-Datei. Biete am Ende an, die Umsetzung als nächsten Schritt anzugehen.
