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
type NodeSeverity = DispatchAlarmEvent["severity"] | "normal";

function severityLabel(severity: DispatchAlarmEvent["severity"]) {
  if (severity === "critical") return "Авария";
  if (severity === "warning") return "Предупреждение";
  return "ТО";
}

function getNodeSeverity(node: DispatchEquipmentNode): NodeSeverity {
  const severities = node.relatedAlarmIds
    .map((id) => alarmEvents.find((alarm) => alarm.id === id)?.severity)
    .filter(Boolean);

  if (severities.includes("critical")) return "critical";
  if (severities.includes("warning")) return "warning";
  if (severities.includes("service")) return "service";
  return "normal";
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
  const selectedSeverity = getNodeSeverity(selectedEquipment);
  const selectedTrendSeries = trendSeries.find((item) => item.key === selectedEquipment.trendKey) ?? trendSeries[0];
  const selectedTrendPoints = selectedTrendSeries.periods["24h"];
  const selectedTrendMax = Math.max(...selectedTrendPoints.map((point) => point.value), 1);

  const relatedAlarms = useMemo(
    () => alarmEvents.filter((alarm) => selectedEquipment.relatedAlarmIds.includes(alarm.id)),
    [selectedEquipment],
  );

  const selectEquipment = (node: DispatchEquipmentNode) => {
    setSelectedId(node.id);
    setSelectedTrendKey(node.trendKey);
    setPassportTab(passportTabs[0]);
    setIsDrawerOpen(true);
  };

  const openAlarm = (alarm: DispatchAlarmEvent) => {
    const node = dispatchEquipmentNodes.find((item) => item.id === alarm.equipmentId);
    if (node) selectEquipment(node);
  };

  const handleAiSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAiAnswer("AI анализирует mock-данные. Для реального ответа требуется подключение к BMS/SCADA historian.");
  };

  return (
    <div className="dispatchShell">
      <div className="dispatchGrid" aria-label="Demo dashboard диспетчеризации">
        <header className="dispatchHeader panel">
          <div>
            <p className="eyebrow">UPGRADE Dispatch / Asia Park Astana</p>
            <h1>
              Интеллектуальная диспетчеризация существующей BMS/SCADA: холодоснабжение, вентиляция,
              насосные группы, чиллеры Trane, аварии, тренды, паспорта оборудования и AI-диагностика.
            </h1>
          </div>
          <div className="headerStatus">
            <span>Связь: Онлайн</span>
            <strong>BMS/SCADA 10.50.4.41</strong>
            <span>Operator</span>
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
              <h2>2.5D цифровой двойник Asia Park Astana</h2>
            </div>
            <div className="readOnlyPill">Read-only / control locked</div>
          </div>

          <div
            className={`twinStage trend-${selectedEquipment.trendKey} selected-${selectedEquipment.id} severity-${selectedSeverity}`}
            data-selected-equipment={selectedEquipment.id}
          >
            <svg className="flowLayer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="flowPath flowCooling" d="M14 78 C27 70 39 72 51 65 S76 56 88 62" />
              <path className="flowPath flowHydraulic" d="M12 85 C27 90 43 83 55 79 S73 79 87 84" />
              <path className="flowPath flowVentilation" d="M18 32 C34 20 49 25 61 18 S77 20 88 30" />
              <path className="flowPath flowData" d="M49 14 C53 25 56 35 62 45 S76 58 87 69" />
              <circle className="dataDot dotCooling" r="1.15">
                <animateMotion dur="5.2s" repeatCount="indefinite" path="M14 78 C27 70 39 72 51 65 S76 56 88 62" />
              </circle>
              <circle className="dataDot dotHydraulic" r="1">
                <animateMotion dur="6.4s" repeatCount="indefinite" path="M12 85 C27 90 43 83 55 79 S73 79 87 84" />
              </circle>
              <circle className="dataDot dotVentilation" r="1">
                <animateMotion dur="4.8s" repeatCount="indefinite" path="M18 32 C34 20 49 25 61 18 S77 20 88 30" />
              </circle>
              <circle className="dataDot dotData" r="0.95">
                <animateMotion dur="4.2s" repeatCount="indefinite" path="M49 14 C53 25 56 35 62 45 S76 58 87 69" />
              </circle>
            </svg>

            <div className="mallTwin" aria-hidden="true">
              <div className="technicalMarkers">
                <span>+11.400</span>
                <span>+12.600</span>
                <span>+13.500</span>
              </div>
              <div className="roofTech">
                <span className="roofUnit">VC-13</span>
                <span className="roofUnit">VC-11</span>
                <span className="roofUnit">SCADA</span>
              </div>
              <div className="mallMass">
                <div className="sideWing sideWingLeft">{Array.from({ length: 12 }).map((_, index) => <i key={index} />)}</div>
                <div className="atriumGlass">
                  {Array.from({ length: 9 }).map((_, index) => <i key={index} />)}
                  <strong>ASIA PARK</strong>
                </div>
                <div className="sideWing sideWingRight">{Array.from({ length: 12 }).map((_, index) => <i key={index} />)}</div>
                <div className="retailRibbon"><span /><span /><span /><span /><span /></div>
              </div>
              <div className="equipmentYard">
                <span className="yardItem yardChillers">Trane RTAF / RTAD</span>
                <span className="yardItem yardPumps">ШУ-1...ШУ-4</span>
                <span className="yardItem yardHex">Plate HEX</span>
                <span className="yardItem yardCircuit">Glycol / water</span>
              </div>
              <div className="integrationLayer">
                <span>existing BMS/SCADA 10.50.4.41</span>
                <b>UPGRADE Dispatch / AI</b>
              </div>
            </div>

            {dispatchEquipmentNodes.map((node) => {
              const severity = getNodeSeverity(node);
              const isSelected = node.id === selectedEquipment.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  className={`equipmentNode severity-${severity} ${isSelected ? "isSelected" : ""} ${severity !== "normal" ? "hasAlarm" : ""}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => selectEquipment(node)}
                >
                  <span className="nodeCore" />
                  <span className="nodeLabel">
                    <strong>{node.shortLabel}</strong>
                    <small>{node.countLabel}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="commandStrip">
            {controlButtons.map((button) => (
              <button key={button} type="button" onClick={() => setModal("readonly")}>
                {button}
              </button>
            ))}
          </div>

          <section className="recommendationPanel">
            <div>
              <p className="eyebrow">AI recommendations</p>
              <h3>{selectedEquipment.shortLabel}</h3>
            </div>
            <ul>
              {selectedEquipment.aiRecommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </section>
        </main>

        <aside className={`passportDrawer panel ${isDrawerOpen ? "isOpen" : ""}`}>
          <button className="drawerClose" type="button" onClick={() => setIsDrawerOpen(false)} aria-label="Закрыть паспорт">
            ×
          </button>
          <div className="panelHeading">
            <p className="eyebrow">Equipment registry</p>
            <h2>Паспортизация оборудования</h2>
          </div>
          <div className="passportHero">
            <div>
              <span className={`statusDot ${selectedEquipment.status === "Авария" ? "danger" : ""}`} />
              <strong>{selectedEquipment.label}</strong>
              <small>Статус: {selectedEquipment.status}</small>
            </div>
            <div className="qrBox">QR</div>
          </div>

          <div className="drawerSnapshot">
            <article>
              <span>Последнее событие</span>
              <strong>{relatedAlarms[0]?.title ?? "Активных аварий нет"}</strong>
              <small>{relatedAlarms[0]?.description ?? "Демо-паспорт в режиме read-only"}</small>
            </article>
            <article>
              <span>Связанные системы</span>
              <strong>{selectedEquipment.relatedTrendKeys.join(" / ") || "TO VERIFY"}</strong>
              <small>{selectedEquipment.location}</small>
            </article>
            <article className="miniTrend">
              <span>{selectedTrendSeries.label}</span>
              <div>
                {selectedTrendPoints.map((point) => (
                  <i key={point.label} style={{ height: `${Math.max(12, (point.value / selectedTrendMax) * 100)}%` }} />
                ))}
              </div>
              <small>24h · {selectedTrendSeries.unit}</small>
            </article>
            <article>
              <span>Сервис</span>
              <strong>{selectedEquipment.serviceHistory[0]?.title ?? "TO VERIFY"}</strong>
              <small>{selectedEquipment.serviceHistory[0]?.result ?? "Нужна верификация на объекте"}</small>
            </article>
          </div>

          <div className="passportTabs" role="tablist" aria-label="Разделы паспорта">
            {passportTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={passportTab === tab}
                className={passportTab === tab ? "isActive" : undefined}
                onClick={() => setPassportTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {passportTab === "Паспорт" ? (
            <dl className="passportList">
              <div><dt>Модель</dt><dd>{selectedEquipment.model}</dd></div>
              <div><dt>Серийный номер</dt><dd>{selectedEquipment.serial}</dd></div>
              <div><dt>Инвентарный номер</dt><dd>{selectedEquipment.inventoryNumber}</dd></div>
              <div><dt>Местоположение</dt><dd>{selectedEquipment.location}</dd></div>
              <div><dt>Производитель</dt><dd>{selectedEquipment.manufacturer}</dd></div>
              <div><dt>Год выпуска</dt><dd>{selectedEquipment.year}</dd></div>
            </dl>
          ) : null}

          {passportTab === "Параметры" ? (
            <div className="paramGrid">
              {selectedEquipment.onlineParams.map((param) => (
                <div key={param.label}>
                  <span>{param.label}</span>
                  <strong>{param.value}</strong>
                </div>
              ))}
            </div>
          ) : null}

          {passportTab === "ТО" ? (
            <div className="serviceList">
              {selectedEquipment.serviceHistory.map((item) => (
                <article key={`${item.date}-${item.title}`}>
                  <span>{item.date}</span>
                  <strong>{item.title}</strong>
                  <small>{item.result}</small>
                </article>
              ))}
            </div>
          ) : null}

          {passportTab === "Документы" ? (
            <div className="documentList">
              {selectedEquipment.documents.map((document) => (
                <button key={document.title} type="button" onClick={() => setModal("readonly")}>
                  <span>{document.type}</span>
                  {document.title}
                </button>
              ))}
            </div>
          ) : null}

          <div className="relatedBlock">
            <span>Связанные аварии/тренды</span>
            {relatedAlarms.length ? (
              relatedAlarms.map((alarm) => (
                <button key={alarm.id} type="button" onClick={() => openAlarm(alarm)}>{alarm.title}</button>
              ))
            ) : (
              <small>Активных аварий нет</small>
            )}
          </div>

          <div className="drawerActions">
            <button type="button" onClick={() => setIsReplacementOpen(true)}>Подобрать аналог</button>
            <button type="button" onClick={() => setModal("ticket")}>Создать заявку</button>
            <button type="button" onClick={() => setSelectedTrendKey(selectedEquipment.trendKey)}>Открыть тренды</button>
          </div>
        </aside>

        <aside className="notificationsPanel panel">
          <div className="panelHeading">
            <p className="eyebrow">Notifications</p>
            <h2>Уведомления</h2>
          </div>
          {alarmEvents.slice(0, 3).map((alarm) => (
            <button key={alarm.id} type="button" onClick={() => openAlarm(alarm)}>
              <span>{severityLabel(alarm.severity)}</span>
              <strong>{alarm.title.replace(" на ШУ-2", "")}</strong>
            </button>
          ))}
          <button className="secondaryButton" type="button" onClick={() => setModal("readonly")}>
            Все уведомления
          </button>
        </aside>
      </div>

      {isReplacementOpen ? (
        <div className="replacementPanel">
          <button type="button" onClick={() => setIsReplacementOpen(false)} aria-label="Закрыть подбор">
            ×
          </button>
          <strong>Подбор аналог / замена</strong>
          <div>
            {replacementWorkflow.map((step, index) => (
              <span key={step} className={index < 2 ? "isDone" : undefined}>
                {index + 1}. {step}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <nav className="dispatchBottomNav" aria-label="Навигация диспетчерской">
        {bottomNavigation.map((item) => (
          <button key={item} type="button" onClick={() => setModal(item === "Заявки" ? "ticket" : "readonly")}>
            {item}
          </button>
        ))}
        <div className="bottomMeta">
          <span>{demoTime}</span>
          <input value={demoTime} onChange={(event) => setDemoTime(event.target.value)} aria-label="Demo time" />
        </div>
      </nav>

      {modal ? (
        <div className="modalBackdrop" role="presentation" onClick={() => setModal(null)}>
          <div className="demoModal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setModal(null)} aria-label="Закрыть">
              ×
            </button>
            <h2>{modal === "ticket" ? "Demo-заявка создана" : "Управление заблокировано"}</h2>
            <p>
              {modal === "ticket"
                ? "Заявка создана только в интерфейсе демонстрации. Реальная интеграция с Service Desk не выполняется."
                : "Демонстрационная страница работает в read-only режиме и не отправляет команды в BMS/SCADA."}
            </p>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        :global(body.is-dispatch-demo){background:#020617}.dispatchShell{min-height:100vh;margin:-24px;padding:18px 18px 92px;background:radial-gradient(circle at 52% 22%,rgba(14,165,233,0.19),transparent 29%),radial-gradient(circle at 72% 72%,rgba(16,185,129,0.12),transparent 26%),linear-gradient(135deg,#020617 0%,#06111f 46%,#020617 100%);color:#dbeafe;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.dispatchGrid{display:grid;grid-template-columns:minmax(280px,370px) minmax(620px,1fr) minmax(300px,410px);grid-auto-rows:min-content;gap:14px}.panel{border:1px solid rgba(56,189,248,0.26);border-radius:8px;background:linear-gradient(145deg,rgba(8,20,38,0.86),rgba(2,8,23,0.74));box-shadow:inset 0 1px 0 rgba(255,255,255,0.07),0 18px 52px rgba(0,0,0,0.34);backdrop-filter:blur(18px)}.dispatchHeader{grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 20px}.eyebrow{margin:0 0 6px;color:#67e8f9;font-size:11px;font-weight:800;letter-spacing:0.13em;text-transform:uppercase}h1,h2,h3{margin:0;color:#f8fafc;letter-spacing:0}h1{max-width:980px;font-size:clamp(20px,2vw,30px);line-height:1.22}h2{font-size:18px}button,input{font:inherit}button{border:1px solid rgba(125,211,252,0.2);border-radius:8px;background:rgba(2,8,23,0.58);color:#dbeafe;cursor:pointer}button:hover{border-color:rgba(34,211,238,0.72)}.headerStatus{display:grid;gap:6px;min-width:220px;color:#bfdbfe;font-size:12px;text-align:right}.headerStatus strong{color:#e0f2fe}.headerStatus b{justify-self:end;border:1px solid rgba(34,197,94,0.5);border-radius:999px;color:#bbf7d0;padding:4px 8px}.leftRail{display:grid;gap:14px}.panelHeading{margin-bottom:12px}.leftRail .panel,.notificationsPanel,.passportDrawer{padding:16px}.kpiGrid,.aiGrid,.paramGrid,.drawerSnapshot{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.kpiCard,.drawerSnapshot article,.paramGrid div,.serviceList article{border:1px solid rgba(125,211,252,0.16);border-radius:8px;background:rgba(2,8,23,0.46);padding:10px}.kpiCard span,.drawerSnapshot span,.paramGrid span,.serviceList span{display:block;color:#93c5fd;font-size:10px;text-transform:uppercase;letter-spacing:0.08em}.kpiCard strong,.drawerSnapshot strong,.paramGrid strong,.serviceList strong{display:block;margin:6px 0 3px;color:#f8fafc;font-size:13px}small{color:#bae6fd;line-height:1.35}.eventList{display:grid;gap:8px}.eventItem,.aiInsight,.notificationsPanel button{width:100%;display:grid;gap:4px;padding:10px;text-align:left}.eventItem.critical{border-color:rgba(248,113,113,0.5);box-shadow:0 0 22px rgba(248,113,113,0.12)}.eventItem.warning{border-color:rgba(251,191,36,0.46)}.eventItem.service{border-color:rgba(147,197,253,0.42)}.secondaryButton.full{width:100%;margin-top:10px;padding:10px 12px}.aiGrid{margin-bottom:10px}.aiInsight strong{color:#e0f2fe}.aiInput{display:grid;grid-template-columns:1fr 46px;gap:8px}.aiInput input,.bottomMeta input{min-width:0;border:1px solid rgba(125,211,252,0.24);border-radius:8px;background:rgba(2,8,23,0.64);color:#e0f2fe;padding:9px 10px}.aiAnswer{margin:10px 0 0;color:#bfdbfe;font-size:13px}.twinPanel{min-height:830px;padding:16px}.twinTopline{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}.readOnlyPill{border:1px solid rgba(34,197,94,0.44);border-radius:999px;color:#bbf7d0;font-size:12px;font-weight:800;padding:7px 10px;white-space:nowrap}.twinStage{position:relative;min-height:575px;overflow:hidden;border:1px solid rgba(34,211,238,0.28);border-radius:8px;background:radial-gradient(circle at 50% 28%,rgba(34,211,238,0.2),transparent 28%),radial-gradient(circle at 48% 82%,rgba(16,185,129,0.12),transparent 30%),linear-gradient(rgba(125,211,252,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,0.05) 1px,transparent 1px),rgba(2,8,23,0.42);background-size:auto,auto,28px 28px,28px 28px,auto}.flowLayer{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 10px rgba(34,211,238,0.62))}.flowPath{fill:none;stroke:rgba(34,211,238,0.56);stroke-width:0.55;stroke-dasharray:1.5 2.1;animation:dashFlow 4s linear infinite;opacity:0.55;transition:opacity 0.25s ease,stroke-width 0.25s ease,filter 0.25s ease}.flowHydraulic{stroke:rgba(74,222,128,0.52);animation-duration:5.4s}.flowVentilation{stroke:rgba(103,232,249,0.44);animation-duration:3.8s}.flowData{stroke:rgba(147,197,253,0.5);stroke-dasharray:0.9 1.8;animation-duration:3.2s}.selected-chiller-ch1 .flowCooling,.selected-cooling-circuits .flowCooling,.selected-cooling-circuits .flowHydraulic,.selected-pump-shu2 .flowHydraulic,.selected-itp-demo .flowHydraulic,.selected-ventilation-vc13 .flowVentilation,.selected-automation-cabinets .flowData,.severity-critical .flowHydraulic,.severity-warning .flowCooling{opacity:1;stroke-width:0.84;filter:drop-shadow(0 0 10px rgba(34,211,238,0.76))}.severity-critical .flowHydraulic{stroke:rgba(248,113,113,0.84);filter:drop-shadow(0 0 13px rgba(248,113,113,0.82))}.dataDot{fill:#e0f2fe;filter:drop-shadow(0 0 7px #22d3ee)}.dotHydraulic{fill:#bbf7d0}.dotData{fill:#bfdbfe}.mallTwin{position:absolute;left:50%;top:49%;width:min(94%,900px);height:min(66%,410px);transform:translate(-50%,-50%)}.mallTwin::before,.mallTwin::after{content:"";position:absolute;left:6%;right:6%;bottom:15%;height:18%;border-radius:50%;background:rgba(14,165,233,0.12);filter:blur(24px)}.mallTwin::after{left:18%;right:18%;bottom:5%;background:rgba(16,185,129,0.1);filter:blur(18px)}.mallMass{position:absolute;left:6%;right:6%;top:26%;height:43%;transform:perspective(850px) rotateX(51deg) rotateZ(-3deg);transform-origin:50% 72%}.sideWing,.atriumGlass,.retailRibbon,.technicalMarkers span{border:1px solid rgba(125,211,252,0.34);box-shadow:inset 0 0 30px rgba(186,230,253,0.12),0 0 42px rgba(14,165,233,0.18)}.sideWing{position:absolute;top:18%;bottom:10%;width:36%;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:12px;background:linear-gradient(90deg,rgba(34,211,238,0.1) 1px,transparent 1px),linear-gradient(145deg,rgba(85,64,44,0.52),rgba(15,23,42,0.7))}.sideWingLeft{left:0;clip-path:polygon(0 24%,100% 8%,96% 100%,6% 92%)}.sideWingRight{right:0;clip-path:polygon(4% 8%,100% 23%,94% 92%,0 100%)}.sideWing i{min-height:14px;border:1px solid rgba(191,219,254,0.16);background:rgba(125,211,252,0.08)}.atriumGlass{position:absolute;z-index:2;left:34%;top:-2%;width:32%;height:106%;overflow:hidden;display:grid;grid-template-columns:repeat(9,1fr);gap:3px;padding:12px 14px 26px;border-radius:50% 50% 18% 18% / 78% 78% 22% 22%;background:radial-gradient(circle at 50% 20%,rgba(240,249,255,0.36),transparent 22%),linear-gradient(120deg,rgba(125,211,252,0.44),rgba(14,165,233,0.14) 42%,rgba(2,8,23,0.6));box-shadow:inset 0 0 46px rgba(240,249,255,0.15),0 0 70px rgba(34,211,238,0.28)}.atriumGlass i{border-left:1px solid rgba(224,242,254,0.36);background:linear-gradient(180deg,rgba(255,255,255,0.16),rgba(34,211,238,0.02))}.atriumGlass strong{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);color:#e0f2fe;font-size:11px;letter-spacing:0.22em;text-shadow:0 0 14px rgba(224,242,254,0.6);white-space:nowrap}.retailRibbon{position:absolute;left:6%;right:6%;bottom:-8%;height:22%;display:grid;grid-template-columns:1.3fr 1fr 1.4fr 1fr 1.3fr;gap:9px;padding:9px 16px;background:linear-gradient(90deg,rgba(15,23,42,0.86),rgba(8,47,73,0.58),rgba(15,23,42,0.86))}.retailRibbon span{border:1px solid rgba(34,211,238,0.18);background:rgba(186,230,253,0.07)}.technicalMarkers{position:absolute;z-index:2;left:15%;right:12%;top:8%;display:flex;justify-content:space-between;pointer-events:none}.technicalMarkers span{border-radius:999px;background:rgba(2,8,23,0.74);color:#bae6fd;font-size:10px;font-weight:800;padding:6px 9px}.roofTech{position:absolute;z-index:1;left:18%;right:16%;top:14%;height:18%;display:grid;grid-template-columns:1.2fr 1fr 0.9fr;gap:12px}.roofUnit,.yardItem,.integrationLayer span,.integrationLayer b{display:flex;align-items:center;justify-content:center;border:1px solid rgba(34,211,238,0.28);border-radius:8px;background:rgba(2,8,23,0.72);color:#cffafe;font-size:11px;font-weight:800;padding:7px 8px;text-align:center}.roofUnit{transform:perspective(720px) rotateX(54deg) rotateZ(-3deg);background:linear-gradient(145deg,rgba(8,47,73,0.8),rgba(34,211,238,0.13))}.equipmentYard{position:absolute;left:12%;right:12%;bottom:8%;display:grid;grid-template-columns:1.4fr 1.1fr 1fr 1.2fr;gap:10px}.yardItem{min-height:36px;background:linear-gradient(145deg,rgba(15,23,42,0.82),rgba(8,47,73,0.5))}.yardChillers{border-color:rgba(56,189,248,0.52)}.yardPumps{border-color:rgba(248,113,113,0.48)}.yardHex,.yardCircuit{border-color:rgba(74,222,128,0.42)}.integrationLayer{position:absolute;right:6%;top:70%;width:24%;display:grid;gap:7px}.integrationLayer span,.integrationLayer b{justify-content:flex-start;font-size:10px}.equipmentNode{position:absolute;z-index:3;display:flex;align-items:center;gap:8px;border:0;background:transparent;color:#dbeafe;cursor:pointer;transform:translate(-50%,-50%)}.nodeCore{width:18px;height:18px;border:1px solid rgba(103,232,249,0.95);border-radius:50%;background:radial-gradient(circle,#e0f2fe 0 16%,#22d3ee 17% 36%,rgba(14,165,233,0.25) 37%);box-shadow:0 0 24px rgba(34,211,238,0.72);transition:transform 0.2s ease,box-shadow 0.2s ease}.nodeLabel{min-width:132px;border:1px solid rgba(125,211,252,0.26);border-radius:8px;background:rgba(2,8,23,0.72);padding:8px 10px;text-align:left;box-shadow:0 10px 28px rgba(0,0,0,0.28)}.nodeLabel strong,.nodeLabel small{display:block}.equipmentNode.isSelected .nodeCore,.equipmentNode.hasAlarm .nodeCore{transform:scale(1.28)}.equipmentNode.isSelected .nodeLabel{border-color:rgba(34,211,238,0.85);box-shadow:0 0 32px rgba(34,211,238,0.22)}.equipmentNode.severity-critical .nodeCore{border-color:rgba(248,113,113,0.95);animation:alarmPulse 1.3s ease-in-out infinite}.equipmentNode.severity-warning .nodeCore{border-color:rgba(251,191,36,0.95);box-shadow:0 0 24px rgba(251,191,36,0.5);animation:warningPulse 1.8s ease-in-out infinite}.equipmentNode.severity-service .nodeCore{border-color:rgba(147,197,253,0.95);box-shadow:0 0 22px rgba(147,197,253,0.5)}.commandStrip{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.commandStrip button,.drawerActions button,.dispatchBottomNav button{padding:9px 11px}.recommendationPanel{margin-top:14px;border:1px solid rgba(34,211,238,0.24);border-radius:8px;background:rgba(8,47,73,0.32);padding:14px}.recommendationPanel ul{margin:10px 0 0;padding-left:18px;color:#bae6fd;font-size:13px;line-height:1.5}.passportDrawer{position:relative;overflow:hidden}.drawerClose,.demoModal>button,.replacementPanel>button{position:absolute;right:10px;top:10px;width:30px;height:30px;padding:0}.passportHero{display:grid;grid-template-columns:1fr 66px;gap:12px;align-items:center;border:1px solid rgba(125,211,252,0.18);border-radius:8px;background:rgba(15,23,42,0.62);padding:12px}.passportHero strong{display:block;color:#f8fafc;line-height:1.25}.drawerSnapshot{margin-top:12px}.miniTrend div{display:grid;grid-template-columns:repeat(7,1fr);align-items:end;gap:3px;height:44px;margin:8px 0 4px}.miniTrend i{display:block;min-height:8px;border-radius:999px 999px 2px 2px;background:linear-gradient(180deg,#67e8f9,rgba(14,165,233,0.24))}.statusDot{display:inline-block;width:9px;height:9px;margin-right:7px;border-radius:999px;background:#22c55e;box-shadow:0 0 14px #22c55e}.statusDot.danger{background:#f87171;box-shadow:0 0 14px #f87171}.qrBox{display:grid;place-items:center;aspect-ratio:1;border:1px dashed rgba(125,211,252,0.45);color:#67e8f9;font-weight:800}.passportTabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:12px 0}.passportTabs button{padding:8px 6px}.passportTabs button.isActive{border-color:rgba(34,211,238,0.68);color:#e0f2fe;background:rgba(14,165,233,0.18)}.passportList{display:grid;gap:8px;margin:0}.passportList div{display:grid;grid-template-columns:110px 1fr;gap:10px;border-bottom:1px solid rgba(125,211,252,0.12);padding-bottom:8px}.passportList dt{color:#93c5fd;font-size:12px}.passportList dd{margin:0;color:#f8fafc;font-size:13px}.serviceList,.documentList,.relatedBlock,.drawerActions{display:grid;gap:8px}.documentList button,.relatedBlock button{padding:9px 10px;text-align:left}.relatedBlock{margin-top:14px}.relatedBlock>span{color:#93c5fd;font-size:12px}.drawerActions{margin-top:14px}.notificationsPanel{grid-column:3;align-self:end;display:grid;gap:8px}.replacementPanel{position:fixed;z-index:20;left:50%;bottom:76px;width:min(760px,calc(100vw - 32px));transform:translateX(-50%);border:1px solid rgba(34,211,238,0.46);border-radius:8px;background:rgba(2,8,23,0.94);box-shadow:0 0 48px rgba(34,211,238,0.2);color:#e0f2fe;padding:18px 48px 18px 18px}.replacementPanel strong{display:block;margin-bottom:12px}.replacementPanel div{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.replacementPanel span{border:1px solid rgba(125,211,252,0.2);border-radius:8px;padding:10px;color:#93c5fd}.replacementPanel span.isDone{border-color:rgba(34,197,94,0.5);color:#bbf7d0}.dispatchBottomNav{position:fixed;z-index:18;left:0;right:0;bottom:0;display:flex;align-items:center;gap:8px;border-top:1px solid rgba(56,189,248,0.28);background:rgba(2,8,23,0.94);box-shadow:0 -18px 44px rgba(0,0,0,0.36);padding:10px 14px;backdrop-filter:blur(18px)}.dispatchBottomNav button{white-space:nowrap}.bottomMeta{display:flex;align-items:center;gap:10px;margin-left:auto;color:#93c5fd;font-size:12px;white-space:nowrap}.bottomMeta input{width:146px;padding:7px 9px;font-size:12px}.modalBackdrop{position:fixed;z-index:40;inset:0;display:grid;place-items:center;background:rgba(0,0,0,0.64);padding:20px}.demoModal{position:relative;width:min(560px,100%);border:1px solid rgba(34,211,238,0.42);border-radius:8px;background:#020817;color:#dbeafe;box-shadow:0 0 64px rgba(34,211,238,0.2);padding:28px}.demoModal h2{margin:0 36px 12px 0}.demoModal p{margin:0;color:#bfdbfe;line-height:1.55}@keyframes dashFlow{from{stroke-dashoffset:0}to{stroke-dashoffset:-18}}@keyframes alarmPulse{0%,100%{box-shadow:0 0 18px rgba(248,113,113,0.45)}50%{box-shadow:0 0 36px rgba(248,113,113,0.95)}}@keyframes warningPulse{0%,100%{box-shadow:0 0 16px rgba(251,191,36,0.34)}50%{box-shadow:0 0 30px rgba(251,191,36,0.72)}}@media (max-width:1120px){.dispatchGrid{grid-template-columns:minmax(280px,360px) minmax(520px,1fr)}.passportDrawer,.notificationsPanel{grid-column:1 / -1}}@media (max-width:980px){.dispatchShell{margin:-16px;padding:16px 16px 120px}.dispatchGrid{display:block}.leftRail,.twinPanel,.passportDrawer,.notificationsPanel{margin-top:14px}.twinPanel{min-height:680px}.dispatchBottomNav,.bottomMeta{overflow-x:auto}}
      `}</style>
    </div>
  );
}
