import { COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH } from "./copper-aluminum-heat-exchanger-quiz-data";

const LEGACY_LEARNING_GAME_PATHS = [
  "/learn/industrial/copper-aluminum-heat-exchangers-basics",
] as const;

export const LEARN_CANONICAL_PATHS = [
  ...LEGACY_LEARNING_GAME_PATHS,
  COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH,
] as const;

export function getLearningGameSitemapPaths(): string[] {
  return Array.from(new Set(LEARN_CANONICAL_PATHS));
}
