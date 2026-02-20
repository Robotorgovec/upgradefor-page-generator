import Link from "next/link";

export default function SandboxIndexPage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px" }}>
      <h1>Sandbox</h1>
      <p style={{ color: "#21ff6a", fontWeight: 700 }}>SportPit Sandbox</p>
      <ul>
        <li>
          <Link href="/sandbox/sportpit">SportPit Strong Preview → /sandbox/sportpit</Link>
        </li>
      </ul>
    </div>
  );
}
