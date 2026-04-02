import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const layoutShellPath = path.join(root, "components", "layout", "LayoutShell.tsx");
const headerPath = path.join(root, "components", "layout", "Header.tsx");
const sidebarPath = path.join(root, "components", "layout", "Sidebar.tsx");
const homePagePath = path.join(root, "app", "page.tsx");
const publicIndexPath = path.join(root, "public", "index.html");
const legacyLayoutScriptPath = path.join(root, "public", "assets", "load-layout.js");

const layoutShellSource = fs.readFileSync(layoutShellPath, "utf8");
const headerSource = fs.readFileSync(headerPath, "utf8");
const sidebarSource = fs.readFileSync(sidebarPath, "utf8");
const homePageSource = fs.readFileSync(homePagePath, "utf8");
const publicIndexSource = fs.readFileSync(publicIndexPath, "utf8");

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

assert.equal(countMatches(layoutShellSource, /<Header\b/g), 1, "Layout shell must render one Header");
assert.equal(countMatches(layoutShellSource, /<Sidebar\b/g), 1, "Layout shell must render one Sidebar");
assert.equal(countMatches(layoutShellSource, /<main\b/g), 1, "Layout shell must render one main");

assert.doesNotMatch(
  layoutShellSource,
  /variant="homepage"/,
  "Layout shell must not select a homepage-only header/sidebar variant"
);
assert.doesNotMatch(
  headerSource,
  /variant\?:\s*"default"\s*\|\s*"homepage"/,
  "Header must not expose multiple structural variants"
);
assert.doesNotMatch(
  sidebarSource,
  /variant\?:\s*"default"\s*\|\s*"homepage"/,
  "Sidebar must not expose multiple structural variants"
);
assert.doesNotMatch(homePageSource, /load-layout\.js/, "Homepage must not reference load-layout.js");
assert.doesNotMatch(homePageSource, /layoutJs/, "Homepage must not inline legacy layout JS");
assert.ok(!fs.existsSync(legacyLayoutScriptPath), "Legacy load-layout.js must be deleted");
assert.doesNotMatch(
  publicIndexSource,
  /load-layout\.js/,
  "public/index.html must not bootstrap legacy load-layout.js"
);
assert.doesNotMatch(
  publicIndexSource,
  /<header>\s*<\/header>/,
  "public/index.html must not keep an empty legacy header bootstrap placeholder"
);
assert.doesNotMatch(
  publicIndexSource,
  /<aside class="sidebar"><\/aside>/,
  "public/index.html must not keep a legacy sidebar bootstrap placeholder"
);

assert.match(homePageSource, /export default function/, "Home page export missing");
assert.ok(!homePageSource.includes("<html"), "Home page should not render <html>");

console.log("Layout tests passed");
