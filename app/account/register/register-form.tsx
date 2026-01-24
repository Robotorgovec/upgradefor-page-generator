"use client";

import { useState } from "react";

type RegisterState = "idle" | "loading" | "success";

const PASSWORD_MIN_LENGTH = 8;

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<RegisterState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setState("loading");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      setState("success");
      return;
    }

    const payload = (await response.json().catch(() => null)) as { code?: string } | null;
    setState("idle");

    if (response.status === 409 || payload?.code === "USER_EXISTS") {
      setError("Пользователь с таким email уже существует.");
      return;
    }

    if (payload?.code === "INVALID_PASSWORD") {
      setError(`Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов.`);
      return;
    }

    if (payload?.code === "RATE_LIMIT") {
      setError("Слишком много попыток. Попробуйте позже.");
      return;
    }

    setError("Не удалось зарегистрироваться. Попробуйте ещё раз.");
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Регистрация</h1>
      {state === "success" ? (
        <p style={{ color: "green" }}>
          Проверьте почту, мы отправили ссылку подтверждения.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "crimson", marginBottom: 16 }}>{error}</p>}
          <label style={{ display: "block", marginBottom: 12 }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 16 }}>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={PASSWORD_MIN_LENGTH}
              required
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          <button
            type="submit"
            disabled={state === "loading"}
            style={{ padding: "8px 16px", background: "black", color: "white" }}
          >
            {state === "loading" ? "Отправка..." : "Зарегистрироваться"}
          </button>
        </form>
      )}
    </div>
  );
}
