// app/account/login/login-form.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";

function getSafeRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}

function getLoginErrorText(error?: string | null) {
  if (error === "RATE_LIMITED") {
    return "Слишком много попыток входа. Попробуйте позже.";
  }

  if (error === "CredentialsSignin" || error === "AccessDenied") {
    return "Неверный email или пароль.";
  }

  return "Не удалось войти. Повторите позже.";
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => getSafeRedirect(searchParams?.get("callbackUrl") || searchParams?.get("next")),
    [searchParams]
  );

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(() =>
    searchParams?.get("registered") === "1"
      ? { type: "success", text: "Аккаунт создан. Теперь войдите." }
      : null
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setMessage(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setMessage({
          type: "error",
          text: getLoginErrorText(result?.error),
        });
        return;
      }

      window.location.href = nextPath;
    } catch {
      setMessage({
        type: "error",
        text: "Ошибка сети. Попробуйте ещё раз.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Вход</h1>

        {message ? (
          <p className={`auth-message ${message.type}`} aria-live="polite">
            {message.text}
          </p>
        ) : null}

        <form onSubmit={onSubmit} noValidate>
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
            <div className="auth-label-row">
              <label htmlFor="password">Пароль</label>
              <Link href="/account/forgot">Забыли пароль?</Link>
            </div>

            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="auth-footnote">
          Нет аккаунта? <Link href="/account/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
