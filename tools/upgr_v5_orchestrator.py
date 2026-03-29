from __future__ import annotations

import json
import re
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PLAN_STATUS_PENDING = "pending"
PLAN_STATUS_IN_PROGRESS = "in_progress"
PLAN_STATUS_COMPLETED = "completed"
PLAN_STATUS_FAILED = "failed"

STEP_STATUS_PENDING = "pending"
STEP_STATUS_IN_PROGRESS = "in_progress"
STEP_STATUS_COMPLETED = "completed"
STEP_STATUS_FAILED = "failed"


@dataclass
class Step:
    id: str
    title: str
    task_file: Path


class OrchestratorError(RuntimeError):
    pass


class UpgrV5Orchestrator:
    def __init__(self, repo_root: Path) -> None:
        self.repo_root = repo_root
        self.runtime_dir = repo_root / "runtime"
        self.tasks_dir = self.runtime_dir / "tasks"
        self.reports_dir = self.runtime_dir / "reports"
        self.goal_file = self.runtime_dir / "goal.txt"
        self.plan_file = self.runtime_dir / "plan.md"
        self.state_file = self.runtime_dir / "state.json"
        self.final_report_file = self.reports_dir / "final-report.md"
        self.task_txt_file = repo_root / "task.txt"
        self.auto_codex_script = repo_root / "auto-codex.ps1"

    def run(self) -> int:
        self.ensure_runtime_layout()
        self.ensure_repo_clean()

        goal = self.read_goal()
        steps = self.load_or_create_plan(goal)
        self.create_task_files(goal, steps)
        state = self.load_or_initialize_state(goal, steps)

        next_index = self.find_next_step_index(state)
        if next_index is None:
            state["plan_status"] = PLAN_STATUS_COMPLETED
            state["current_step"] = None
            self.write_state(state)
            self.write_final_report(goal, state)
            self.commit_if_needed("orchestrator: finalize completed plan")
            self.print_run_instructions()
            return 0

        while next_index is not None:
            step = steps[next_index]
            self.mark_step_in_progress(state, next_index)
            self.write_state(state)

            task_body = step.task_file.read_text(encoding="utf-8")
            self.task_txt_file.write_text(task_body, encoding="utf-8")
            self.commit_if_needed(f"orchestrator: prepare {step.id}")

            result = self.run_auto_codex()
            if result.returncode != 0:
                self.mark_step_failed(state, next_index, result.returncode, result.stdout)
                self.write_state(state)
                self.write_failure_report(goal, state, step, result)
                return result.returncode

            self.mark_step_completed(state, next_index)
            self.write_state(state)

            next_index = self.find_next_step_index(state)
            if next_index is None:
                state["plan_status"] = PLAN_STATUS_COMPLETED
                state["current_step"] = None
                self.write_state(state)
                self.write_final_report(goal, state)
                self.commit_if_needed("orchestrator: finalize completed plan")
                self.print_run_instructions()
                return 0

            self.commit_if_needed(f"orchestrator: record completion of {step.id}")

        return 0

    def ensure_runtime_layout(self) -> None:
        self.tasks_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        if not self.goal_file.exists():
            self.goal_file.write_text(
                "Describe the multi-step goal for the orchestrator here.\n",
                encoding="utf-8",
            )
        if not self.state_file.exists():
            self.state_file.write_text("{}\n", encoding="utf-8")

    def ensure_repo_clean(self) -> None:
        result = self.run_command(["git", "status", "--porcelain"], check=False)
        if result.returncode != 0:
            raise OrchestratorError("git status failed; repository health could not be verified.")
        if result.stdout.strip():
            raise OrchestratorError(
                "Repository must be clean before running the orchestrator because auto-codex.ps1 enforces it."
            )

    def read_goal(self) -> str:
        goal = self.goal_file.read_text(encoding="utf-8").strip()
        if not goal:
            raise OrchestratorError(f"Goal file is empty: {self.goal_file}")
        if goal == "Describe the multi-step goal for the orchestrator here.":
            raise OrchestratorError(f"Goal file still contains the placeholder text: {self.goal_file}")
        return goal

    def load_or_create_plan(self, goal: str) -> list[Step]:
        if self.plan_file.exists() and self.plan_file.read_text(encoding="utf-8").strip():
            titles = self.parse_plan_titles(self.plan_file.read_text(encoding="utf-8"))
        else:
            titles = self.generate_plan_titles(goal)
            self.write_plan(titles)

        steps: list[Step] = []
        for index, title in enumerate(titles, start=1):
            step_id = f"step-{index:02d}"
            task_file = self.tasks_dir / f"task-{index:02d}.md"
            steps.append(Step(id=step_id, title=title, task_file=task_file))
        return steps

    def generate_plan_titles(self, goal: str) -> list[str]:
        extracted = self.extract_goal_items(goal)
        if len(extracted) >= 2:
            titles = extracted[:8]
        else:
            single_goal = self.compact_whitespace(goal)
            titles = [
                f"Inspect the current implementation and isolate the files needed for: {single_goal}",
                f"Implement the smallest functional backend change for: {single_goal}",
                f"Verify the result and update only required runtime artifacts for: {single_goal}",
            ]
        return [self.ensure_terminal_period(title) for title in titles]

    def extract_goal_items(self, goal: str) -> list[str]:
        items: list[str] = []
        for raw_line in goal.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            line = re.sub(r"^[-*]\s+", "", line)
            line = re.sub(r"^\d+[.)]\s+", "", line)
            if len(line) < 8:
                continue
            items.append(self.compact_whitespace(line))
        if len(items) >= 2:
            return items

        sentences = re.split(r"(?<=[.!?])\s+", self.compact_whitespace(goal))
        items = [sentence.strip() for sentence in sentences if len(sentence.strip()) >= 8]
        return items

    def write_plan(self, titles: list[str]) -> None:
        lines = ["# Plan", ""]
        for index, title in enumerate(titles, start=1):
            lines.append(f"{index}. [ ] {title}")
        lines.append("")
        self.plan_file.write_text("\n".join(lines), encoding="utf-8")

    def parse_plan_titles(self, content: str) -> list[str]:
        titles: list[str] = []
        for raw_line in content.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            match = re.match(r"^(?:[-*]|\d+[.)])\s+(?:\[[ xX]\]\s+)?(.+)$", line)
            if match:
                titles.append(self.ensure_terminal_period(self.compact_whitespace(match.group(1))))
        if not titles:
            raise OrchestratorError(f"Could not parse any plan steps from {self.plan_file}")
        return titles

    def create_task_files(self, goal: str, steps: list[Step]) -> None:
        for index, step in enumerate(steps, start=1):
            content = self.render_step_task(goal, step, index, len(steps))
            step.task_file.write_text(content, encoding="utf-8")

    def render_step_task(self, goal: str, step: Step, index: int, total_steps: int) -> str:
        return (
            f"Goal:\n{goal.strip()}\n\n"
            f"Current step: {index}/{total_steps} - {step.title}\n\n"
            "Requirements:\n"
            "- Complete only this step.\n"
            "- Keep the implementation small and isolated.\n"
            "- Do not start future steps.\n"
            "- Stop after this step is complete.\n"
        )

    def load_or_initialize_state(self, goal: str, steps: list[Step]) -> dict[str, Any]:
        raw = self.state_file.read_text(encoding="utf-8").strip()
        state: dict[str, Any]
        if raw:
            try:
                state = json.loads(raw)
            except json.JSONDecodeError:
                state = {}
        else:
            state = {}

        step_states = state.get("steps")
        if not isinstance(step_states, list) or len(step_states) != len(steps):
            step_states = [
                {
                    "id": step.id,
                    "title": step.title,
                    "task_file": self.to_repo_relative(step.task_file),
                    "status": STEP_STATUS_PENDING,
                    "started_at": None,
                    "completed_at": None,
                    "last_exit_code": None,
                }
                for step in steps
            ]

        state = {
            "goal": goal,
            "plan_status": state.get("plan_status", PLAN_STATUS_PENDING),
            "current_step": state.get("current_step"),
            "updated_at": self.now_iso(),
            "steps": step_states,
        }
        self.write_state(state)
        return state

    def write_state(self, state: dict[str, Any]) -> None:
        state["updated_at"] = self.now_iso()
        self.state_file.write_text(json.dumps(state, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")

    def find_next_step_index(self, state: dict[str, Any]) -> int | None:
        for index, step in enumerate(state["steps"]):
            if step["status"] != STEP_STATUS_COMPLETED:
                return index
        return None

    def mark_step_in_progress(self, state: dict[str, Any], index: int) -> None:
        state["plan_status"] = PLAN_STATUS_IN_PROGRESS
        state["current_step"] = index + 1
        for step_index, step_state in enumerate(state["steps"]):
            if step_index == index:
                step_state["status"] = STEP_STATUS_IN_PROGRESS
                step_state["started_at"] = step_state.get("started_at") or self.now_iso()
                step_state["last_exit_code"] = None
            elif step_state["status"] == STEP_STATUS_IN_PROGRESS:
                step_state["status"] = STEP_STATUS_PENDING

    def mark_step_completed(self, state: dict[str, Any], index: int) -> None:
        step_state = state["steps"][index]
        step_state["status"] = STEP_STATUS_COMPLETED
        step_state["completed_at"] = self.now_iso()
        step_state["last_exit_code"] = 0

    def mark_step_failed(
        self,
        state: dict[str, Any],
        index: int,
        exit_code: int,
        output: str,
    ) -> None:
        state["plan_status"] = PLAN_STATUS_FAILED
        state["current_step"] = index + 1
        step_state = state["steps"][index]
        step_state["status"] = STEP_STATUS_FAILED
        step_state["last_exit_code"] = exit_code
        step_state["failure_excerpt"] = self.trim_output(output)

    def run_auto_codex(self) -> subprocess.CompletedProcess[str]:
        return self.run_command(
            [
                "powershell",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(self.auto_codex_script),
            ],
            check=False,
        )

    def write_final_report(self, goal: str, state: dict[str, Any]) -> None:
        lines = [
            "# Final Report",
            "",
            f"Status: {state['plan_status']}",
            "",
            "## Goal",
            "",
            goal.strip(),
            "",
            "## Steps",
            "",
        ]
        for index, step in enumerate(state["steps"], start=1):
            lines.append(f"{index}. {step['title']} [{step['status']}]")
        lines.extend(
            [
                "",
                "## Run Guide",
                "",
                f"- Set the goal in `{self.to_repo_relative(self.goal_file)}`.",
                f"- Run `python {self.to_repo_relative(self.repo_root / 'tools' / 'upgr_v5_orchestrator.py')}` from the repo root.",
                f"- Check progress in `{self.to_repo_relative(self.state_file)}`.",
                f"- Read the final report in `{self.to_repo_relative(self.final_report_file)}`.",
                "",
            ]
        )
        self.final_report_file.write_text("\n".join(lines), encoding="utf-8")

    def write_failure_report(
        self,
        goal: str,
        state: dict[str, Any],
        step: Step,
        result: subprocess.CompletedProcess[str],
    ) -> None:
        lines = [
            "# Final Report",
            "",
            "Status: failed",
            "",
            "## Goal",
            "",
            goal.strip(),
            "",
            "## Failed Step",
            "",
            f"- Step: {step.id}",
            f"- Title: {step.title}",
            f"- Exit code: {result.returncode}",
            "",
            "## Output Excerpt",
            "",
            self.trim_output(result.stdout),
            "",
        ]
        self.final_report_file.write_text("\n".join(lines), encoding="utf-8")

    def print_run_instructions(self) -> None:
        print("Run guide:")
        print(f"1. Set the goal in {self.to_repo_relative(self.goal_file)}")
        print("2. Run: python tools/upgr_v5_orchestrator.py")
        print(f"3. Watch state in {self.to_repo_relative(self.state_file)}")
        print(f"4. Read report in {self.to_repo_relative(self.final_report_file)}")

    def commit_if_needed(self, message: str) -> None:
        status = self.run_command(["git", "status", "--porcelain"], check=False)
        if status.returncode != 0:
            raise OrchestratorError("git status failed before commit.")
        if not status.stdout.strip():
            return
        self.run_command(["git", "add", "task.txt", "runtime"], check=True)
        self.run_command(["git", "commit", "-m", message], check=True)

    def run_command(self, args: list[str], check: bool) -> subprocess.CompletedProcess[str]:
        result = subprocess.run(
            args,
            cwd=self.repo_root,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        if check and result.returncode != 0:
            command_text = " ".join(args)
            raise OrchestratorError(
                f"Command failed ({result.returncode}): {command_text}\n{self.trim_output(result.stdout + result.stderr)}"
            )
        return result

    def to_repo_relative(self, path: Path) -> str:
        return path.relative_to(self.repo_root).as_posix()

    def now_iso(self) -> str:
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    def compact_whitespace(self, value: str) -> str:
        return re.sub(r"\s+", " ", value).strip()

    def ensure_terminal_period(self, value: str) -> str:
        return value if value.endswith((".", "!", "?")) else f"{value}."

    def trim_output(self, value: str, limit: int = 4000) -> str:
        text = value.strip()
        if not text:
            return "(no output)"
        return text[:limit]


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    orchestrator = UpgrV5Orchestrator(repo_root)
    try:
        return orchestrator.run()
    except OrchestratorError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
