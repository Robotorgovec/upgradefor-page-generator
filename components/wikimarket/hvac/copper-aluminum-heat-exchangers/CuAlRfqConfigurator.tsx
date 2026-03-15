"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";

import styles from "./CuAlRfqConfigurator.module.css";
import { trackRfqEvent } from "./rfq/analytics";
import {
  APPLICATION_CHIPS,
  CLIENT_TYPE_OPTIONS,
  CONNECTION_ORIENTATION_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
  DEADLINE_PRESET_OPTIONS,
  DEFAULT_ESTIMATE_TEXT,
  FILE_CATEGORY_OPTIONS,
  HEADER_POSITION_OPTIONS,
  KNOWN_DATA_OPTIONS,
  MANUFACTURER_SELECTION,
  MEDIUM_OPTIONS,
  MODE_OPTIONS,
  OEM_REQUIREMENT_OPTIONS,
  ONSITE_NEED_OPTIONS,
  PREFERRED_CONTACT_OPTIONS,
  PRESERVE_OPTIONS,
  PURPOSE_OPTIONS,
  QUICK_ENTRY_CHIPS,
  REPLACEMENT_NEED_OPTIONS,
  ROUTING_PREFERENCE_OPTIONS,
  SCENARIO_OPTIONS,
  STEP_TITLES,
  TASK_NEED_OPTIONS,
  createInitialState,
  detectCountryFromLocale,
} from "./rfq/config";
import { calculateEstimate } from "./rfq/estimator";
import { buildRfqPayload, validateSubmitMinimum } from "./rfq/payload";
import { buildHistorySnapshot, clearDraft, loadDraft, pushHistorySnapshot, saveDraft } from "./rfq/storage";
import { DeadlinePreset, FileCategory, RfqFileItem, RfqFormState, RfqScenario } from "./rfq/types";
import { clampStep, formatCurrency, numberFromInput, selectListValue, toId } from "./rfq/utils";

const MAX_STEP_INDEX = STEP_TITLES.length - 1;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_FILE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".xlsx", ".xls", ".csv", ".dwg"];

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string; stopBoundary: boolean }
  | { status: "error"; message: string };

interface CuAlRfqConfiguratorProps {
  prefillProductSlug?: string;
  prefillUsecaseSlug?: string;
}

function scenarioLabel(scenario: RfqScenario): string {
  return SCENARIO_OPTIONS.find((item) => item.value === scenario)?.label ?? scenario;
}

function confidenceLabel(value: string): string {
  if (value === "high") return "Высокая";
  if (value === "medium") return "Средняя";
  return "Низкая";
}

function completionLabel(value: string): string {
  if (value === "enough-for-precise-calculation") return "Данных достаточно для точного инженерного расчета";
  if (value === "enough-for-preselection") return "Данных достаточно для первичного подбора";
  return "Можно отправлять";
}

function guessFileCategory(file: File): FileCategory {
  const name = file.name.toLowerCase();
  if (name.includes("шильд") || name.includes("nameplate")) return "nameplate";
  if (name.includes("draw") || name.includes("черт") || name.endsWith(".dwg")) return "drawing";
  if (name.endsWith(".pdf")) return "pdf-spec";
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) return "excel-spec";
  if (name.includes("old") || name.includes("стар")) return "old-coil-photo";
  if (name.includes("install") || name.includes("монтаж")) return "installation-photo";
  return "other";
}

function isUsefulFieldFilled(form: RfqFormState): boolean {
  const numericFields: Array<number | ""> = [
    form.powerKw,
    form.airflowM3h,
    form.lengthMm,
    form.heightMm,
    form.depthMm,
    form.rows,
    form.tubeDiameterMm,
    form.finPitchMm,
    form.collectorDiameterMm,
  ];

  const hasNumber = numericFields.some((value) => typeof value === "number" && value > 0);
  const hasText = Boolean(form.applicationArea.trim() || form.oldModel.trim() || form.comments.trim());
  return hasNumber || hasText || form.files.length > 0;
}

function slugToReadableText(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includeListValue(list: string[], value: string): string[] {
  if (list.includes(value)) return list;
  return [...list, value];
}

function presetLabel(preset: DeadlinePreset | ""): string {
  return DEADLINE_PRESET_OPTIONS.find((item) => item.value === preset)?.label ?? "";
}

function formatDateLabel(value: string): string {
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ru-RU");
}

function deadlineSummaryLabel(form: RfqFormState): string {
  if (form.deadlineMode === "asap") return "ближайший возможный";

  if (form.deadlineMode === "exact_date") {
    return form.deadlineDate ? `до ${formatDateLabel(form.deadlineDate)}` : "-";
  }

  if (form.deadlineMode === "days_from_now") {
    if (typeof form.deadlineDays === "number" && form.deadlineDays > 0) {
      return `через ${form.deadlineDays} дней`;
    }
    return "-";
  }

  if (form.deadlinePreset) {
    const label = presetLabel(form.deadlinePreset);
    return label ? `через ${label}` : "-";
  }

  return "-";
}
export default function CuAlRfqConfigurator({ prefillProductSlug, prefillUsecaseSlug }: CuAlRfqConfiguratorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RfqFormState>(() => createInitialState(""));
  const [errors, setErrors] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [scenarioLockedByQuickEntry, setScenarioLockedByQuickEntry] = useState(false);
  const [showScenarioEditor, setShowScenarioEditor] = useState(false);

  const locale = useMemo(() => {
    if (typeof navigator === "undefined") return "ru-RU";
    return navigator.language || "ru-RU";
  }, []);

  const countryFallback = useMemo(() => detectCountryFromLocale(locale), [locale]);

  const estimate = useMemo(() => calculateEstimate(form), [form]);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setForm((prev) => ({
        ...prev,
        ...draft,
        contact: {
          ...prev.contact,
          ...draft.contact,
          country: draft.contact?.country || prev.contact.country || countryFallback,
        },
        files: Array.isArray(draft.files)
          ? draft.files.map((file) => ({
              ...file,
              previewUrl: undefined,
            }))
          : [],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          country: countryFallback,
        },
      }));
    }

    trackRfqEvent("configurator_view", { scenario: draft?.scenario || "quick" });
    trackRfqEvent("estimate_view");
  }, [countryFallback]);

  useEffect(() => {
    if (!prefillProductSlug && !prefillUsecaseSlug) return;

    setForm((prev) => {
      const nextComment = prefillProductSlug
        ? `${prev.comments}\nИнтересует изделие: ${slugToReadableText(prefillProductSlug)}`.trim()
        : prev.comments;

      return {
        ...prev,
        applicationArea: prev.applicationArea || (prefillUsecaseSlug ? slugToReadableText(prefillUsecaseSlug) : ""),
        comments: nextComment,
      };
    });
  }, [prefillProductSlug, prefillUsecaseSlug]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveDraft(form);
      trackRfqEvent("draft_saved", { step, scenario: form.scenario });

      const snapshot = buildHistorySnapshot(form, estimate, {
        locale,
        country: form.contact.country || countryFallback,
        submitAttempted: false,
        submitSucceeded: false,
        submitFailed: false,
        finalPayload: null,
      });
      pushHistorySnapshot(snapshot);
    }, 380);

    return () => window.clearTimeout(timeout);
  }, [countryFallback, estimate, form, locale, step]);

  useEffect(() => {
    trackRfqEvent("estimate_update", {
      low: estimate.low,
      mid: estimate.mid,
      high: estimate.high,
      confidence: estimate.confidence,
    });
  }, [estimate.confidence, estimate.high, estimate.low, estimate.mid]);

  useEffect(() => {
    return () => {
      form.files.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [form.files]);

  const showCollectorsStep = form.scenario !== "quick";
  const completionText = completionLabel(estimate.completion);
  const deadlineText = deadlineSummaryLabel(form);

  const knowsDimensions = form.knownData.includes("Габариты");
  const knowsPower = form.knownData.includes("Мощность");
  const knowsThermal = form.knownData.includes("Температуры / расход");
  const knowsConnections = form.knownData.includes("Данные по подключениям");
  const hasFileKnownData = form.knownData.includes("Есть чертеж / фото / шильдик");

  const showDimensionFields =
    form.scenario === "dimensions" || form.scenario === "replacement" || form.scenario === "engineering" || knowsDimensions;
  const showPowerFields = form.scenario === "power" || form.scenario === "engineering" || knowsPower;
  const showThermalFields = form.scenario === "power" || form.scenario === "engineering" || knowsThermal;
  const replacementNeedsExactAnalog = form.scenario === "replacement" && form.replacementNeed === "full-analog";
  const collectorsPriority =
    form.scenario === "replacement" || replacementNeedsExactAnalog || form.keepConnectionLayoutExact || knowsConnections;

  const setField = <K extends keyof RfqFormState>(key: K, value: RfqFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setContactField = <K extends keyof RfqFormState["contact"]>(
    key: K,
    value: RfqFormState["contact"][K],
  ) => {
    setForm((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [key]: value,
      },
    }));
  };

  const toggleListField = (field: "preserveWhat" | "oemRequirements" | "selectedManufacturers", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: selectListValue(prev[field], value),
    }));
  };

  const toggleKnownDataOption = (option: string) => {
    const enablingEngineerHelp = option === "Нужна помощь инженера" && !form.knownData.includes(option);
    if (enablingEngineerHelp) {
      trackRfqEvent("engineer_help_click", { source: "step-2" });
    }

    setForm((prev) => {
      const nextKnownData = selectListValue(prev.knownData, option);
      return {
        ...prev,
        knownData: nextKnownData,
        engineerHelp: nextKnownData.includes("Нужна помощь инженера"),
      };
    });
  };

  const setDeadlinePreset = (preset: DeadlinePreset) => {
    setForm((prev) => ({
      ...prev,
      deadlineMode: "preset",
      deadlinePreset: preset,
      deadlineDate: "",
      deadlineDays: "",
    }));
  };

  const setDeadlineAsap = () => {
    setForm((prev) => ({
      ...prev,
      deadlineMode: "asap",
      deadlinePreset: "",
      deadlineDate: "",
      deadlineDays: "",
    }));
  };

  const validateStep = (targetStep: number): string[] => {
    const stepErrors: string[] = [];

    if (targetStep === 0) {
      if (!form.taskNeed) stepErrors.push("Выберите, что нужно: новый подбор, замена, OEM или нестандарт");
      if (!form.purpose) stepErrors.push("Выберите назначение (охлаждение/нагрев/испарение/конденсация)");
      if (!form.applicationArea.trim()) stepErrors.push("Укажите область применения");
    }

    if (targetStep === 2) {
      const hasRequiredSizing =
        form.scenario !== "dimensions" ||
        [form.lengthMm, form.heightMm, form.depthMm].filter((value) => typeof value === "number" && value > 0).length >= 2;

      if (!hasRequiredSizing) {
        stepErrors.push("Для сценария по размерам укажите минимум два габарита в мм");
      }

      if (form.powerKw !== "" && (typeof form.powerKw !== "number" || form.powerKw <= 0)) {
        stepErrors.push("Введите значение больше 0");
      }
    }

    if (targetStep === 5) {
      if (!form.contact.name.trim() && !form.contact.company.trim()) {
        stepErrors.push("Укажите имя или компанию");
      }
      if (!form.contact.email.trim() && !form.contact.phone.trim() && !form.contact.whatsapp.trim() && !form.contact.telegram.trim()) {
        stepErrors.push("Добавьте email или телефон");
      }
      if (form.contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email.trim())) {
        stepErrors.push("Укажите корректный email");
      }
    }

    if (targetStep === 6) {
      const submitErrors = validateSubmitMinimum(form);
      if (submitErrors.length > 0) {
        stepErrors.push(...submitErrors);
      }
      if (!form.consent) {
        stepErrors.push("Подтвердите согласие на обработку данных");
      }
    }

    return stepErrors;
  };

  const goNext = () => {
    const nextErrors = validateStep(step);
    setErrors(nextErrors);
    if (nextErrors.length > 0) return;

    const nextStep = clampStep(step + 1, MAX_STEP_INDEX);
    setStep(nextStep);
    trackRfqEvent("wizard_step_next", { from: step, to: nextStep });
  };

  const goBack = () => {
    const nextStep = clampStep(step - 1, MAX_STEP_INDEX);
    setStep(nextStep);
    setErrors([]);
    trackRfqEvent("wizard_step_back", { from: step, to: nextStep });
  };

  const goToStep = (target: number) => {
    if (target > step) {
      const nextErrors = validateStep(step);
      setErrors(nextErrors);
      if (nextErrors.length > 0) return;
    }
    setStep(clampStep(target, MAX_STEP_INDEX));
  };

  const applyQuickScenario = (chipId: string) => {
    const chip = QUICK_ENTRY_CHIPS.find((item) => item.id === chipId);
    if (!chip) return;

    setForm((prev) => {
      const withFilesHint =
        chip.id === "have-files" ? includeListValue(prev.knownData, "Есть чертеж / фото / шильдик") : prev.knownData;
      const withEngineerHelp = chip.engineerHelp ? includeListValue(withFilesHint, "Нужна помощь инженера") : withFilesHint;
      const replacementNeed = chip.id === "analog-no-rework" ? "full-analog" : prev.replacementNeed;

      return {
        ...prev,
        scenario: chip.scenario,
        engineerHelp: chip.engineerHelp ? true : prev.engineerHelp,
        knownData: withEngineerHelp,
        replacementNeed,
        keepConnectionLayoutExact: chip.highlightConnections ? true : prev.keepConnectionLayoutExact,
      };
    });

    setScenarioLockedByQuickEntry(true);
    setShowScenarioEditor(false);
    setStep(0);
    setErrors([]);
    trackRfqEvent("quick_chip_click", { chipId, scenario: chip.scenario });
    if (chip.engineerHelp) {
      trackRfqEvent("engineer_help_click", { source: "quick-chip" });
    }
    if (chip.scenario === "replacement") {
      trackRfqEvent("replacement_mode_enter", { source: "quick-chip" });
    }
    if (chip.scenario === "oem") {
      trackRfqEvent("oem_mode_enter", { source: "quick-chip" });
    }
  };

  const handleScenarioChange = (scenario: RfqScenario) => {
    setForm((prev) => ({ ...prev, scenario }));
    setScenarioLockedByQuickEntry(false);
    setShowScenarioEditor(false);
    trackRfqEvent("scenario_select", { scenario });
    if (scenario === "replacement") trackRfqEvent("replacement_mode_enter", { source: "scenario-select" });
    if (scenario === "oem") trackRfqEvent("oem_mode_enter", { source: "scenario-select" });
  };

  const appendFiles = (incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    if (files.length === 0) return;

    trackRfqEvent("file_upload_start", { count: files.length });

    const nextItems: RfqFileItem[] = [];

    for (const file of files) {
      const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;
      if (!ACCEPTED_FILE_EXTENSIONS.includes(extension)) {
        setFileError(`Формат ${extension} не поддерживается`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`Файл ${file.name} превышает 20 MB`);
        continue;
      }

      const isImage = file.type.startsWith("image/");
      nextItems.push({
        id: toId("rfq-file"),
        name: file.name,
        size: file.size,
        type: file.type || extension.replace(".", "application/"),
        lastModified: file.lastModified,
        category: guessFileCategory(file),
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      });
    }

    if (nextItems.length > 0) {
      setForm((prev) => ({
        ...prev,
        files: [...prev.files, ...nextItems],
      }));
      setFileError("");
      trackRfqEvent("file_upload_success", { count: nextItems.length });
    }
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    appendFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      appendFiles(event.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
    setForm((prev) => {
      const target = prev.files.find((file) => file.id === fileId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return {
        ...prev,
        files: prev.files.filter((file) => file.id !== fileId),
      };
    });
  };

  const updateFileCategory = (fileId: string, category: FileCategory) => {
    setForm((prev) => ({
      ...prev,
      files: prev.files.map((file) => (file.id === fileId ? { ...file, category } : file)),
    }));
  };

  const handleSubmit = async () => {
    const submitErrors = validateStep(6);
    setErrors(submitErrors);
    if (submitErrors.length > 0) return;

    setSubmitState({ status: "loading" });
    trackRfqEvent("submit_attempt", { scenario: form.scenario });

    const payload = buildRfqPayload(form, estimate, {
      locale,
      country: form.contact.country || countryFallback,
    });

    pushHistorySnapshot(
      buildHistorySnapshot(form, estimate, {
        locale,
        country: form.contact.country || countryFallback,
        submitAttempted: true,
        submitSucceeded: false,
        submitFailed: false,
        finalPayload: payload,
      }),
    );

    const endpoint = process.env.NEXT_PUBLIC_CUAL_RFQ_ENDPOINT || "";

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        setSubmitState({ status: "success", message: "Заявка отправлена. Мы свяжемся с вами для уточнения параметров.", stopBoundary: false });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350));
        setSubmitState({
          status: "success",
          message:
            "Заявка и RFQ payload сохранены в contract-layer (session/local history). Реальный backend routing/submit endpoint в текущей инфраструктуре не подключен.",
          stopBoundary: true,
        });
      }

      pushHistorySnapshot(
        buildHistorySnapshot(form, estimate, {
          locale,
          country: form.contact.country || countryFallback,
          submitAttempted: true,
          submitSucceeded: true,
          submitFailed: false,
          finalPayload: payload,
        }),
      );

      clearDraft();
      trackRfqEvent("submit_success", { scenario: form.scenario, endpointEnabled: Boolean(endpoint) });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: `Не удалось отправить заявку: ${error instanceof Error ? error.message : "unknown error"}`,
      });

      pushHistorySnapshot(
        buildHistorySnapshot(form, estimate, {
          locale,
          country: form.contact.country || countryFallback,
          submitAttempted: true,
          submitSucceeded: false,
          submitFailed: true,
          finalPayload: payload,
        }),
      );

      trackRfqEvent("submit_error", {
        scenario: form.scenario,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  };

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <section className={styles.stepSection} aria-labelledby="rfq-step-1">
          <h3 id="rfq-step-1">Шаг 1. Сценарий задачи</h3>

          <label className={styles.field}>
            <span>Что нужно</span>
            <select
              value={form.taskNeed}
              onChange={(event) => setField("taskNeed", event.target.value as RfqFormState["taskNeed"])}
              data-analytics-id="task_need"
            >
              <option value="">Выберите вариант</option>
              {TASK_NEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Назначение</span>
            <select
              value={form.purpose}
              onChange={(event) => setField("purpose", event.target.value as RfqFormState["purpose"])}
            >
              <option value="">Выберите назначение</option>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <section className={styles.groupBlock}>
            <h4 className={styles.groupTitle}>Главный сценарий</h4>
            {scenarioLockedByQuickEntry && !showScenarioEditor ? (
              <div className={styles.scenarioSummaryCard}>
                <p>
                  Выбран сценарий: <strong>{scenarioLabel(form.scenario)}</strong>
                </p>
                <button type="button" className={styles.secondaryButton} onClick={() => setShowScenarioEditor(true)}>
                  Изменить сценарий
                </button>
              </div>
            ) : (
              <>
                <div className={styles.radioGrid} role="radiogroup" aria-label="Выбор сценария">
                  {SCENARIO_OPTIONS.map((scenario) => (
                    <button
                      key={scenario.value}
                      type="button"
                      className={`${styles.radioCard} ${form.scenario === scenario.value ? styles.radioCardActive : ""}`}
                      onClick={() => handleScenarioChange(scenario.value)}
                      role="radio"
                      aria-checked={form.scenario === scenario.value}
                    >
                      <strong>{scenario.label}</strong>
                      <small>{scenario.description}</small>
                    </button>
                  ))}
                </div>
                {scenarioLockedByQuickEntry ? (
                  <p className={styles.microHelp}>
                    Сценарий можно изменить, если быстрый вход выбран не для вашего текущего кейса.
                  </p>
                 ) : null}
              </>
            )}
          </section>

          <label className={styles.field}>
            <span>Область применения</span>
            <input
              type="text"
              value={form.applicationArea}
              onChange={(event) => setField("applicationArea", event.target.value)}
              placeholder="Например: вентиляция, чиллер, ККБ, фанкойл"
            />
            <small className={styles.microHelp}>Можно выбрать чип ниже или ввести свой вариант.</small>
          </label>

          <div className={styles.chipGrid}>
            {APPLICATION_CHIPS.map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.inlineChip} ${form.applicationArea === item ? styles.inlineChipActive : ""}`}
                onClick={() => setField("applicationArea", item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (step === 1) {
      return (
        <section className={styles.stepSection} aria-labelledby="rfq-step-2">
          <h3 id="rfq-step-2">Шаг 2. Какие данные у вас есть</h3>
          <p className={styles.microHelp}>Этот шаг управляет тем, какие поля будут раскрыты на следующем шаге.</p>

          <div className={styles.checkGrid}>
            {KNOWN_DATA_OPTIONS.map((option) => {
              const checked = form.knownData.includes(option);
              return (
                <label key={option} className={styles.checkboxItem}>
                  <input type="checkbox" checked={checked} onChange={() => toggleKnownDataOption(option)} />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          {form.engineerHelp ? (
            <p className={styles.helperNotice}>
              Отправьте то, что знаете. Чем больше данных, тем точнее ориентировочная оценка и быстрее подбор.
            </p>
           ) : null}
        </section>
      );
    }

    if (step === 2) {
      return (
        <section className={styles.stepSection} aria-labelledby="rfq-step-3">
          <h3 id="rfq-step-3">Шаг 3. Основные параметры</h3>

          <section className={styles.groupBlock}>
            <h4 className={styles.groupTitle}>Тепловые параметры</h4>
            <div className={styles.fieldGrid2}>
              <label className={styles.field}>
                <span>Рабочая среда</span>
                <select value={form.medium} onChange={(event) => setField("medium", event.target.value as RfqFormState["medium"])}>
                  <option value="">Выберите среду</option>
                  {MEDIUM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Режим</span>
                <select value={form.mode} onChange={(event) => setField("mode", event.target.value as RfqFormState["mode"])}>
                  <option value="">Выберите режим</option>
                  {MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {showPowerFields ? (
                <label className={styles.field}>
                  <span>Требуемая мощность, кВт</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.powerKw}
                    min={0}
                    onChange={(event) => setField("powerKw", numberFromInput(event.target.value))}
                    placeholder="Например: 72"
                  />
                </label>
               ) : null}

              {showThermalFields || showPowerFields ? (
                <label className={styles.field}>
                  <span>Расход воздуха, м3/ч</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.airflowM3h}
                    min={0}
                    onChange={(event) => setField("airflowM3h", numberFromInput(event.target.value))}
                  />
                </label>
               ) : null}

              <label className={styles.field}>
                <span>Количество изделий</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.quantity}
                  min={1}
                  onChange={(event) => setField("quantity", numberFromInput(event.target.value))}
                />
              </label>
            </div>

            {showThermalFields ? (
              <div className={styles.fieldGrid3}>
                <label className={styles.field}>
                  <span>Температура воздуха на входе, C</span>
                  <input type="number" value={form.airInC} onChange={(event) => setField("airInC", numberFromInput(event.target.value))} />
                </label>
                <label className={styles.field}>
                  <span>Температура воздуха на выходе, C</span>
                  <input type="number" value={form.airOutC} onChange={(event) => setField("airOutC", numberFromInput(event.target.value))} />
                </label>
                <label className={styles.field}>
                  <span>Температура среды на входе, C</span>
                  <input
                    type="number"
                    value={form.mediumInC}
                    onChange={(event) => setField("mediumInC", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Температура среды на выходе, C</span>
                  <input
                    type="number"
                    value={form.mediumOutC}
                    onChange={(event) => setField("mediumOutC", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Рабочее давление, bar</span>
                  <input
                    type="number"
                    value={form.workingPressureBar}
                    min={0}
                    step="0.1"
                    onChange={(event) => setField("workingPressureBar", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Допустимое падение давления, kPa</span>
                  <input
                    type="number"
                    value={form.pressureDropLimitKpa}
                    min={0}
                    step="0.1"
                    onChange={(event) => setField("pressureDropLimitKpa", numberFromInput(event.target.value))}
                  />
                </label>
              </div>
             ) : null}

            <div className={styles.deadlineBlock}>
              <h5 className={styles.deadlineTitle}>Срок нужен к</h5>
              <div className={styles.chipGrid}>
                {DEADLINE_PRESET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.inlineChip} ${
                      form.deadlineMode === "preset" && form.deadlinePreset === option.value ? styles.inlineChipActive : ""
                    }`}
                    onClick={() => setDeadlinePreset(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.inlineChip} ${form.deadlineMode === "asap" ? styles.inlineChipActive : ""}`}
                  onClick={setDeadlineAsap}
                >
                  Ближайший возможный срок
                </button>
              </div>

              <div className={styles.deadlineModeRow}>
                <button
                  type="button"
                  className={`${styles.secondaryButton} ${
                    form.deadlineMode === "exact_date" ? styles.deadlineModeButtonActive : styles.deadlineModeButton
                  }`}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      deadlineMode: "exact_date",
                      deadlinePreset: "",
                      deadlineDays: "",
                    }))
                  }
                >
                  Указать точную дату
                </button>

                <button
                  type="button"
                  className={`${styles.secondaryButton} ${
                    form.deadlineMode === "days_from_now" ? styles.deadlineModeButtonActive : styles.deadlineModeButton
                  }`}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      deadlineMode: "days_from_now",
                      deadlinePreset: "",
                      deadlineDate: "",
                    }))
                  }
                >
                  Указать через N дней
                </button>
              </div>

              {form.deadlineMode === "exact_date" ? (
                <label className={styles.field}>
                  <span>Дата</span>
                  <input
                    type="date"
                    value={form.deadlineDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        deadlineMode: "exact_date",
                        deadlineDate: event.target.value,
                        deadlinePreset: "",
                        deadlineDays: "",
                      }))
                    }
                  />
                </label>
               ) : null}

              {form.deadlineMode === "days_from_now" ? (
                <label className={styles.field}>
                  <span>Через сколько дней</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.deadlineDays}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        deadlineMode: "days_from_now",
                        deadlineDays: numberFromInput(event.target.value),
                        deadlinePreset: "",
                        deadlineDate: "",
                      }))
                    }
                  />
                </label>
               ) : null}
            </div>
          </section>

          {showDimensionFields ? (
            <section className={styles.groupBlock}>
              <h4 className={styles.groupTitle}>Габариты</h4>
              <div className={styles.fieldGrid3}>
                <label className={styles.field}>
                  <span>A - длина, мм</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.lengthMm}
                    min={0}
                    onChange={(event) => setField("lengthMm", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>B - высота, мм</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.heightMm}
                    min={0}
                    onChange={(event) => setField("heightMm", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>C - глубина, мм</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.depthMm}
                    min={0}
                    onChange={(event) => setField("depthMm", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Рядность</span>
                  <input type="number" value={form.rows} min={1} onChange={(event) => setField("rows", numberFromInput(event.target.value))} />
                </label>
                <label className={styles.field}>
                  <span>Диаметр трубок, мм</span>
                  <input
                    type="number"
                    value={form.tubeDiameterMm}
                    min={0}
                    step="0.01"
                    onChange={(event) => setField("tubeDiameterMm", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Шаг ламелей, мм</span>
                  <input
                    type="number"
                    value={form.finPitchMm}
                    min={0}
                    step="0.01"
                    onChange={(event) => setField("finPitchMm", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Толщина ламелей, мм</span>
                  <input
                    type="number"
                    value={form.finThicknessMm}
                    min={0}
                    step="0.01"
                    onChange={(event) => setField("finThicknessMm", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Толщина корпуса, мм</span>
                  <input
                    type="number"
                    value={form.casingThicknessMm}
                    min={0}
                    step="0.01"
                    onChange={(event) => setField("casingThicknessMm", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Труб в ряду, если известно</span>
                  <input
                    type="number"
                    value={form.tubesPerRow}
                    min={0}
                    onChange={(event) => setField("tubesPerRow", numberFromInput(event.target.value))}
                  />
                </label>
              </div>
            </section>
           ) : null}

          {form.scenario === "replacement" ? (
            <section className={styles.groupBlock}>
              <h4 className={styles.groupTitle}>Замена существующего</h4>

              <label className={styles.field}>
                <span>Нужен ли аналог без переделки установки?</span>
                <select
                  value={form.replacementNeed}
                  onChange={(event) => {
                    const value = event.target.value as RfqFormState["replacementNeed"];
                    setForm((prev) => ({
                      ...prev,
                      replacementNeed: value,
                      keepConnectionLayoutExact: value === "full-analog" ? true : prev.keepConnectionLayoutExact,
                    }));
                  }}
                >
                  <option value="">Выберите режим</option>
                  {REPLACEMENT_NEED_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {replacementNeedsExactAnalog ? (
                <p className={styles.highlightNotice}>
                  Для точного аналога без переделок желательно указать габариты, подключения, коллекторы и приложить
                  фото/шильдик/чертеж.
                </p>
               ) : null}

              <label className={styles.field}>
                <span>Марка / модель / обозначение старого изделия</span>
                <input type="text" value={form.oldModel} onChange={(event) => setField("oldModel", event.target.value)} />
              </label>

              <div className={styles.checkGrid}>
                {PRESERVE_OPTIONS.map((item) => (
                  <label key={item} className={styles.checkboxItem}>
                    <input type="checkbox" checked={form.preserveWhat.includes(item)} onChange={() => toggleListField("preserveWhat", item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </section>
           ) : null}

          {(form.scenario === "oem" || form.scenario === "engineering") ? (
            <section className={styles.groupBlock}>
              <h4 className={styles.groupTitle}>OEM / серия</h4>
              <div className={styles.fieldGrid2}>
                <label className={styles.field}>
                  <span>Тип вашего оборудования</span>
                  <input type="text" value={form.oemEquipmentType} onChange={(event) => setField("oemEquipmentType", event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Нужен образец или серия</span>
                  <input
                    type="text"
                    value={form.oemSampleOrSeries}
                    onChange={(event) => setField("oemSampleOrSeries", event.target.value)}
                    placeholder="Образец / пилот / серия"
                  />
                </label>
                <label className={styles.field}>
                  <span>Плановый объем</span>
                  <input
                    type="number"
                    value={form.oemPlannedVolume}
                    min={0}
                    onChange={(event) => setField("oemPlannedVolume", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Регулярность закупок</span>
                  <input
                    type="text"
                    value={form.oemPurchaseRegularity}
                    onChange={(event) => setField("oemPurchaseRegularity", event.target.value)}
                    placeholder="Ежемесячно / квартально / по графику"
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>Новый проект или аналог текущего решения</span>
                <input type="text" value={form.oemProjectType} onChange={(event) => setField("oemProjectType", event.target.value)} />
              </label>

              <div className={styles.checkGrid}>
                {OEM_REQUIREMENT_OPTIONS.map((item) => (
                  <label key={item} className={styles.checkboxItem}>
                    <input type="checkbox" checked={form.oemRequirements.includes(item)} onChange={() => toggleListField("oemRequirements", item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <div className={styles.inlineChecks}>
                <label className={styles.checkboxLine}>
                  <input type="checkbox" checked={form.oemNeedSerialCalc} onChange={(event) => setField("oemNeedSerialCalc", event.target.checked)} />
                  <span>Нужен расчет под серийное производство</span>
                </label>
                <label className={styles.checkboxLine}>
                  <input
                    type="checkbox"
                    checked={form.oemNeedSupplierAnalog}
                    onChange={(event) => setField("oemNeedSupplierAnalog", event.target.checked)}
                  />
                  <span>Нужен аналог текущему поставщику</span>
                </label>
              </div>
            </section>
           ) : null}

          {form.scenario === "engineering" ? (
            <section className={styles.groupBlock}>
              <h4 className={styles.groupTitle}>Полное инженерное ТЗ</h4>
              <div className={styles.fieldGrid2}>
                <label className={styles.field}>
                  <span>Материал труб</span>
                  <input type="text" value={form.materialTube} onChange={(event) => setField("materialTube", event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Материал ламелей</span>
                  <input type="text" value={form.materialFin} onChange={(event) => setField("materialFin", event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Тип коллектора</span>
                  <input type="text" value={form.headerType} onChange={(event) => setField("headerType", event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Количество контуров</span>
                  <input
                    type="number"
                    value={form.circuitsCount}
                    min={0}
                    onChange={(event) => setField("circuitsCount", numberFromInput(event.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Схема циркуляции</span>
                  <input type="text" value={form.circulationScheme} onChange={(event) => setField("circulationScheme", event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Монтажное исполнение</span>
                  <input type="text" value={form.mountingExecution} onChange={(event) => setField("mountingExecution", event.target.value)} />
                </label>
              </div>

              <label className={styles.field}>
                <span>Требования к коррозионной стойкости</span>
                <textarea value={form.corrosionRequirement} onChange={(event) => setField("corrosionRequirement", event.target.value)} rows={2} />
              </label>

              <label className={styles.field}>
                <span>Требования к температурному диапазону</span>
                <textarea
                  value={form.temperatureRangeRequirement}
                  onChange={(event) => setField("temperatureRangeRequirement", event.target.value)}
                  rows={2}
                />
              </label>

              <label className={styles.field}>
                <span>Требования к документам / маркировке / спецификации</span>
                <textarea value={form.documentsRequirement} onChange={(event) => setField("documentsRequirement", event.target.value)} rows={2} />
              </label>
            </section>
           ) : null}
        </section>
      );
    }

    if (step === 3) {
      if (!showCollectorsStep) {
        return (
          <section className={styles.stepSection} aria-labelledby="rfq-step-4">
            <h3 id="rfq-step-4">Шаг 4. Конструкция, коллекторы, подключения</h3>
            <p className={styles.helperNotice}>
              В quick режиме этот блок скрыт. Переключитесь на replacement, OEM или engineering для детального ввода.
            </p>
          </section>
        );
      }

      return (
        <section className={styles.stepSection} aria-labelledby="rfq-step-4">
          <h3 id="rfq-step-4">Шаг 4. Конструкция, коллекторы, подключения</h3>

          {collectorsPriority && (
            <p className={styles.highlightNotice}>
              Для replacement и сценария "аналог без переделки" этот блок критичен: укажите подключения максимально точно.
            </p>
          )}

          <section className={styles.groupBlock}>
            <h4 className={styles.groupTitle}>Коллекторы и подключения</h4>

            <div className={styles.helperWrap}>
            <details className={styles.helperDetails} open>
              <summary>Схема габаритов (A, B, C)</summary>
              <svg viewBox="0 0 340 160" role="img" aria-label="Схема размеров теплообменника" className={styles.diagram}>
                <rect x="44" y="32" width="220" height="88" rx="8" />
                <line x1="44" y1="130" x2="264" y2="130" />
                <line x1="44" y1="130" x2="44" y2="145" />
                <line x1="264" y1="130" x2="264" y2="145" />
                <text x="148" y="150">A - длина</text>
                <line x1="278" y1="32" x2="278" y2="120" />
                <line x1="278" y1="32" x2="294" y2="32" />
                <line x1="278" y1="120" x2="294" y2="120" />
                <text x="300" y="80">B</text>
                <line x1="44" y1="24" x2="76" y2="8" />
                <line x1="264" y1="24" x2="296" y2="8" />
                <text x="126" y="18">C - глубина</text>
              </svg>
            </details>

            <details className={styles.helperDetails}>
              <summary>Схема подключений / коллекторов</summary>
              <svg viewBox="0 0 340 160" role="img" aria-label="Схема подключений теплообменника" className={styles.diagram}>
                <rect x="36" y="24" width="236" height="104" rx="8" />
                <circle cx="48" cy="66" r="8" />
                <circle cx="48" cy="96" r="8" />
                <circle cx="260" cy="66" r="8" />
                <circle cx="260" cy="96" r="8" />
                <line x1="48" y1="66" x2="48" y2="96" />
                <line x1="48" y1="110" x2="48" y2="142" />
                <line x1="260" y1="110" x2="260" y2="142" />
                <line x1="48" y1="142" x2="260" y2="142" />
                <text x="102" y="154">межосевое расстояние</text>
                <text x="276" y="70">коллектор</text>
                <text x="274" y="94">ось подкл.</text>
              </svg>
            </details>
          </div>

          <div className={styles.fieldGrid3}>
            <label className={styles.field}>
              <span>Диаметр коллектора, мм</span>
              <input
                type="number"
                value={form.collectorDiameterMm}
                min={0}
                onChange={(event) => setField("collectorDiameterMm", numberFromInput(event.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span>Количество коллекторов</span>
              <input
                type="number"
                value={form.collectorsCount}
                min={0}
                onChange={(event) => setField("collectorsCount", numberFromInput(event.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span>Расположение коллекторов</span>
              <select
                value={form.collectorPosition}
                onChange={(event) =>
                  setField("collectorPosition", event.target.value as RfqFormState["collectorPosition"])
                }
              >
                <option value="">Выберите вариант</option>
                {HEADER_POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Межосевое расстояние, мм</span>
              <input
                type="number"
                value={form.collectorCenterDistanceMm}
                min={0}
                onChange={(event) => setField("collectorCenterDistanceMm", numberFromInput(event.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span>Расстояние от края до оси подключения, мм</span>
              <input
                type="number"
                value={form.edgeToConnectionAxisMm}
                min={0}
                onChange={(event) => setField("edgeToConnectionAxisMm", numberFromInput(event.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span>Вылет коллектора, мм</span>
              <input
                type="number"
                value={form.collectorProjectionMm}
                min={0}
                onChange={(event) => setField("collectorProjectionMm", numberFromInput(event.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span>Тип подключения</span>
              <select
                value={form.connectionType}
                onChange={(event) => setField("connectionType", event.target.value as RfqFormState["connectionType"])}
              >
                <option value="">Выберите тип подключения</option>
                {CONNECTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Размер подключения / резьбы / фланца</span>
              <input type="text" value={form.connectionSize} onChange={(event) => setField("connectionSize", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Ориентация подключения</span>
              <select
                value={form.connectionOrientation}
                onChange={(event) =>
                  setField("connectionOrientation", event.target.value as RfqFormState["connectionOrientation"])
                }
              >
                <option value="">Выберите ориентацию</option>
                {CONNECTION_ORIENTATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.inlineChecks}>
            <label className={styles.checkboxLine}>
              <input
                type="checkbox"
                checked={form.keepConnectionLayoutExact}
                onChange={(event) => setField("keepConnectionLayoutExact", event.target.checked)}
              />
              <span>Сохранить расположение подключений 1 в 1</span>
            </label>
            <label className={styles.checkboxLine}>
              <input
                type="checkbox"
                checked={form.allowConnectionChanges}
                onChange={(event) => setField("allowConnectionChanges", event.target.checked)}
              />
              <span>Допустимо изменение подключений</span>
            </label>
          </div>
        </section>
      </section>
      );
    }

    if (step === 4) {
      return (
        <section className={styles.stepSection} aria-labelledby="rfq-step-5">
          <h3 id="rfq-step-5">Шаг 5. Файлы и комментарии</h3>

          {hasFileKnownData ? (
            <p className={styles.helperNotice}>
              Вы отметили сценарий с файлами. Добавьте чертеж, фото шильдика или фото старого изделия, чтобы ускорить подбор.
            </p>
            ) : null}

          <section className={styles.groupBlock}>
            <h4 className={styles.groupTitle}>Файлы</h4>

          <div
            className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            data-dropzone="true"
          >
            <p>Перетащите файлы сюда или выберите через кнопку</p>
            <p className={styles.microHelp}>Поддержка: PNG/JPG/WebP, PDF, XLS/XLSX/CSV, DWG. До 20 MB на файл.</p>
            <button type="button" className={styles.secondaryButton} onClick={() => fileInputRef.current?.click()}>
              Выбрать файлы
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className={styles.hiddenInput}
              onChange={handleFileInput}
              accept={ACCEPTED_FILE_EXTENSIONS.join(",")}
            />
          </div>

          <p className={styles.helperNotice}>
            Фото шильдика, старого изделия или чертеж часто позволяют подобрать решение быстрее и точнее.
          </p>

          {fileError ? <p className={styles.errorText}>{fileError}</p> : null}

          {form.files.length > 0 ? (
            <ul className={styles.fileList}>
              {form.files.map((file) => (
                <li key={file.id} className={styles.fileItem}>
                  <div className={styles.fileMeta}>
                    {file.previewUrl ? <img src={file.previewUrl} alt={file.name} className={styles.filePreview} /> : null}
                    <div>
                      <p>{file.name}</p>
                      <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                  </div>

                  <div className={styles.fileActions}>
                    <select
                      value={file.category}
                      onChange={(event) => updateFileCategory(file.id, event.target.value as FileCategory)}
                      aria-label={`Категория файла ${file.name}`}
                    >
                      {FILE_CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button type="button" className={styles.removeButton} onClick={() => removeFile(file.id)}>
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
           ) : null}

          </section>

          <section className={styles.groupBlock}>
            <h4 className={styles.groupTitle}>Комментарии</h4>

          <label className={styles.field}>
            <span>Комментарии и ограничения</span>
            <textarea
              value={form.comments}
              onChange={(event) => setField("comments", event.target.value)}
              rows={5}
              placeholder="Опишите задачу, ограничения по срокам, геометрии, подключению и документации"
            />
          </label>
          </section>
        </section>
      );
    }

    if (step === 5) {
      return (
        <section className={styles.stepSection} aria-labelledby="rfq-step-6">
          <h3 id="rfq-step-6">Шаг 6. Контакты и отправка</h3>

          <section className={styles.groupBlock}>
            <h4 className={styles.groupTitle}>Контакты</h4>

          <div className={styles.fieldGrid2}>
            <label className={styles.field}>
              <span>Имя</span>
              <input type="text" value={form.contact.name} onChange={(event) => setContactField("name", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Компания</span>
              <input type="text" value={form.contact.company} onChange={(event) => setContactField("company", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Страна</span>
              <input
                type="text"
                value={form.contact.country}
                onChange={(event) => setContactField("country", event.target.value.toUpperCase())}
              />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                value={form.contact.email}
                onChange={(event) => setContactField("email", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Телефон</span>
              <input type="text" value={form.contact.phone} onChange={(event) => setContactField("phone", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>WhatsApp</span>
              <input
                type="text"
                value={form.contact.whatsapp}
                onChange={(event) => setContactField("whatsapp", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Telegram</span>
              <input
                type="text"
                value={form.contact.telegram}
                onChange={(event) => setContactField("telegram", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Предпочтительный способ связи</span>
              <select
                value={form.contact.preferredContact}
                onChange={(event) =>
                  setContactField("preferredContact", event.target.value as RfqFormState["contact"]["preferredContact"])
                }
              >
                <option value="">Выберите канал</option>
                {PREFERRED_CONTACT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Удобное время связи</span>
              <input
                type="text"
                value={form.contact.preferredTime}
                onChange={(event) => setContactField("preferredTime", event.target.value)}
                placeholder="Например: 10:00-16:00"
              />
            </label>
            <label className={styles.field}>
              <span>Нужен ли выезд на замер</span>
              <select
                value={form.contact.onsiteNeed}
                onChange={(event) => setContactField("onsiteNeed", event.target.value as RfqFormState["contact"]["onsiteNeed"])}
              >
                <option value="">Выберите вариант</option>
                {ONSITE_NEED_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Город / объект</span>
              <input
                type="text"
                value={form.contact.cityObject}
                onChange={(event) => setContactField("cityObject", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Тип клиента</span>
              <select
                value={form.clientType}
                onChange={(event) => setField("clientType", event.target.value as RfqFormState["clientType"])}
              >
                <option value="">Выберите тип клиента</option>
                {CLIENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>Комментарий для команды</span>
            <textarea
              value={form.contact.comment}
              onChange={(event) => setContactField("comment", event.target.value)}
              rows={3}
            />
          </label>

          </section>

          <div className={styles.routingBlock}>
            <h4>Сценарий RFQ-routing</h4>
            <div className={styles.radioStack}>
              {ROUTING_PREFERENCE_OPTIONS.map((option) => (
                <label key={option.value} className={styles.radioLine}>
                  <input
                    type="radio"
                    name="routing-preference"
                    checked={form.routingPreference === option.value}
                    onChange={() => setField("routingPreference", option.value)}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              ))}
            </div>

            {form.routingPreference === "selected" ? (
              <div className={styles.checkGrid}>
                {MANUFACTURER_SELECTION.map((manufacturer) => (
                  <label key={manufacturer} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={form.selectedManufacturers.includes(manufacturer)}
                      onChange={() => toggleListField("selectedManufacturers", manufacturer)}
                    />
                    <span>{manufacturer}</span>
                  </label>
                ))}
              </div>
             ) : null}

            <p className={styles.microHelp}>
              После отправки заявка будет направлена по выбранному сценарию обработки.
            </p>
          </div>
        </section>
      );
    }

    return (
      <section className={styles.stepSection} aria-labelledby="rfq-step-7">
        <h3 id="rfq-step-7">Шаг 7. Проверка заявки и финальное подтверждение</h3>

        <div className={styles.reviewGrid}>
          <article className={styles.reviewCard}>
            <h4>Ключевые параметры</h4>
            <ul>
              <li>Сценарий: {scenarioLabel(form.scenario)}</li>
              <li>Назначение: {form.purpose || "Не указано"}</li>
              <li>Среда: {form.medium || "Не указана"}</li>
              <li>Режим: {form.mode || "Не указан"}</li>
              <li>Срок: {deadlineText}</li>
              <li>
                Габариты: {form.lengthMm || "-"} x {form.heightMm || "-"} x {form.depthMm || "-"} мм
              </li>
              <li>Рядность: {form.rows || "-"}</li>
              <li>Мощность: {form.powerKw || "-"} кВт</li>
              <li>Файлы: {form.files.length}</li>
              <li>Статус полноты: {completionText}</li>
            </ul>
          </article>

          <article className={styles.reviewCard}>
            <h4>Контактный блок</h4>
            <ul>
              <li>Имя: {form.contact.name || "-"}</li>
              <li>Компания: {form.contact.company || "-"}</li>
              <li>Email: {form.contact.email || "-"}</li>
              <li>Телефон: {form.contact.phone || form.contact.whatsapp || form.contact.telegram || "-"}</li>
              <li>Предпочтительный канал: {form.contact.preferredContact || "Любой"}</li>
              <li>Routing: {ROUTING_PREFERENCE_OPTIONS.find((item) => item.value === form.routingPreference)?.label}</li>
            </ul>
          </article>
        </div>

        <label className={styles.checkboxLine}>
          <input type="checkbox" checked={form.consent} onChange={(event) => setField("consent", event.target.checked)} />
          <span>Согласен на обработку данных для подбора, оценки и формирования RFQ payload.</span>
        </label>
      </section>
    );
  };

  return (
    <section id="request" className={styles.configurator} data-configurator-view="true">
      <div className={styles.header}>
        <h2>Подбор медно-алюминиевого теплообменника</h2>
        <p>
          Заполните только те параметры, которые вам известны. Система покажет ориентировочную оценку, а точную цену и
          срок подтвердит производитель.
        </p>
        <p className={styles.trustLine}>
          Подходит для HVAC, холодильных систем, вентиляции, осушения, отопления, сервисной замены и OEM-производства.
        </p>
      </div>

      <div className={styles.quickChips} role="list" aria-label="Быстрые сценарии входа">
        {QUICK_ENTRY_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => applyQuickScenario(chip.id)}
            className={styles.quickChip}
            data-event="quick_chip_click"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.wizardColumn}>
          <nav className={styles.stepper} aria-label="Шаги конфигуратора">
            {STEP_TITLES.map((title, index) => (
              <button
                key={title}
                type="button"
                className={`${styles.stepButton} ${step === index ? styles.stepButtonActive : ""}`}
                onClick={() => goToStep(index)}
                aria-current={step === index ? "step" : undefined}
              >
                <span className={styles.stepIndex}>{index + 1}</span>
                <span className={styles.stepLabel}>{title}</span>
              </button>
            ))}
          </nav>

          <div className={styles.progressWrap}>
            <div
              className={`${styles.progressBar} ${styles[`progressStep${step + 1}`]}`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={MAX_STEP_INDEX + 1}
              aria-valuenow={step + 1}
            >
              <span className={styles.progressFill} />
            </div>
          </div>

          <div className={styles.stepCard}>{renderStepContent()}</div>

          {errors.length > 0 ? (
            <div className={styles.errorBlock} role="alert" aria-live="assertive">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
           ) : null}

          <div className={styles.stepActions}>
            <button type="button" className={styles.secondaryButton} onClick={goBack} disabled={step === 0}>
              Назад
            </button>

            {step < MAX_STEP_INDEX ? (
              <button type="button" className={styles.primaryButton} onClick={goNext}>
                Далее
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSubmit}
                disabled={submitState.status === "loading"}
              >
                {submitState.status === "loading" ? "Отправка..." : "Отправить заявку"}
              </button>
            )}
          </div>

          {submitState.status === "success" ? (
            <div className={styles.successState} role="status">
              <h4>Заявка обработана</h4>
              <p>{submitState.message}</p>
              {submitState.stopBoundary ? (
                <p className={styles.stopBoundaryNote}>
                  Stop-condition: в текущем проекте нет готового backend endpoint для production RFQ-routing. Подготовлены
                  UI, estimate, payload contract и structured history capture layer.
                </p>
               ) : null}
            </div>
           ) : null}

          {submitState.status === "error" ? (
            <div className={styles.errorState} role="alert">
              <h4>Ошибка отправки</h4>
              <p>{submitState.message}</p>
            </div>
           ) : null}
        </div>

        <aside className={styles.summaryColumn}>
          <button
            type="button"
            className={styles.mobileSummaryToggle}
            onClick={() => setMobileSummaryOpen((prev) => !prev)}
            aria-expanded={mobileSummaryOpen}
          >
            {mobileSummaryOpen ? "Скрыть summary" : "Показать summary"}
          </button>

          <div className={`${styles.summarySticky} ${mobileSummaryOpen ? styles.summaryOpen : ""}`}>
            <article className={styles.summaryCard}>
              <h3>Summary заявки</h3>
              <ul>
                <li>Сценарий: {scenarioLabel(form.scenario)}</li>
                <li>Назначение: {form.purpose || "-"}</li>
                <li>Среда: {form.medium || "-"}</li>
                <li>Режим: {form.mode || "-"}</li>
                <li>Срок: {deadlineText}</li>
                <li>
                  Габариты: {form.lengthMm || "-"} x {form.heightMm || "-"} x {form.depthMm || "-"} мм
                </li>
                <li>Рядность: {form.rows || "-"}</li>
                <li>Мощность: {form.powerKw || "-"} кВт</li>
                <li>Файлы: {form.files.length > 0 ? `Да (${form.files.length})` : "Нет"}</li>
                <li>Тип клиента: {form.clientType || "-"}</li>

                <li>Статус полноты: {completionText}</li>
              </ul>
            </article>

            <article className={styles.estimateCard} data-event="estimate_view">
              <h3>Ориентировочная стоимость</h3>
              <p className={styles.estimateCaption}>Диапазон оценки</p>
              <p className={styles.estimateRange}>
                {formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}
              </p>
              <p className={styles.estimateMid}>Средняя оценка: {formatCurrency(estimate.mid)}</p>
              <p>
                Точность оценки: <strong>{confidenceLabel(estimate.confidence)}</strong>
              </p>
              <p className={styles.estimateHint}>{DEFAULT_ESTIMATE_TEXT.disclaimer}</p>
              <p className={styles.estimateHint}>{DEFAULT_ESTIMATE_TEXT.precisionHint}</p>
            </article>

            <article className={styles.estimateCard}>
              <h3>Факторы оценки</h3>
              <ul>
                <li>Medium factor: x{estimate.factors.mediumFactor.toFixed(2)}</li>
                <li>Fin density factor: x{estimate.factors.finDensityFactor.toFixed(2)}</li>
                <li>Replacement exact-fit: x{estimate.factors.replacementExactFitFactor.toFixed(2)}</li>
                <li>OEM serial factor: x{estimate.factors.oemSerialFactor.toFixed(2)}</li>
                <li>Custom connection: x{estimate.factors.customConnectionFactor.toFixed(2)}</li>
                <li>Deadline factor: x{estimate.factors.deadlineFactor.toFixed(2)}</li>
                <li>Quantity factor: x{estimate.factors.quantityFactor.toFixed(2)}</li>
                <li>Uncertainty: x{estimate.factors.uncertaintyFactor.toFixed(2)}</li>
              </ul>
            </article>
          </div>
        </aside>
      </div>

      {!isUsefulFieldFilled(form) ? <p className={styles.microHelp}>Запрос можно отправить даже с неполными данными.</p> : null}
    </section>
  );
}

