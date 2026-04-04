import fs from "fs";
import path from "path";

type HtmlTemplate = {
  bodyClass?: string;
  mainHtml: string;
  styles: string[];
  jsonLd: string[];
  inlineScripts: string[];
};

const MAIN_REGEX = /<main[^>]*>([\s\S]*?)<\/main>/i;
const BODY_REGEX = /<body[^>]*>([\s\S]*?)<\/body>/i;
const BODY_CLASS_REGEX = /<body[^>]*class=["']([^"']+)["'][^>]*>/i;
const STYLE_REGEX = /<style[^>]*>([\s\S]*?)<\/style>/gi;
const JSON_LD_REGEX =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const SCRIPT_REGEX = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

export function loadHtmlTemplate(relativePath: string): HtmlTemplate {
  const filePath = path.join(process.cwd(), "public", relativePath);
  const html = fs.readFileSync(filePath, "utf8");

  const mainMatch = html.match(MAIN_REGEX);
  if (!mainMatch) {
    throw new Error(`Main tag not found in ${relativePath}`);
  }

  const styles = Array.from(html.matchAll(STYLE_REGEX))
    .map((match) => match[1].trim())
    .filter(Boolean);

  const jsonLd = Array.from(html.matchAll(JSON_LD_REGEX))
    .map((match) => match[1].trim())
    .filter(Boolean);

  const bodyClass = html.match(BODY_CLASS_REGEX)?.[1];

  const bodyMatch = html.match(BODY_REGEX);
  const bodyHtml = bodyMatch ? bodyMatch[1] : "";
  const inlineScripts = Array.from(bodyHtml.matchAll(SCRIPT_REGEX))
    .filter((match) => {
      const attrs = match[1] ?? "";
      const content = match[2] ?? "";
      if (attrs.includes("type=\"application/ld+json\"")) return false;
      if (attrs.includes("application/ld+json")) return false;
      if (attrs.includes("src=") && attrs.includes("load-layout.js")) return false;
      if (attrs.includes("src=") && attrs.includes("/assets/load-layout.js")) return false;
      if (!content.trim()) return false;
      return true;
    })
    .map((match) => match[2].trim());

  return {
    bodyClass,
    mainHtml: mainMatch[1].trim(),
    styles,
    jsonLd,
    inlineScripts,
  };
}
