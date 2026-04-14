import styles from "./CompanyProfilePage.module.css";

type MarkdownTextProps = {
  markdown: string;
};

function renderBlock(block: string, index: number) {
  if (block.startsWith("## ")) {
    return (
      <h3 key={index} className={styles.markdownHeading}>
        {block.slice(3).trim()}
      </h3>
    );
  }

  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.every((line) => line.startsWith("- "))) {
    return (
      <ul key={index} className={styles.markdownList}>
        {lines.map((line) => (
          <li key={line}>{line.slice(2).trim()}</li>
        ))}
      </ul>
    );
  }

  return (
    <p key={index} className={styles.markdownParagraph}>
      {lines.join(" ")}
    </p>
  );
}

export default function MarkdownText({ markdown }: MarkdownTextProps) {
  const blocks = markdown
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  return <div className={styles.markdown}>{blocks.map(renderBlock)}</div>;
}
