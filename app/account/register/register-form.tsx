"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: { message?: string; error?: string } | null = null;
      try {
        data = (await res.json()) as { message?: string; error?: string };
      } catch {
        data = null;
      }

      if (!res.ok) {
        const text =
          (data && (data.message || data.error)) ||
          `Не удалось зарегистрироваться (код ${res.status}).`;
        setMessage({ type: "error", text });
        return;
      }

      setMessage({ type: "success", text: data?.message || "Регистрация успешна. Проверьте почту." });
    } catch {
      setMessage({ type: "error", text: "Ошибка сети. Попробуйте ещё раз." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {message ? <p className={`auth-message ${message.type}`}>{message.text}</p> : null}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Пароль</label>

        <div className="password-field">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            title={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Регистрация..." : "Зарегистрироваться"}
      </button>
    </form>
  );
}
