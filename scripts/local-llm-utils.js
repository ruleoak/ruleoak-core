import os from "node:os";
import { readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

export function readProfiles() {
  return JSON.parse(readFileSync(join(resolve("."), "configs", "local-llm-profiles.json"), "utf8"));
}

export function detectHardware() {
  const cpus = os.cpus() || [];
  const totalRamGb = Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10;
  const platform = os.platform();
  const arch = os.arch();
  const cpuModel = cpus[0]?.model || "unknown";
  const cpuCount = cpus.length;
  let appleSilicon = false;
  let gpuHint = "not-detected";
  let nvidiaSmi = false;
  if (platform === "darwin") {
    try {
      const chip = execFileSync("sysctl", ["-n", "machdep.cpu.brand_string"], { encoding: "utf8" }).trim();
      appleSilicon = arch === "arm64" || chip.toLowerCase().includes("apple");
      gpuHint = appleSilicon ? "apple-unified-memory" : "mac-cpu-or-discrete-gpu";
    } catch {
      appleSilicon = arch === "arm64";
      gpuHint = appleSilicon ? "apple-unified-memory" : "mac-unknown";
    }
  }
  try {
    const result = spawnSync("nvidia-smi", ["--query-gpu=name,memory.total", "--format=csv,noheader"], { encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim()) { nvidiaSmi = true; gpuHint = result.stdout.trim().split("\n").join("; "); }
  } catch {}
  return { platform, arch, cpuModel, cpuCount, totalRamGb, appleSilicon, gpuHint, nvidiaSmi };
}
export function chooseProfile(totalRamGb, profiles) { return profiles.find((p) => totalRamGb >= p.min_ram_gb && totalRamGb <= p.max_ram_gb) || profiles[0]; }
export function ollamaInstalled() {
  const result = spawnSync("ollama", ["--version"], { encoding: "utf8" });
  return { ok: result.status === 0, version: result.status === 0 ? (result.stdout || result.stderr).trim() : null };
}
export function buildRecommendation() {
  const config = readProfiles(); const hardware = detectHardware(); const profile = chooseProfile(hardware.totalRamGb, config.profiles); const ollama = ollamaInstalled();
  return { config, hardware, profile, ollama };
}
export function printRecommendation({ hardware, profile, ollama }) {
  console.log("RuleOak Local LLM Doctor"); console.log("------------------------");
  console.log(`OS:          ${hardware.platform} ${hardware.arch}`);
  console.log(`CPU:         ${hardware.cpuModel}`); console.log(`CPU cores:   ${hardware.cpuCount}`); console.log(`RAM:         ${hardware.totalRamGb} GB`);
  console.log(`GPU hint:    ${hardware.gpuHint}`); console.log(`Ollama:      ${ollama.ok ? ollama.version : "not found"}`); console.log("");
  console.log(`Profile:     ${profile.id}`); console.log(`Recommend:   ${profile.recommended_model}`); console.log(`Alternates:  ${profile.alternates.join(", ")}`); console.log(`Purpose:     ${profile.purpose}`); console.log("");
  console.log("Next commands:"); console.log(`  ollama pull ${profile.recommended_model}`); console.log(`  RULEOAK_OLLAMA_MODEL=${profile.recommended_model} npm run llm:smoke`); console.log(`  RULEOAK_OLLAMA_MODEL=${profile.recommended_model} npm run example:consultant:llm`);
}
