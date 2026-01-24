type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function getBaseUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

async function sendWithResend(payload: ResendPayload) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[mail] RESEND_API_KEY отсутствует, письмо не отправлено.");
      return;
    }

    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error: ${response.status} ${body}`);
  }
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const provider = (process.env.EMAIL_PROVIDER ?? "resend").toLowerCase();
  const from = process.env.EMAIL_FROM ?? "noreply@upgradefor.com";

  if (provider !== "resend") {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[mail] Провайдер ${provider} не поддержан, письмо не отправлено.`);
      return;
    }

    throw new Error(`Unsupported email provider: ${provider}`);
  }

  const payload: ResendPayload = {
    from,
    to: [to],
    subject,
    html,
    text,
  };

  try {
    await sendWithResend(payload);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[mail] Не удалось отправить письмо через Resend.", error);
      const previewLink = `${getBaseUrl()}/account/verify?token=<token>`;
      console.info(`[mail] Проверьте базовый URL: ${previewLink}`);
      return;
    }

    throw error;
  }
}

export function logVerificationLink(link: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[mail] Ссылка подтверждения: ${link}`);
  }
}
