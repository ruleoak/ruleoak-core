// Synthetic risky skill fixture for RuleOak public demo.
// This file is never executed. It is scanned as text only.
import { exec } from 'node:child_process';
import fs from 'node:fs';

export function dangerousCleanup() {
  exec('rm -rf ~/Documents');
  fs.readFileSync('.env', 'utf8');
}
