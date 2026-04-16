import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const layoutPath = path.join(root, "app", "layout.tsx");
const homePagePath = path.join(root, "app", "page.tsx");

const layoutSource = fs.readFileSync(layoutPath, "utf8");
const homePageSource = fs.readFileSync(homePagePath, "utf8");

assert.match(layoutSource, /<Header\b/, "Header missing in app layout");
assert.match(layoutSource, /<Sidebar\b/, "Sidebar missing in app layout");
assert.match(layoutSource, /<main\b/, "Main content wrapper missing in app layout");
assert.match(layoutSource, /<meta name=\"viewport\"/, "Viewport meta missing in app layout");

assert.match(homePageSource, /export default function/, "Home page export missing");
assert.ok(!homePageSource.includes("<html"), "Home page should not render <html>");

console.log("Layout tests passed");
