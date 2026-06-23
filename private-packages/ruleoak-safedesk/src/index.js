export function createPrivateSafeDeskScaffold() {
  return {
    name: "RuleOak SafeDesk",
    visibility: "private-commercial",
    modules: ["onboarding", "protected-folders", "approval-queue", "evidence-timeline", "report-export", "home-evidence", "creator-proof"]
  };
}
