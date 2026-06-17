import { z } from "zod";
import { Id, IsoTimestamp, ModelTier } from "./common.js";

/**
 * Routing Policy Spec v1.0
 *
 * The router decides where a skill's model calls run. The default is
 * always local. Escalation to cloud requires (1) a routing rule that
 * allows it, (2) a data-boundary policy that allows it, and (3) user
 * consent / sufficient skill approval level. This contract also defines
 * the metering record written for EVERY model action.
 */

export const ROUTING_API_VERSION = "routing/v1.0" as const;

/** Conditions under which the router may escalate beyond the local default. */
export const EscalationTrigger = z.enum([
  "low_confidence",
  "high_stakes",
  "long_context",
  "explicit_user",
]);
export type EscalationTrigger = z.infer<typeof EscalationTrigger>;

export const RoutingPolicy = z
  .object({
    apiVersion: z.literal(ROUTING_API_VERSION),
    /** Default route. Local-first is non-negotiable at v1.0. */
    default: z.literal("local").default("local"),
    escalation: z
      .object({
        allowed: z.boolean().default(false),
        triggers: z.array(EscalationTrigger).default([]),
        /** Below this confidence [0..1] the router considers escalating. */
        minConfidence: z.number().min(0).max(1).default(0.6),
        /** Escalation always requires visible user consent at v1.0. */
        requireConsent: z.literal(true).default(true),
        /** Ceiling tier escalation may reach. */
        maxTier: ModelTier.default("L1"),
      })
      .default({}),
    metering: z
      .object({
        enabled: z.literal(true).default(true),
      })
      .default({}),
  })
  .strict();
export type RoutingPolicy = z.infer<typeof RoutingPolicy>;

/**
 * Meter record — written for every model action. Field names are snake_case
 * to match the persisted/exported schema referenced throughout the playbook.
 */
export const MeterRecord = z
  .object({
    action_id: z.string().min(1),
    skill_id: Id,
    workspace_id: Id,
    provider: z.string().min(1),
    model: z.string().min(1),
    tier: ModelTier,
    ran_locally: z.boolean(),
    left_device: z.boolean(),
    input_tokens_estimate: z.number().int().nonnegative().default(0),
    output_tokens_estimate: z.number().int().nonnegative().default(0),
    estimated_cost: z.number().nonnegative().default(0),
    approval_required: z.boolean().default(false),
    approval_status: z
      .enum(["not_required", "pending", "approved", "rejected"])
      .default("not_required"),
    boundary_policy_id: z.string().min(1),
    created_at: IsoTimestamp,
  })
  .strict();
export type MeterRecord = z.infer<typeof MeterRecord>;

/** Invariant: a record that left the device cannot also be `ran_locally`. */
export const MeterRecordChecked = MeterRecord.refine(
  (r) => !(r.ran_locally && r.left_device),
  { message: "a record cannot both run locally and leave the device" },
);

export function parseRoutingPolicy(input: unknown): RoutingPolicy {
  return RoutingPolicy.parse(input);
}
