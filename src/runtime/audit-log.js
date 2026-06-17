export class AuditLog {
  constructor({ runId, clock = () => new Date().toISOString() } = {}) {
    this.runId = runId;
    this.clock = clock;
    this.events = [];
    this.sequence = 0;
  }

  record(type, payload = {}) {
    const event = {
      id: `${this.runId || "run"}-evt-${String(++this.sequence).padStart(4, "0")}`,
      runId: this.runId,
      sequence: this.sequence,
      type,
      timestamp: this.clock(),
      payload
    };
    this.events.push(event);
    return event;
  }

  list() {
    return [...this.events];
  }
}
