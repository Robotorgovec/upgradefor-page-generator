"use client";

import { alarms, objectSummary } from "../../data/dispatchDemo";
import styles from "./DispatchDemo.module.css";

export default function DispatchTicketModal({ onClose }: { onClose: () => void }) {
  const alarm = alarms[0];
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.row}>
          <h2>Создать заявку из аварии</h2>
          <button className={styles.ghost} onClick={onClose} type="button">Закрыть</button>
        </div>
        <div className={styles.grid}>
          <p><b>Объект:</b> {objectSummary.name}</p>
          <p><b>Система:</b> {alarm.system}</p>
          <p><b>Оборудование:</b> {alarm.equipment}</p>
          <p><b>Параметры:</b> {alarm.message}, time {alarm.time}, source SCADA/BMS mock gateway</p>
          <p><b>Ошибка:</b> Физически невозможное значение перепада давления, alarm {alarm.id}</p>
          <p><b>Рекомендация:</b> {alarm.recommendation}</p>
          <div className={styles.skeleton} />
          <button className={styles.primary} type="button">Заявка подготовлена к отправке</button>
        </div>
      </div>
    </div>
  );
}
