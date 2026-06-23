const SENSITIVE_KEY_PATTERN = /(^|_|-|\b)(password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|credential|authorization|cookie|session|bearer)(_|-|\b|$)/i;
const SENSITIVE_VALUE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._~+\/-]+=*/i,
  /sk-[A-Za-z0-9]{12,}/i,
  /(password|passwd|pwd|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+/i
];

export const REDACTED_VALUE = "[REDACTED]";

function redactString(value) {
  let next = value;
  for (const pattern of SENSITIVE_VALUE_PATTERNS) {
    next = next.replace(pattern, (match) => {
      const separator = match.includes(":") ? ":" : match.includes("=") ? "=" : null;
      if (!separator) return REDACTED_VALUE;
      return `${match.slice(0, match.indexOf(separator) + 1)}${REDACTED_VALUE}`;
    });
  }
  return next;
}

export function redactValue(value, { depth = 0, maxDepth = 12, seen = new WeakSet() } = {}) {
  if (value == null) return value;
  if (typeof value === "string") return redactString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return String(value);
  if (typeof value === "function") return "[Function]";
  if (typeof value !== "object") return String(value);
  if (depth > maxDepth) return "[MaxDepth]";
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => redactValue(item, { depth: depth + 1, maxDepth, seen }));
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED_VALUE : redactValue(item, { depth: depth + 1, maxDepth, seen });
  }
  return output;
}

export function redactedJson(value) {
  return JSON.stringify(redactValue(value));
}
