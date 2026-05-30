// app/account/register/register-form.tsx
"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRef, useState } from "react";

type AccountType = "BUYER" | "VENDOR";
type FieldName = "email" | "password" | "confirmPassword" | "acceptTerms" | "accountType";
type FieldErrors = Partial<Record<FieldName, string>>;

type RegisterResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  fieldErrors?: FieldErrors;
  requestId?: string;
};

const passwordChecks = [
  { id: "length", label: "минимум 8 символов", test: (value: string) => value.length >= 8 },
  { id: "letter", label: "буква", test: (value: string) => /[A-Za-zА-Яа-яЁё]/.test(value) },
  { id: "digit", label: "цифра", test: (value: string) => /\d/.test(value) },
  { id: "special", label: "спецсимвол", test: (value: string) => /[^A-Za-zА-Яа-яЁё\d]/.test(value) },
];

function getErrorMessage(data: RegisterResponse | null, status: number) {
  if (data?.message) return data.message;
  if (status === 409) return "Email уже зарегистрирован.";
  if (status === 403) return "Регистрация сейчас недоступна.";
  if (status === 429) return "Слишком много попыток. Попробуйте позже.";
  if (data?.requestId) return `Не удалось завершить регистрацию. ID: ${data.requestId}`;
  return "Не удалось завершить регистрацию. Повторите позже.";
}

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("BUYER");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const fieldRefs = {
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    confirmPassword: useRef<HTMLInputElement>(null),
    acceptTerms: useRef<HTMLInputElement>(null),
    accountType: useRef<HTMLInputElement>(null),
  };

  function focusFirstError(errors: FieldErrors) {
    const firstField = (["email", "password", "confirmPassword", "acceptTerms", "accountType"] as FieldName[]).find(
      (field) => errors[field]
    );
    if (firstField) {
      fieldRefs[firstField].current?.focus();
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setMessage(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword, acceptTerms, accountType }),
      });

      let data: RegisterResponse | null = null;
      try {
        data = (await res.json()) as RegisterResponse;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const nextFieldErrors = data?.fieldErrors ?? {};
        setFieldErrors(nextFieldErrors);
        setMessage({ type: "error", text: getErrorMessage(data, res.status) });
        window.requestAnimationFrame(() => focusFirstError(nextFieldErrors));
        return;
      }

      setMessage({ type: "success", text: "Аккаунт создан. Выполняем вход..." });

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok && !signInResult.error) {
        window.location.href = "/account";
        return;
      }

      window.location.href = "/account/login?registered=1";
    } catch {
      setMessage({
        type: "error",
        text: "Ошибка сети. Проверьте подключение и попробуйте ещё раз.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Регистрация</h1>

        {message ? (
          <p className={`auth-message ${message.type}`} aria-live="polite">
            {message.text}
          </p>
        ) : null}

        <form onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email">Email</label>
            <input
              ref={fieldRefs.email}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email ? (
              <p className="field-error" id="email-error">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password">Пароль</label>

            <div className="password-field">
              <input
                ref={fieldRefs.password}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error password-hints" : "password-hints"}
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
            <ul className="password-hints" id="password-hints">
              {passwordChecks.map((check) => (
                <li key={check.id} className={check.test(password) ? "is-met" : undefined}>
                  {check.label}
                </li>
              ))}
            </ul>
            {fieldErrors.password ? (
              <p className="field-error" id="password-error">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="confirmPassword">Повторите пароль</label>
            <input
              ref={fieldRefs.confirmPassword}
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
            />
            {fieldErrors.confirmPassword ? (
              <p className="field-error" id="confirm-password-error">
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <fieldset className="auth-fieldset" aria-describedby={fieldErrors.accountType ? "account-type-error" : undefined}>
            <legend>Тип аккаунта</legend>
            <label className="auth-radio">
              <input
                ref={fieldRefs.accountType}
                type="radio"
                name="accountType"
                value="BUYER"
                checked={accountType === "BUYER"}
                onChange={() => setAccountType("BUYER")}
              />
              <span>Я покупатель / ищу поставщика</span>
            </label>
            <label className="auth-radio">
              <input
                type="radio"
                name="accountType"
                value="VENDOR"
                checked={accountType === "VENDOR"}
                onChange={() => setAccountType("VENDOR")}
              />
              <span>Я поставщик / вендор</span>
            </label>
            {fieldErrors.accountType ? (
              <p className="field-error" id="account-type-error">
                {fieldErrors.accountType}
              </p>
            ) : null}
          </fieldset>

          <label className="auth-checkbox">
            <input
              ref={fieldRefs.acceptTerms}
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              aria-invalid={Boolean(fieldErrors.acceptTerms)}
              aria-describedby={fieldErrors.acceptTerms ? "terms-error" : undefined}
            />
            <span>
              Принимаю{" "}
              <Link href="/legal/terms" target="_blank">
                условия использования
              </Link>{" "}
              и{" "}
              <Link href="/legal/privacy" target="_blank">
                политику конфиденциальности
              </Link>
              .
            </span>
          </label>
          {fieldErrors.acceptTerms ? (
            <p className="field-error" id="terms-error">
              {fieldErrors.acceptTerms}
            </p>
          ) : null}

          <button type="submit" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="auth-footnote">
          Уже есть аккаунт? <Link href="/account/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
