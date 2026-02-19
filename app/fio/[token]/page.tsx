import Script from "next/script";

import { loadHtmlTemplate } from "../../../lib/html-template";

const template = loadHtmlTemplate("wikimarket/domains/fio-rus/index.html");

export const metadata = {
  title: "Персональный пример ФИО-домена | UpgradeFor",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FioSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      {template.styles.map((style, index) => (
        <style
          key={`fio-share-style-${index}`}
          dangerouslySetInnerHTML={{ __html: style }}
        />
      ))}

      <Script id="fio-share-token" strategy="beforeInteractive">
        {`window.__fioShareToken = ${JSON.stringify(token)};`}
      </Script>

      <div dangerouslySetInnerHTML={{ __html: template.mainHtml }} />

      {template.inlineScripts.map((script, index) => (
        <Script
          key={`fio-share-inline-${index}`}
          id={`fio-share-inline-${index}`}
          strategy="afterInteractive"
        >
          {script}
        </Script>
      ))}
    </>
  );
}
