import { z } from "zod";
import { Id, IsoTimestamp, SemVer } from "./common.js";

/**
 * Skill signing v1.0 — MINIMAL design hook (Prompt V5-25, demand-gated).
 *
 * A detached signature envelope over a skill artifact's content hash. This is a
 * SHAPE only — the runtime does not verify or require signatures yet. Signing,
 * verification, a curated registry, and a marketplace are built only when users
 * ask to install/share/sell packs or skills.
 */

export const SIGNATURE_API_VERSION = "signing/v1.0" as const;

export const SignatureAlgorithm = z.enum(["ed25519", "ecdsa-p256"]);
export type SignatureAlgorithm = z.infer<typeof SignatureAlgorithm>;

/** Generic detached-signature envelope over a content hash. */
export const SignatureEnvelope = z
  .object({
    apiVersion: z.literal(SIGNATURE_API_VERSION),
    artifactType: z.enum(["skill", "domain-pack"]),
    artifactId: Id,
    version: SemVer,
    /** Hex content hash of the artifact (e.g. sha256). */
    contentHash: z.string().min(1),
    hashAlgorithm: z.string().min(1).default("sha256"),
    algorithm: SignatureAlgorithm,
    /** Base64 signature over `contentHash`. */
    signature: z.string().min(1),
    /** Signer key id / publisher identity. */
    signer: z.string().min(1),
    signedAt: IsoTimestamp,
  })
  .strict();
export type SignatureEnvelope = z.infer<typeof SignatureEnvelope>;

export const SkillSignature = SignatureEnvelope.refine((e) => e.artifactType === "skill", {
  message: "SkillSignature.artifactType must be 'skill'",
});
export type SkillSignature = z.infer<typeof SkillSignature>;

export function parseSkillSignature(input: unknown): SkillSignature {
  return SkillSignature.parse(input);
}
