import { z } from "zod";
import { BoundaryLevel, Id, SemVer } from "./common.js";

/**
 * Retrieval Spec v1.0
 *
 * A RetrievalSpec (a "retrieval recipe") declaratively describes how the
 * RAG / work-memory engine should fetch and assemble a grounded context
 * pack for a given workflow. It is the contract between a skill and the
 * retrieval engine: the engine reads this, never ad-hoc heuristics.
 *
 * Design constraints (v4.2 slimmed scope):
 * - Keyword + metadata retrieval is the MVP. Vector/hybrid/rerank live in a
 *   later prompt; this contract therefore stays strategy-light and only
 *   carries hints the engine may honor.
 * - Grounding is first-class: citations and an explicit policy for
 *   unsupported claims are required fields, not afterthoughts.
 */

export const RETRIEVAL_API_VERSION = "retrieval/v1.0" as const;

/**
 * A class of documents the engine may draw from. Kept open-ended via a
 * free-form `type` string so domain packs can name their own sources
 * (e.g. `meeting_notes`, `approved_memory`, `documents`) without changing
 * the core contract.
 */
export const DocumentSource = z.object({
  /** Source type identifier, e.g. `approved_memory`, `meeting_notes`, `documents`. */
  type: z.string().min(1),
  /** Optional object types within the source, e.g. `decision`, `risk`, `action_item`. */
  objectTypes: z.array(z.string().min(1)).optional(),
  /** Only retrieve the N most recent items from this source. */
  recencyLimit: z.number().int().positive().optional(),
  /** If true, derive the query for this source from the user's task input. */
  queryFromUserTask: z.boolean().default(false),
});
export type DocumentSource = z.infer<typeof DocumentSource>;

/** Hints for how documents should be chunked before indexing/retrieval. */
export const ChunkingHints = z.object({
  /** Target chunk size in tokens (approximate). */
  maxTokens: z.number().int().positive().default(512),
  /** Token overlap between adjacent chunks. */
  overlapTokens: z.number().int().nonnegative().default(64),
  /** Prefer splitting on these boundaries before falling back to token windows. */
  splitOn: z.array(z.enum(["heading", "paragraph", "sentence"])).default(["heading", "paragraph"]),
});
export type ChunkingHints = z.infer<typeof ChunkingHints>;

/** Coarse filters that constrain what the engine is allowed to consider. */
export const RetrievalFilters = z.object({
  /** Retrieval must be scoped to a workspace. */
  workspaceRequired: z.boolean().default(true),
  /** Retrieval must be scoped to a project. */
  projectRequired: z.boolean().default(false),
  /** Only retrieve from approved memory (default: true for grounding safety). */
  approvedOnly: z.boolean().default(true),
});
export type RetrievalFilters = z.infer<typeof RetrievalFilters>;

/** A single metadata key/value constraint applied during retrieval. */
export const MetadataFilter = z.object({
  /** Metadata key, e.g. `client`, `project`, `tag`. */
  key: z.string().min(1),
  op: z.enum(["eq", "neq", "in", "exists"]).default("eq"),
  /** Value(s) to match. Omit for the `exists` operator. */
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
});
export type MetadataFilter = z.infer<typeof MetadataFilter>;

/**
 * Named sections the assembled context pack must contain, in order.
 * Free-form strings so domain packs can shape their own packs, but the
 * canonical work-memory sections are documented in the spec.
 */
export const ContextPackSection = z.string().min(1);

/**
 * What to do with claims the answer makes that retrieval did NOT support.
 * Defaults to the safest option: mark them rather than silently emit them.
 */
export const UnsupportedClaimPolicy = z.enum([
  /** Tag the claim as unknown / needs-review and keep it visible. */
  "mark_unknown",
  /** Drop unsupported claims entirely. */
  "omit",
  /** Fail the run if any unsupported claim is detected. */
  "block",
]);
export type UnsupportedClaimPolicy = z.infer<typeof UnsupportedClaimPolicy>;

export const RetrievalSpec = z
  .object({
    apiVersion: z.literal(RETRIEVAL_API_VERSION),
    /** Recipe id, e.g. `meeting-context`. Unique within a domain pack. */
    id: Id,
    version: SemVer,
    description: z.string().min(1),
    /** Skill this recipe is intended for (optional; a recipe may be shared). */
    skillId: Id.optional(),
    /**
     * Boundary level retrieval runs under. `local_only` means the engine
     * (including any embeddings) must not make outbound calls.
     */
    boundary: BoundaryLevel.default("local_only"),
    sources: z.array(DocumentSource).min(1),
    chunking: ChunkingHints.default({}),
    filters: RetrievalFilters.default({}),
    metadataFilters: z.array(MetadataFilter).default([]),
    /** Maximum number of chunks to retrieve. */
    topK: z.number().int().positive().default(8),
    contextPack: z
      .object({
        /** Soft cap on the assembled context pack size, in tokens. */
        maxTokens: z.number().int().positive().default(6000),
        /** Ordered sections to emit. */
        sections: z.array(ContextPackSection).min(1),
      }),
    /** Every retrieved chunk used in the answer must carry a source reference. */
    citationRequired: z.boolean().default(true),
    /** Policy for claims not supported by retrieved sources. */
    unsupportedClaimPolicy: UnsupportedClaimPolicy.default("mark_unknown"),
  })
  .strict();

export type RetrievalSpec = z.infer<typeof RetrievalSpec>;

/** Parse + validate an untyped object (e.g. parsed YAML) into a RetrievalSpec. */
export function parseRetrievalSpec(input: unknown): RetrievalSpec {
  return RetrievalSpec.parse(input);
}
