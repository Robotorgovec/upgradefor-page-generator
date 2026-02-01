import fs from "fs";
import path from "path";

export default function Sidebar() {
  const menuHtml = fs.readFileSync(
    path.join(process.cwd(), "public", "includes", "menu.html"),
    "utf8"
  );

  return <aside className="sidebar" dangerouslySetInnerHTML={{ __html: menuHtml }} />;
}
