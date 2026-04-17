import type { Metadata } from "next";

import ObairVentilationSelectorPage from "../../../../components/wikimarket/hvac/obair-ventilation-selector/ObairVentilationSelectorPage";

export const metadata: Metadata = {
  title: "OBAIR Ventilation Selector — BF / GXH / FG / ZKW",
  description:
    "Guided selector for OBAIR ventilation and air-side families (BF, GXH, FG, ZKW) with preliminary recommendation based on project inputs.",
};

export default function Page() {
  return <ObairVentilationSelectorPage />;
}
