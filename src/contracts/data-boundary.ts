import { z } from "zod";
import { BoundaryLevel, Id } from "./common.js";

/**
 * Data Boundary Spec v1.0
 *
 * Declares what may leave the device, what must stay local, how data is
 * redacted before any cloud call, and per-client overrides. A workspace
 * (or a specific client within it) marked `local_only` MUST produce zero
 * outbound network calls — this is enforced at the network layer, not just
 * by checking this flag.
 */

export const DATA_BOUNDARY_API_VERSION = "data-boundary/v1.0" as const;

/** Redaction behavior applied before any permitted cloud call. */
export const RedactionRule = z.object({
  /** Replace client/entity names with stable pseudonyms. */
  pseudonymizeClients: z.boolean().default(true),
  /** Remove attachments/binary blobs before sending. */
  stripAttachments: z.boolean().default(true),
  /** Additional regex patterns to redact (e.g. secrets, account numbers). */
  patterns: z.array(z.string()).default([]),
});
export type RedactionRule = z.infer<typeof RedactionRule>;

/** Per-client override of the workspace default boundary. */
export const ClientBoundaryOverride = z.object({
  clientId: Id,
  level: BoundaryLevel,
});
export type ClientBoundaryOverride = z.infer<typeof ClientBoundaryOverride>;

export const DataBoundaryPolicy = z
  .object({
    apiVersion: z.literal(DATA_BOUNDARY_API_VERSION),
    id: Id,
    /** Workspace the policy applies to (omit for a reusable template). */
    workspaceId: Id.optional(),
    /** Workspace default boundary level. Defaults to the safest option. */
    level: BoundaryLevel.default("local_only"),
    redaction: RedactionRule.default({}),
    perClientOverrides: z.array(ClientBoundaryOverride).default([]),
  })
  .strict();
export type DataBoundaryPolicy = z.infer<typeof DataBoundaryPolicy>;

/** Resolve the effective boundary level for an optional client. */
export function resolveBoundaryLevel(
  policy: DataBoundaryPolicy,
  clientId?: string,
): BoundaryLevel {
  if (clientId) {
    const override = policy.perClientOverrides.find((o) => o.clientId === clientId);
    if (override) return override.level;
  }
  return policy.level;
}

export function parseDataBoundaryPolicy(input: unknown): DataBoundaryPolicy {
  return DataBoundaryPolicy.parse(input);
}
