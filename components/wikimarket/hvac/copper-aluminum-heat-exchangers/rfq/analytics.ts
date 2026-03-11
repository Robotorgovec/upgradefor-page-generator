export type RfqAnalyticsEvent =
  | "configurator_view"
  | "quick_chip_click"
  | "scenario_select"
  | "wizard_step_next"
  | "wizard_step_back"
  | "engineer_help_click"
  | "replacement_mode_enter"
  | "oem_mode_enter"
  | "file_upload_start"
  | "file_upload_success"
  | "estimate_view"
  | "estimate_update"
  | "estimate_confidence_change"
  | "draft_saved"
  | "submit_attempt"
  | "submit_success"
  | "submit_error";

export function trackRfqEvent(event: RfqAnalyticsEvent, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  const detail = {
    event,
    payload,
    ts: Date.now(),
    source: "cu-al-rfq-configurator",
  };

  window.dispatchEvent(new CustomEvent("upgr:rfq-analytics", { detail }));

  const globalWithDataLayer = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };

  if (Array.isArray(globalWithDataLayer.dataLayer)) {
    globalWithDataLayer.dataLayer.push({
      event,
      source: "cu-al-rfq-configurator",
      ...payload,
    });
  }
}
