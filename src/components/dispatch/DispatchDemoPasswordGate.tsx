"use client";

import { FormEvent, useState } from "react";

export default function DispatchDemoPasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/dispatch-demo-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Неверный пароль");
        setIsSubmitting(false);
        return;
      }

      window.location.reload();
    } catch {
      setError("Не удалось открыть демо. Попробуйте еще раз.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="dispatchDemoGate">
      <section className="dispatchDemoGateCard" aria-labelledby="dispatch-demo-gate-title">
        <p className="dispatchDemoGateEyebrow">UPGRADE Dispatch / Asia Park Astana</p>
        <h1 id="dispatch-demo-gate-title">Demo access protected</h1>
        <p className="dispatchDemoGateText">
          Введите 6-значный пароль, чтобы открыть read-only demo диспетчеризации.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="dispatch-demo-password">6-digit password</label>
          <input
            id="dispatch-demo-password"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••••"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "dispatch-demo-password-error" : undefined}
          />
          {error ? (
            <p id="dispatch-demo-password-error" className="dispatchDemoGateError" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={isSubmitting || password.length !== 6}>
            {isSubmitting ? "Проверяем..." : "Открыть демо"}
          </button>
        </form>
      </section>
      <style jsx>{`
        .dispatchDemoGate {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background:
            linear-gradient(rgba(125, 211, 252, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125, 211, 252, 0.055) 1px, transparent 1px),
            radial-gradient(circle at 50% 24%, rgba(14, 165, 233, 0.2), transparent 34%),
            #020617;
          background-size: 32px 32px, 32px 32px, auto, auto;
          color: #dbeafe;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .dispatchDemoGateCard {
          width: min(100%, 430px);
          border: 1px solid rgba(56, 189, 248, 0.28);
          border-radius: 8px;
          background: linear-gradient(145deg, rgba(8, 20, 38, 0.95), rgba(2, 8, 23, 0.86));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 24px 68px rgba(0, 0, 0, 0.38);
          padding: 24px;
        }

        .dispatchDemoGateEyebrow {
          margin: 0 0 10px;
          color: #67e8f9;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .dispatchDemoGateCard h1 {
          margin: 0;
          color: #f8fafc;
          font-size: 28px;
          letter-spacing: 0;
        }

        .dispatchDemoGateText {
          margin: 12px 0 20px;
          color: #bfdbfe;
          font-size: 14px;
          line-height: 1.55;
        }

        form {
          display: grid;
          gap: 12px;
        }

        label {
          color: #93c5fd;
          font-size: 12px;
          font-weight: 800;
        }

        input {
          width: 100%;
          border: 1px solid rgba(125, 211, 252, 0.28);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.78);
          color: #f8fafc;
          font-size: 24px;
          letter-spacing: 0.18em;
          padding: 12px 14px;
          outline: none;
        }

        input:focus {
          border-color: rgba(34, 211, 238, 0.78);
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12);
        }

        input::placeholder {
          color: #64748b;
        }

        .dispatchDemoGateError {
          margin: 0;
          color: #fecaca;
          font-size: 13px;
          font-weight: 800;
        }

        button {
          border: 1px solid rgba(34, 211, 238, 0.42);
          border-radius: 8px;
          background: rgba(14, 165, 233, 0.18);
          color: #e0f2fe;
          cursor: pointer;
          font-weight: 900;
          padding: 12px 14px;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.54;
        }
      `}</style>
    </main>
  );
}
