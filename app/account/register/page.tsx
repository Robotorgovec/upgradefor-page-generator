import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../../lib/auth";
import RegisterForm from "./register-form";

function getSignupMode() {
  const explicitMode = process.env.AUTH_SIGNUP_MODE;
  if (explicitMode === "open" || explicitMode === "invite" || explicitMode === "request") {
    return explicitMode;
  }

  if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview") {
    return "open";
  }

  return "request";
}

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/account");
  }

  const signupMode = getSignupMode();

  if (signupMode !== "open") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Запросить доступ</h1>
          <p className="auth-message" aria-live="polite">
            {signupMode === "invite"
              ? "Регистрация сейчас доступна только по приглашению."
              : "Публичная регистрация сейчас закрыта. Напишите команде UpgradeFor, чтобы получить доступ."}
          </p>
          <p className="auth-footnote">
            Уже есть аккаунт? <a href="/account/login">Войти</a>
          </p>
        </div>
      </div>
    );
  }

  return <RegisterForm />;
}
