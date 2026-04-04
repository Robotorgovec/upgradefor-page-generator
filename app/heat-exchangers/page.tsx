import { loadHtmlTemplate } from "../../lib/html-template";

const redirectTemplate = loadHtmlTemplate("heat-exchangers/index.html");

export const metadata = {
  title: "Heat Exchangers | UPGR Upgrade Innovations",
  description:
    "Heat exchanger services and diagnostics. Redirecting to the WikiMarket heat exchangers page.",
};

export default function HeatExchangersRedirectPage() {
  return (
    <div dangerouslySetInnerHTML={{ __html: redirectTemplate.mainHtml }} />
  );
}
