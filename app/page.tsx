import Script from "next/script";

import BodyClass from "../components/layout/BodyClass";
import Hero from "../components/Hero";
import TopNotice from "../components/TopNotice";
import { loadHtmlTemplate } from "../lib/html-template";

const homeTemplate = loadHtmlTemplate("index.html");

export const metadata = {
  title: "UPGRADE INNOVATIONS — открытая бета",
  description:
    "UPGRADE — платформа, где технологии находят применение. Каталог, публикации, пилоты и кейсы. Публичный статус и план развития.",
};

export default function HomePage() {
  // More robust hero start detection:
  // - tolerates attribute order
  // - tolerates class order and extra classes
  // - tolerates single/double quotes
  const heroStartMatch = homeTemplate.mainHtml.match(
    /<section\b[^>]*\bclass=(['"])(?:(?!\1).)*\bhero\b(?:(?!\1).)*\1[^>]*>/i,
  );
  const heroStartIndex = heroStartMatch?.index ?? -1;
  let heroEndIndex = -1;

  if (heroStartIndex !== -1) {
    const htmlFromHero = homeTemplate.mainHtml.slice(heroStartIndex);
    const sectionTagRegex = /<\/?section\b[^>]*>/gi;
    let match: RegExpExecArray | null;
    let depth = 0;
    while ((match = sectionTagRegex.exec(htmlFromHero))) {
      const tag = match[0];
      const isClose = /^<\/section\b/i.test(tag);
      const isOpen = /^<section\b/i.test(tag) && !isClose;

      if (isOpen) depth += 1;
      if (isClose) depth -= 1;

      if (depth === 0 && isClose) {
        heroEndIndex = heroStartIndex + match.index + tag.length;
        break;
      }
    }
  }

  const hasHero = heroStartIndex !== -1 && heroEndIndex !== -1;
  const beforeHero = hasHero ? homeTemplate.mainHtml.slice(0, heroStartIndex) : "";
  const afterHero = hasHero ? homeTemplate.mainHtml.slice(heroEndIndex) : "";

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
        <TopNotice />
        {hasHero ? (
          <>
            {beforeHero && (
              <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: beforeHero }} />
            )}
            <Hero />
            {afterHero && (
              <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: afterHero }} />
            )}
          </>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: homeTemplate.mainHtml }} />
        )}
      </div>
    </>
  );
}
