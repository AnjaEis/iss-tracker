#!/usr/bin/env node
// Hook-Skript: protokolliert sämtliche Skill-Aufrufe als JSON-Zeile in
// logs/skill-calls.log. Erfasst werden
//  - Aufrufe durch Claude über das Skill-Tool (PreToolUse, Matcher "Skill") und
//  - Aufrufe durch die Nutzerin per Slash-Befehl (UserPromptSubmit, Prompt
//    beginnt mit "/name").
// Fehler beim Loggen dürfen Claude nie blockieren, daher immer Exit-Code 0.

const fs = require("fs");
const path = require("path");

const PROJECT_DIR =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
const LOG_FILE = path.join(PROJECT_DIR, "logs", "skill-calls.log");
const SLASH_COMMAND = /^\/([\w:.-]+)(?:\s+([\s\S]*))?$/;

function buildEntry(input) {
  const base = {
    timestamp: new Date().toISOString(),
    session_id: input.session_id,
  };
  if (input.hook_event_name === "PreToolUse" && input.tool_name === "Skill") {
    return {
      ...base,
      source: "claude",
      skill: input.tool_input?.skill,
      args: input.tool_input?.args,
    };
  }
  if (input.hook_event_name === "UserPromptSubmit") {
    const match = SLASH_COMMAND.exec((input.prompt || "").trim());
    if (!match) return null;
    return { ...base, source: "user", skill: match[1], args: match[2] };
  }
  return null;
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  try {
    const entry = buildEntry(JSON.parse(raw || "{}"));
    if (entry) {
      fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
      fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
    }
  } catch (err) {
    process.stderr.write(`Skill-Logging fehlgeschlagen: ${err.message}\n`);
  }
  process.exit(0);
});
