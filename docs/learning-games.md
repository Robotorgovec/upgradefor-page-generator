# Learning games

## Copper-aluminum heat exchangers quiz (runtime stabilized)

- Live source-of-truth URL: `/wikimarket/hvac/copper-aluminum-heat-exchangers`
- Quiz is visible on the live Cu-Al page in `#quiz-section`.
- Data module: `lib/learning-game/copper-aluminum-heat-exchanger-quiz-data.ts`
- Client quiz component: `components/learning-game/copper-aluminum-heat-exchanger-quiz.tsx`
- Quiz state is internal component state and is **not** encoded in URL query/hash/path steps.
- Runtime sitemap source-of-truth is `app/sitemap.ts` with learning-game paths from `lib/learning-game/sitemap.ts`.
- `/learn/industrial/copper-aluminum-heat-exchangers-basics` is not exposed as a canonical runtime learning-game URL in sitemap.
