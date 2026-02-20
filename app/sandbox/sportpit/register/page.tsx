"use client";

import Link from "next/link";
import styles from "../SportpitPreview.module.css";

export default function SportpitRegisterPage() {
  return (
    <section className={styles.authSection}>
      <h1>Регистрация</h1>
      <p className={styles.muted}>Demo-форма для песочницы без backend.</p>
      <form className={styles.authForm} onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Имя" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Пароль" required />
        <button type="submit" className={styles.primaryBtn}>
          Создать аккаунт
        </button>
      </form>
      <p className={styles.muted}>
        Уже есть аккаунт? <Link href="/sandbox/sportpit/login">Вход</Link>
      </p>
    </section>
  );
}
