import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const layoutPath = path.join(root, "app", "layout.tsx");
const homePagePath = path.join(root, "app", "page.tsx");
const layoutShellPath = path.join(root, "components", "layout", "LayoutShell.tsx");
const headerPath = path.join(root, "components", "layout", "Header.tsx");
const sidebarPath = path.join(root, "components", "layout", "Sidebar.tsx");

const layoutSource = fs.readFileSync(layoutPath, "utf8");
const homePageSource = fs.readFileSync(homePagePath, "utf8");
const layoutShellSource = fs.readFileSync(layoutShellPath, "utf8");
const headerSource = fs.readFileSync(headerPath, "utf8");
const sidebarSource = fs.readFileSync(sidebarPath, "utf8");

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

assert.match(layoutSource, /LayoutShell/, "Root layout must render LayoutShell");
assert.doesNotMatch(homePageSource, /load-layout\.js/, "Home page must not reference load-layout.js");
assert.doesNotMatch(
  homePageSource,
  /layoutJs/,
  "Home page must not keep legacy layout JS wiring"
);
assert.doesNotMatch(
  layoutShellSource,
  /variant="homepage"/,
  "Layout shell must not select a homepage-only structural variant"
);
assert.doesNotMatch(
  headerSource,
  /variant\?:\s*"default"\s*\|\s*"homepage"/,
  "Header must not define multiple structural variants"
);
assert.doesNotMatch(
  sidebarSource,
  /variant\?:\s*"default"\s*\|\s*"homepage"/,
  "Sidebar must not define multiple structural variants"
);

assert.equal(
  countMatches(layoutShellSource, /<Header\b/g),
  1,
  "Layout shell must render exactly one Header"
);
assert.equal(
  countMatches(layoutShellSource, /<Sidebar\b/g),
  1,
  "Layout shell must render exactly one Sidebar"
);
assert.equal(
  countMatches(layoutShellSource, /<main\b/g),
  1,
  "Layout shell must render exactly one main content wrapper"
);

console.log("Layout verification passed");
