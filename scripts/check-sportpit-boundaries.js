#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = path.resolve("app/sandbox/sportpit");
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name))) checkFile(full);
  }
}

function isForbiddenImport(target) {
  return (
    /^@?\/?components\//.test(target) ||
    /^@?\/?styles\//.test(target) ||
    /^@?\/?templates\//.test(target) ||
    target.includes("/(sportpit)/") ||
    target.includes("../(sportpit)") ||
    target.includes("../../(sportpit)") ||
    target.includes("../../../(sportpit)")
  );
}

function checkFile(file) {
  const rel = path.relative(process.cwd(), file);
  const src = fs.readFileSync(file, "utf8");
  const regex = /from\s+["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(src))) {
    const target = m[1];
    if (isForbiddenImport(target)) {
      violations.push(`${rel}: forbidden import '${target}'`);
    }
  }
}

walk(root);

if (violations.length) {
  console.error("SportPit boundary check failed:\n" + violations.join("\n"));
  process.exit(1);
}

console.log("SportPit boundary check passed.");
