import type { Metadata } from "next";

import CuAlManufacturersDirectoryPage from "../../../../../components/wikimarket/hvac/copper-aluminum-heat-exchangers/CuAlManufacturersDirectoryPage";

export const metadata: Metadata = {
  title: "Производители Cu-Al теплообменников для HVAC",
  description:
    "Проверенные производители, OEM и поставщики Cu-Al coils: роли, верификация, рейтинг, документы и профиль компании.",
};

export default function CuAlManufacturersPage() {
  return <CuAlManufacturersDirectoryPage />;
}
