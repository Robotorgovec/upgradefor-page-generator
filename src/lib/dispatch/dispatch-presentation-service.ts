import type {
  DispatchExecutiveValueCard,
  DispatchPresentationModeState,
  DispatchPresentationStep,
  DispatchPresentationStepId,
  DispatchScenarioId,
  DispatchScenarioState,
} from "./types";

export const investorDemoScenarioId: DispatchScenarioId = "cooling-loop-pressure-drop";

export const dispatchPresentationSteps: DispatchPresentationStep[] = [
  {
    id: "opening",
    eyebrow: "Investor demo",
    title: "Object control workspace",
    script:
      "Start from a live-looking but simulated object workspace: object, floors, systems, alarms, and equipment are already connected in one operator view.",
    talkingPoints: [
      "The operator enters through the building, not through isolated 3D files.",
      "The interface is demo/simulated and does not control real equipment.",
      "The story is problem, diagnosis, recommendation, command intent, and audit trail.",
    ],
    presenterNote: "Use /dispatch?demo=investor for a repeatable one-click launch.",
    focus: "workspace",
  },
  {
    id: "incident",
    eyebrow: "Step 1",
    title: "Cooling incident appears",
    script:
      "Trigger a deterministic cooling-loop pressure drop. The affected pump is selected, the alarm opens, and the floor plan highlights the operational context.",
    talkingPoints: [
      "The system turns a raw alarm into a navigable incident.",
      "The URL deep link follows the selected equipment and alarm tab.",
      "This is still simulation only; no real equipment is touched.",
    ],
    presenterNote: "Click Start cooling incident or Next step from the opening slide.",
    focus: "alarm",
  },
  {
    id: "diagnosis",
    eyebrow: "Step 2",
    title: "Guided diagnosis",
    script:
      "The inspector explains what happened, probable cause, and the recommended next action in the same place as telemetry and alarms.",
    talkingPoints: [
      "The operator does not need to hunt across dashboards.",
      "Telemetry deviation, alarm text, and affected equipment remain synchronized.",
      "The guided card shows the value of an operational AI/BMS layer.",
    ],
    presenterNote: "Point to probable cause and recommended action in the right inspector.",
    focus: "inspector",
  },
  {
    id: "action",
    eyebrow: "Step 3",
    title: "Prepare safe demo command",
    script:
      "The operator prepares command intent with a confirmation guardrail. The command is posted to the simulated API boundary only.",
    talkingPoints: [
      "The UI makes action explicit before commit.",
      "The modal says this is a simulated Dispatch API command.",
      "Production control would require backend, roles, and equipment integration later.",
    ],
    presenterNote: "Click Prepare demo command, then Confirm via simulation.",
    focus: "command",
  },
  {
    id: "impact",
    eyebrow: "Step 4",
    title: "Business impact becomes visible",
    script:
      "After confirmation, the scenario advances locally and KPI estimates show faster diagnosis, avoided downtime, and transparent operator guidance.",
    talkingPoints: [
      "The demo records mitigation without claiming real equipment was fixed.",
      "KPI cards are explicitly demo estimates.",
      "The operator can explain value in under three minutes.",
    ],
    presenterNote: "Use the KPI strip to talk about response time, downtime, and confidence.",
    focus: "impact",
  },
  {
    id: "audit",
    eyebrow: "Step 5",
    title: "Audit trail and repeatability",
    script:
      "The command journal preserves operator intent, simulation result, and safety wording so the same story can be repeated for every investor demo.",
    talkingPoints: [
      "Journal entries link back to equipment history.",
      "The flow is resettable from the presenter controls.",
      "No real equipment was controlled at any point in the demo.",
    ],
    presenterNote: "Switch to Commands or History to show the audit trail.",
    focus: "journal",
  },
];

const firstPresentationStepId = dispatchPresentationSteps[0].id;

export function createInitialPresentationState(): DispatchPresentationModeState {
  return {
    enabled: false,
    activeStepId: firstPresentationStepId,
    scriptVisible: true,
  };
}

export function startDispatchPresentationMode(
  launchedFromUrl = false,
): DispatchPresentationModeState {
  return {
    enabled: true,
    activeStepId: firstPresentationStepId,
    scriptVisible: true,
    launchedFromUrl,
  };
}

export function stopDispatchPresentationMode(): DispatchPresentationModeState {
  return createInitialPresentationState();
}

export function toggleDispatchPresentationScript(
  presentation: DispatchPresentationModeState,
): DispatchPresentationModeState {
  return {
    ...presentation,
    scriptVisible: !presentation.scriptVisible,
  };
}

export function getDispatchPresentationStep(stepId: DispatchPresentationStepId) {
  return dispatchPresentationSteps.find((step) => step.id === stepId) ?? dispatchPresentationSteps[0];
}

export function getDispatchPresentationStepIndex(stepId: DispatchPresentationStepId) {
  return Math.max(0, dispatchPresentationSteps.findIndex((step) => step.id === stepId));
}

export function getNextPresentationStepId(stepId: DispatchPresentationStepId) {
  const index = getDispatchPresentationStepIndex(stepId);
  return dispatchPresentationSteps[Math.min(dispatchPresentationSteps.length - 1, index + 1)].id;
}

export function getPreviousPresentationStepId(stepId: DispatchPresentationStepId) {
  const index = getDispatchPresentationStepIndex(stepId);
  return dispatchPresentationSteps[Math.max(0, index - 1)].id;
}

export function selectDispatchPresentationStep(
  presentation: DispatchPresentationModeState,
  stepId: DispatchPresentationStepId,
): DispatchPresentationModeState {
  return {
    ...presentation,
    enabled: true,
    activeStepId: stepId,
    scriptVisible: true,
  };
}

export function getExecutiveValueCards(
  scenario: DispatchScenarioState,
): DispatchExecutiveValueCard[] {
  const incidentActive = scenario.id !== "normal-operations" && scenario.status !== "idle";
  const mitigated = scenario.status === "mitigated";

  return [
    {
      id: "diagnosis",
      label: "Time to diagnosis",
      value: incidentActive ? "< 60 sec" : "Ready",
      helperText: "Demo estimate from alarm to affected equipment context.",
      tone: mitigated ? "success" : "neutral",
    },
    {
      id: "downtime",
      label: "Downtime avoided",
      value: mitigated ? "18 min" : incidentActive ? "Projected" : "Armed",
      helperText: "Investor demo estimate, not a production SLA.",
      tone: mitigated ? "success" : "warning",
    },
    {
      id: "audit",
      label: "Audit clarity",
      value: mitigated ? "Recorded" : "Traceable",
      helperText: "Command intent and scenario steps remain linked.",
      tone: "neutral",
    },
    {
      id: "safety",
      label: "Control safety",
      value: "Simulated",
      helperText: "No real equipment control in presentation mode.",
      tone: "neutral",
    },
  ];
}
