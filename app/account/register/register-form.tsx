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
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMessage({
        type: "error",
        text: data?.message || data?.error || "Ошибка регистрации",
      });
      setLoading(false);
      return;
    }

    setMessage({ type: "success", text: data?.message || "Регистрация успешна" });
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Регистрация</h1>

        {message && <p className={`auth-message ${message.type}`}>{message.text}</p>}

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label>Пароль</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(v => !v)}
            >
              <span className="material-symbols-outlined">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          <button disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}
