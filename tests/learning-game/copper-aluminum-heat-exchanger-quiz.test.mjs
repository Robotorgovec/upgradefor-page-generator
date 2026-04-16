import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "lib", "learning-game", "copper-aluminum-heat-exchanger-quiz-data.ts");
const sitemapPath = path.join(root, "lib", "learning-game", "sitemap.ts");

const dataSource = fs.readFileSync(dataPath, "utf8");
const sitemapSource = fs.readFileSync(sitemapPath, "utf8");

test("learning-game data and sitemap wiring are sane", () => {
  assert.match(
    dataSource,
    /COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH\s*=\s*"\/wikimarket\/hvac\/copper-aluminum-heat-exchangers"/,
  );

  const questionCount = (dataSource.match(/id:\s*"/g) || []).length;
  assert.equal(questionCount, 10);

  const optionsTupleCount = (dataSource.match(/options:\s*\[/g) || []).length;
  assert.ok(optionsTupleCount >= 10);

  const correctIndexCount = (dataSource.match(/correctIndex:\s*\d+/g) || []).length;
  assert.ok(correctIndexCount >= 10);

  const explanationCount = (dataSource.match(/explanation:\s*/g) || []).length;
  assert.ok(explanationCount >= 10);

  assert.match(sitemapSource, /getLearningGameSitemapPaths\(/);
  assert.match(sitemapSource, /COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH/);

  const disallowedFragments = ["?", "#", "/step/", "/score/", "/challenge/", "/review/", "/session/", "/debug/"];
  const canonicalPath = "/wikimarket/hvac/copper-aluminum-heat-exchangers";
  for (const fragment of disallowedFragments) {
    assert.equal(canonicalPath.includes(fragment), false);
  }
});
