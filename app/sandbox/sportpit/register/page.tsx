"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../SportpitPreview.module.css";

export default function SportpitRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!res.ok) {
        setMessage({ type: "error", text: data?.message || data?.error || `Ошибка регистрации (${res.status})` });
        return;
      }

      setMessage({ type: "success", text: data?.message || "Регистрация успешна. Перенаправление на вход..." });
      setTimeout(() => router.push("/sandbox/sportpit/login"), 700);
    } catch {
      setMessage({ type: "error", text: "Ошибка сети. Попробуйте снова." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.authSection}>
      <h1>Регистрация</h1>
      <p className={styles.muted}>Создание аккаунта через API регистрации.</p>
      {message ? <p className={message.type === "error" ? styles.errorText : styles.successText}>{message.text}</p> : null}
      <form className={styles.authForm} onSubmit={onSubmit}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Пароль (минимум 8 символов)"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? "Регистрация..." : "Создать аккаунт"}
        </button>
      </form>
      <p className={styles.muted}>
        Уже есть аккаунт? <Link href="/sandbox/sportpit/login">Вход</Link>
      </p>
    </section>
  );
}
