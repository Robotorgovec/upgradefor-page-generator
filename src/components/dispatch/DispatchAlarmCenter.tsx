"use client";

import { alarms } from "../../data/dispatchDemo";
import styles from "./DispatchDemo.module.css";

export default function DispatchAlarmCenter({ onTicket }: { onTicket: () => void }) {
  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <div>
          <span className={styles.pill}>Alarm Center</span>
          <h2>Активные аварии и события</h2>
        </div>
        <button className={styles.primary} onClick={onTicket} type="button">Создать заявку</button>
      </div>
      <div className={styles.list}>
        {alarms.map((alarm) => (
          <article key={alarm.id} className={`${styles.row} ${styles.alarm} ${alarm.severity === "warning" ? styles.warning : ""} ${alarm.severity === "event" ? styles.event : ""}`}>
            <div>
              <b>{alarm.message}</b>
              <p className={styles.muted}>{alarm.time} · {alarm.system} · {alarm.equipment}</p>
              <p>{alarm.recommendation}</p>
            </div>
            <span className={styles.badge}>{alarm.severity}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
