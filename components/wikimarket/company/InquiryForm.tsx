"use client";

import { FormEvent, useState } from "react";

import styles from "./CompanyContactCard.module.css";

type InquiryFormProps = {
  companySlug: string;
  companyName: string;
};

type FormState = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  website: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  message: "",
  website: "",
};

export default function InquiryForm({ companySlug, companyName }: InquiryFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch(`/api/wikimarket/companies/${companySlug}/inquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "Не удалось отправить запрос.");
      }

      setForm(initialState);
      setStatus({
        type: "success",
        message: payload?.message || `Запрос для ${companyName} отправлен.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Не удалось отправить запрос.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Имя</span>
          <input
            className={styles.input}
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Email</span>
          <input
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Компания</span>
          <input
            className={styles.input}
            name="company"
            autoComplete="organization"
            value={form.company}
            onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
          />
        </label>

        <label className={styles.field}>
          <span>Телефон</span>
          <input
            className={styles.input}
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>Что нужно</span>
        <textarea
          className={styles.textarea}
          name="message"
          rows={5}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          placeholder="Опишите режимы, размеры, сроки и что нужно посчитать."
          required
        />
      </label>

      <label className={styles.honeypot} aria-hidden="true">
        <span>Website</span>
        <input
          tabIndex={-1}
          name="website"
          value={form.website}
          onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
        />
      </label>

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? "Отправляем..." : "Отправить запрос"}
      </button>

      <p
        className={`${styles.status} ${status.type === "success" ? styles.statusSuccess : ""} ${
          status.type === "error" ? styles.statusError : ""
        }`}
        aria-live="polite"
      >
        {status.message}
      </p>
    </form>
  );
}
