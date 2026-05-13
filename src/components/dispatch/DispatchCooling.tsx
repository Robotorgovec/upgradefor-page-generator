import { chillers, pumpGroups } from "../../data/dispatchDemo";
import styles from "./DispatchDemo.module.css";

export default function DispatchCooling() {
  return (
    <section className={styles.grid}>
      <div className={styles.card}>
        <span className={styles.pill}>Холодоснабжение · 5 чиллерных позиций</span>
        <h2>Чиллеры, вода/гликоль, фанкойлы и вентиляция</h2>
        <div className={`${styles.grid} ${styles.three}`}>
          {chillers.map((chiller) => (
            <article className={styles.card} key={chiller.id}>
              <div className={styles.row}><b>{chiller.id}</b><span className={styles.badge}>{chiller.status}</span></div>
              <p>{chiller.model}</p>
              <div className={styles.bar}><i style={{ width: `${chiller.load}%` }} /></div>
              <p className={styles.muted}>Load {chiller.load}% · Supply {chiller.supply} · Return {chiller.return} · Flow {chiller.flow}</p>
            </article>
          ))}
        </div>
      </div>
      <div className={styles.card}>
        <span className={styles.pill}>4 насосные группы · около 10 насосов</span>
        <div className={`${styles.grid} ${styles.two}`}>
          {pumpGroups.map((group) => (
            <article className={styles.row} key={group.name}>
              <div>
                <b>{group.name}</b><p className={styles.muted}>{group.medium}</p>
                <p>{group.pumps.join(" · ")}</p>
              </div>
              <span className={styles.badge}>{group.hz.join("/")} Hz</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
