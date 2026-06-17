import { z } from "zod";
import { Id, SemVer } from "./common.js";

/**
 * Domain Pack Manifest v1.0 (MINIMAL)
 *
 * A domain pack turns the domain-neutral core into a vertical app. This is
 * deliberately a plain config schema, NOT a heavy framework: it carries only
 * what the loader and the first vertical (Technical Consultant) need today —
 * identity, runtime compatibility, skill paths, retrieval-recipe paths, and a
 * flat map of UI label overrides.
 *
 * Deferred on purpose (rule of three — one example cannot define them well):
 * - CompliancePolicy, EvalSuite, and UIManifest as separate versioned
 *   contracts. `uiLabels` stays INLINE here rather than becoming a UIManifest.
 * - `ontology`. These are built in prompt 7V-rest once a real second vertical
 *   justifies the abstraction.
 */

export const DOMAIN_PACK_API_VERSION = "domain-pack/v1.0" as const;

/** Which core runtime + contract versions this pack is compatible with. */
export const RuntimeCompat = z.object({
  /** Minimum core runtime semver this pack requires. */
  minCoreVersion: SemVer,
  /** Contract api-version strings the pack relies on, e.g. `skill/v1.0`. */
  contracts: z.array(z.string().min(1)).default([]),
});
export type RuntimeCompat = z.infer<typeof RuntimeCompat>;

export const DomainPackManifest = z
  .object({
    apiVersion: z.literal(DOMAIN_PACK_API_VERSION),
    id: Id,
    name: z.string().min(1),
    version: SemVer,
    description: z.string().min(1).optional(),
    runtimeCompat: RuntimeCompat,
    /** Paths (relative to the pack root) to skill folders or skill.yaml files. */
    skills: z.array(z.string().min(1)).default([]),
    /** Paths (relative to the pack root) to retrieval-recipe YAML files. */
    retrievalRecipes: z.array(z.string().min(1)).default([]),
    /**
     * Flat UI label overrides: key -> display string. Kept inline by design;
     * promotion to a separate UIManifest contract is deferred to 7V-rest.
     */
    uiLabels: z.record(z.string(), z.string()).default({}),
  })
  .strict();

export type DomainPackManifest = z.infer<typeof DomainPackManifest>;

/** Parse + validate an untyped object (e.g. parsed YAML) into a DomainPackManifest. */
export function parseDomainPackManifest(input: unknown): DomainPackManifest {
  return DomainPackManifest.parse(input);
}
