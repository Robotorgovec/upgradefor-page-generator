import Script from "next/script";

import BodyClass from "../components/layout/BodyClass";
import { loadHtmlTemplate } from "../lib/html-template";

const homeTemplate = loadHtmlTemplate("index.html");
const homeMobileOverrides = `
  @media (max-width: 520px) {
    .homePage .wrap {
      padding-left: 10px;
      padding-right: 10px;
    }

    .homePage .hero .cta {
      width: 100%;
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
      margin-top: 16px;
    }

    .homePage .btn {
      display: flex;
      width: 100%;
      max-width: 360px;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;
    }

    .homePage .card {
      padding-left: 12px;
      padding-right: 12px;
    }

    .homePage section {
      padding-top: 24px;
      padding-bottom: 24px;
    }

    .homePage .section-title {
      margin-bottom: 14px;
    }

    .homePage .grid,
    .homePage .cards-3,
    .homePage .cards-6 {
      gap: 14px;
    }
  }
`;

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
      <style dangerouslySetInnerHTML={{ __html: homeMobileOverrides }} />
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
      <div className="is-home homePage">
        <div dangerouslySetInnerHTML={{ __html: homeTemplate.mainHtml }} />
      </div>
    </>
  );
}
