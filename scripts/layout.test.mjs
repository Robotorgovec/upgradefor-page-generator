import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const rootLayoutPath = path.join(root, "app", "layout.tsx");
const homePagePath = path.join(root, "app", "page.tsx");
const dispatchPagePath = path.join(root, "app", "dispatch", "page.tsx");
const snapshotPath = path.join(
  root,
  "tests",
  "__snapshots__",
  "root-layout.txt"
);

const rootLayoutSource = fs.readFileSync(rootLayoutPath, "utf8").replace(/^\uFEFF/, "");
const homePageSource = fs.readFileSync(homePagePath, "utf8");
const dispatchPageSource = fs.readFileSync(dispatchPagePath, "utf8");

const normalized = rootLayoutSource.trim().replace(/\s+$/gm, "");
const snapshot = `${normalized}\n`;

if (process.env.UPDATE_SNAPSHOT === "1" || !fs.existsSync(snapshotPath)) {
  fs.writeFileSync(snapshotPath, snapshot, "utf8");
} else {
  const existing = fs.readFileSync(snapshotPath, "utf8");
  assert.equal(snapshot, existing, "Layout snapshot mismatch");
}

assert.match(rootLayoutSource, /import Header\b/, "Header import missing in root layout");
assert.match(rootLayoutSource, /import Sidebar\b/, "Sidebar import missing in root layout");
assert.match(rootLayoutSource, /import MobileBottomNav\b/, "MobileBottomNav import missing in root layout");
assert.match(rootLayoutSource, /<Header\s*\/>/, "Header missing in root layout");
assert.match(rootLayoutSource, /<Sidebar\s*\/>/, "Sidebar missing in root layout");
assert.match(rootLayoutSource, /<main\s+id="main"\s+className="app-content"/, "Main content wrapper missing");
assert.match(rootLayoutSource, /<MobileBottomNav\s*\/>/, "MobileBottomNav missing in root layout");
assert.match(rootLayoutSource, /\/assets\/layout\.css/, "Global layout stylesheet missing");
assert.match(rootLayoutSource, /\/assets\/load-layout\.js/, "Legacy layout loader script missing");

assert.match(homePageSource, /export default function/, "Home page export missing");
assert.ok(!homePageSource.includes("<html"), "Home page should not render <html>");

assert.match(dispatchPageSource, /DispatchWorkspace/, "Dispatch page must render the R002/R003 workspace");
assert.ok(!dispatchPageSource.includes("Equipment3DViewer"), "Dispatch page should not render standalone 3D viewer");
assert.ok(!dispatchPageSource.includes("DispatchDashboard"), "Dispatch page should not render legacy dashboard");

console.log("Layout tests passed");
