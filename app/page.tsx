import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

type HomeTemplate = {
  mainHtml: string;
  jsonLd: string[];
  headStyles: string[];
  layoutCss: string;
};

const MAIN_REGEX = /<main[^>]*>([\s\S]*?)<\/main>/i;
const STYLESHEET_LINK_REGEX =
  /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
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
    headStyles: Array.from(html.matchAll(STYLESHEET_LINK_REGEX))
      .map((match) => match[1].trim())
      .filter((href) => href && !href.includes("/assets/layout.css")),
    layoutCss: readPublicFile("assets/layout.css"),
  };
}

const homeTemplate = loadHomeTemplate();

export const metadata = {
  title: "UPGRADE INNOVATIONS — платформа для вендоров и внедрения",
  description:
    "Платформа для вендоров, пилотов и внедрения технологий. Вендоры получают структурированную витрину, поток профильных запросов и инструменты автоматизации. Компании получают проверяемые решения и понятный путь от запроса до пилота.",
};

export default function HomePage() {
  return (
    <>
      {homeTemplate.headStyles.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
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
    </>
  );
}
