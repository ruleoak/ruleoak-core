import { z } from "zod";
import { BoundaryLevel, Id } from "./common.js";

/**
 * Team Policy v1.0 — MINIMAL design hook (Prompt V5-24, demand-gated).
 *
 * This is a *minimal contract hook only*. Full team governance (shared
 * workspaces, RBAC enforcement, signed packs, admin dashboards) is NOT built and
 * waits until ≥3 teams request it with willingness to pay. This schema exists so
 * the shape is reserved and reviewable; the runtime does not yet enforce it.
 */

export const TEAM_POLICY_API_VERSION = "team-policy/v1.0" as const;

/** A role and the coarse permissions it grants. */
export const TeamRole = z.object({
  name: Id,
  permissions: z
    .array(z.enum(["read_memory", "propose_memory", "approve_memory", "approve_output", "export", "admin"]))
    .default([]),
});
export type TeamRole = z.infer<typeof TeamRole>;

export const TeamPolicy = z
  .object({
    apiVersion: z.literal(TEAM_POLICY_API_VERSION),
    id: Id,
    roles: z.array(TeamRole).default([]),
    /** Shared-memory writes still require approval (the core invariant holds). */
    sharedMemoryRequiresApproval: z.boolean().default(true),
    /** Per-client boundary overrides for the whole team. */
    perClientBoundaries: z.array(z.object({ clientId: Id, level: BoundaryLevel })).default([]),
    /** Whether domain packs/skills must be signed to load (design; not enforced). */
    requireSignedPacks: z.boolean().default(false),
  })
  .strict();
export type TeamPolicy = z.infer<typeof TeamPolicy>;

export function parseTeamPolicy(input: unknown): TeamPolicy {
  return TeamPolicy.parse(input);
}
