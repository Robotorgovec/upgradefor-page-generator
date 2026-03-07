export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function toId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

export function clampStep(step: number, max: number): number {
  if (Number.isNaN(step)) return 0;
  return Math.max(0, Math.min(step, max));
}

export function isValidPositiveNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function numberFromInput(value: string): number | "" {
  if (value.trim() === "") return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";
  return parsed;
}

export function selectListValue(current: string[], item: string): string[] {
  if (current.includes(item)) {
    return current.filter((entry) => entry !== item);
  }
  return [...current, item];
}
