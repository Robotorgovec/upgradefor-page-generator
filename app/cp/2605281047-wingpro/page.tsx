import type { Metadata } from "next";

import WingproProposalPage from "../../../components/proposals/wingpro/WingproProposalPage";

const canonicalPath = "/cp/2605281047-wingpro";

export const metadata: Metadata = {
  title: "WinGPro commercial proposal | UPGRADE",
  description:
    "Коммерческое предложение WinGPro: IT/data и закупочно-координационное сопровождение от UPGRADE.",
  alternates: {
    canonical: canonicalPath,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <WingproProposalPage proposalPath={canonicalPath} />;
}
