import type { Metadata } from "next";

import ObairVentilationSelectorPage from "../../../../components/wikimarket/hvac/obair-ventilation-selector/ObairVentilationSelectorPage";

export const metadata: Metadata = {
  title: "Подбор OBAIR по каталогу — BF / GXH / FG / ZKW",
  description:
    "Подбор вентиляционных и air-side установок OBAIR по параметрам проекта: BF, GXH, FG, ZKW. Предварительная рекомендация + заявка инженеру.",
};

export default function Page() {
  return <ObairVentilationSelectorPage />;
}
