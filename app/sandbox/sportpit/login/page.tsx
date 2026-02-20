"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import styles from "../SportpitPreview.module.css";

export default function SportpitLoginPage() {
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setMessage({ type: "error", text: "Неверный email или пароль." });
        return;
      }

      setMessage({ type: "success", text: "Вход выполнен. Перенаправление..." });
      router.push("/sandbox/sportpit");
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Ошибка сети. Попробуйте снова." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.authSection}>
      <h1>Вход</h1>
      <p className={styles.muted}>Вход через существующий credentials-провайдер.</p>
      {message ? <p className={message.type === "error" ? styles.errorText : styles.successText}>{message.text}</p> : null}
      <form className={styles.authForm} onSubmit={onSubmit}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Пароль" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
      <p className={styles.muted}>
        Нет аккаунта? <Link href="/sandbox/sportpit/register">Регистрация</Link>
      </p>
    </section>
  );
}
