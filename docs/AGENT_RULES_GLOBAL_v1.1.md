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

---

Version 1.1 — this version clarifies waiting requirements, logging practices, and session handling.
