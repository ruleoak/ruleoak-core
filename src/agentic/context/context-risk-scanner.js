const INJECTION_RE = /(ignore\s+(all\s+)?previous|system\s+prompt|developer\s+message|tool\s+call|exfiltrate|send\s+.*secret|delete\s+files?|drop\s+table|run\s+shell)/i;
const SECRET_RE = /(api[_-]?key|bearer\s+[a-z0-9._-]+|password\s*=|-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----)/i;

export function scanContextRisk(item = {}) {
  const text = String(item.text || item.content || item.value || "");
  const source = item.source || item.type || "unknown";
  const findings = [];
  if (INJECTION_RE.test(text)) findings.push({ type: "instruction_injection", severity: "high" });
  if (SECRET_RE.test(text)) findings.push({ type: "credential_like_text", severity: "high" });
  if (source === "retrieved_document" && /\btool\s*:/i.test(text)) findings.push({ type: "hidden_tool_instruction", severity: "medium" });
  const risk = findings.some((f) => f.severity === "high") ? "high" : findings.length ? "medium" : "low";
  return { source, risk, findings, length: text.length };
}
