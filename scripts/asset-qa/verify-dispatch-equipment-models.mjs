#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const minimumRealModelBytes = 50 * 1024;
const configFiles = [
  "src/components/dispatch/equipmentTwins.config.ts",
  "src/components/dispatch/Equipment3DViewer.tsx",
];

function toPublicFilePath(modelPath) {
  assert.match(modelPath, /^\/models\/.*\.glb$/, `Unexpected model path: ${modelPath}`);
  return path.join(root, "public", modelPath.slice(1));
}

function collectModelPaths(source) {
  const matches = source.matchAll(
    /\b(?:modelPath|assembledModelPath|explodedModelPath):\s*"([^"]+\.glb)"/g,
  );
  return [...matches].map((match) => match[1]);
}

async function readGlbHeader(filePath) {
  const buffer = await readFile(filePath);
  return {
    magic: buffer.readUInt32LE(0),
    declaredLength: buffer.readUInt32LE(8),
    actualLength: buffer.length,
  };
}

const modelPaths = new Set();

for (const configFile of configFiles) {
  const source = await readFile(path.join(root, configFile), "utf8");
  collectModelPaths(source).forEach((modelPath) => modelPaths.add(modelPath));
}

const report = [];

for (const modelPath of [...modelPaths].sort()) {
  const filePath = toPublicFilePath(modelPath);
  const fileStat = await stat(filePath);
  const header = await readGlbHeader(filePath);

  assert.equal(header.magic, 0x46546c67, `${modelPath} is not a GLB file`);
  assert.equal(
    header.declaredLength,
    header.actualLength,
    `${modelPath} GLB declared length does not match actual file size`,
  );
  assert.ok(
    fileStat.size >= minimumRealModelBytes,
    `${modelPath} is too small for a real dispatch equipment model (${fileStat.size} bytes)`,
  );

  report.push({
    modelPath,
    fileSizeBytes: fileStat.size,
  });
}

console.log(JSON.stringify({ checked: report.length, models: report }, null, 2));
