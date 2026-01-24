"use client";

import Link from "next/link";
import { useState } from "react";

type ForgotState = "idle" | "loading" | "success";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<ForgotState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setState("loading");

    const response = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    if (!response) {
      setState("idle");
      setError("Не удалось отправить ссылку. Попробуйте позже.");
      return;
    }

    setState("success");
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Восстановление пароля</h1>
      {state === "success" ? (
        <p style={{ marginBottom: 16 }}>
          Если такой email существует, мы отправили ссылку для сброса пароля.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "crimson", marginBottom: 16 }}>{error}</p>}
          <label style={{ display: "block", marginBottom: 16 }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          <button
            type="submit"
            disabled={state === "loading"}
            style={{ padding: "8px 16px", background: "black", color: "white" }}
          >
            {state === "loading" ? "Отправка..." : "Отправить ссылку"}
          </button>
        </form>
      )}
      <p style={{ marginTop: 16 }}>
        <Link href="/account/login" style={{ textDecoration: "underline" }}>
          Вернуться ко входу
        </Link>
      </p>
    </div>
  );
}
