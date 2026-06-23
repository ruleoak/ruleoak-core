export declare class RuleOakAgenticError extends Error { code: string; details: Record<string, unknown>; constructor(message: string, options?: Record<string, unknown>); }
export declare class RuleOakPolicyError extends RuleOakAgenticError {}
export declare class RuleOakEvidenceValidationError extends RuleOakAgenticError {}
export declare class RuleOakApprovalRequiredError extends RuleOakAgenticError {}
export declare class RuleOakPermissionDeniedError extends RuleOakAgenticError {}
export declare class RuleOakReplayError extends RuleOakAgenticError {}
export type AgenticRisk = "low" | "medium" | "high" | "unknown";
export type FirewallDecision = "allow" | "deny" | "needs_approval" | "dry_run_only";
export interface AgenticActionEnvelope {
  actionId?: string;
  id?: string;
  action?: string;
  toolName?: string;
  tool?: string;
  name?: string;
  operation?: string;
  intent?: string;
  verb?: string;
  target?: string | null;
  subject?: string | null;
  input?: unknown;
  arguments?: unknown;
  payload?: unknown;
  actor?: string;
  risk?: AgenticRisk;
  approved?: boolean;
  metadata?: Record<string, unknown>;
}
export interface EvidenceEvent {
  schemaVersion: string;
  eventId: string;
  runId: string;
  sessionId: string;
  sequence: number;
  type: string;
  timestamp: string;
  actor: string;
  payload: Record<string, unknown>;
}
export declare const REDACTED_VALUE: string;
export declare function redactValue(value: unknown, options?: Record<string, unknown>): unknown;
export declare function redactedJson(value: unknown): string;
export declare class InMemoryEvidenceSink { append(event: EvidenceEvent): void; list(): EvidenceEvent[]; }
export declare class JsonlEvidenceSink { constructor(filePath: string); filePath: string; append(event: EvidenceEvent): void; list(): EvidenceEvent[]; }
export declare function readEvidenceJsonl(filePath: string): EvidenceEvent[];
export declare class FlightRecorder {
  constructor(options?: Record<string, unknown>);
  runId: string;
  sessionId: string;
  actor: string;
  record(type: string, payload?: Record<string, unknown>, options?: Record<string, unknown>): EvidenceEvent;
  startRun(payload?: Record<string, unknown>): EvidenceEvent;
  finishRun(payload?: Record<string, unknown>): EvidenceEvent;
  recordActionRequested(action?: AgenticActionEnvelope): EvidenceEvent;
  recordPolicyDecision(actionId: string, decision?: Record<string, unknown>): EvidenceEvent;
  recordApprovalRequested(actionId: string, approval?: Record<string, unknown>): EvidenceEvent;
  recordApprovalDecision(actionId: string, approval?: Record<string, unknown>): EvidenceEvent;
  recordActionExecuted(actionId: string, result?: Record<string, unknown>): EvidenceEvent;
  recordActionFailed(actionId: string, error?: unknown): EvidenceEvent;
  wrapAction(action: AgenticActionEnvelope, executor: (action: AgenticActionEnvelope) => Promise<unknown> | unknown): Promise<unknown>;
  list(): EvidenceEvent[];
}
export declare class AgentFirewall {
  constructor(options?: Record<string, unknown>);
  classifyRisk(action?: AgenticActionEnvelope): AgenticRisk;
  evaluateAction(action?: AgenticActionEnvelope): Record<string, unknown>;
  guardAction(action: AgenticActionEnvelope, executor?: (action: AgenticActionEnvelope, decision: Record<string, unknown>) => Promise<unknown> | unknown): Promise<Record<string, unknown>>;
  report(options?: Record<string, unknown>): Record<string, unknown>;
}
export declare class OpenClawSafetyShield {
  constructor(options?: Record<string, unknown>);
  static defaultPolicy(): Record<string, unknown>;
  mapAction(action?: Record<string, unknown>): AgenticActionEnvelope;
  handleAction(action?: Record<string, unknown>): Promise<Record<string, unknown>>;
  handleActions(actions?: Array<Record<string, unknown>>): Promise<Array<Record<string, unknown>>>;
  report(options?: Record<string, unknown>): Record<string, unknown>;
}
export declare class McpPermissionGateway {
  constructor(options?: Record<string, unknown>);
  tools(): Array<Record<string, unknown>>;
  inventory(): Record<string, unknown>;
  inspect(): Record<string, unknown>;
  callTool(args?: Record<string, unknown>): Promise<Record<string, unknown>>;
  handleJsonRpc(request?: Record<string, unknown>): Promise<Record<string, unknown>>;
  report(options?: Record<string, unknown>): Record<string, unknown>;
}
export declare function buildActionTimeline(events?: EvidenceEvent[], filters?: Record<string, unknown>): Array<Record<string, unknown>>;
export declare function loadActionTimelineFromJsonl(filePath: string, filters?: Record<string, unknown>): Array<Record<string, unknown>>;
export declare function renderTimelineText(timeline?: Array<Record<string, unknown>>): string;
export declare function renderTimelineMarkdown(timeline?: Array<Record<string, unknown>>, options?: Record<string, unknown>): string;
export declare class AgentActionReplay {
  constructor(options?: Record<string, unknown>);
  timeline(filters?: Record<string, unknown>): Array<Record<string, unknown>>;
  toText(filters?: Record<string, unknown>): string;
  toMarkdown(filters?: Record<string, unknown>): string;
}
export declare const EVIDENCE_JSONL_SCHEMA_VERSION: string;
export declare const EVIDENCE_EVENT_TYPES: readonly string[];
export declare function normalizeEvidenceEvent(event?: Record<string, unknown>, defaults?: Record<string, unknown>): EvidenceEvent;
export declare function validateEvidenceEvent(event?: Record<string, unknown>, options?: Record<string, unknown>): { ok: boolean; errors: string[] };
export declare function validateEvidenceJsonlText(text?: string, options?: Record<string, unknown>): Record<string, unknown>;
export declare function validateEvidenceJsonlFile(filePath: string, options?: Record<string, unknown>): Record<string, unknown>;
export declare function evidenceEventToJsonl(event?: Record<string, unknown>): string;
export declare const RULEOAK_MANIFEST_VERSION: string;
export declare function parseRuleOakManifestText(text?: string): Record<string, unknown>;
export declare function loadRuleOakManifest(filePath?: string): Record<string, unknown>;
export declare function normalizeRuleOakManifest(manifest?: Record<string, unknown>): Record<string, unknown>;
export declare function validateRuleOakManifest(manifest?: Record<string, unknown>): Record<string, unknown>;
export declare function ruleOakManifestToPolicy(manifest?: Record<string, unknown>): Record<string, unknown>;
export declare function generateRuleOakManifestSummary(manifest?: Record<string, unknown>): string;
export declare function generateRuleOakBadgeMarkdown(level?: string, options?: Record<string, unknown>): string;
export declare function verifyRuleOakBadgeClaim(level?: string, manifest?: Record<string, unknown>): Record<string, unknown>;
export declare function badgeLevelReport(manifest?: Record<string, unknown>): Array<Record<string, unknown>>;
export declare class ToolRiskScanner { constructor(options?: Record<string, unknown>); scanTools(tools?: Array<Record<string, unknown>>): Record<string, unknown>; scanObject(value?: Record<string, unknown>): Record<string, unknown>; scanFile(filePath: string): Record<string, unknown>; renderMarkdown(report?: Record<string, unknown>): string; }
export declare function classifyToolRisk(tool?: Record<string, unknown>, classifier?: unknown): Record<string, unknown>;
export declare function scanToolRisks(tools?: Array<Record<string, unknown>>, options?: Record<string, unknown>): Record<string, unknown>;
export declare function runAgentSafetyCi(options?: Record<string, unknown>): Record<string, unknown>;
export declare function renderAgentSafetyCiMarkdown(report?: Record<string, unknown>): string;
export declare function compileRuleOakPolicyFromPrompt(text?: string): Record<string, unknown>;
export declare function renderCompiledPolicyYaml(compilation?: Record<string, unknown>): string;
export declare function filterToolsForLeastPrivilege(options?: Record<string, unknown>): Record<string, unknown>;
export declare class LocalApprovalStore { save(request: Record<string, unknown>): Record<string, unknown>; get(approvalId: string): Record<string, unknown> | null; list(): Array<Record<string, unknown>>; }
export declare class ApprovalLinkProtocol { constructor(options?: Record<string, unknown>); createRequest(action?: Record<string, unknown>, options?: Record<string, unknown>): Record<string, unknown>; decide(approvalId: string, options?: Record<string, unknown>): Record<string, unknown>; canProceed(approvalId: string): boolean; }
export declare class AgentDryRunMode { constructor(options?: Record<string, unknown>); preview(action?: Record<string, unknown>): Promise<Record<string, unknown>>; }
export declare function dryRunAction(action?: Record<string, unknown>, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
export declare function generateAgentIncidentReport(events?: EvidenceEvent[], options?: Record<string, unknown>): Record<string, unknown>;
export declare function renderIncidentReportMarkdown(report?: Record<string, unknown>): string;
export declare function renderIncidentReportHtml(report?: Record<string, unknown>): string;
export declare function scanMcpToolCatalog(catalog?: Record<string, unknown>): Record<string, unknown>;
export declare function renderMcpCatalogScanMarkdown(report?: Record<string, unknown>): string;
export declare function calculateAgentTrustScore(options?: Record<string, unknown>): Record<string, unknown>;
export declare function renderAgentTrustScoreMarkdown(report?: Record<string, unknown>): string;
export declare class LocalEvidenceVault { constructor(options?: Record<string, unknown>); indexEvents(events?: EvidenceEvent[]): Record<string, unknown>; indexJsonlFile(filePath: string): Record<string, unknown>; search(filters?: Record<string, unknown>): EvidenceEvent[]; summary(): Record<string, unknown>; exportJson(filePath: string): Record<string, unknown>; redactionCheck(): Record<string, unknown>; static fromJsonlFile(filePath: string): LocalEvidenceVault; }
export declare const AI_AGENT_CONSTITUTION_PACKS: Record<string, Record<string, unknown>>;
export declare function getAgentConstitutionPack(name: string): Record<string, unknown>;
export declare function listAgentConstitutionPacks(): Array<Record<string, unknown>>;
export declare function mergeAgentConstitutionPacks(names?: string[], overrides?: Record<string, unknown>): Record<string, unknown>;
export declare function constitutionPackToManifest(name: string): Record<string, unknown>;

export function classifyFilesystemAction(action?: any, options?: any): any;
export function evaluateFilesystemAction(action?: any, policy?: any): any;
export function classifySqlOperation(sql?: string): any;
export function evaluateDatabaseAction(action?: any, policy?: any): any;
export function scanSkillPlugin(targetPath: string, options?: any): any;
export function hardenMcpCatalog(catalog?: any): any;

export function validateRuleOakPolicy(policy: any): { ok: boolean; errors: string[] };
export function evaluateRuleOakPolicy(policy: any, action: any): any;
export function evaluateContextItem(item: any, policy?: any): any;
export function guardContextItems(items: any[], policy?: any): any;
