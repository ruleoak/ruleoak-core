export type RuntimeBoundaryLevel = 'local_only' | 'redacted_cloud_ok' | 'cloud_ok';

export interface RuntimeDecisionRecord {
  requestId: string;
  boundary: RuntimeBoundaryLevel;
  dataLeftDevice: boolean;
  approvalRequired: boolean;
  auditEventIds: string[];
}

export interface RuntimePort {
  recordDecision(record: RuntimeDecisionRecord): Promise<void> | void;
}
