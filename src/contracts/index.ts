/**
 * @lar/contracts — v1.0
 *
 * The frozen public contracts of RuleOak Core. Everything the
 * runtime enforces is expressed here as both human-readable docs (see
 * /docs/contracts) and typed, runtime-validated Zod schemas.
 *
 * Semver: each contract carries an `apiVersion`. Additive change = minor;
 * breaking change = major. Do not mutate v1.0 shapes in place once a
 * downstream package depends on them.
 */

export * from "./common.js";
export * from "./skill.js";
export * from "./memory.js";
export * from "./routing.js";
export * from "./data-boundary.js";
export * from "./retrieval.js";
export * from "./domain-pack.js";
export * from "./team-policy.js";
export * from "./skill-signing.js";
export * from "./domain-signing.js";

/** Convenience map of contract api-version strings. */
export const CONTRACT_VERSIONS = {
  skill: "skill/v1.0",
  memory: "memory/v1.0",
  routing: "routing/v1.0",
  dataBoundary: "data-boundary/v1.0",
  retrieval: "retrieval/v1.0",
  domainPack: "domain-pack/v1.0",
} as const;
