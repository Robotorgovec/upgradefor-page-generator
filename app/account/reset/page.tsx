"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ResetState = "idle" | "loading" | "success" | "error";

const PASSWORD_MIN_LENGTH = 8;

function ResetContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<ResetState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Ссылка недействительна или истекла.");
    }
  }, [token]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!token) {
      setState("error");
      setMessage("Ссылка недействительна или истекла.");
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setState("error");
      setMessage(`Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов.`);
      return;
    }

    if (password !== confirmPassword) {
      setState("error");
      setMessage("Пароли не совпадают.");
      return;
    }

    setState("loading");
    setMessage(null);

    const response = await fetch("/api/auth/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);

    if (!response) {
      setState("error");
      setMessage("Не удалось сменить пароль. Попробуйте позже.");
      return;
    }

    const payload = (await response.json().catch(() => null)) as { ok?: boolean; code?: string } | null;

    if (response.ok && payload?.ok) {
      setState("success");
      setMessage("Пароль обновлён.");
      return;
    }

    setState("error");

    if (payload?.code === "INVALID_PASSWORD") {
      setMessage(`Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов.`);
      return;
    }

    if (payload?.code === "RATE_LIMIT") {
      setMessage("Слишком много попыток. Попробуйте позже.");
      return;
    }

    setMessage("Ссылка недействительна или истекла.");
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Смена пароля</h1>
      {message && (
        <p style={{ color: state === "success" ? "green" : "crimson", marginBottom: 16 }}>{message}</p>
      )}
      {state !== "success" && (
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 12 }}>
            Новый пароль
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={PASSWORD_MIN_LENGTH}
              required
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 16 }}>
            Подтверждение пароля
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={PASSWORD_MIN_LENGTH}
              required
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          <button
            type="submit"
            disabled={state === "loading" || (state === "error" && !token)}
            style={{ padding: "8px 16px", background: "black", color: "white" }}
          >
            {state === "loading" ? "Сохраняем..." : "Сменить пароль"}
          </button>
        </form>
      )}
      {(state === "success" || state === "error") && (
        <p style={{ marginTop: 16 }}>
          <Link href="/account/login" style={{ textDecoration: "underline" }}>
            Перейти ко входу
          </Link>
        </p>
      )}
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>Загружаем форму...</div>}>
      <ResetContent />
    </Suspense>
  );
}
