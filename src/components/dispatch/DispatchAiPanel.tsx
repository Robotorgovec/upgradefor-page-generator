import { aiInsights } from "../../data/dispatchDemo";
import styles from "./DispatchDemo.module.css";

export default function DispatchAiPanel() {
  return (
    <section className={`${styles.card} ${styles.ai}`}>
      <span className={styles.pill}>AI Panel · mock inference</span>
      <h2>AI-рекомендация по DP 6553.5 bar</h2>
      <p>Вероятная причина — не гидравлическая авария, а ошибка преобразования значения: неправильный scaling, смещённый Modbus register, неверный диапазон sensor или некорректная formula в SCADA.</p>
      <ol>
        <li>Сверить raw value регистра <span className={styles.mono}>4x40117</span> с Modbus map.</li>
        <li>Проверить коэффициент масштабирования и endian/word order.</li>
        <li>Измерить сигнал датчика на месте и сравнить с диапазоном паспорта.</li>
        <li>Временно исключить DP из управляющей формулы до подтверждения.</li>
      </ol>
      <div className={styles.list}>{aiInsights.map((insight) => <div className={styles.row} key={insight}>{insight}</div>)}</div>
    </section>
  );
}
