#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RunManager, ReportExporter } from '../../src/runtime/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
const readText = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');

const policy = readJson('policy.json');
const caseFile = readJson('mock-data/alert.json');
const logs = readJson('mock-data/logs.json');
const metrics = readJson('mock-data/metrics.json');
const notes = readText('mock-data/notes.md');

const runtime = new RunManager({
  app: 'RuleOak Technical Consultant Demo',
  policy,
  metadata: { demo: 'technical-consultant-demo', caseId: caseFile.id }
}).start();

const connectionWaitLogs = logs.filter((entry) => /database connection/i.test(entry.message));
const service = metrics['checkout-service'];
const database = metrics.database;
const provider = metrics['payment-provider'];

const evidence = runtime.addEvidenceMany([
  {
    id: 'E1',
    source: 'case',
    claim: `${caseFile.service} has high latency and elevated errors`,
    value: caseFile.symptoms.join('; ')
  },
  {
    id: 'E2',
    source: 'logs',
    claim: 'Service logs show database connection wait and timeout messages',
    value: connectionWaitLogs.map((entry) => `${entry.time} ${entry.message}`).join(' | ')
  },
  {
    id: 'E3',
    source: 'metrics',
    claim: 'Database pool pressure is high while service CPU and memory are not saturated',
    value: `dbPool=${service.dbPoolUtilizationPct}%, cpu=${service.cpuPct}%, memory=${service.memoryPct}%, dbActiveConnections=${database.activeConnectionsPct}%`
  },
  {
    id: 'E4',
    source: 'metrics',
    claim: 'External payment provider appears normal compared with the affected service',
    value: `providerP95=${provider.p95LatencyMs}ms, providerErrorRate=${provider.errorRatePct}%`
  },
  {
    id: 'E5',
    source: 'notes',
    claim: 'Known review notes identify database pool pressure as a matching pattern',
    value: notes.includes('database pool utilization exceeds 90%') ? 'matched known pattern' : 'no match'
  }
]);

const proposedAction = 'restart.service';
const { decision: actionPolicy, approval } = runtime.evaluateAction(proposedAction, {
  proposedBy: 'technical-consultant-demo',
  caseId: caseFile.id,
  severity: caseFile.severity,
  evidenceIds: evidence.map((item) => item.id)
});

const output = {
  demo: 'technical-consultant-demo',
  case: {
    id: caseFile.id,
    service: caseFile.service,
    severity: caseFile.severity,
    title: caseFile.title
  },
  probableCause: 'Database connection pool saturation affecting checkout-service request handling.',
  confidence: 'medium-high',
  recommendation: [
    'Do not make an automatic production change.',
    'Capture current database connection, recent deployment, and traffic context.',
    'Escalate to the service owner if saturation persists.',
    'Consider restart or capacity change only after approval.'
  ],
  proposedAction,
  policyDecision: actionPolicy,
  approvalStatus: approval.status,
  executedProductionChange: false
};

const report = runtime.complete({
  summary: {
    title: caseFile.title,
    probableCause: output.probableCause,
    confidence: output.confidence,
    proposedAction,
    policyDecision: actionPolicy.decision,
    approvalStatus: approval.status
  },
  output
});

const outPath = path.join(__dirname, 'out', 'case-report.json');
ReportExporter.writeJson(outPath, report);

console.log('\nRuleOak Technical Consultant Demo');
console.log('---------------------------------');
console.log(`Runtime: ${report.runtimeVersion} (${report.runtimeStage})`);
console.log(`Case: ${caseFile.title}`);
console.log(`Probable cause: ${output.probableCause}`);
console.log(`Confidence: ${output.confidence}`);
console.log('\nEvidence:');
for (const item of evidence) console.log(`- ${item.id} [${item.source}] ${item.claim}`);
console.log('\nPolicy decision:');
console.log(`- Proposed action: ${proposedAction}`);
console.log(`- Allowed now: ${actionPolicy.allowedNow}`);
console.log(`- Approval required: ${actionPolicy.approvalRequired}`);
console.log(`- Reason: ${actionPolicy.reason}`);
console.log(`- Approval status: ${approval.status}`);
console.log('\nOutput written to examples/technical-consultant-demo/out/case-report.json\n');
