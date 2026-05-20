"use client";

import { equipmentPassport } from "../../data/dispatchDemo";
import styles from "./DispatchDemo.module.css";

export default function DispatchEquipmentCard({ onTicket }: { onTicket: () => void }) {
  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <div>
          <span className={styles.pill}>Паспорт оборудования</span>
          <h2>{equipmentPassport.id}</h2>
        </div>
        <div className={styles.tabs}>
          <button className={styles.primary} onClick={onTicket} type="button">Создать заявку</button>
          <button className={styles.ghost} type="button">AI-диагностика</button>
        </div>
      </div>
      <div className={`${styles.grid} ${styles.two}`}>
        <div className={styles.list}>
          <p><b>Модель:</b> {equipmentPassport.model}</p>
          <p><b>Локация:</b> {equipmentPassport.location}</p>
          <p><b>Статус:</b> {equipmentPassport.status}</p>
          <h3>SCADA-теги</h3>
          {equipmentPassport.tags.map((tag) => <span className={styles.mono} key={tag}>{tag}</span>)}
        </div>
        <div className={styles.list}>
          <h3>Документы</h3>{equipmentPassport.documents.map((item) => <div className={styles.row} key={item}>{item}</div>)}
          <h3>История аварий</h3>{equipmentPassport.alarmHistory.map((item) => <div className={styles.row} key={item}>{item}</div>)}
          <h3>Сервисная история</h3>{equipmentPassport.serviceHistory.map((item) => <div className={styles.row} key={item}>{item}</div>)}
        </div>
      </div>
    </section>
  );
}
