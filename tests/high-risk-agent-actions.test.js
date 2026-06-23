import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runHighRiskAgentActionDemos } from '../examples/high-risk-agent-actions/run.js';

const summary = runHighRiskAgentActionDemos();
assert.equal(summary.ruleoakCoreVersion, '2.2.0');
assert.equal(summary.scenarioResults.length, 7);

const byName = Object.fromEntries(summary.scenarioResults.map((scenario) => [scenario.name, scenario]));
assert.ok(['needs_approval', 'deny'].includes(byName['AI tries to delete protected folder'].decision));
assert.equal(byName['AI tries to run shell command'].decision, 'deny');
assert.equal(byName['AI tries to mutate database'].decision, 'needs_approval');
assert.equal(byName['AI tries to call dangerous MCP tool'].decision, 'deny');
assert.equal(byName['AI tries to send external email-like action'].decision, 'needs_approval');
assert.equal(byName['AI uses poisoned retrieved context'].decision, 'deny');
assert.equal(byName['AI installs risky skill/plugin'].decision, 'deny');
assert.ok(summary.evidenceEventCount >= 16);

const reportPath = join('examples', 'high-risk-agent-actions', 'out', 'report.md');
assert.ok(existsSync(reportPath), 'report.md should be generated');
const report = readFileSync(reportPath, 'utf8');
assert.match(report, /AI tries to delete protected folder/);
assert.match(report, /Public\/private boundary/);
console.log('high-risk agent action demo tests passed');
