import { SignatureEnvelope } from "./skill-signing.js";

/**
 * Domain-pack signing v1.0 — MINIMAL design hook (Prompt V5-25, demand-gated).
 *
 * Reuses the generic SignatureEnvelope from skill-signing for a domain pack.
 * Shape only; not verified or required by the runtime yet.
 */

export const DomainPackSignature = SignatureEnvelope.refine((e) => e.artifactType === "domain-pack", {
  message: "DomainPackSignature.artifactType must be 'domain-pack'",
});
export type DomainPackSignature = ReturnType<typeof parseDomainPackSignature>;

export function parseDomainPackSignature(input: unknown) {
  return DomainPackSignature.parse(input);
}
