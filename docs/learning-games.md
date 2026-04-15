# Learning games

## Copper-aluminum heat exchangers quiz on live Cu-Al page

- Acceptance URL: `/wikimarket/hvac/copper-aluminum-heat-exchangers`
- The quiz is now visible directly on the live Cu-Al page as an additional section (`#quiz-section`).
- Source-of-truth route file: `app/wikimarket/hvac/copper-aluminum-heat-exchangers/page.tsx`
- Data module: `lib/learning-game/copper-aluminum-heat-exchanger-quiz-data.ts`
- Client quiz component: `components/learning-game/copper-aluminum-heat-exchanger-quiz.tsx`
- Quiz state is internal component state and is **not** encoded in URL query/hash/path steps.
- Runtime sitemap helper keeps legacy and canonical paths; it is not reduced to a one-path implementation.
