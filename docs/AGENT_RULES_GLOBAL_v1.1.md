# AGENT_RULES_GLOBAL v1.1

This document describes the global rules for all UpgradeFor AI agents. These rules apply to all tasks and interactions.

## Waiting and logging

- Agents must wait at least 1.1 seconds after loading before beginning interactions.
- All actions should be logged to ensure transparency and traceability. Logs should include timestamps, user commands, and the resulting actions.

## Authentication and sessions

- Agents should log in using provided credentials when required, and store session cookies securely.
- Credentials must never be exposed in logs or output.
- Agents should maintain persistent sessions to minimize repeated logins.

## DOM and interaction

- Agents must only interact with DOM elements when explicitly instructed by the user or required to complete a task.
- Use caution when performing actions that could cause external side effects (e.g., sending messages, purchasing) and always request user confirmation.

## Safety and compliance

- Agents must comply with all policies and legal requirements, including data protection and privacy.
- Always follow instructions from the user, but never perform harmful or illegal activities.

## Global weekday theme system

- The entire site always uses the global weekday accent theme system for accent UI layers.
- All new pages, sections, and modern shared UI must read accent colors from the global theme token layer, not from page-local hardcoded accent hex values.
- Stable neutral tokens must control base typography and shell readability: body text, headings, menu labels, sidebar labels, and neutral layout surfaces stay on neutral tokens.
- Menu and sidebar labels must always remain neutral and readable; only icons, active indicators, and subtle active backgrounds may use the weekday accent.
- Dynamic weekday tokens must control accent UI only: primary buttons, CTA blocks, chips, badges, selected states, focus rings, subtle section tints, accent borders, sticky CTA surfaces, link accents where appropriate, and menu/sidebar icons.
- Menu and sidebar icons use the weekday accent by default, then shift to neutral near-black on hover and on active/current states.
- Logo accent must follow the current weekday accent color, while the neutral logo text and base shell text remain neutral and readable.
- Active menu items must stay lightweight: use only a subtle tinted background and a standard border; do not add a thick left stripe, heavy accent outline, or heavy inset shadow.
- New theme-aware pages must use the global `--theme-*` token layer instead of introducing local accent color systems.
- Local accent hardcodes are not allowed for new pages unless the color is a documented stable neutral token.
- Thursday must use the current logo blue hue as its base accent; the stable brand source is the logo blue used by the site identity.
- Agents and Codex must not change site visuals, layout, content, spacing, icons, navigation behavior, or interaction patterns unless the user explicitly asked for those changes.
- Weekday mapping is fixed and applies site-wide:
  - Sunday = red
  - Monday = orange
  - Tuesday = yellow
  - Wednesday = green
  - Thursday = current logo blue
  - Friday = blue / indigo
  - Saturday = purple

---

Version 1.1 - this version clarifies waiting requirements, logging practices, session handling, and the mandatory global weekday theme system.
