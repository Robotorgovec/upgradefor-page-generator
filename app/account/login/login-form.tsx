"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Подтвердите email перед входом.",
  CredentialsSignin: "Неверный email или пароль.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const errorParam = searchParams.get("error");
  const nextParam = searchParams.get("next") ?? "/account";

  const errorFromParams = useMemo(() => {
    if (!errorParam) return null;
    return ERROR_MESSAGES[errorParam] ?? "Не удалось войти. Попробуйте ещё раз.";
  }, [errorParam]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      redirect: true,
      callbackUrl: nextParam,
      email,
      password,
    });

    if (result?.error) {
      setError(ERROR_MESSAGES[result.error] ?? "Неверный email или пароль.");
    }
  };

  const displayedError = error ?? errorFromParams;

  return (
    <div className="auth-card">
      <h1>Вход</h1>

      {displayedError && <p className="auth-message error">{displayedError}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
