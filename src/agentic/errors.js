// SPDX-License-Identifier: AGPL-3.0-or-later

export class RuleOakAgenticError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || this.constructor.name;
    this.details = options.details || {};
  }
}

export class RuleOakPolicyError extends RuleOakAgenticError {}
export class RuleOakEvidenceValidationError extends RuleOakAgenticError {}
export class RuleOakApprovalRequiredError extends RuleOakAgenticError {}
export class RuleOakPermissionDeniedError extends RuleOakAgenticError {}
export class RuleOakReplayError extends RuleOakAgenticError {}
