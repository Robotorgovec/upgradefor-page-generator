import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();

function readProjectFile(...segments) {
  return fs.readFileSync(path.join(root, ...segments), "utf8");
}

const appLayoutSource = readProjectFile("app", "layout.tsx");
const homePageSource = readProjectFile("app", "page.tsx");
const headerSource = readProjectFile("components", "layout", "Header.tsx");
const sidebarSource = readProjectFile("components", "layout", "Sidebar.tsx");
const mobileBottomNavSource = readProjectFile("components", "layout", "MobileBottomNav.tsx");

assert.match(appLayoutSource, /import Header from "\.\.\/components\/layout\/Header"/, "Root layout must import Header");
assert.match(appLayoutSource, /import Sidebar from "\.\.\/components\/layout\/Sidebar"/, "Root layout must import Sidebar");
assert.match(
  appLayoutSource,
  /import MobileBottomNav from "\.\.\/components\/layout\/MobileBottomNav"/,
  "Root layout must import MobileBottomNav",
);

assert.match(appLayoutSource, /<html\s+lang="ru"/, "Root layout must define the Russian html shell");
assert.match(appLayoutSource, /<body>/, "Root layout must render body");
assert.match(appLayoutSource, /<a\s+className="skip"\s+href="#main"/, "Skip link missing in root layout");
assert.match(appLayoutSource, /<Header\s*\/>/, "Header missing in root layout");
assert.match(appLayoutSource, /<Sidebar\s*\/>/, "Sidebar missing in root layout");
assert.match(appLayoutSource, /<main\s+id="main"\s+className="app-content"/, "Main content wrapper missing");
assert.match(appLayoutSource, /<MobileBottomNav\s*\/>/, "Mobile bottom nav missing in root layout");
assert.match(appLayoutSource, /\/assets\/layout\.css/, "Layout stylesheet missing");
assert.match(appLayoutSource, /\/assets\/load-layout\.js/, "Layout hydration script missing");

assert.match(headerSource, /<header\s+className="site-header"/, "Header component must render site header");
assert.match(headerSource, /data-site-header="true"/, "Header component must expose data-site-header marker");
assert.match(sidebarSource, /<aside\s+className="sidebar"/, "Sidebar component must render sidebar aside");
assert.match(
  mobileBottomNavSource,
  /<nav\s+className="mobile-bottom-nav"/,
  "MobileBottomNav component must render mobile nav",
);

assert.match(homePageSource, /export default function/, "Home page export missing");
assert.ok(!homePageSource.includes("<html"), "Home page should not render <html>");
assert.ok(!homePageSource.includes("<body"), "Home page should not render <body>");

console.log("Layout tests passed");
