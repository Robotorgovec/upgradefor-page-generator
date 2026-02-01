import fs from "fs";
import path from "path";

export default function Header() {
  const headerHtml = fs.readFileSync(
    path.join(process.cwd(), "public", "includes", "header.html"),
    "utf8"
  );

  return <header dangerouslySetInnerHTML={{ __html: headerHtml }} />;
}
