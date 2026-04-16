import test from "node:test";
import assert from "node:assert/strict";

import {
  COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH,
  COPPER_ALUMINUM_HEAT_EXCHANGER_QUESTIONS,
} from "../../lib/learning-game/copper-aluminum-heat-exchanger-quiz-data";
import { getLearningGameSitemapPaths } from "../../lib/learning-game/sitemap";

test("copper-aluminum quiz data is consistent and sitemap-safe", () => {
  assert.equal(
    COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH,
    "/wikimarket/hvac/copper-aluminum-heat-exchangers",
  );

  assert.equal(COPPER_ALUMINUM_HEAT_EXCHANGER_QUESTIONS.length, 10);

  for (const question of COPPER_ALUMINUM_HEAT_EXCHANGER_QUESTIONS) {
    assert.equal(question.options.length, 4);
    assert.ok(question.correctIndex >= 0);
    assert.ok(question.correctIndex < question.options.length);
    assert.ok(question.explanation.trim().length > 0);
  }

  const paths = getLearningGameSitemapPaths();
  assert.ok(paths.includes(COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH));

  const disallowedFragments = [
    "?",
    "#",
    "/step/",
    "/score/",
    "/challenge/",
    "/review/",
    "/session/",
    "/debug/",
  ];

  for (const fragment of disallowedFragments) {
    assert.equal(COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH.includes(fragment), false);
  }
});
