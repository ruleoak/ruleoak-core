import { z } from "zod";
import { Id, IsoTimestamp, LifecycleState } from "./common.js";

/**
 * Memory Spec v1.0
 *
 * Memory is local-first and inspectable. Long-form notes are stored as
 * Markdown; metadata/indexing lives in a local store. The contract here
 * declares the record shape, consent state, and retention/export/delete
 * rules. There are NO hidden memory writes: every write starts life as
 * `proposed` and only an explicit approval moves it to `approved`.
 */

export const MEMORY_API_VERSION = "memory/v1.0" as const;

/** Storage format of a memory record's body. */
export const MemoryFormat = z.enum(["markdown", "structured"]);
export type MemoryFormat = z.infer<typeof MemoryFormat>;

/** Kind of memory, mirroring the skill write rules. */
export const MemoryKind = z.enum(["note", "fact", "entity", "action_ref"]);
export type MemoryKind = z.infer<typeof MemoryKind>;

/** Retention rule for a record. */
export const RetentionRule = z.object({
  /** `keep` = retain until explicitly deleted; `expire_days` = auto-expire. */
  policy: z.enum(["keep", "expire_days"]).default("keep"),
  days: z.number().int().positive().optional(),
});
export type RetentionRule = z.infer<typeof RetentionRule>;

export const MemoryRecord = z
  .object({
    apiVersion: z.literal(MEMORY_API_VERSION),
    id: z.string().min(1),
    workspaceId: Id,
    /** Optional sub-scope within the workspace (client/project). */
    scope: z.enum(["workspace", "client", "project", "global"]).default("workspace"),
    scopeRef: z.string().optional(),
    kind: MemoryKind,
    format: MemoryFormat.default("markdown"),
    title: z.string().min(1),
    body: z.string().default(""),
    tags: z.array(z.string()).default([]),
    /** Consent lifecycle. New writes MUST start as `proposed`. */
    state: LifecycleState.default("proposed"),
    /** Skill or actor that proposed this memory. */
    source: z.string().min(1),
    retention: RetentionRule.default({ policy: "keep" }),
    createdAt: IsoTimestamp,
    updatedAt: IsoTimestamp,
  })
  .strict();
export type MemoryRecord = z.infer<typeof MemoryRecord>;

/** An export bundle: what a user gets when they export workspace memory. */
export const MemoryExport = z.object({
  apiVersion: z.literal(MEMORY_API_VERSION),
  workspaceId: Id,
  exportedAt: IsoTimestamp,
  records: z.array(MemoryRecord),
});
export type MemoryExport = z.infer<typeof MemoryExport>;

export function parseMemoryRecord(input: unknown): MemoryRecord {
  return MemoryRecord.parse(input);
}
