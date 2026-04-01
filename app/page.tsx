import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

type HomeTemplate = {
  mainHtml: string;
  jsonLd: string[];
  layoutCss: string;
  layoutJs: string;
};

const MAIN_REGEX = /<main[^>]*>([\s\S]*?)<\/main>/i;
const JSON_LD_REGEX =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function readPublicFile(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), "public", relativePath), "utf8");
}

function loadHomeTemplate(): HomeTemplate {
  const html = readPublicFile("index.html");
  const mainMatch = html.match(MAIN_REGEX);

  if (!mainMatch) {
    throw new Error("Main tag not found in public/index.html");
  }

  return {
    mainHtml: mainMatch[1].trim(),
    jsonLd: Array.from(html.matchAll(JSON_LD_REGEX))
      .map((match) => match[1].trim())
      .filter(Boolean),
    layoutCss: readPublicFile("assets/layout.css"),
    layoutJs: readPublicFile("assets/load-layout.js"),
  };
}

const homeTemplate = loadHomeTemplate();

export const metadata = {
  title: "UPGRADE INNOVATIONS - открытая бета",
  description:
    "UPGRADE - платформа для вендоров, пилотов и внедрения технологий. Партнёрские витрины, маршрутизация запросов и AI-поддержка.",
};

export default function HomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: homeTemplate.layoutCss }} />
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
      <div className="is-home">
        <div dangerouslySetInnerHTML={{ __html: homeTemplate.mainHtml }} />
      </div>
      <Script id="upgr-home-layout" strategy="afterInteractive">
        {homeTemplate.layoutJs}
      </Script>
    </>
  );
}
