# Wedding Hairstyles Top 100 Approved Asset Contract

Approved production PNG files live in:

- `public/assets/media/wikimarket/beauty/wedding-hairstyles/top-100/`

Canonical slugs remain the source of truth for:

- detail routes
- internal links
- masters filter keys
- taxonomy and SEO bindings

Approved filenames are connected through a dedicated asset mapping layer in code.

Rules:

- do not rename canonical slug routes to match asset filenames
- do not replace the mapping layer with filename-derived routes
- keep one approved image connected to each canonical record
- keep approved `-closeup` variants in the mapped Top 100 set when they are part of the provided asset pack
- dropping updated PNGs into this folder later should not require a route or filter refactor

Examples:

- canonical slug: `smooth-low-bun-wedding-hairstyle`
- mapped asset filename: `smooth-low-bun-wedding-hairstyle.png`

- canonical slug: `pearl-low-bun-wedding-hairstyle`
- mapped asset filename: `shell-bun-wedding-hairstyle-closeup.png`
