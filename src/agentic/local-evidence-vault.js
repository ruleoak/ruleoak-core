import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readEvidenceJsonl } from "./flight-recorder.js";
import { validateEvidenceEvent } from "./evidence-jsonl-format.js";
import { REDACTED_VALUE } from "./redaction.js";

function haystack(event = {}) {
  return JSON.stringify(event).toLowerCase();
}

export class LocalEvidenceVault {
  constructor({ events = [] } = {}) {
    this.records = [];
    if (events.length) this.indexEvents(events);
  }

  indexEvents(events = []) {
    for (const event of events) {
      const validation = validateEvidenceEvent(event);
      this.records.push({ event, validation, text: haystack(event) });
    }
    return this.summary();
  }

  indexJsonlFile(filePath) {
    const events = readEvidenceJsonl(filePath);
    return this.indexEvents(events);
  }

  search({ query = "", runId, type, toolName, decision, risk, since, until } = {}) {
    const q = String(query).toLowerCase();
    return this.records.filter(({ event, text }) => {
      if (q && !text.includes(q)) return false;
      if (runId && event.runId !== runId) return false;
      if (type && event.type !== type) return false;
      if (toolName && event.payload?.toolName !== toolName && event.payload?.tool !== toolName) return false;
      if (decision && event.payload?.decision !== decision && event.payload?.policyDecision !== decision) return false;
      if (risk && event.payload?.risk !== risk) return false;
      if (since && String(event.timestamp || "") < since) return false;
      if (until && String(event.timestamp || "") > until) return false;
      return true;
    }).map((r) => r.event);
  }

  summary() {
    const counts = { total: this.records.length, invalid: this.records.filter((r) => !r.validation.ok).length };
    return { schemaVersion: "ruleoak.local_evidence_vault.v1", counts };
  }

  exportJson(filePath) {
    const data = { ...this.summary(), events: this.records.map((r) => r.event) };
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return data;
  }

  redactionCheck() {
    const leaks = this.records.filter((r) => /(sk-[a-z0-9]{12,}|Bearer\s+[A-Za-z0-9._~+\/-]+=*|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(r.event)) && !JSON.stringify(r.event).includes(REDACTED_VALUE));
    return { ok: leaks.length === 0, leakCount: leaks.length, leaks: leaks.map((r) => r.event.eventId) };
  }

  static fromJsonlFile(filePath) {
    if (!existsSync(filePath)) throw new Error(`evidence file not found: ${filePath}`);
    const vault = new LocalEvidenceVault();
    vault.indexEvents(readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)));
    return vault;
  }
}
