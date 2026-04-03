# UPGR Accepted Production Baseline

## Baseline Identity

- Baseline date: 2026-04-03
- Accepted production deployment id: 9neq7QhjbgvThCjBUnRYLNKzHTB6
- Accepted production commit: 4a2e07b
- Accepted production URL: https://upgradefor.com
- note: below this baseline we do not roll back without explicit manual decision
- Baseline is NOT updated automatically by date/time.

## Route Classification Rule

- Any route that returns HTTP 200 on the accepted production baseline belongs in accepted routes.
- Excluded or not-ready routes may include only non-200 routes, absent routes, or unresolved dynamic patterns.
- Do not exclude a route without proof of non-200 status, absence, or unresolved dynamic pattern.

## Accepted Routes

The following routes returned HTTP 200 on the accepted production baseline:

<!-- ACCEPTED_ROUTES_START -->
- /
- /app
- /account/forgot
- /account/login
- /account/register
- /account/reset
- /account/verify
- /heat-exchangers
- /legal/privacy
- /legal/refunds
- /legal/terms
- /wikimarket/beauty/bridal-makeup
- /wikimarket/beauty/wedding-hairstyles
- /wikimarket/domains/fio-rus
- /wikimarket/hvac/copper-aluminum-heat-exchangers
- /wikimarket/hvac/copper-aluminum-heat-exchangers/manufacturers
- /wikimarket/hvac/heat-exchanger-repair
- /wikimarket/hvac/heat-exchangers
<!-- ACCEPTED_ROUTES_END -->

## Excluded Or Not-Ready Routes

Only non-200 routes, absent routes, or unresolved dynamic patterns belong here:

<!-- EXCLUDED_ROUTES_START -->
- /account [HTTP 307 -> /account/login?next=/account]
- /account/profile/setup [HTTP 307 -> /account/login?next=/account/profile/setup]
- /account/welcome [HTTP 307 -> /account/login?next=/account/welcome]
- /fio/[token] [unresolved dynamic pattern]
- /wikimarket/beauty/wedding-hairstyles/[slug] [unresolved dynamic pattern]
<!-- EXCLUDED_ROUTES_END -->

- Absent routes discovered in the accepted production baseline scan: none

## Baseline Update Protocol

baseline updated only after:

1. preview accepted manually
2. production promoted / accepted
3. baseline file updated
