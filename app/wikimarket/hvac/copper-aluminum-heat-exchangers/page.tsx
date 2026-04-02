import type { Metadata } from "next";

import CuAlHeatExchangersPage from "../../../../components/wikimarket/hvac/copper-aluminum-heat-exchangers/CuAlHeatExchangersPage";

export const metadata: Metadata = {
  title: "Медно-алюминиевые теплообменники (Cu-Al) — проектирование, производство и поставка",
  description:
    "Калориферы, воздухоохладители, испарители и конденсаторы Cu-Al для вентиляции, ПУ, чиллеров, руфтопов и кондиционеров. Подбор по режимам, чертежи, документы и КП.",
};

export default function Page() {
  return <CuAlHeatExchangersPage />;
}
