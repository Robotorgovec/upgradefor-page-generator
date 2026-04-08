"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

const PASSWORD_MIN_LENGTH = 8;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordValidationError(password: unknown) {
  if (typeof password !== "string" || !password) {
    return "Password is required.";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }

  if (!/[A-Za-z]/.test(password)) {
    return "Password must include at least one letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }

  return null;
}

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "registering" | "signingIn">("idle");
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const loading = submitState !== "idle";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      setMessage({ type: "error", text: "Enter a valid email address." });
      return;
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      setMessage({ type: "error", text: passwordError });
      return;
    }

    setSubmitState("registering");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      let data: { message?: string; error?: string } | null = null;
      try {
        data = (await response.json()) as { message?: string; error?: string };
      } catch {
        data = null;
      }

      if (!response.ok) {
        const text =
          (data && (data.message || data.error)) || `Registration failed (status ${response.status}).`;
        setMessage({ type: "error", text });
        return;
      }

      setSubmitState("signingIn");

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        window.location.assign("/account/login?registered=1");
        return;
      }

      setMessage({
        type: "success",
        text: data?.message || "Account created. Redirecting to account setup...",
      });
      window.location.assign("/account");
    } catch {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setSubmitState("idle");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>

        {message ? <p className={`auth-message ${message.type}`}>{message.text}</p> : null}

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
                autoComplete="new-password"
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

            <p className="auth-hint">Use at least 8 characters, including a letter and a number.</p>
          </div>

          <button type="submit" disabled={loading}>
            {submitState === "registering"
              ? "Creating account..."
              : submitState === "signingIn"
                ? "Signing you in..."
                : "Create account"}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/account/login">Already have an account?</Link>
        </div>
      </div>
    </div>
  );
}
