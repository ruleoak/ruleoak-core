#!/usr/bin/env node
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateEd25519KeyPair, createTrustRoot } from '../src/integrity/signing.js';
import { signPolicyPackDirectory } from '../src/integrity/policy-pack-integrity.js';
const keys = generateEd25519KeyPair();
const keyId = 'ruleoak-v2.2.0-local-demo-ed25519';
const trustRoot = createTrustRoot({
  rootId: 'ruleoak-v2.2.0-local-trust-root',
  createdAt: '2026-06-19T00:00:00.000Z',
  keys: [{ keyId, publicKeyPem: keys.publicKeyPem, purpose: 'policy-pack-and-evidence-integrity' }],
  latestPublicCoreRelease: 'v2.2.0',
  earlierPublicBaseline: 'v1.0.1',
  developmentTrack: 'public developer release',
  metadata: { note: 'Demo trust root for RuleOak Core v2.2.0 local integrity checks. Replace this key in production.', privateKeyStored: false },
  previousPublicRelease: 'v2.1.0'
});
writeFileSync('configs/trust/ruleoak-local-trust-root.json', JSON.stringify(trustRoot, null, 2)+'\n');
for (const entry of readdirSync('policy-packs', { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  signPolicyPackDirectory(join('policy-packs', entry.name), { privateKeyPem: keys.privateKeyPem, keyId, signedAt: '2026-06-19T00:00:00.000Z', write: true });
}
console.log(JSON.stringify({ ok: true, resigned: true, keyId }, null, 2));
