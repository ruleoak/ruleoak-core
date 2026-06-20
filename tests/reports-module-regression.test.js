import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const reportsIndex = new URL('../src/reports/index.js', import.meta.url);
const reportSnapshotFixture = new URL('./fixtures/reports/report-snapshot-minimum.json', import.meta.url);
assert.equal(existsSync(reportsIndex), true, 'src/reports/index.js must exist for report-importing examples');
assert.equal(existsSync(reportSnapshotFixture), true, 'tests/fixtures/reports/report-snapshot-minimum.json must exist for npm test report snapshots');

const imported = await import('../src/reports/index.js');
assert.equal(typeof imported, 'object', 'src/reports/index.js should be importable as an ES module');

const result = spawnSync(process.execPath, ['examples/sre-monitoring-change-governance/run.js'], {
  cwd: new URL('..', import.meta.url),
  encoding: 'utf8'
});

assert.equal(
  result.status,
  0,
  `SRE monitoring change example must run without missing src/reports/index.js.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
);

assert.match(result.stdout, /RuleOak SRE Monitoring Change Governance/);
assert.match(result.stdout, /Output written to/);
