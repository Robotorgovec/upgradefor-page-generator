import { COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH } from "./copper-aluminum-heat-exchanger-quiz-data";

export const LEARN_CANONICAL_PATHS = [
  COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH,
] as const;

export function getLearningGameSitemapPaths(): string[] {
  return Array.from(new Set(LEARN_CANONICAL_PATHS));
}
