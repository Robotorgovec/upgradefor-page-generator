import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const rootLayoutPath = path.join(root, "app", "layout.tsx");
const appShellPath = path.join(root, "components", "layout", "AppShell.tsx");
const homePagePath = path.join(root, "app", "page.tsx");
const snapshotPath = path.join(
  root,
  "tests",
  "__snapshots__",
  "root-layout.txt"
);

const rootLayoutSource = fs.readFileSync(rootLayoutPath, "utf8").replace(/^\uFEFF/, "");
const appShellSource = fs.readFileSync(appShellPath, "utf8");
const homePageSource = fs.readFileSync(homePagePath, "utf8");

const normalized = rootLayoutSource.trim().replace(/\s+$/gm, "");
const snapshot = `${normalized}\n`;

if (process.env.UPDATE_SNAPSHOT === "1" || !fs.existsSync(snapshotPath)) {
  fs.writeFileSync(snapshotPath, snapshot, "utf8");
} else {
  const existing = fs.readFileSync(snapshotPath, "utf8");
  assert.equal(snapshot, existing, "Layout snapshot mismatch");
}

assert.match(rootLayoutSource, /import AppShell\b/, "AppShell import missing in root layout");
assert.match(rootLayoutSource, /headerHtml/, "Header HTML loader missing in root layout");
assert.match(rootLayoutSource, /sidebarHtml/, "Sidebar HTML loader missing in root layout");
assert.match(rootLayoutSource, /<AppShell\s+headerHtml=\{headerHtml\}\s+sidebarHtml=\{sidebarHtml\}/, "AppShell wrapper missing");
assert.match(rootLayoutSource, /\/assets\/layout\.css/, "Global layout stylesheet missing");
assert.match(appShellSource, /AUTH_SHELL_ROUTES/, "Auth route shell list missing");
assert.match(appShellSource, /auth-app-content/, "Auth route content wrapper missing");
assert.match(appShellSource, /<header\b/, "Header missing in app shell");
assert.match(appShellSource, /<aside\b/, "Sidebar missing in app shell");
assert.match(appShellSource, /mobile-bottom-nav/, "Mobile bottom nav missing in app shell");

assert.match(homePageSource, /export default function/, "Home page export missing");
assert.ok(!homePageSource.includes("<html"), "Home page should not render <html>");

console.log("Layout tests passed");
