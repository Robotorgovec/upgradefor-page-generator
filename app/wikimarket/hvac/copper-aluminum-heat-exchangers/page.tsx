import type { Metadata } from "next";

import { CopperAluminumHeatExchangerQuiz } from "../../../../components/learning-game/copper-aluminum-heat-exchanger-quiz";
import CuAlHeatExchangersPage from "../../../../components/wikimarket/hvac/copper-aluminum-heat-exchangers/CuAlHeatExchangersPage";
import { getCuAlManufacturerCards } from "../../../../lib/wikimarket/company-catalog";

export const metadata: Metadata = {
  title: "Медно-алюминиевые теплообменники (Cu-Al) — проектирование, производство и поставка",
  description:
    "Калориферы, воздухоохладители, испарители и конденсаторы Cu-Al для вентиляции, ПУ, чиллеров, руфтопов и кондиционеров. Подбор под режимы, чертежи, документы, КП.",
};

export default function Page() {
  return (
    <>
      <CuAlHeatExchangersPage manufacturerCards={getCuAlManufacturerCards()} />
      <section id="quiz-section">
        <h2>Проверьте понимание медно-алюминиевых теплообменников</h2>
        <p>
          Короткий обучающий блок: 10 вопросов по конструкции Cu-Al секций, влиянию загрязнений,
          airflow-side рискам и базовым принципам эксплуатации.
        </p>
        <CopperAluminumHeatExchangerQuiz />
      </section>
    </>
  );
}
