import crypto from "crypto";

export function generateRawToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
