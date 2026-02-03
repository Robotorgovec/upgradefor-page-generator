import Script from "next/script";

import BodyClass from "../components/layout/BodyClass";
import HomeNotice from "../components/home/HomeNotice";
import { loadHtmlTemplate } from "../lib/html-template";

const homeTemplate = loadHtmlTemplate("index.html");

export const metadata = {
  title: "UPGRADE INNOVATIONS — открытая бета",
  description:
    "UPGRADE — платформа, где технологии находят применение. Каталог, публикации, пилоты и кейсы. Публичный статус и план развития.",
};

export default function HomePage() {
  return (
    <>
      {homeTemplate.styles.map((style, index) => (
        <style key={`home-style-${index}`} dangerouslySetInnerHTML={{ __html: style }} />
      ))}
      {homeTemplate.jsonLd.map((data, index) => (
        <Script
          key={`home-jsonld-${index}`}
          id={`home-jsonld-${index}`}
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {data}
        </Script>
      ))}
      <BodyClass className="is-home" />
      <div className="is-home">
        <HomeNotice />
        <div dangerouslySetInnerHTML={{ __html: homeTemplate.mainHtml }} />
      </div>
    </>
  );
}
