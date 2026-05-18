import type { Metadata } from "next";

import styles from "./page.module.css";

const assetBase = "/heat-exchangers/tz-light-v2";
const viewerUrl = `${assetBase}/index.html`;

const validationBadges = [
  "50/50 validation PASS",
  "API-review accepted",
  "V2.1 baseline locked",
  "Geometry unchanged",
];

const validationFacts = [
  ["Package", "V2.3 final visual polish"],
  ["Validation", "50/50 checks PASS"],
  ["API-review", "Accepted, blocking issues 0"],
  ["Geometry", "Locked from V2.1 baseline"],
  ["Web camera target", "570m 350m 0m"],
];

const assetFacts = [
  "Clean GLB",
  "Annotated GLB",
  "Exploded GLB",
  "Preview hero",
];

export const metadata: Metadata = {
  title: "Heat Exchanger TZ LIGHT V2.3 Demo | UPGRADE",
  description:
    "Validated 3D digital twin demo of a copper-aluminum HVAC heat exchanger.",
};

export default function HeatExchangerDemoPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <img
          className={styles.heroImage}
          src={`${assetBase}/preview_hero.webp`}
          alt="Heat Exchanger TZ LIGHT V2.3 copper-aluminum HVAC digital twin"
        />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Copper-aluminum HVAC digital twin</p>
          <h1>Heat Exchanger TZ LIGHT V2.3</h1>
          <p className={styles.lead}>
            Validated presentation demo for an engineered Cu-Al heat exchanger with
            clean, annotated, and exploded 3D views.
          </p>

          <div className={styles.badges} aria-label="Validation summary">
            {validationBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href={viewerUrl} target="_blank" rel="noreferrer">
              Open 3D viewer
            </a>
            <a className={styles.secondaryAction} href="/wikimarket/hvac/copper-aluminum-heat-exchangers#request">
              Request engineering review
            </a>
            <a className={styles.secondaryAction} href="#validation">
              View validation summary
            </a>
          </div>
        </div>
      </section>

      <section className={styles.viewerSection} aria-labelledby="viewer-title">
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Interactive demo</p>
          <h2 id="viewer-title">3D viewer</h2>
          <p>
            The embedded model uses the verified V2.3 web assets served from the
            site public folder.
          </p>
        </div>
        <div className={styles.viewerFrame}>
          <iframe
            title="Heat Exchanger TZ LIGHT V2.3 interactive 3D viewer"
            src={viewerUrl}
            loading="lazy"
            allow="fullscreen; xr-spatial-tracking"
          />
        </div>
      </section>

      <section id="validation" className={styles.infoGrid} aria-label="Validation and asset details">
        <article className={styles.panel}>
          <p className={styles.kicker}>Validation</p>
          <h2>Verified V2.3 package</h2>
          <dl className={styles.factList}>
            {validationFacts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className={styles.panel}>
          <p className={styles.kicker}>Assets</p>
          <h2>Included web files</h2>
          <ul className={styles.assetList}>
            {assetFacts.map((asset) => (
              <li key={asset}>{asset}</li>
            ))}
          </ul>
          <p className={styles.note}>
            DXF/PDF manufacturing-grade drawings are not part of this web demo.
            This page is a presentation demo, not a manufacturing release package.
          </p>
        </article>
      </section>
    </main>
  );
}
