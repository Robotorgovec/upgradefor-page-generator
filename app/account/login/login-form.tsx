"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSafeNextPath(value: string | null | undefined, fallback = "/account") {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function getAuthErrorMessage(error: string | null | undefined) {
  switch (error) {
    case "CredentialsSignin":
      return "Invalid email or password.";
    case "AccessDenied":
      return "Please verify your email before signing in.";
    case "google_email_not_verified":
      return "Your Google account must have a verified email address.";
    case "google_account_error":
      return "Google sign-in could not be completed. Please try again.";
    default:
      return "You are not authorized to sign in with these credentials.";
  }
}

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams?.get("next"), "/account");
  const queryError = searchParams?.get("error");
  const queryReason = searchParams?.get("reason");
  const wasRegistered = searchParams?.get("registered") === "1";
  const wasLoggedOut = searchParams?.get("logged_out") === "1";

  const [showPassword, setShowPassword] = useState(false);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const loading = credentialsLoading || googleLoading;
  const queryMessage =
    message ??
    (wasLoggedOut
      ? { type: "success" as const, text: "You have been signed out." }
      : wasRegistered
        ? { type: "success" as const, text: "Account created. Verify your email, then sign in to continue." }
        : queryReason === "unauthorized"
          ? { type: "error" as const, text: "Please sign in to access your account." }
          : queryError
            ? { type: "error" as const, text: getAuthErrorMessage(queryError) }
            : null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      setMessage({ type: "error", text: "Enter a valid email address." });
      return;
    }

    setCredentialsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (!result) {
        setMessage({
          type: "error",
          text: "Sign-in could not be completed. Please try again.",
        });
        return;
      }

      if (result.error) {
        setMessage({
          type: "error",
          text: getAuthErrorMessage(result.error),
        });
        return;
      }

      window.location.assign(nextPath);
    } catch {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setCredentialsLoading(false);
    }
  }

  async function onGoogleClick() {
    setMessage(null);
    setGoogleLoading(true);

    try {
      await signIn("google", { callbackUrl: "/account" });
    } catch {
      setMessage({
        type: "error",
        text: "Google sign-in could not be started. Please try again.",
      });
      setGoogleLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>

        {queryMessage ? <p className={`auth-message ${queryMessage.type}`}>{queryMessage.text}</p> : null}

        {googleEnabled ? (
          <>
            <button type="button" className="auth-provider-button" onClick={onGoogleClick} disabled={loading}>
              <span className="auth-provider-mark" aria-hidden="true">
                G
              </span>
              <span>{googleLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
            </button>
            <div className="auth-divider" aria-hidden="true">
              <span>or continue with email</span>
            </div>
          </>
        ) : null}

        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>

            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {credentialsLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/account/register">Create account</Link>
          <Link href="/account/forgot">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
