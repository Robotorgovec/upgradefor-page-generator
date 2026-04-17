
"use client";

import { useEffect, useMemo, useState } from "react";

import { familyCards } from "./data";
import { getRecommendation } from "./mapping";
import styles from "./obair-ventilation-selector.module.css";
import type {
  ApiRecommendResponse,
  ComplexityLevel,
  IndustryType,
  MountingType,
  SelectorInputs,
  TaskType,
} from "./types";

const defaultInputs: SelectorInputs = {
  taskType: "ventilation-only",
  airflowM3h: 12000,
  staticPressurePa: 600,
  needHeatRecovery: false,
  needCoil: false,
  mountingType: "indoor-standard",
  industry: "other",
  complexity: "simple-box",
};

const selectorDraftStorageKey = "obair_selector_draft_v1";

function getStatusLabel(status: ApiRecommendResponse["status"]): string {
  if (status === "matched-standard") return "Подобран стандартный типоразмер";
  if (status === "matched-with-warning") return "Предварительно подходит, нужна инженерная проверка";
  if (status === "no-standard-match") return "Стандартного решения нет";
  return "Нужна конфигурация производителя";
}

export default function ObairSelectorClient() {
  const [inputs, setInputs] = useState<SelectorInputs>(defaultInputs);
  const localRecommendation = useMemo(() => getRecommendation(inputs), [inputs]);
  const [apiRecommendation, setApiRecommendation] = useState<ApiRecommendResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [requestState, setRequestState] = useState<{
    status: "idle" | "sending" | "done" | "error";
    message?: string;
  }>({
    status: "idle",
  });

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(selectorDraftStorageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<SelectorInputs>;
      setInputs((prev) => ({ ...prev, ...parsed }));
    } catch {
      // keep defaults when draft parsing fails
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(selectorDraftStorageKey, JSON.stringify(inputs));
    } catch {
      // ignore write errors in restricted environments
    }
  }, [inputs]);

  useEffect(() => {
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setApiError(null);

      try {
        const response = await fetch("/api/selector/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskType: inputs.taskType,
            airflowM3h: inputs.airflowM3h,
            staticPressurePa: inputs.staticPressurePa,
            needHeatRecovery: inputs.needHeatRecovery,
            needCoil: inputs.needCoil,
            mountingType: inputs.mountingType,
            industry: inputs.industry,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorPayload = (await response.json().catch(() => ({}))) as { message?: string };
          setApiError(errorPayload.message ?? "Не удалось получить API-рекомендацию");
          setApiRecommendation(null);
          return;
        }

        const payload = (await response.json()) as ApiRecommendResponse;
        setApiRecommendation(payload);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setApiRecommendation(null);
        setApiError("API недоступен, показана локальная fallback-рекомендация");
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [inputs]);

  const familyId = apiRecommendation?.recommendedFamily.code ?? localRecommendation.familyId;
  const recommendedCard = familyCards.find((card) => card.id === familyId);

  const whyThisFits = apiRecommendation
    ? [
        ...apiRecommendation.warnings,
        ...(apiRecommendation.primaryModel
          ? [`Score: ${apiRecommendation.primaryModel.score.toFixed(2)} for ${apiRecommendation.primaryModel.displayName}`]
          : []),
      ]
    : localRecommendation.reason;

  const scenarios = apiRecommendation
    ? apiRecommendation.primaryModel
      ? [
          `Primary model: ${apiRecommendation.primaryModel.displayName}`,
          `Airflow range: ${apiRecommendation.primaryModel.airflowRangeM3h[0]}–${apiRecommendation.primaryModel.airflowRangeM3h[1]} m³/h`,
          ...apiRecommendation.alternatives.map(
            (item) => `Alternative: ${item.displayName} (score ${item.score.toFixed(2)})`
          ),
        ]
      : ["Стандартный типоразмер не определён. Используйте запрос инженеру."]
    : localRecommendation.scenarios;

  const clarificationList =
    apiRecommendation?.clarificationChecklist ?? localRecommendation.clarifyForEngineering;

  const handleCreateRequest = async () => {
    setRequestState({ status: "sending" });

    try {
      const response = await fetch("/api/selector/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputPayload: {
            taskType: inputs.taskType,
            airflowM3h: inputs.airflowM3h,
            staticPressurePa: inputs.staticPressurePa,
            needHeatRecovery: inputs.needHeatRecovery,
            needCoil: inputs.needCoil,
            mountingType: inputs.mountingType,
            industry: inputs.industry,
          },
          resultStatus: apiRecommendation?.status ?? "matched-with-warning",
          selectedModelId: apiRecommendation?.primaryModel?.id,
          selectedFamilyCode: familyId,
          shortlist: apiRecommendation
            ? [apiRecommendation.primaryModel, ...apiRecommendation.alternatives]
                .filter(Boolean)
                .map((item) => ({
                  modelId: item?.id,
                  score: item?.score,
                  warnings: item?.warnings,
                }))
            : undefined,
        }),
      });

      if (!response.ok) {
        setRequestState({
          status: "error",
          message: "Не удалось сохранить запрос. Попробуйте позже.",
        });
        return;
      }

      const payload = (await response.json()) as { requestId?: string };
      setRequestState({
        status: "done",
        message: `Запрос сохранён: ${payload.requestId ?? "без ID"}`,
      });
    } catch {
      setRequestState({
        status: "error",
        message: "Сетевая ошибка при отправке запроса",
      });
    }
  };

  return (
    <section className={styles.selectorSection} id="selector">
      <div className={styles.selectorHeader}>
        <h2>Interactive OBAIR Selector</h2>
        <p>
          Ответьте на ключевые вопросы по проекту — и получите рекомендованное семейство OBAIR без
          перезагрузки страницы.
        </p>
      </div>

      <div className={styles.selectorGrid}>
        <form className={styles.form}>
          <label>
            Тип задачи
            <select
              value={inputs.taskType}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  taskType: event.target.value as TaskType,
                }))
              }
            >
              <option value="ventilation-only">Только вентиляция</option>
              <option value="fresh-exhaust-heat-recovery">Приток/вытяжка с рекуперацией</option>
              <option value="cooling-heating-air">Охлаждение/нагрев воздуха</option>
              <option value="modular-ahu-cleanroom">
                Модульная AHU / чистое помещение / сложная система
              </option>
            </select>
          </label>

          <label>
            Расход воздуха, m³/h
            <input
              type="number"
              min={500}
              step={100}
              value={inputs.airflowM3h}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  airflowM3h: Number(event.target.value) || defaultInputs.airflowM3h,
                }))
              }
            />
          </label>

          <label>
            Требуемое статическое давление, Pa
            <input
              type="number"
              min={50}
              step={50}
              value={inputs.staticPressurePa}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  staticPressurePa:
                    Number(event.target.value) || defaultInputs.staticPressurePa,
                }))
              }
            />
          </label>

          <label>
            Нужен ли heat recovery
            <select
              value={inputs.needHeatRecovery ? "yes" : "no"}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  needHeatRecovery: event.target.value === "yes",
                }))
              }
            >
              <option value="no">Нет</option>
              <option value="yes">Да</option>
            </select>
          </label>

          <label>
            Нужен ли cooling/heating coil
            <select
              value={inputs.needCoil ? "yes" : "no"}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  needCoil: event.target.value === "yes",
                }))
              }
            >
              <option value="no">Нет</option>
              <option value="yes">Да</option>
            </select>
          </label>

          <label>
            Тип монтажа / ограничение по месту
            <select
              value={inputs.mountingType}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  mountingType: event.target.value as MountingType,
                }))
              }
            >
              <option value="indoor-standard">Стандартный indoor монтаж</option>
              <option value="limited-plant-room">Ограниченная машинная зона</option>
              <option value="ceiling-or-tight-space">Потолочная / очень компактная зона</option>
              <option value="rooftop-or-technical-floor">Rooftop / технический этаж</option>
            </select>
          </label>

          <label>
            Объект / отрасль
            <select
              value={inputs.industry}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  industry: event.target.value as IndustryType,
                }))
              }
            >
              <option value="medicine">Медицина</option>
              <option value="biopharma">Биофарма</option>
              <option value="electronics">Электроника</option>
              <option value="mall-hotel">Mall / Hotel</option>
              <option value="workshop-factory">Workshop / Factory</option>
              <option value="other">Другое</option>
            </select>
          </label>

          <label>
            Степень сложности
            <select
              value={inputs.complexity}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  complexity: event.target.value as ComplexityLevel,
                }))
              }
            >
              <option value="simple-box">Простой box ventilation</option>
              <option value="cabinety-unit">Cabinet unit</option>
              <option value="modular-ahu">Modular AHU</option>
            </select>
          </label>
        </form>

        <aside className={styles.resultCard} aria-live="polite">
          <p className={styles.resultKicker}>Recommended family</p>
          <h3>{familyId}</h3>
          <p>{recommendedCard?.title}</p>

          {apiRecommendation ? <p>Status: {getStatusLabel(apiRecommendation.status)}</p> : null}
          {apiRecommendation?.manufacturerRequestRequired ? (
            <p>По этому запросу требуется заявка производителю (manufacturer review required).</p>
          ) : null}
          {apiError ? <p>{apiError}</p> : null}

          <h4>Why this family fits</h4>
          <ul>
            {whyThisFits.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>

          <h4>Typical suitable scenarios</h4>
          <ul>
            {scenarios.map((scenario) => (
              <li key={scenario}>{scenario}</li>
            ))}
          </ul>

          <h4>Что ещё уточнить для точного инженерного подбора</h4>
          <ul>
            {clarificationList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className={styles.resultCtas}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleCreateRequest}
              disabled={requestState.status === "sending"}
            >
              {requestState.status === "sending" ? "Отправка..." : "Отправить запрос"}
            </button>

            <a href="#final-cta" className={styles.secondaryBtn}>
              Получить консультацию
            </a>
          </div>

          {requestState.message ? <p>{requestState.message}</p> : null}
        </aside>
      </div>
    </section>
  );
}