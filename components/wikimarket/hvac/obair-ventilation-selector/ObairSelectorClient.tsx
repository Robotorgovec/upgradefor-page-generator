"use client";

import { useMemo, useState } from "react";

import { familyCards } from "./data";
import { getRecommendation } from "./mapping";
import styles from "./obair-ventilation-selector.module.css";
import type { ComplexityLevel, IndustryType, MountingType, SelectorInputs, TaskType } from "./types";

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

export default function ObairSelectorClient() {
  const [inputs, setInputs] = useState<SelectorInputs>(defaultInputs);
  const recommendation = useMemo(() => getRecommendation(inputs), [inputs]);
  const recommendedCard = familyCards.find((card) => card.id === recommendation.familyId);

  return (
    <section className={styles.selectorSection} id="selector">
      <div className={styles.selectorHeader}>
        <h2>Interactive OBAIR Selector</h2>
        <p>
          Ответьте на ключевые вопросы по проекту — и получите рекомендованное семейство OBAIR без перезагрузки
          страницы.
        </p>
      </div>

      <div className={styles.selectorGrid}>
        <form className={styles.form}>
          <label>
            Тип задачи
            <select
              value={inputs.taskType}
              onChange={(event) => setInputs((prev) => ({ ...prev, taskType: event.target.value as TaskType }))}
            >
              <option value="ventilation-only">Только вентиляция</option>
              <option value="fresh-exhaust-heat-recovery">Приток/вытяжка с рекуперацией</option>
              <option value="cooling-heating-air">Охлаждение/нагрев воздуха</option>
              <option value="modular-ahu-cleanroom">Модульная AHU / чистое помещение / сложная система</option>
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
                setInputs((prev) => ({ ...prev, airflowM3h: Number(event.target.value) || defaultInputs.airflowM3h }))
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
                setInputs((prev) => ({ ...prev, staticPressurePa: Number(event.target.value) || defaultInputs.staticPressurePa }))
              }
            />
          </label>

          <label>
            Нужен ли heat recovery
            <select
              value={inputs.needHeatRecovery ? "yes" : "no"}
              onChange={(event) => setInputs((prev) => ({ ...prev, needHeatRecovery: event.target.value === "yes" }))}
            >
              <option value="no">Нет</option>
              <option value="yes">Да</option>
            </select>
          </label>

          <label>
            Нужен ли cooling/heating coil
            <select
              value={inputs.needCoil ? "yes" : "no"}
              onChange={(event) => setInputs((prev) => ({ ...prev, needCoil: event.target.value === "yes" }))}
            >
              <option value="no">Нет</option>
              <option value="yes">Да</option>
            </select>
          </label>

          <label>
            Тип монтажа / ограничение по месту
            <select
              value={inputs.mountingType}
              onChange={(event) => setInputs((prev) => ({ ...prev, mountingType: event.target.value as MountingType }))}
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
              onChange={(event) => setInputs((prev) => ({ ...prev, industry: event.target.value as IndustryType }))}
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
              onChange={(event) => setInputs((prev) => ({ ...prev, complexity: event.target.value as ComplexityLevel }))}
            >
              <option value="simple-box">Простой box ventilation</option>
              <option value="cabinety-unit">Cabinet unit</option>
              <option value="modular-ahu">Modular AHU</option>
            </select>
          </label>
        </form>

        <aside className={styles.resultCard} aria-live="polite">
          <p className={styles.resultKicker}>Recommended family</p>
          <h3>{recommendation.familyId}</h3>
          <p>{recommendedCard?.title}</p>

          <h4>Why this family fits</h4>
          <ul>
            {recommendation.reason.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>

          <h4>Typical suitable scenarios</h4>
          <ul>
            {recommendation.scenarios.map((scenario) => (
              <li key={scenario}>{scenario}</li>
            ))}
          </ul>

          <h4>Что ещё уточнить для точного инженерного подбора</h4>
          <ul>
            {recommendation.clarifyForEngineering.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className={styles.resultCtas}>
            <a href="#final-cta" className={styles.primaryBtn}>
              Отправить запрос
            </a>
            <a href="#final-cta" className={styles.secondaryBtn}>
              Получить консультацию
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
