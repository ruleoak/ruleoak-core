export type RuleOakDecision = {
  action: string;
  decision: 'allowed' | 'blocked' | 'approval_required' | 'unknown_action_requires_review' | string;
  allowedNow: boolean;
  approvalRequired: boolean;
  blocked: boolean;
  reason: string;
  context?: Record<string, unknown>;
};

export type RuleOakEvidenceInput = {
  id?: string;
  source?: string;
  type?: string;
  claim?: string;
  title?: string;
  summary?: string;
  value?: unknown;
  evidence?: unknown;
  sourceIds?: string[];
  source_ids?: string[];
  confidence?: string;
  metadata?: Record<string, unknown>;
};

export type RuleOakEvidence = {
  id: string;
  source: string;
  claim: string;
  value: unknown;
  sourceIds: string[];
  confidence?: string;
  metadata: Record<string, unknown>;
};

export type RuleOakAuditEvent = {
  id: string;
  runId?: string;
  sequence: number;
  type: string;
  timestamp: string;
  payload: Record<string, unknown>;
};

export class AuditLog {
  constructor(options?: { runId?: string; clock?: () => string });
  record(type: string, payload?: Record<string, unknown>): RuleOakAuditEvent;
  list(): RuleOakAuditEvent[];
}

export class PolicyEngine {
  constructor(policy?: Record<string, unknown>);
  evaluate(action: string | { id?: string; action?: string }, context?: Record<string, unknown>): RuleOakDecision;
  boundary(): string;
}

export class EvidenceStore {
  constructor(options?: { auditLog?: AuditLog });
  add(item: RuleOakEvidenceInput): RuleOakEvidence;
  addMany(items?: RuleOakEvidenceInput[]): RuleOakEvidence[];
  list(): RuleOakEvidence[];
  requireMinimum(count: number): void;
}

export type RuleOakApprovalRequest = {
  id: string;
  action: string;
  status: 'pending' | string;
  proposedBy: string;
  reason?: string;
  createdAt: string;
};

export class ApprovalGate {
  constructor(options?: { auditLog?: AuditLog });
  handleDecision(decision: RuleOakDecision, proposedBy?: string): { status: string; request: RuleOakApprovalRequest | null };
  list(): RuleOakApprovalRequest[];
}

export class ReportExporter {
  static writeJson(path: string, report: unknown): string;
}

export class RunManager {
  constructor(options?: {
    app?: string;
    policy?: Record<string, unknown>;
    runId?: string;
    metadata?: Record<string, unknown>;
    clock?: () => string;
  });
  start(): this;
  addEvidence(item: RuleOakEvidenceInput): RuleOakEvidence;
  addEvidenceMany(items: RuleOakEvidenceInput[]): RuleOakEvidence[];
  evaluateAction(action: string | { id?: string; action?: string }, context?: Record<string, unknown>): { decision: RuleOakDecision; approval: { status: string; request: RuleOakApprovalRequest | null } };
  complete(options?: { summary?: Record<string, unknown>; output?: Record<string, unknown> }): Record<string, unknown>;
  report(options?: { summary?: Record<string, unknown>; output?: Record<string, unknown> }): Record<string, unknown>;
}
