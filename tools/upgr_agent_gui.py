from __future__ import annotations

import os
import queue
import subprocess
import threading
from datetime import datetime
from pathlib import Path
import tkinter as tk
from tkinter import messagebox, ttk


class UpgrAgentGui:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.repo_root = Path(__file__).resolve().parent.parent
        self.task_file = self.repo_root / "task.txt"
        self.script_file = self.repo_root / "auto-codex.ps1"
        # Keep runtime logs in a gitignored location so GUI launches do not dirty the repo
        # before auto-codex.ps1 performs its clean-worktree pre-check.
        self.logs_dir = self.repo_root / ".codex-temp" / "agent-logs"
        self.logs_dir.mkdir(parents=True, exist_ok=True)

        self.process: subprocess.Popen[str] | None = None
        self.process_thread: threading.Thread | None = None
        self.output_queue: queue.Queue[tuple[str, str | None]] = queue.Queue()
        self.log_handle = None
        self.current_log_path: Path | None = None
        self.pending_save = None
        self.git_refresh_job = None
        self.last_saved_text = ""
        self.status_message = tk.StringVar(value="Idle")
        self.git_message = tk.StringVar(value="Checking git status...")
        self.task_status_message = tk.StringVar(value="")

        self.root.title("UPGR Codex Agent")
        self.root.geometry("980x720")
        self.root.minsize(860, 620)

        self._build_ui()
        self._load_task_file()
        self._refresh_git_status()
        self._poll_output_queue()
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    def _build_ui(self) -> None:
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(1, weight=1)

        header = ttk.Frame(self.root, padding=12)
        header.grid(row=0, column=0, sticky="ew")
        header.columnconfigure(1, weight=1)

        ttk.Label(header, text="Task").grid(row=0, column=0, sticky="w")
        self.status_label = ttk.Label(header, textvariable=self.status_message)
        self.status_label.grid(row=0, column=1, sticky="e")

        body = ttk.Panedwindow(self.root, orient=tk.VERTICAL)
        body.grid(row=1, column=0, sticky="nsew", padx=12, pady=(0, 12))

        top_frame = ttk.Frame(body, padding=0)
        top_frame.columnconfigure(0, weight=1)
        top_frame.rowconfigure(1, weight=1)
        body.add(top_frame, weight=3)

        task_info = ttk.Frame(top_frame)
        task_info.grid(row=0, column=0, sticky="ew", pady=(0, 6))
        task_info.columnconfigure(0, weight=1)
        ttk.Label(task_info, text="Edit task.txt").grid(row=0, column=0, sticky="w")
        self.task_status_label = ttk.Label(task_info, textvariable=self.task_status_message)
        self.task_status_label.grid(row=0, column=1, sticky="e")

        task_frame = ttk.Frame(top_frame)
        task_frame.grid(row=1, column=0, sticky="nsew")
        task_frame.columnconfigure(0, weight=1)
        task_frame.rowconfigure(0, weight=1)

        self.task_text = tk.Text(task_frame, wrap="word", undo=True)
        task_scroll = ttk.Scrollbar(task_frame, orient="vertical", command=self.task_text.yview)
        self.task_text.configure(yscrollcommand=task_scroll.set)
        self.task_text.grid(row=0, column=0, sticky="nsew")
        task_scroll.grid(row=0, column=1, sticky="ns")
        self.task_text.bind("<<Modified>>", self._on_task_modified)

        controls = ttk.Frame(top_frame)
        controls.grid(row=2, column=0, sticky="ew", pady=(8, 0))
        for index in range(6):
            controls.columnconfigure(index, weight=1 if index == 5 else 0)

        self.run_button = ttk.Button(controls, text="Run", command=self._run_agent)
        self.run_button.grid(row=0, column=0, padx=(0, 6))
        self.stop_button = ttk.Button(controls, text="Stop", command=self._stop_agent, state="disabled")
        self.stop_button.grid(row=0, column=1, padx=(0, 6))
        ttk.Button(controls, text="Refresh Git", command=self._refresh_git_status).grid(row=0, column=2, padx=(0, 6))
        ttk.Button(controls, text="Open Logs", command=self._open_logs).grid(row=0, column=3, padx=(0, 6))
        ttk.Button(controls, text="Open Project", command=self._open_project).grid(row=0, column=4)

        git_frame = ttk.Frame(top_frame)
        git_frame.grid(row=3, column=0, sticky="ew", pady=(8, 0))
        git_frame.columnconfigure(0, weight=1)
        self.git_label = ttk.Label(git_frame, textvariable=self.git_message)
        self.git_label.grid(row=0, column=0, sticky="w")

        bottom_frame = ttk.Frame(body, padding=0)
        bottom_frame.columnconfigure(0, weight=1)
        bottom_frame.rowconfigure(1, weight=1)
        body.add(bottom_frame, weight=2)

        ttk.Label(bottom_frame, text="Live output").grid(row=0, column=0, sticky="w", pady=(0, 6))
        log_frame = ttk.Frame(bottom_frame)
        log_frame.grid(row=1, column=0, sticky="nsew")
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)

        self.log_text = tk.Text(log_frame, wrap="word", state="disabled")
        log_scroll = ttk.Scrollbar(log_frame, orient="vertical", command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=log_scroll.set)
        self.log_text.grid(row=0, column=0, sticky="nsew")
        log_scroll.grid(row=0, column=1, sticky="ns")

    def _load_task_file(self) -> None:
        if self.task_file.exists():
            content = self.task_file.read_text(encoding="utf-8")
        else:
            content = ""
            self.task_file.write_text("", encoding="utf-8")
        self.task_text.delete("1.0", tk.END)
        self.task_text.insert("1.0", content)
        self.task_text.edit_modified(False)
        self.last_saved_text = content
        self._set_task_status("task.txt loaded", "#2d6a4f")

    def _on_task_modified(self, _event: tk.Event[tk.Misc]) -> None:
        if not self.task_text.edit_modified():
            return
        self.task_text.edit_modified(False)
        self._set_task_status("Unsaved changes", "#9a6700")
        if self.pending_save is not None:
            self.root.after_cancel(self.pending_save)
        self.pending_save = self.root.after(500, self._save_task_file)

    def _save_task_file(self) -> bool:
        self.pending_save = None
        content = self.task_text.get("1.0", "end-1c")
        if content == self.last_saved_text:
            self._set_task_status("task.txt saved", "#2d6a4f")
            return True
        try:
            self.task_file.write_text(content, encoding="utf-8")
        except OSError as exc:
            self._set_task_status(f"Save failed: {exc}", "#b42318")
            return False
        self.last_saved_text = content
        self._set_task_status(f"Saved {datetime.now().strftime('%H:%M:%S')}", "#2d6a4f")
        return True

    def _run_agent(self) -> None:
        if self.process is not None:
            return
        if not self.script_file.exists():
            messagebox.showerror("Missing script", f"Cannot find {self.script_file.name}")
            return
        if not self._save_task_file():
            messagebox.showerror("Save failed", "task.txt could not be saved.")
            return

        timestamp = datetime.now().strftime("%y%m%d-%H%M%S")
        self.current_log_path = self.logs_dir / f"run-{timestamp}.log"
        self.log_handle = self.current_log_path.open("w", encoding="utf-8")
        self._clear_logs()
        self._append_log(f">>> Starting {self.script_file.name}\n")
        if not self._prepare_gui_commit():
            self._append_log(">>> GUI task commit failed. Run aborted.\n")
            self._close_log_handle()
            self._refresh_git_status()
            return
        self._set_running_state(True)

        script_path = str(self.script_file).replace("'", "''")
        command = [
            "powershell",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            (
                "$ErrorActionPreference = 'Stop'\n"
                f"& '{script_path}'\n"
                "exit $LASTEXITCODE\n"
            ),
        ]
        try:
            self.process = subprocess.Popen(
                command,
                cwd=self.repo_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
        except OSError as exc:
            self._append_log(f"Failed to start process: {exc}\n")
            self._close_log_handle()
            self._set_running_state(False)
            return

        self.process_thread = threading.Thread(target=self._read_process_output, daemon=True)
        self.process_thread.start()

    def _prepare_gui_commit(self) -> bool:
        self._append_log(">>> Preparing GUI task commit...\n")
        try:
            add_result = subprocess.run(
                ["git", "add", "."],
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=False,
            )
        except OSError as exc:
            messagebox.showerror("Git failed", f"git add failed:\n{exc}")
            self._append_log(f"git add failed: {exc}\n")
            return False

        if add_result.stdout:
            self._append_log(add_result.stdout)
        if add_result.stderr:
            self._append_log(add_result.stderr)
        if add_result.returncode != 0:
            messagebox.showerror("Git failed", "git add . failed. See log for details.")
            return False

        try:
            status_result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=False,
            )
        except OSError as exc:
            messagebox.showerror("Git failed", f"git status failed:\n{exc}")
            self._append_log(f"git status failed: {exc}\n")
            return False

        if status_result.returncode != 0:
            if status_result.stdout:
                self._append_log(status_result.stdout)
            if status_result.stderr:
                self._append_log(status_result.stderr)
            messagebox.showerror("Git failed", "git status failed. See log for details.")
            return False

        if not status_result.stdout.strip():
            self._append_log(">>> No changes to commit.\n")
            return True

        try:
            commit_result = subprocess.run(
                ["git", "commit", "-m", "task: from GUI"],
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=False,
            )
        except OSError as exc:
            messagebox.showerror("Git failed", f"git commit failed:\n{exc}")
            self._append_log(f"git commit failed: {exc}\n")
            return False

        if commit_result.stdout:
            self._append_log(commit_result.stdout)
        if commit_result.stderr:
            self._append_log(commit_result.stderr)
        if commit_result.returncode != 0:
            messagebox.showerror("Git failed", "git commit failed. See log for details.")
            return False

        return True

    def _read_process_output(self) -> None:
        assert self.process is not None
        if self.process.stdout is not None:
            for line in self.process.stdout:
                self.output_queue.put(("line", line))
        return_code = self.process.wait()
        self.output_queue.put(("done", str(return_code)))

    def _stop_agent(self) -> None:
        if self.process is None:
            return
        self._append_log(">>> Stopping process tree...\n")
        pid = self.process.pid
        try:
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/T", "/F"],
                cwd=self.repo_root,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
        except OSError as exc:
            self._append_log(f"Stop failed: {exc}\n")

    def _poll_output_queue(self) -> None:
        try:
            while True:
                event, payload = self.output_queue.get_nowait()
                if event == "line":
                    self._append_log(payload or "")
                elif event == "done":
                    return_code = int(payload or "0")
                    self._append_log(f"\n>>> Process exited with code {return_code}\n")
                    self.process = None
                    self.process_thread = None
                    self._close_log_handle()
                    self._set_running_state(False)
                    self._refresh_git_status()
        except queue.Empty:
            pass
        self.root.after(120, self._poll_output_queue)

    def _refresh_git_status(self) -> None:
        branch_text = "git unavailable"
        branch_color = "#b42318"
        try:
            branch = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=False,
            )
            status = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=False,
            )
            branch_name = branch.stdout.strip() or "(detached)"
            dirty = bool(status.stdout.strip())
            state = "dirty" if dirty else "clean"
            branch_text = f"Git: {state} | branch: {branch_name}"
            branch_color = "#b42318" if dirty else "#2d6a4f"
        except OSError as exc:
            branch_text = f"Git status failed: {exc}"
        self.git_message.set(branch_text)
        self.git_label.configure(foreground=branch_color)
        if self.git_refresh_job is not None:
            self.root.after_cancel(self.git_refresh_job)
        self.git_refresh_job = self.root.after(5000, self._refresh_git_status)

    def _set_running_state(self, running: bool) -> None:
        if running:
            self.status_message.set("Running")
            self.status_label.configure(foreground="#9a6700")
            self.run_button.configure(state="disabled")
            self.stop_button.configure(state="normal")
            self.task_text.configure(state="disabled")
        else:
            self.status_message.set("Idle")
            self.status_label.configure(foreground="#2d6a4f")
            self.run_button.configure(state="normal")
            self.stop_button.configure(state="disabled")
            self.task_text.configure(state="normal")

    def _set_task_status(self, message: str, color: str) -> None:
        self.task_status_message.set(message)
        self.task_status_label.configure(foreground=color)

    def _append_log(self, text: str, log_only: bool = True) -> None:
        if self.log_handle is not None:
            self.log_handle.write(text)
            self.log_handle.flush()
        if log_only:
            self.log_text.configure(state="normal")
            self.log_text.insert(tk.END, text)
            self.log_text.see(tk.END)
            self.log_text.configure(state="disabled")

    def _clear_logs(self) -> None:
        self.log_text.configure(state="normal")
        self.log_text.delete("1.0", tk.END)
        self.log_text.configure(state="disabled")

    def _open_logs(self) -> None:
        target = self.current_log_path if self.current_log_path and self.current_log_path.exists() else self.logs_dir
        os.startfile(str(target))

    def _open_project(self) -> None:
        os.startfile(str(self.repo_root))

    def _close_log_handle(self) -> None:
        if self.log_handle is not None:
            self.log_handle.close()
            self.log_handle = None

    def _on_close(self) -> None:
        if self.process is not None:
            if not messagebox.askyesno("Process running", "Stop the running agent and close the window?"):
                return
            self._stop_agent()
        self._save_task_file()
        self._close_log_handle()
        self.root.destroy()


def main() -> None:
    root = tk.Tk()
    ttk.Style(root).theme_use("clam")
    UpgrAgentGui(root)
    root.mainloop()


if __name__ == "__main__":
    main()
