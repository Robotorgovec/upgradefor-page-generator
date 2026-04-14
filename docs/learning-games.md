# Learning games

## Copper-aluminum heat exchangers basics (visible MVP)

- Canonical URL: `/learn/industrial/copper-aluminum-heat-exchangers-basics`
- This route is a visible MVP quiz page with indexable educational HTML and an interactive quiz block.
- Data module: `lib/learning-game/copper-aluminum-heat-exchanger-quiz-data.ts`
- Client quiz component: `components/learning-game/copper-aluminum-heat-exchanger-quiz.tsx`
- Quiz state is internal component state and is **not** encoded in URL query, hash, or path steps.
- Route path is included in runtime sitemap helpers via `lib/learning-game/sitemap.ts`.
