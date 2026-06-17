import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export class ReportExporter {
  static writeJson(path, report) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(report, null, 2));
    return path;
  }
}
