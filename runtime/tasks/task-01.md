Goal:
Улучшить GUI локального AI-агента до удобного ежедневного использования.

Добавить:
- кнопки управления task и log
- устойчивый Run flow
- удобное копирование и очистку
- улучшение UX интерфейса

Current step: 1/1 - Audit and tighten the current Tkinter GUI surface in `tools/upgr_agent_gui.py`: separate task actions from log actions, normalize button behavior around selection vs full-content copy/clear, and remove ambiguous handlers so task/log controls match their labels and daily editing flow. 2. [ ] Refactor the Run/Stop lifecycle into an explicit run-state model around `auto-codex.ps1`: add preflight checks for script/task availability before launch, guard against double-start and stale queue events, and make process startup, stop, completion, and failure transitions update status, controls, and log file ownership consistently. 3. [ ] Add persistent session context for repeated use: store last-used window geometry, last opened log path, and recent run metadata in `runtime/` or `.codex-temp/` so the GUI restores useful state without dirtying tracked files. 4. [ ] Improve log handling for long agent sessions: keep live output responsive with bounded UI updates, expose quick access to the active log file and logs directory, and distinguish clearly between clearing the visible pane and preserving the saved run log on disk. 5. [ ] Strengthen task editor UX around `task.txt`: make autosave status more explicit, show actionable validation for empty/unchanged content before run, and preserve keyboard-first workflows for paste, select-all, run, stop, and focus switching without conflicting shortcuts. 6. [ ] Polish operational feedback and trust signals: surface git cleanliness, current branch, active run status, exit code, and save state in a compact status area so the user can understand whether the repository and agent are in a safe state before and after each run.

Requirements:
- Complete only this step.
- Keep the implementation small and isolated.
- Do not start future steps.
- Stop after this step is complete.
