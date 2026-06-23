import { redactValue } from "../redaction.js";

export const DATABASE_GUARD_SCHEMA = "ruleoak.database_guard.v1";

const READ_RE = /^\s*(with\b[\s\S]*?select\b|select\b|show\b|describe\b|desc\b|explain\b|pragma\s+table_info\b)/i;
const WRITE_RE = /\b(insert|update|delete|merge|replace|upsert|create\s+(?!temporary\s+view)|call\b|execute\b|exec\b)\b/i;
const DESTRUCTIVE_RE = /\b(drop|truncate|alter|grant|revoke|vacuum|attach|detach|shutdown|kill|rename\s+table|delete\s+from\s+sqlite_master)\b/i;
const TX_RE = /\b(begin|commit|rollback|savepoint|release\s+savepoint)\b/i;
const ADMIN_RE = /\b(create\s+user|alter\s+user|drop\s+user|create\s+role|alter\s+role|drop\s+role|set\s+password|flush\s+privileges)\b/i;

export function stripSqlComments(sql = "") {
  return String(sql || "")
    .replace(/--.*$/gm, "")
    .replace(/#.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();
}

export function classifySqlOperation(sql = "", options = {}) {
  const text = String(sql || "").trim();
  const normalized = stripSqlComments(text);
  const compact = normalized.replace(/\s+/g, " ").trim();
  const destructive = DESTRUCTIVE_RE.test(compact) || ADMIN_RE.test(compact);
  const write = WRITE_RE.test(compact);
  const transaction = TX_RE.test(compact);
  const readOnly = READ_RE.test(compact) && !write && !destructive && !transaction;
  const statements = compact.split(";").map((s) => s.trim()).filter(Boolean);
  const multipleStatements = statements.length > 1;
  const operation = destructive ? "destructive_ddl" : transaction ? "transaction_control" : write ? "mutation" : readOnly ? "read" : "unknown";
  const risk = destructive || multipleStatements ? "high" : write || transaction ? "medium" : readOnly ? "low" : "unknown";
  return {
    operation,
    risk,
    readOnly,
    write,
    destructive,
    transaction,
    admin: ADMIN_RE.test(compact),
    multipleStatements,
    databaseType: options.databaseType || options.dialect || "generic",
    normalizedSql: compact,
    rollbackRecommended: write || destructive || transaction
  };
}

export function evaluateDatabaseAction(action = {}, policy = {}) {
  const sql = action.sql || action.query || action.input?.sql || action.input?.query || "";
  const classification = classifySqlOperation(sql, policy);
  let decision = "allow";
  let reason = "read-only database query allowed";
  if (classification.destructive || classification.multipleStatements) { decision = "deny"; reason = "destructive, admin, or multi-statement SQL is denied by default"; }
  else if (classification.write && policy.allowMutation !== true) { decision = "needs_approval"; reason = "database mutation requires approval by default"; }
  else if (classification.transaction && policy.allowTransactionControl !== true) { decision = "needs_approval"; reason = "transaction control requires review"; }
  else if (!classification.readOnly && policy.allowUnknown !== true) { decision = "needs_approval"; reason = "unknown SQL operation requires review"; }
  return {
    schemaVersion: DATABASE_GUARD_SCHEMA,
    guard: "database",
    decision,
    allowedNow: decision === "allow",
    approvalRequired: decision === "needs_approval",
    blocked: decision === "deny",
    reason,
    dryRunRequired: decision !== "allow" || classification.rollbackRecommended,
    classification: { ...classification, normalizedSql: classification.normalizedSql.slice(0, 240) },
    evidencePayload: redactValue({ action: { ...action, sql }, classification, decision, reason })
  };
}

export function databaseDecisionToRuleOakAction(action = {}, policy = {}) {
  const decision = evaluateDatabaseAction(action, policy);
  return {
    toolName: "database",
    operation: decision.classification.operation,
    target: action.database || action.target || "database",
    risk: decision.classification.risk,
    input: decision.evidencePayload,
    metadata: { guard: "database", decision: decision.decision, reason: decision.reason, dryRunRequired: decision.dryRunRequired }
  };
}
