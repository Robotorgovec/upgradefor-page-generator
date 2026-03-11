import { STORAGE_KEYS } from "./config";
import { EstimateResult, RfqFormState, RfqHistorySnapshot, RfqPayload } from "./types";
import { normalizeRfqInputs } from "./estimator";

const HISTORY_LIMIT = 25;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadDraft(): RfqFormState | null {
  if (typeof window === "undefined") return null;
  const parsed = safeParse<RfqFormState>(window.sessionStorage.getItem(STORAGE_KEYS.draft));
  return parsed;
}

export function saveDraft(state: RfqFormState): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(state));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEYS.draft);
}

export function loadHistory(): RfqHistorySnapshot[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<RfqHistorySnapshot[]>(window.localStorage.getItem(STORAGE_KEYS.history));
  if (!Array.isArray(parsed)) return [];
  return parsed;
}

export function pushHistorySnapshot(snapshot: RfqHistorySnapshot): void {
  if (typeof window === "undefined") return;
  const current = loadHistory();
  current.unshift(snapshot);
  const next = current.slice(0, HISTORY_LIMIT);
  window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
}

export function buildHistorySnapshot(
  form: RfqFormState,
  estimate: EstimateResult,
  options: {
    locale: string;
    country: string;
    submitAttempted: boolean;
    submitSucceeded: boolean;
    submitFailed: boolean;
    finalPayload: RfqPayload | null;
  },
): RfqHistorySnapshot {
  return {
    scenario: form.scenario,
    normalizedInputs: normalizeRfqInputs(form),
    files: form.files,
    estimateLow: estimate.low,
    estimateMid: estimate.mid,
    estimateHigh: estimate.high,
    estimateConfidence: estimate.confidence,
    estimateFactorsSnapshot: estimate.factors,
    timestamp: new Date().toISOString(),
    locale: options.locale,
    country: options.country,
    submitAttempted: options.submitAttempted,
    submitSucceeded: options.submitSucceeded,
    submitFailed: options.submitFailed,
    finalPayload: options.finalPayload,
  };
}
