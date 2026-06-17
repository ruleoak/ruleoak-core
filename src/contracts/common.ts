import { z } from "zod";

/**
 * Shared primitives used across all four v1.0 contracts.
 *
 * These contracts are semver-ready: every top-level contract carries an
 * `apiVersion` string of the form `<contract>/v<major>.<minor>`. Bump the
 * minor for additive changes, the major for breaking changes.
 */

/** A kebab-case identifier, e.g. `meeting-prep` or `acme-corp`. */
export const Id = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case (lowercase, hyphen-separated)");

/** A semantic version string, e.g. `1.0.0`. */
export const SemVer = z
  .string()
  .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/, "must be a semver string");

/** ISO-8601 timestamp string. */
export const IsoTimestamp = z.string().datetime({ offset: true });

/**
 * Model tiers used by skills and the router.
 * - `L0` small/fast local model (routine, low-stakes work)
 * - `L1` larger local model (better reasoning, still on-device)
 * - `C`  cloud / frontier model (BYOK or managed; may leave the device)
 */
export const ModelTier = z.enum(["L0", "L1", "C"]);
export type ModelTier = z.infer<typeof ModelTier>;

/**
 * Data-boundary level. The single most important safety primitive.
 * - `local_only`        nothing may leave the device. Zero outbound calls.
 * - `redacted_cloud_ok` cloud allowed only after redaction/pseudonymization.
 * - `cloud_ok`          cloud allowed (still requires consent + audit).
 */
export const BoundaryLevel = z.enum(["local_only", "redacted_cloud_ok", "cloud_ok"]);
export type BoundaryLevel = z.infer<typeof BoundaryLevel>;

/** Helper: a record's lifecycle state shared by memory + approvals. */
export const LifecycleState = z.enum([
  "proposed",
  "approved",
  "rejected",
  "deleted",
]);
export type LifecycleState = z.infer<typeof LifecycleState>;
