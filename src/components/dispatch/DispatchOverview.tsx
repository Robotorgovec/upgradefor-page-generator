"use client";

import { kpis, liveSystems, objectSummary, trendData } from "../../data/dispatchDemo";
import DispatchAiPanel from "./DispatchAiPanel";
import DispatchAlarmCenter from "./DispatchAlarmCenter";
import styles from "./DispatchDemo.module.css";

function MiniChart() {
  const points = trendData.map((d, index) => `${(index / (trendData.length - 1)) * 100},${100 - (d.kw - 900) / 4}`).join(" ");
  return <svg className={styles.chart} viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={points} fill="none" stroke="#58e7ff" strokeWidth="3"/><polyline points="0,82 100,82" stroke="rgba(255,255,255,.12)"/></svg>;
}

export default function DispatchOverview({ onTicket }: { onTicket: () => void }) {
  return (
    <>
      <section className={`${styles.grid} ${styles.kpi}`}>
        {kpis.map((kpi) => (
          <article className={styles.card} key={kpi.label}>
            <span className={styles.pill}>{kpi.trend}</span>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <p className={styles.muted}>{kpi.label}</p>
          </article>
        ))}
      </section>
      <section className={`${styles.grid} ${styles.two}`}>
        <div className={styles.card}>
          <span className={styles.pill}>Digital Twin · {objectSummary.mode}</span>
          <h2>{objectSummary.name}</h2>
          <div className={styles.twin}>
            <div className={styles.building}>{Array.from({ length: 15 }).map((_, i) => <div className={styles.block} key={i} />)}</div>
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.pill}>Live status систем</span>
          <h2>Оперативный контур</h2>
          <div className={styles.list}>
            {liveSystems.map((system) => (
              <div className={styles.row} key={system.name}>
                <div><b>{system.name}</b><p className={styles.muted}>{system.note}</p><div className={styles.bar}><i style={{ width: `${system.load}%` }} /></div></div>
                <span className={styles.badge}>{system.status}</span>
              </div>
            ))}
          </div>
          <MiniChart />
        </div>
      </section>
      <section className={`${styles.grid} ${styles.two}`}>
        <DispatchAlarmCenter onTicket={onTicket} />
        <DispatchAiPanel />
      </section>
    </>
  );
}
