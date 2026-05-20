import { ventilationUnits } from "../../data/dispatchDemo";
import styles from "./DispatchDemo.module.css";

export default function DispatchVentilation() {
  return (
    <section className={styles.card}>
      <span className={styles.pill}>Вентиляция · верхние технические отметки</span>
      <h2>Венткамеры Asia Park Astana</h2>
      <div className={`${styles.grid} ${styles.two}`}>
        {ventilationUnits.map((unit) => (
          <article className={styles.card} key={unit.id}>
            <div className={styles.row}><b>{unit.id}</b><span className={styles.badge}>{unit.status}</span></div>
            <p><b>Отметка:</b> {unit.mark}</p>
            <p><b>Локация:</b> {unit.location}</p>
            <p><b>Расход:</b> {unit.airflow} · CO₂ {unit.co2} ppm</p>
            <div className={styles.bar}><i style={{ width: `${Math.min(95, unit.co2 / 9)}%` }} /></div>
          </article>
        ))}
      </div>
    </section>
  );
}
