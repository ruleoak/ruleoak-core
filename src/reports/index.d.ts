export function renderReport(report: unknown, options?: { sourcePath?: string }): string;
export function renderReportFile(inputPath: string, outputPath: string): string;
export function summarizeReport(report?: unknown, sourcePath?: string): unknown;
export function buildReportCatalog(reportPaths?: string[]): unknown;
export function writeReportCatalog(reportPaths?: string[], outputPath?: string): unknown;
