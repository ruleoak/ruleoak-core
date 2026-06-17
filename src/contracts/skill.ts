import { z } from "zod";
import { BoundaryLevel, Id, ModelTier, SemVer } from "./common.js";

/**
 * Skill Spec v1.0
 *
 * A skill is a declarative unit of work. Skills declare their inputs,
 * outputs, approval level, the tools they need, model-tier hints, the
 * memory they read/write, and their data-boundary requirement.
 *
 * Skills NEVER call providers or the filesystem directly — the runtime
 * mediates everything. This contract is what the runtime enforces.
 */

export const SKILL_API_VERSION = "skill/v1.0" as const;

/** Approval level a skill requires before its effects are committed. */
export const ApprovalLevel = z.enum([
  /** No approval needed (read-only / pure compute). */
  "none",
  /** Output is a draft; user must approve before it can be exported/sent. */
  "review_before_export",
  /** Any external action requires explicit per-action approval. */
  "review_before_action",
]);
export type ApprovalLevel = z.infer<typeof ApprovalLevel>;

/** A typed input or output field of a skill. */
export const SkillField = z.object({
  name: Id,
  type: z.enum(["string", "text", "number", "boolean", "date", "list", "object"]),
  description: z.string().min(1),
  required: z.boolean().default(true),
});
export type SkillField = z.infer<typeof SkillField>;

/** Which memory the skill may read. */
export const MemoryReadRule = z.object({
  /** Scope of memory to read, e.g. `workspace`, `client`, `project`. */
  scope: z.enum(["workspace", "client", "project", "global"]),
  /** Optional tag filter; if present only matching memory is visible. */
  tags: z.array(z.string()).optional(),
});
export type MemoryReadRule = z.infer<typeof MemoryReadRule>;

/** Which memory the skill may *propose* writing (writes always need approval). */
export const MemoryWriteRule = z.object({
  scope: z.enum(["workspace", "client", "project"]),
  kind: z.enum(["note", "fact", "entity", "action_ref"]),
  /** Human description of what gets written and why. */
  description: z.string().min(1),
});
export type MemoryWriteRule = z.infer<typeof MemoryWriteRule>;

/** Model-tier routing hint for this skill. */
export const ModelTierHint = z.object({
  /** Preferred starting tier. Local-first by default. */
  default: ModelTier.default("L0"),
  /** May the router escalate to a higher/cloud tier? */
  allowEscalation: z.boolean().default(false),
  /** If escalation is allowed, the ceiling tier it may escalate to. */
  escalateTo: ModelTier.optional(),
});
export type ModelTierHint = z.infer<typeof ModelTierHint>;

/** Data-boundary requirement declared by the skill. */
export const SkillDataBoundary = z.object({
  /** Minimum boundary level the skill is allowed to operate under. */
  requirement: BoundaryLevel.default("local_only"),
  /** Strip attachments before any cloud call. */
  stripAttachments: z.boolean().default(true),
  /** Pseudonymize client/entity names before any cloud call. */
  pseudonymizeClients: z.boolean().default(true),
});
export type SkillDataBoundary = z.infer<typeof SkillDataBoundary>;

export const SkillSpec = z
  .object({
    apiVersion: z.literal(SKILL_API_VERSION),
    id: Id,
    name: z.string().min(1),
    version: SemVer,
    description: z.string().min(1),
    category: z.string().min(1).default("technical-operator"),
    approvalLevel: ApprovalLevel,
    inputs: z.array(SkillField).default([]),
    outputs: z.array(SkillField).default([]),
    /** Declared tool ids the skill is permitted to use. */
    tools: z.array(Id).default([]),
    modelTier: ModelTierHint,
    memory: z
      .object({
        read: z.array(MemoryReadRule).default([]),
        write: z.array(MemoryWriteRule).default([]),
      })
      .default({ read: [], write: [] }),
    dataBoundary: SkillDataBoundary,
    /** Path (relative to the skill folder) to the prompt template. */
    promptFile: z.string().default("prompt.md"),
  })
  .strict();

export type SkillSpec = z.infer<typeof SkillSpec>;

/** Parse + validate an untyped object (e.g. parsed YAML) into a SkillSpec. */
export function parseSkillSpec(input: unknown): SkillSpec {
  return SkillSpec.parse(input);
}
