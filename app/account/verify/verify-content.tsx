"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyState = "loading" | "success" | "error";

type VerifyResponse = {
  ok: boolean;
  code?: string;
};

export function VerifyContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams?.get("token") ?? null, [searchParams]);
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Проверяем ссылку...");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Ссылка недействительна или истекла.");
      return;
    }

    const controller = new AbortController();

    const verifyEmail = async () => {
      setState("loading");
      setMessage("Подтверждаем email...");

      const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);

      if (!response) {
        setState("error");
        setMessage("Не удалось подтвердить email. Попробуйте позже.");
        return;
      }

      const payload = (await response.json().catch(() => null)) as VerifyResponse | null;

      if (response.ok && payload?.ok) {
        setState("success");
        setMessage("Email подтверждён.");
        return;
      }

      setState("error");
      if (payload?.code === "RATE_LIMIT") {
        setMessage("Слишком много попыток. Попробуйте позже.");
        return;
      }

      setMessage("Ссылка недействительна или истекла.");
    };

    void verifyEmail();

    return () => controller.abort();
  }, [token]);

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Подтверждение email</h1>
      <p style={{ marginBottom: 16 }}>{message}</p>
      {state === "success" && (
        <Link href="/account/login" style={{ color: "black", textDecoration: "underline" }}>
          Войти
        </Link>
      )}
      {state === "error" && (
        <Link href="/account/register" style={{ color: "black", textDecoration: "underline" }}>
          Зарегистрироваться снова
        </Link>
      )}
    </div>
  );
}
