export type SandboxDecisionValue = 'allow' | 'deny' | 'approval_required' | string;

export type SandboxDecision = {
  subject: string;
  operation: string;
  decision: SandboxDecisionValue;
  allowed: boolean;
  approvalRequired: boolean;
  denied: boolean;
  reason: string;
  matchedRule: string | null;
  metadata: Record<string, unknown>;
  stage: string;
};

export type SandboxPolicy = {
  stage?: string;
  default?: 'deny' | 'allow' | string;
  filesystem?: {
    read?: string[];
    write?: string[];
    deny?: string[];
  };
  network?: {
    default?: 'deny' | 'allow' | string;
    allow?: string[];
  };
  commands?: {
    default?: 'deny' | 'allow' | string;
    allow?: string[];
    approval_required?: string[];
    deny?: string[];
  };
  tools?: Record<string, SandboxDecisionValue>;
};

export const DEFAULT_SANDBOX_POLICY: Readonly<Required<SandboxPolicy>>;
export function mergeSandboxPolicy(policy?: SandboxPolicy): Required<SandboxPolicy>;
export function sandboxDecision(input: {
  subject: string;
  operation: string;
  decision: SandboxDecisionValue;
  reason: string;
  matchedRule?: string | null;
  metadata?: Record<string, unknown>;
}): SandboxDecision;

export class FilesystemGuard {
  constructor(options?: { policy?: SandboxPolicy; workspaceRoot?: string });
  evaluate(operation: 'read' | 'write' | string, targetPath: string): SandboxDecision;
  canRead(path: string): SandboxDecision;
  canWrite(path: string): SandboxDecision;
}

export class NetworkGuard {
  constructor(options?: { policy?: SandboxPolicy });
  evaluate(target: string, operation?: string): SandboxDecision;
}

export class CommandGuard {
  constructor(options?: { policy?: SandboxPolicy });
  evaluate(input: string | string[], operation?: string): SandboxDecision;
}

export type ToolRegistration = {
  name: string;
  decision?: SandboxDecisionValue;
  risk?: string;
  description?: string;
};

export class ToolRegistry {
  constructor(options?: { policy?: SandboxPolicy });
  register(tool: ToolRegistration): ToolRegistration;
  evaluate(name: string, operation?: string): SandboxDecision;
  list(): ToolRegistration[];
}

export class ToolPermissionEvaluator extends ToolRegistry {}

export class SandboxManager {
  constructor(options?: { policy?: SandboxPolicy; workspaceRoot?: string; auditLog?: { record: (type: string, payload?: Record<string, unknown>) => unknown } });
  record(decision: SandboxDecision): SandboxDecision;
  canRead(path: string): SandboxDecision;
  canWrite(path: string): SandboxDecision;
  canConnect(target: string): SandboxDecision;
  canExecute(command: string | string[]): SandboxDecision;
  canUseTool(tool: string): SandboxDecision;
  inspect(): Record<string, unknown>;
}
