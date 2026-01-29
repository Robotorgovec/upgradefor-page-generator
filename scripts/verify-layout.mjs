import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const layoutPath = path.join(root, "app", "layout.tsx");
const layoutSource = fs.readFileSync(layoutPath, "utf8");

assert.match(
  layoutSource,
  /LayoutShell/,
  "Root layout must render LayoutShell"
);

const searchRoots = ["app", "components", "styles"].map((dir) =>
  path.join(root, dir)
);

function findForbidden(rootDir, pattern) {
  const matches = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      matches.push(...findForbidden(fullPath, pattern));
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (pattern.test(content)) {
        matches.push(fullPath);
      }
    }
  }
  return matches;
}

const forbidden = findForbidden(root, /load-layout\.js/).filter((file) =>
  searchRoots.some((dir) => file.startsWith(dir))
);

assert.equal(
  forbidden.length,
  0,
  `Forbidden load-layout.js reference found in: ${forbidden.join(", ")}`
);

console.log("Layout verification passed");
