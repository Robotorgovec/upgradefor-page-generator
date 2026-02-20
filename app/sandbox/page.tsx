import Link from "next/link";

export default function SandboxIndexPage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px" }}>
      <h1>Sandbox</h1>
      <p>Изолированные превью-страницы для экспериментов.</p>
      <ul>
        <li>
          <Link href="/sandbox/sportpit">SportPit Preview</Link>
        </li>
      </ul>
    </div>
  );
}
