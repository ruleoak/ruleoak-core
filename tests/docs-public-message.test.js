import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));

const publicWording = 'RuleOak Core is a TypeScript runtime library for governing AI tool calls before execution. It provides guard and policy checks, approval gates, evidence records, audit reports, and protocol conformance tools.';
const sequence = 'Declare tool call → Evaluate policy → Decide allow / approve / block → Pause for approval when required → Record evidence and audit events → Validate and export audit report';
const weakerSequence = 'tool call → policy decision → evidence → approval if needed → audit trail → report';

for (const rel of [
  'README.md',
  'docs/README.md',
  'docs/adoption/developer-usage.md',
  'docs/adoption/10-minute-quickstart.md',
  'docs/launch/demo-sequence.md'
]) {
  assert.ok(exists(rel), `${rel} must exist`);
  const text = read(rel);
  assert.ok(text.includes(publicWording), `${rel} must include public RuleOak Core wording`);
}

const readme = read('README.md');
assert.ok(readme.includes(sequence), 'README must use the aligned governance sequence');
assert.ok(!readme.includes(weakerSequence), 'README must not use the weaker evidence-before-approval sequence');
assert.ok(readme.includes('Path A — GitHub release / source preview'), 'README must document source preview path');
assert.ok(readme.includes('Path B — Local package install from release tarball'), 'README must document local tarball install path');
assert.ok(readme.includes('git clone https://github.com/ruleoak/ruleoak-core.git'), 'README must show source preview clone command');
assert.ok(readme.includes('npm install ../ruleoak-core/ruleoak-core-2.1.0.tgz'), 'README must show local tarball install command');
assert.ok(readme.includes('docs/assets/demo/ruleoak-v2.1.0-demo.gif'), 'README must use the current v2.1.0 demo GIF');

const docsReadme = read('docs/README.md');
assert.ok(docsReadme.includes('Developer usage'), 'docs/README must link developer usage');
assert.ok(docsReadme.includes('10-minute quickstart'), 'docs/README must link quickstart');
assert.ok(docsReadme.includes('Compatibility wording'), 'docs/README must include compatibility wording section');

const usage = read('docs/adoption/developer-usage.md');
assert.ok(usage.includes('Path A — GitHub release / source preview'), 'developer usage must include Path A');
assert.ok(usage.includes('Path B — Local package install from release tarball'), 'developer usage must include Path B');
assert.ok(usage.includes('npm pack'), 'developer usage must include npm pack');

const demoDir = path.join(root, 'docs/assets/demo');
const gifs = fs.readdirSync(demoDir).filter((name) => name.toLowerCase().endsWith('.gif')).sort();
assert.deepEqual(gifs, ['ruleoak-v2.1.0-demo.gif'], `Only the current v2.1.0 demo GIF should remain: ${gifs.join(', ')}`);

const searchable = [
  'README.md',
  'docs/README.md',
  'docs/demo-video-script.md',
  'docs/launch/demo-sequence.md',
  'package.json'
].map(read).join('\n');
const legacyDemoAssets = ['2min-demo', '60s-governance-demo', 'tool-call-approval-audit-demo'].map((name) => `ruleoak-${name}.gif`);
for (const legacy of legacyDemoAssets) {
  assert.ok(!searchable.includes(legacy), `Legacy demo asset reference must be removed: ${legacy}`);
}

console.log('docs public message tests passed');
