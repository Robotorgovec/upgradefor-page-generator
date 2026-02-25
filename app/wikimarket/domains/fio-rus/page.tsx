import Script from "next/script";

import BodyClass from "../../../../components/layout/BodyClass";
import { loadHtmlTemplate } from "../../../../lib/html-template";

const template = loadHtmlTemplate("wikimarket/domains/fio-rus/index.html");

export const metadata = {
  title: "Именной домен .РФ для {{user_name}} | UpgradeFor",
  description:
    "Персональный домен .РФ с регистрацией, настройкой и поддержкой для вашего проекта.",
};

export default function FioRusDomainPage() {
  return (
    <>
      <BodyClass className="fio-rus-landing" />

      <div className="fio-rus-landing" dangerouslySetInnerHTML={{ __html: template.mainHtml }} />

      {template.inlineScripts.map((script, index) => (
        <Script
          key={`fio-rus-inline-${index}`}
          id={`fio-rus-inline-${index}`}
          strategy="afterInteractive"
        >
          {script}
        </Script>
      ))}
    </>
  );
}
