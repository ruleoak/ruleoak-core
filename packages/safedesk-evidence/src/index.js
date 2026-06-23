import { randomUUID } from "node:crypto";

export const SAFEDESK_EVIDENCE_SCHEMA = "ruleoak.safedesk.evidence.v1";
export const SAFEDESK_VERTICALS = ["safedesk", "home", "travel", "creator", "freelancer", "knowledge"];

function nowIso() { return new Date().toISOString(); }
function id(prefix) { return `${prefix}_${randomUUID().slice(0, 12)}`; }
function arr(value) { return Array.isArray(value) ? value : value ? [value] : []; }

export function createConsumerCase({ vertical = "safedesk", title, summary = "", owner = "local-user", tags = [], status = "open", createdAt = nowIso(), metadata = {} } = {}) {
  if (!SAFEDESK_VERTICALS.includes(vertical)) throw new Error(`Unsupported SafeDesk vertical: ${vertical}`);
  if (!title) throw new Error("SafeDesk case title is required");
  return {
    schemaVersion: "ruleoak.safedesk.case.v1",
    caseId: id(`${vertical}_case`),
    vertical,
    title,
    summary,
    owner,
    status,
    tags: arr(tags),
    createdAt,
    updatedAt: createdAt,
    metadata,
    evidenceItems: [],
    timeline: [],
    reminders: [],
    exports: []
  };
}

export function addEvidenceItem(caseRecord, item = {}) {
  if (!caseRecord?.caseId) throw new Error("Valid SafeDesk case is required");
  const evidence = {
    schemaVersion: SAFEDESK_EVIDENCE_SCHEMA,
    evidenceId: item.evidenceId || id("ev"),
    caseId: caseRecord.caseId,
    type: item.type || "note",
    title: item.title || "Untitled evidence",
    summary: item.summary || "",
    source: item.source || "manual",
    occurredAt: item.occurredAt || item.timestamp || nowIso(),
    capturedAt: item.capturedAt || nowIso(),
    sensitivity: item.sensitivity || "normal",
    tags: arr(item.tags),
    attachmentRefs: arr(item.attachmentRefs),
    metadata: item.metadata || {}
  };
  caseRecord.evidenceItems.push(evidence);
  addTimelineEvent(caseRecord, {
    type: "evidence_added",
    title: `Evidence added: ${evidence.title}`,
    occurredAt: evidence.occurredAt,
    evidenceRefs: [evidence.evidenceId],
    metadata: { evidenceType: evidence.type }
  });
  caseRecord.updatedAt = nowIso();
  return evidence;
}

export function addTimelineEvent(caseRecord, event = {}) {
  if (!caseRecord?.caseId) throw new Error("Valid SafeDesk case is required");
  const timelineEvent = {
    schemaVersion: "ruleoak.safedesk.timeline_event.v1",
    eventId: event.eventId || id("tl"),
    caseId: caseRecord.caseId,
    type: event.type || "note",
    title: event.title || "Timeline event",
    summary: event.summary || "",
    occurredAt: event.occurredAt || nowIso(),
    actor: event.actor || "local-user",
    decision: event.decision || null,
    riskLevel: event.riskLevel || null,
    evidenceRefs: arr(event.evidenceRefs),
    metadata: event.metadata || {}
  };
  caseRecord.timeline.push(timelineEvent);
  caseRecord.timeline.sort((a, b) => String(a.occurredAt).localeCompare(String(b.occurredAt)));
  caseRecord.updatedAt = nowIso();
  return timelineEvent;
}

export function addReminder(caseRecord, reminder = {}) {
  if (!reminder.title) throw new Error("Reminder title is required");
  const record = {
    reminderId: reminder.reminderId || id("rem"),
    caseId: caseRecord.caseId,
    title: reminder.title,
    dueAt: reminder.dueAt || nowIso(),
    status: reminder.status || "open",
    metadata: reminder.metadata || {}
  };
  caseRecord.reminders.push(record);
  return record;
}

export function addExportRecord(caseRecord, exportRecord = {}) {
  const record = {
    exportId: exportRecord.exportId || id("exp"),
    caseId: caseRecord.caseId,
    format: exportRecord.format || "markdown",
    createdAt: exportRecord.createdAt || nowIso(),
    path: exportRecord.path || null,
    redactionMode: exportRecord.redactionMode || "summary",
    metadata: exportRecord.metadata || {}
  };
  caseRecord.exports.push(record);
  return record;
}

export function buildEvidenceTimeline(caseRecord) {
  return [...(caseRecord.timeline || [])].sort((a, b) => String(a.occurredAt).localeCompare(String(b.occurredAt)));
}

export function createVerticalCase(vertical, fields = {}) {
  const defaults = {
    home: "Home Evidence Case",
    travel: "Travel Proof Case",
    creator: "Creator Proof Case",
    freelancer: "Freelancer Proof Case",
    knowledge: "Personal Knowledge Proof Case",
    safedesk: "SafeDesk AI Action Case"
  };
  return createConsumerCase({ vertical, title: fields.title || defaults[vertical], ...fields });
}

export function toRuleOakEvidenceEvent(caseRecord, timelineEvent) {
  return {
    schema_version: "ruleoak.agentic.evidence.v1",
    event_id: timelineEvent.eventId,
    run_id: caseRecord.caseId,
    session_id: caseRecord.caseId,
    timestamp: timelineEvent.occurredAt,
    event_type: "consumer_timeline_event",
    actor: timelineEvent.actor,
    tool: "safedesk",
    action: timelineEvent.type,
    risk_level: timelineEvent.riskLevel || "low",
    decision: timelineEvent.decision || "record",
    approval: null,
    input: { title: timelineEvent.title, summary: timelineEvent.summary },
    output: { evidence_refs: timelineEvent.evidenceRefs },
    redaction: { mode: "summary" },
    evidence_refs: timelineEvent.evidenceRefs
  };
}

export function exportCaseAsJson(caseRecord) {
  return JSON.stringify(caseRecord, null, 2);
}
