"use client";

import { useMemo, useState } from "react";
import { dispatchSections, objectSummary, type DispatchSection } from "../../data/dispatchDemo";
import DispatchAiPanel from "./DispatchAiPanel";
import DispatchAlarmCenter from "./DispatchAlarmCenter";
import DispatchCooling from "./DispatchCooling";
import DispatchEquipmentCard from "./DispatchEquipmentCard";
import DispatchOverview from "./DispatchOverview";
import DispatchSidebar from "./DispatchSidebar";
import DispatchTicketModal from "./DispatchTicketModal";
import DispatchVentilation from "./DispatchVentilation";
import styles from "./DispatchDemo.module.css";

export default function DispatchDemo() {
  const [active, setActive] = useState<DispatchSection>("overview");
  const [ticketOpen, setTicketOpen] = useState(false);
  const clock = useMemo(() => objectSummary.updatedAt, []);

  const content = active === "overview" ? <DispatchOverview onTicket={() => setTicketOpen(true)} />
    : active === "cooling" || active === "pumps" ? <DispatchCooling />
    : active === "ventilation" ? <DispatchVentilation />
    : active === "alarms" ? <DispatchAlarmCenter onTicket={() => setTicketOpen(true)} />
    : active === "equipment" ? <DispatchEquipmentCard onTicket={() => setTicketOpen(true)} />
    : active === "ai" ? <DispatchAiPanel />
    : active === "tickets" ? <DispatchAlarmCenter onTicket={() => setTicketOpen(true)} />
    : <section className={styles.card}><span className={styles.pill}>{active.toUpperCase()}</span><h2>Раздел готов к демонстрации</h2><p>Моковый real-time экран для инженерных систем объекта.</p></section>;

  return (
    <div className={styles.shell}>
      <div className={styles.mobileTabs}>{dispatchSections.map((s) => <button className={active === s.id ? styles.primary : styles.ghost} key={s.id} onClick={() => setActive(s.id)} type="button">{s.label}</button>)}</div>
      <div className={styles.wrap}>
        <DispatchSidebar active={active} onSelect={setActive} />
        <main className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <span className={styles.live}><i className={styles.dot} /> LIVE MOCK DATA</span>
              <h1>Медиадиспетчеризация Asia Park Astana</h1>
              <p className={styles.muted}>{objectSummary.address} · {objectSummary.area} · {objectSummary.floors}</p>
            </div>
            <div><span className={styles.pill}>Обновлено {clock}</span></div>
          </header>
          {content}
        </main>
      </div>
      {ticketOpen ? <DispatchTicketModal onClose={() => setTicketOpen(false)} /> : null}
    </div>
  );
}
