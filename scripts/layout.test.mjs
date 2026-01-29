import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const layoutShellPath = path.join(root, "components", "layout", "LayoutShell.tsx");
const homePagePath = path.join(root, "app", "page.tsx");
const snapshotPath = path.join(
  root,
  "tests",
  "__snapshots__",
  "layout-shell.txt"
);

const layoutShellSource = fs.readFileSync(layoutShellPath, "utf8");
const homePageSource = fs.readFileSync(homePagePath, "utf8");

const normalized = layoutShellSource.trim().replace(/\s+$/gm, "");
const snapshot = `${normalized}\n`;

if (process.env.UPDATE_SNAPSHOT === "1" || !fs.existsSync(snapshotPath)) {
  fs.writeFileSync(snapshotPath, snapshot, "utf8");
} else {
  const existing = fs.readFileSync(snapshotPath, "utf8");
  assert.equal(snapshot, existing, "Layout snapshot mismatch");
}

assert.match(layoutShellSource, /<Header\b/, "Header missing in layout shell");
assert.match(layoutShellSource, /<Sidebar\b/, "Sidebar missing in layout shell");
assert.match(layoutShellSource, /<main\b/, "Main content wrapper missing");

assert.match(homePageSource, /export default function/, "Home page export missing");
assert.ok(!homePageSource.includes("<html"), "Home page should not render <html>");

console.log("Layout tests passed");
