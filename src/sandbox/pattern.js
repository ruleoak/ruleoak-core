function escapeRegex(text) {
  return text.replace(/[.+^${}()|[\]\\]/g, "\\$&");
}

export function globToRegExp(pattern) {
  let p = String(pattern || "").replace(/\\/g, "/");
  p = p.replace(/^\.\//, "");
  let out = "";
  for (let i = 0; i < p.length; i++) {
    const ch = p[i];
    if (ch === "*") {
      if (p[i + 1] === "*") {
        out += ".*";
        i++;
      } else {
        out += "[^/]*";
      }
    } else {
      out += escapeRegex(ch);
    }
  }
  return new RegExp(`^${out}$`);
}

export function matchesAny(value, patterns = []) {
  const normalized = String(value || "").replace(/\\/g, "/").replace(/^\.\//, "");
  for (const pattern of patterns || []) {
    const p = String(pattern || "").replace(/\\/g, "/");
    if (p === "*") return { matched: true, pattern };
    if (globToRegExp(p).test(normalized)) return { matched: true, pattern };
  }
  return { matched: false, pattern: null };
}
