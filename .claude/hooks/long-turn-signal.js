#!/usr/bin/env node
// Hook-Skript: spielt einen sanften Gong (3 s) ab, sobald Claude eine Antwort
// fertig hat – aber nur, wenn die Antwort länger als 2 Minuten gedauert hat.
//  - UserPromptSubmit: merkt sich den Startzeitpunkt pro Session.
//  - Stop: berechnet die Dauer und spielt ggf. den Ton ab.
// Fehler dürfen Claude nie blockieren, daher immer Exit-Code 0.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const MIN_DURATION_MS = 2 * 60 * 1000;
const SAMPLE_RATE = 22050;
const DURATION_S = 3;
const VOLUME = 0.25;

function startFile(sessionId) {
  const safeId = String(sessionId || "default").replace(/[^\w-]/g, "_");
  return path.join(os.tmpdir(), `claude-turn-start-${safeId}`);
}

// Zwei weiche Glockentöne (E5, A5) mit exponentiellem Abklingen als WAV.
function buildChimeWav() {
  const notes = [
    { freq: 659.25, start: 0 },
    { freq: 880.0, start: 0.35 },
  ];
  const sampleCount = SAMPLE_RATE * DURATION_S;
  const data = Buffer.alloc(sampleCount * 2);
  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;
    for (const { freq, start } of notes) {
      const dt = t - start;
      if (dt < 0) continue;
      const attack = Math.min(1, dt / 0.01);
      const decay = Math.exp(-dt * 1.8);
      sample +=
        attack *
        decay *
        (Math.sin(2 * Math.PI * freq * dt) +
          0.3 * Math.sin(2 * Math.PI * freq * 2 * dt));
    }
    const fadeOut = Math.min(1, (DURATION_S - t) / 0.3);
    const value = Math.max(-1, Math.min(1, sample * VOLUME * fadeOut));
    data.writeInt16LE(Math.round(value * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function playChime() {
  const wavFile = path.join(os.tmpdir(), "claude-long-turn-chime.wav");
  if (!fs.existsSync(wavFile)) fs.writeFileSync(wavFile, buildChimeWav());

  let command;
  let args;
  if (process.platform === "win32") {
    command = "powershell.exe";
    args = [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `(New-Object System.Media.SoundPlayer '${wavFile}').PlaySync()`,
    ];
  } else if (process.platform === "darwin") {
    command = "afplay";
    args = [wavFile];
  } else {
    command = "aplay";
    args = ["-q", wavFile];
  }
  // Losgelöst starten, damit der Hook Claude nicht 3 s aufhält.
  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.on("error", () => {});
  child.unref();
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw || "{}");
    const file = startFile(input.session_id);
    if (input.hook_event_name === "UserPromptSubmit") {
      fs.writeFileSync(file, String(Date.now()), "utf8");
    } else if (input.hook_event_name === "Stop" && fs.existsSync(file)) {
      const startedAt = Number(fs.readFileSync(file, "utf8"));
      fs.unlinkSync(file);
      if (Date.now() - startedAt > MIN_DURATION_MS) playChime();
    }
  } catch (err) {
    process.stderr.write(`Signal-Hook fehlgeschlagen: ${err.message}\n`);
  }
  process.exit(0);
});
