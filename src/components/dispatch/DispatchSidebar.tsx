"use client";

import { dispatchSections, type DispatchSection } from "../../data/dispatchDemo";
import styles from "./DispatchDemo.module.css";

export default function DispatchSidebar({ active, onSelect }: { active: DispatchSection; onSelect: (section: DispatchSection) => void }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo} />
        <div>
          <strong>UPGRADE Dispatch</strong>
          <br />
          <small>Asia Park Astana</small>
        </div>
      </div>
      <nav className={styles.nav} aria-label="Dispatch demo sections">
        {dispatchSections.map((section) => (
          <button key={section.id} className={active === section.id ? styles.active : ""} onClick={() => onSelect(section.id)} type="button">
            <span>{section.label}</span>
            {section.badge ? <span className={styles.badge}>{section.badge}</span> : null}
          </button>
        ))}
      </nav>
    </aside>
  );
}
