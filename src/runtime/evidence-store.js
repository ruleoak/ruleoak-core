function normalizeEvidence(item, index) {
  if (!item || typeof item !== "object") throw new Error("evidence item must be an object");
  const id = item.id || `E${index + 1}`;
  const source = item.source || item.type || "unknown";
  const claim = item.claim || item.title || item.summary;
  if (!claim) throw new Error(`evidence ${id} must include a claim, title, or summary`);
  return {
    id,
    source,
    claim,
    value: item.value ?? item.summary ?? item.evidence ?? null,
    sourceIds: item.sourceIds || item.source_ids || [],
    confidence: item.confidence || undefined,
    metadata: item.metadata || {}
  };
}

export class EvidenceStore {
  constructor({ auditLog } = {}) {
    this.auditLog = auditLog;
    this.items = [];
  }

  add(item) {
    const normalized = normalizeEvidence(item, this.items.length);
    this.items.push(normalized);
    this.auditLog?.record("evidence.added", { evidenceId: normalized.id, source: normalized.source, claim: normalized.claim });
    return normalized;
  }

  addMany(items = []) {
    return items.map((item) => this.add(item));
  }

  list() {
    return [...this.items];
  }

  requireMinimum(count) {
    if (this.items.length < count) {
      throw new Error(`expected at least ${count} evidence items, got ${this.items.length}`);
    }
  }
}
