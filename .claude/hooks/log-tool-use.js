#!/usr/bin/env node
// Hook-Skript: protokolliert jeden Tool-Aufruf von Claude Code als JSON-Zeile
// in logs/tool-calls.log. Wird für PreToolUse (Aufruf) und PostToolUse
// (Ergebnis) registriert. Fehler beim Loggen dürfen Claude nie blockieren,
// daher endet das Skript immer mit Exit-Code 0.

const fs = require("fs");
const path = require("path");

const PROJECT_DIR =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
const LOG_FILE = path.join(PROJECT_DIR, "logs", "tool-calls.log");
// Tool-Ergebnisse können sehr groß sein (Dateiinhalte, Befehlsausgaben).
const MAX_RESPONSE_CHARS = 2000;

function truncate(value) {
  if (value === undefined) return undefined;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > MAX_RESPONSE_CHARS
    ? `${text.slice(0, MAX_RESPONSE_CHARS)}… [gekürzt, ${text.length} Zeichen]`
    : value;
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw || "{}");
    const entry = {
      timestamp: new Date().toISOString(),
      event: input.hook_event_name,
      session_id: input.session_id,
      tool: input.tool_name,
      tool_use_id: input.tool_use_id,
      input: input.tool_input,
      response: truncate(input.tool_response),
    };
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    process.stderr.write(`Tool-Logging fehlgeschlagen: ${err.message}\n`);
  }
  process.exit(0);
});
