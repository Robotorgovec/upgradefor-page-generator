"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  alarmEvents,
  dispatchAiInsights,
  dispatchEquipmentNodes,
  realtimeMetrics,
  replacementWorkflow,
  trendSeries,
  type DispatchAlarmEvent,
  type DispatchEquipmentNode,
  type DispatchTrendKey,
} from "../../data/dispatchDemo";
import DispatchTrendsPanel from "./DispatchTrendsPanel";

const bottomNavigation = ["Обзор", "Объект", "Оборудование", "Тренды", "Аварии", "Отчёты", "Заявки", "Настройки"];
const passportTabs = ["Паспорт", "Параметры", "ТО", "Документы"];
const controlButtons = ["Пуск", "Стоп", "Auto/Manual", "Изменить уставку", "Сброс аварии"];

type ModalState = "readonly" | "ticket" | null;

function severityLabel(severity: DispatchAlarmEvent["severity"]) {
  if (severity === "critical") return "Авария";
  if (severity === "warning") return "Предупреждение";
  return "ТО";
}

export default function DispatchDashboard() {
  const [selectedId, setSelectedId] = useState("chiller-ch1");
  const [selectedTrendKey, setSelectedTrendKey] = useState<DispatchTrendKey>("temperature");
  const [passportTab, setPassportTab] = useState(passportTabs[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isReplacementOpen, setIsReplacementOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [aiAnswer, setAiAnswer] = useState("");
  const [demoTime, setDemoTime] = useState("17.05.2026 10:45");

  useEffect(() => {
    document.body.classList.add("is-dispatch-demo");
    document.body.classList.remove("menu-open");

    return () => {
      document.body.classList.remove("is-dispatch-demo");
    };
  }, []);

  const selectedEquipment =
    dispatchEquipmentNodes.find((node) => node.id === selectedId) ?? dispatchEquipmentNodes[0];

  const relatedAlarms = useMemo(
    () => alarmEvents.filter((alarm) => selectedEquipment.relatedAlarmIds.includes(alarm.id)),
    [selectedEquipment],
  );

  const notificationItems = alarmEvents.slice(0, 3);

  const selectEquipment = (node: DispatchEquipmentNode) => {
    setSelectedId(node.id);
    setSelectedTrendKey(node.trendKey);
    setPassportTab(passportTabs[0]);
    setIsDrawerOpen(true);
  };

  const openAlarm = (alarm: DispatchAlarmEvent) => {
    const node = dispatchEquipmentNodes.find((item) => item.id === alarm.equipmentId);
    if (node) {
      selectEquipment(node);
    }
  };

  const handleAiSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAiAnswer(
      "AI анализирует mock-данные. Для реального ответа требуется подключение к BMS/SCADA historian.",
    );
  };

  return (
    <div className="dispatchShell">
      <div className="dispatchGrid" aria-label="Demo dashboard диспетчеризации">
        <header className="dispatchHeader panel">
          <div>
            <p className="eyebrow">UPGRADE Dispatch / Asia Park demo</p>
            <h1>Интеллектуальная диспетчерская объекта</h1>
          </div>
          <div className="headerStatus">
            <span>Связь: Онлайн</span>
            <strong>Simulated gateway</strong>
            <b>DEMO MODE</b>
          </div>
        </header>

        <aside className="leftRail">
          <section className="panel">
            <div className="panelHeading">
              <p className="eyebrow">Live telemetry</p>
              <h2>Мониторинг в реальном времени</h2>
            </div>
            <div className="kpiGrid">
              {realtimeMetrics.map((metric) => (
                <article className="kpiCard" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.state} · {metric.trend}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panelHeading">
              <p className="eyebrow">Events</p>
              <h2>Аварии и события</h2>
            </div>
            <div className="eventList">
              {alarmEvents.map((alarm) => (
                <button
                  className={`eventItem ${alarm.severity}`}
                  key={alarm.id}
                  type="button"
                  onClick={() => openAlarm(alarm)}
                >
                  <span>{severityLabel(alarm.severity)} · {alarm.time}</span>
                  <strong>{alarm.title}</strong>
                  <small>{alarm.description}</small>
                </button>
              ))}
            </div>
            <button className="secondaryButton full" type="button" onClick={() => setModal("ticket")}>
              Создать заявку
            </button>
          </section>

          <DispatchTrendsPanel
            trendSeries={trendSeries}
            selectedTrendKey={selectedTrendKey}
            onTrendChange={setSelectedTrendKey}
          />

          <section className="panel">
            <div className="panelHeading">
              <p className="eyebrow">AI analytics</p>
              <h2>AI-аналитика и прогнозирование</h2>
            </div>
            <div className="aiGrid">
              {dispatchAiInsights.map((insight) => (
                <button
                  className="aiInsight"
                  key={insight.id}
                  type="button"
                  onClick={() => {
                    const node = dispatchEquipmentNodes.find((item) => item.id === insight.equipmentId);
                    if (node) selectEquipment(node);
                  }}
                >
                  <span>{insight.title}</span>
                  <strong>{insight.value}</strong>
                </button>
              ))}
            </div>
            <form className="aiInput" onSubmit={handleAiSubmit}>
              <input aria-label="AI assistant" placeholder="Задайте вопрос по объекту..." />
              <button type="submit">AI</button>
            </form>
            {aiAnswer ? <p className="aiAnswer">{aiAnswer}</p> : null}
          </section>
        </aside>

        <main className="twinPanel panel">
          <div className="twinTopline">
            <div>
              <p className="eyebrow">Digital twin</p>
              <h2>3D цифровой двойник объекта</h2>
            </div>
            <div className="readOnlyPill">Read-only / control locked</div>
          </div>

          <div className="twinStage">
            <svg className="flowLayer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="flowPath pathOne" d="M13 25 C28 18 35 38 50 28 S75 18 84 31" />
              <path className="flowPath pathTwo" d="M18 72 C34 60 44 84 61 72 S77 55 91 58" />
              <path className="flowPath pathThree" d="M8 50 C28 48 35 54 49 49 S70 37 90 42" />
              <circle className="dataDot dotOne" r="1.2">
                <animateMotion dur="4.8s" repeatCount="indefinite" path="M13 25 C28 18 35 38 50 28 S75 18 84 31" />
              </circle>
              <circle className="dataDot dotTwo" r="1.1">
                <animateMotion dur="5.8s" repeatCount="indefinite" path="M18 72 C34 60 44 84 61 72 S77 55 91 58" />
              </circle>
              <circle className="dataDot dotThree" r="1">
                <animateMotion dur="4.2s" repeatCount="indefinite" path="M8 50 C28 48 35 54 49 49 S70 37 90 42" />
              </circle>
            </svg>

            <div className="buildingIso" aria-hidden="true">
              <div className="roofDeck"><span /><span /><span /></div>
              <div className="tower towerA">{Array.from({ length: 24 }).map((_, index) => <i key={index} />)}</div>
              <div className="tower towerB">{Array.from({ length: 18 }).map((_, index) => <i key={index} />)}</div>
              <div className="techFloor"><b /><b /><b /><b /></div>
              <div className="plantRoom"><span>CH-1</span><span>NPS-2</span><span>VC-13</span></div>
            </div>

            {dispatchEquipmentNodes.map((node) => {
              const isSelected = node.id === selectedEquipment.id;
              const hasAlarm = node.relatedAlarmIds.some((id) => alarmEvents.find((alarm) => alarm.id === id)?.severity === "critical");
              return (
                <button key={node.id} type="button" className={`equipmentNode ${isSelected ? "isSelected" : ""} ${hasAlarm ? "hasAlarm" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => selectEquipment(node)}>
                  <span className="nodeCore" />
                  <span className="nodeLabel"><strong>{node.shortLabel}</strong><small>{node.countLabel}</small></span>
                </button>
              );
            })}
          </div>

          <div className="commandStrip">{controlButtons.map((button) => <button key={button} type="button" onClick={() => setModal("readonly")}>{button}</button>)}</div>

          <section className="recommendationPanel">
            <div><p className="eyebrow">AI recommendations</p><h3>{selectedEquipment.shortLabel}</h3></div>
            <ul>{selectedEquipment.aiRecommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ul>
          </section>
        </main>

        <aside className={`passportDrawer panel ${isDrawerOpen ? "isOpen" : ""}`}>
          <button className="drawerClose" type="button" onClick={() => setIsDrawerOpen(false)} aria-label="Закрыть паспорт">×</button>
          <div className="panelHeading"><p className="eyebrow">Equipment registry</p><h2>Паспортизация оборудования</h2></div>
          <div className="passportHero"><div><span className={`statusDot ${selectedEquipment.status === "Авария" ? "danger" : ""}`} /><strong>{selectedEquipment.label}</strong><small>Статус: {selectedEquipment.status}</small></div><div className="qrBox">QR</div></div>
          <div className="passportTabs" role="tablist" aria-label="Разделы паспорта">{passportTabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={passportTab === tab} className={passportTab === tab ? "isActive" : undefined} onClick={() => setPassportTab(tab)}>{tab}</button>)}</div>
          {passportTab === "Паспорт" ? <dl className="passportList"><div><dt>Модель</dt><dd>{selectedEquipment.model}</dd></div><div><dt>Серийный номер</dt><dd>{selectedEquipment.serial}</dd></div><div><dt>Инвентарный номер</dt><dd>{selectedEquipment.inventoryNumber}</dd></div><div><dt>Местоположение</dt><dd>{selectedEquipment.location}</dd></div><div><dt>Производитель</dt><dd>{selectedEquipment.manufacturer}</dd></div><div><dt>Год выпуска</dt><dd>{selectedEquipment.year}</dd></div></dl> : null}
          {passportTab === "Параметры" ? <div className="paramGrid">{selectedEquipment.onlineParams.map((param) => <div key={param.label}><span>{param.label}</span><strong>{param.value}</strong></div>)}</div> : null}
          {passportTab === "ТО" ? <div className="serviceList">{selectedEquipment.serviceHistory.map((item) => <article key={`${item.date}-${item.title}`}><span>{item.date}</span><strong>{item.title}</strong><small>{item.result}</small></article>)}</div> : null}
          {passportTab === "Документы" ? <div className="documentList">{selectedEquipment.documents.map((document) => <button key={document.title} type="button" onClick={() => setModal("readonly")}><span>{document.type}</span>{document.title}</button>)}</div> : null}
          <div className="relatedBlock"><span>Связанные аварии/тренды</span>{relatedAlarms.length ? relatedAlarms.map((alarm) => <button key={alarm.id} type="button" onClick={() => openAlarm(alarm)}>{alarm.title}</button>) : <small>Активных аварий нет</small>}</div>
          <div className="drawerActions"><button type="button" onClick={() => setIsReplacementOpen(true)}>Подобрать аналог</button><button type="button" onClick={() => setModal("ticket")}>Создать заявку</button><button type="button" onClick={() => setSelectedTrendKey(selectedEquipment.trendKey)}>Открыть тренды</button></div>
        </aside>

        <aside className="notificationsPanel panel"><div className="panelHeading"><p className="eyebrow">Notifications</p><h2>Уведомления</h2></div>{notificationItems.map((alarm) => <button key={alarm.id} type="button" onClick={() => openAlarm(alarm)}><span>{severityLabel(alarm.severity)}</span><strong>{alarm.title.replace(" на насосе NPS-2", "")}</strong></button>)}<button className="secondaryButton" type="button" onClick={() => setModal("readonly")}>Все уведомления</button></aside>
      </div>

      {isReplacementOpen ? <div className="replacementPanel"><button type="button" onClick={() => setIsReplacementOpen(false)} aria-label="Закрыть подбор">×</button><strong>Подбор аналог / замена</strong><div>{replacementWorkflow.map((step, index) => <span key={step} className={index < 2 ? "isDone" : undefined}>{index + 1}. {step}</span>)}</div></div> : null}

      <nav className="dispatchBottomNav" aria-label="Навигация диспетчерской">{bottomNavigation.map((item) => <button key={item} type="button" onClick={() => setModal(item === "Заявки" ? "ticket" : "readonly")}>{item}</button>)}<div className="bottomMeta"><span>Связь с объектом: Онлайн / Simulated gateway</span><span>Пользователь: Диспетчер</span><input aria-label="Текущее demo-время" value={demoTime} onChange={(event) => setDemoTime(event.target.value)} /><b>DEMO MODE</b></div></nav>

      {modal ? <div className="modalBackdrop" role="presentation" onMouseDown={() => setModal(null)}><div className="demoModal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button>{modal === "readonly" ? <><h2>Управление оборудованием отключено</h2><p>Управление оборудованием отключено в демонстрационном режиме. Для реального управления требуется интеграция с BMS/SCADA, подтверждение прав доступа, аудит тегов и согласование с эксплуатационной службой.</p></> : <><h2>Demo-заявка создана</h2><p>Заявка по оборудованию {selectedEquipment.shortLabel} сформирована в demo/read-only режиме и не отправлена во внешнюю систему.</p></>}</div></div> : null}

      <style jsx>{`
        :global(body.is-dispatch-demo .site-header), :global(body.is-dispatch-demo .sidebar), :global(body.is-dispatch-demo .mobile-bottom-nav), :global(body.is-dispatch-demo .skip) { display: none !important; }
        :global(body.is-dispatch-demo .app-content) { width: 100% !important; margin-left: 0 !important; padding: 0 !important; }
        .dispatchShell{min-height:100vh;margin:0;padding:14px 14px 88px;color:#dbeafe;background:radial-gradient(circle at 48% 18%,rgba(14,165,233,.18),transparent 34%),linear-gradient(rgba(34,211,238,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.04) 1px,transparent 1px),#020712;background-size:auto,34px 34px,34px 34px,auto}.dispatchGrid{display:grid;grid-template-columns:minmax(270px,320px) minmax(470px,1fr) minmax(300px,340px);grid-template-rows:auto 1fr auto;gap:14px;min-height:calc(100vh - 116px)}.panel{border:1px solid rgba(56,189,248,.26);border-radius:8px;background:linear-gradient(145deg,rgba(8,20,38,.84),rgba(2,8,23,.74));box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 18px 52px rgba(0,0,0,.34);backdrop-filter:blur(18px)}.dispatchHeader{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 20px}.dispatchHeader h1,.panelHeading h2,.twinTopline h2{margin:0;color:#f8fafc;font-size:20px;line-height:1.15}.eyebrow{margin:0 0 6px;color:#67e8f9;font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.headerStatus{display:flex;align-items:center;gap:10px;color:#93c5fd;font-size:12px}.headerStatus b,.bottomMeta b,.readOnlyPill{border:1px solid rgba(34,211,238,.42);border-radius:999px;color:#22d3ee;padding:7px 10px;box-shadow:0 0 22px rgba(34,211,238,.18)}.leftRail{display:grid;gap:14px;align-content:start}.leftRail .panel,.passportDrawer,.notificationsPanel{padding:16px}.panelHeading{margin-bottom:14px}.kpiGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.kpiCard,.aiInsight,.paramGrid div,.serviceList article{border:1px solid rgba(125,211,252,.18);border-radius:8px;background:rgba(15,23,42,.62);padding:12px}.kpiCard span,.aiInsight span,.paramGrid span,.serviceList span,.passportList dt,.relatedBlock span{display:block;color:#93c5fd;font-size:11px}.kpiCard strong,.aiInsight strong,.paramGrid strong{display:block;margin:7px 0 4px;color:#f8fafc;font-size:18px}.kpiCard small,.serviceList small,.passportHero small,.relatedBlock small{color:#86efac;font-size:11px}button{font:inherit}.eventList,.serviceList,.documentList,.relatedBlock{display:grid;gap:8px}.eventItem,.aiInsight,.notificationsPanel button,.documentList button,.relatedBlock button{width:100%;border:1px solid rgba(125,211,252,.18);border-radius:8px;background:rgba(2,8,23,.66);color:#dbeafe;cursor:pointer;padding:10px;text-align:left;transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease}.eventItem:hover,.aiInsight:hover,.notificationsPanel button:hover,.documentList button:hover,.relatedBlock button:hover,.equipmentNode:hover .nodeCore{border-color:rgba(34,211,238,.72);box-shadow:0 0 24px rgba(34,211,238,.16);transform:translateY(-1px)}.eventItem span,.notificationsPanel span{color:#67e8f9;font-size:11px}.eventItem strong,.notificationsPanel strong{display:block;margin:4px 0;color:#f8fafc;font-size:13px}.eventItem.critical{border-color:rgba(248,113,113,.45)}.eventItem.warning{border-color:rgba(251,191,36,.38)}.secondaryButton,.commandStrip button,.drawerActions button,.aiInput button,.dispatchBottomNav button{border:1px solid rgba(56,189,248,.34);border-radius:8px;background:rgba(14,165,233,.1);color:#e0f2fe;cursor:pointer;padding:9px 11px}.full{width:100%;margin-top:10px}.aiGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.aiInput{display:flex;gap:8px;margin-top:12px}.aiInput input,.bottomMeta input{min-width:0;border:1px solid rgba(56,189,248,.25);border-radius:8px;background:rgba(2,8,23,.72);color:#e0f2fe;padding:10px}.aiInput input{flex:1}.aiAnswer{margin:10px 0 0;color:#bae6fd;font-size:12px;line-height:1.45}.twinPanel{position:relative;display:flex;flex-direction:column;min-height:690px;overflow:hidden;padding:18px}.twinTopline{display:flex;align-items:center;justify-content:space-between;gap:16px;position:relative;z-index:2}.twinStage{position:relative;flex:1;min-height:480px;margin:16px 0;border:1px solid rgba(56,189,248,.18);border-radius:8px;overflow:hidden;background:radial-gradient(circle at 50% 52%,rgba(34,211,238,.14),transparent 34%),linear-gradient(rgba(125,211,252,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,.05) 1px,transparent 1px),rgba(2,8,23,.42);background-size:auto,28px 28px,28px 28px,auto}.flowLayer{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 10px rgba(34,211,238,.62))}.flowPath{fill:none;stroke:rgba(34,211,238,.58);stroke-width:.55;stroke-dasharray:1.5 2.1;animation:dashFlow 4s linear infinite}.pathTwo{stroke:rgba(56,189,248,.5);animation-duration:5.4s}.pathThree{stroke:rgba(103,232,249,.42);animation-duration:3.8s}.dataDot{fill:#e0f2fe;filter:drop-shadow(0 0 7px #22d3ee)}.buildingIso{position:absolute;left:50%;top:24%;width:min(88%,820px);aspect-ratio:1.32;transform:translate(-50%,-50%) perspective(900px) rotateX(52deg) rotateZ(-38deg) scale(1.08);transform-style:preserve-3d}.buildingIso::before{content:"";position:absolute;inset:8% 10% 12% 10%;border:1px solid rgba(186,230,253,.48);background:linear-gradient(90deg,rgba(186,230,253,.18) 1px,transparent 1px),linear-gradient(rgba(186,230,253,.12) 1px,transparent 1px),linear-gradient(145deg,rgba(14,165,233,.28),rgba(6,78,118,.2));background-size:34px 34px,34px 34px,auto;clip-path:polygon(16% 0,78% 0,100% 32%,82% 100%,20% 100%,0 62%);box-shadow:inset 0 0 44px rgba(125,211,252,.16),0 0 70px rgba(34,211,238,.22)}.roofDeck,.techFloor,.plantRoom,.tower{position:absolute;border:1px solid rgba(125,211,252,.42);background:linear-gradient(145deg,rgba(59,130,246,.34),rgba(8,47,73,.24));box-shadow:inset 0 0 34px rgba(186,230,253,.16),0 0 52px rgba(14,165,233,.28)}.roofDeck{inset:2% 12% 55% 14%;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:14px}.roofDeck span,.techFloor b{border:1px solid rgba(34,211,238,.35);background:rgba(34,211,238,.12)}.tower{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:10px;transform:translateZ(62px)}.tower i{min-height:12px;border:1px solid rgba(191,219,254,.24);background:rgba(125,211,252,.12)}.towerA{inset:18% 48% 18% 17%}.towerB{inset:28% 22% 18% 56%;transform:translateZ(44px)}.techFloor{inset:58% 20% 22% 18%;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px}.plantRoom{inset:75% 30% 6% 25%;display:flex;align-items:center;justify-content:center;gap:10px;transform:translateZ(22px)}.plantRoom span{border:1px solid rgba(34,211,238,.42);color:#cffafe;font-size:11px;padding:6px}.equipmentNode{position:absolute;z-index:3;display:flex;align-items:center;gap:8px;border:0;background:transparent;color:#dbeafe;cursor:pointer;transform:translate(-50%,-50%)}.nodeCore{width:18px;height:18px;border:1px solid rgba(103,232,249,.95);border-radius:50%;background:radial-gradient(circle,#e0f2fe 0 16%,#22d3ee 17% 36%,rgba(14,165,233,.25) 37%);box-shadow:0 0 24px rgba(34,211,238,.72);transition:transform .2s ease,box-shadow .2s ease}.nodeLabel{min-width:132px;border:1px solid rgba(125,211,252,.26);border-radius:8px;background:rgba(2,8,23,.72);padding:8px 10px;text-align:left;box-shadow:0 10px 28px rgba(0,0,0,.28)}.nodeLabel strong,.nodeLabel small{display:block}.nodeLabel small{color:#93c5fd;font-size:11px}.equipmentNode.isSelected .nodeCore,.equipmentNode.hasAlarm .nodeCore{transform:scale(1.28)}.equipmentNode.isSelected .nodeLabel{border-color:rgba(34,211,238,.85);box-shadow:0 0 32px rgba(34,211,238,.22)}.equipmentNode.hasAlarm .nodeCore{border-color:rgba(248,113,113,.95);animation:alarmPulse 1.3s ease-in-out infinite}.commandStrip{display:flex;flex-wrap:wrap;gap:8px;position:relative;z-index:2}.recommendationPanel{margin-top:14px;border:1px solid rgba(34,211,238,.24);border-radius:8px;background:rgba(8,47,73,.32);padding:14px}.recommendationPanel h3{margin:0;color:#f8fafc}.recommendationPanel ul{margin:10px 0 0;padding-left:18px;color:#bae6fd;font-size:13px;line-height:1.5}.passportDrawer{position:relative;overflow:hidden}.drawerClose,.demoModal>button,.replacementPanel>button{position:absolute;right:10px;top:10px;border:1px solid rgba(125,211,252,.24);border-radius:8px;background:rgba(2,8,23,.72);color:#e0f2fe;cursor:pointer;width:30px;height:30px}.passportHero{display:grid;grid-template-columns:1fr 66px;gap:12px;align-items:center;border:1px solid rgba(125,211,252,.18);border-radius:8px;background:rgba(15,23,42,.62);padding:12px}.passportHero strong{display:block;color:#f8fafc;line-height:1.25}.statusDot{display:inline-block;width:9px;height:9px;margin-right:7px;border-radius:999px;background:#22c55e;box-shadow:0 0 14px #22c55e}.statusDot.danger{background:#f87171;box-shadow:0 0 14px #f87171}.qrBox{display:grid;place-items:center;aspect-ratio:1;border:1px dashed rgba(125,211,252,.45);color:#67e8f9;font-weight:800}.passportTabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:12px 0}.passportTabs button{border:1px solid rgba(125,211,252,.18);border-radius:8px;background:rgba(2,8,23,.48);color:#93c5fd;cursor:pointer;padding:8px 6px}.passportTabs button.isActive{border-color:rgba(34,211,238,.68);color:#e0f2fe;background:rgba(14,165,233,.18)}.passportList{display:grid;gap:8px;margin:0}.passportList div{display:grid;grid-template-columns:110px 1fr;gap:10px;border-bottom:1px solid rgba(125,211,252,.12);padding-bottom:8px}.passportList dd{margin:0;color:#f8fafc;font-size:13px}.paramGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.documentList button span{display:inline-grid;place-items:center;width:38px;margin-right:8px;color:#67e8f9}.relatedBlock{margin-top:14px}.drawerActions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:14px}.notificationsPanel{grid-column:3;align-self:end}.replacementPanel{position:fixed;z-index:20;left:50%;bottom:76px;width:min(760px,calc(100vw - 32px));transform:translateX(-50%);border:1px solid rgba(34,211,238,.46);border-radius:8px;background:rgba(2,8,23,.94);box-shadow:0 0 48px rgba(34,211,238,.2);color:#e0f2fe;padding:18px 48px 18px 18px}.replacementPanel strong{display:block;margin-bottom:12px}.replacementPanel div{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.replacementPanel span{border:1px solid rgba(125,211,252,.2);border-radius:8px;padding:10px;color:#93c5fd}.replacementPanel span.isDone{border-color:rgba(34,197,94,.5);color:#bbf7d0}.dispatchBottomNav{position:fixed;z-index:18;left:0;right:0;bottom:0;display:flex;align-items:center;gap:8px;border-top:1px solid rgba(56,189,248,.28);background:rgba(2,8,23,.94);box-shadow:0 -18px 44px rgba(0,0,0,.36);padding:10px 14px;backdrop-filter:blur(18px)}.dispatchBottomNav button{white-space:nowrap}.bottomMeta{display:flex;align-items:center;gap:10px;margin-left:auto;color:#93c5fd;font-size:12px;white-space:nowrap}.bottomMeta input{width:146px;padding:7px 9px;font-size:12px}.modalBackdrop{position:fixed;z-index:40;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.64);padding:20px}.demoModal{position:relative;width:min(560px,100%);border:1px solid rgba(34,211,238,.42);border-radius:8px;background:#020817;color:#dbeafe;box-shadow:0 0 64px rgba(34,211,238,.2);padding:28px}.demoModal h2{margin:0 36px 12px 0;color:#f8fafc}.demoModal p{margin:0;color:#bfdbfe;line-height:1.55}@keyframes dashFlow{from{stroke-dashoffset:0}to{stroke-dashoffset:-18}}@keyframes alarmPulse{0%,100%{box-shadow:0 0 18px rgba(248,113,113,.45)}50%{box-shadow:0 0 36px rgba(248,113,113,.95)}}@media(max-width:1120px){.dispatchGrid{grid-template-columns:minmax(280px,360px) minmax(520px,1fr)}.passportDrawer,.notificationsPanel{grid-column:1/-1}}@media(max-width:980px){.dispatchShell{margin:-16px;padding:16px 16px 120px}.dispatchGrid{display:block}.leftRail,.twinPanel,.passportDrawer,.notificationsPanel{margin-top:14px}.twinPanel{min-height:680px}.dispatchBottomNav,.bottomMeta{overflow-x:auto}}
      `}</style>
    </div>
  );
}
