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
    if (!errorParam) {
      return null;
    }

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
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Вход</h1>
      {displayedError && (
        <p style={{ color: "crimson", marginBottom: 16 }}>{displayedError}</p>
      )}
      <form onSubmit={handleSubmit}>
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
            required
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
        <button
          type="submit"
          style={{ padding: "8px 16px", background: "black", color: "white" }}
        >
          Войти
        </button>
      </form>
    </div>
  );
}
