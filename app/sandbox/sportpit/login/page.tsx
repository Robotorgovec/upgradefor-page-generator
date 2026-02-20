"use client";

import Link from "next/link";
import styles from "../SportpitPreview.module.css";

export default function SportpitLoginPage() {
  return (
    <section className={styles.authSection}>
      <h1>Вход</h1>
      <p className={styles.muted}>Demo-форма для песочницы без backend.</p>
      <form className={styles.authForm} onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Пароль" required />
        <button type="submit" className={styles.primaryBtn}>
          Войти
        </button>
      </form>
      <p className={styles.muted}>
        Нет аккаунта? <Link href="/sandbox/sportpit/register">Регистрация</Link>
      </p>
    </section>
  );
}
