import type {
  AlarmModel,
  EquipmentModel,
  StatusFilter,
  WorkspaceLayer,
  WorkspaceMockData,
  WorkspaceState,
} from "./types";

export function byId<T extends { id: string }>(items: T[], id?: string) {
  return id ? items.find((item) => item.id === id) : undefined;
}

export function statusRank(status: EquipmentModel["status"] | AlarmModel["severity"]) {
  if (status === "critical") return 3;
  if (status === "warning") return 2;
  if (status === "offline") return 1;
  return 0;
}

export function getSystemIdsForLayer(data: WorkspaceMockData, layer: WorkspaceLayer) {
  if (layer === "plan" || layer === "3d" || layer === "hvac") {
    return new Set(data.systems.map((system) => system.id));
  }

  return new Set(data.systems.filter((system) => system.layer === layer).map((system) => system.id));
}

export function matchesWorkspaceLayer(
  data: WorkspaceMockData,
  equipment: EquipmentModel,
  layer: WorkspaceLayer,
) {
  if (layer === "plan" || layer === "hvac" || layer === "3d") return true;

  const system = byId(data.systems, equipment.systemId);
  if (system?.layer === layer) return true;

  if (layer === "cooling") {
    return equipment.type === "chiller" || equipment.type === "fan_coil" || equipment.systemId === "cooling";
  }

  if (layer === "ventilation") {
    return equipment.type === "ahu" || system?.layer === "ventilation";
  }

  return false;
}

export function matchesStatus(status: EquipmentModel["status"], filter: StatusFilter) {
  return filter === "all" || status === filter;
}

export function getEquipmentAlarms(data: WorkspaceMockData, equipmentId?: string) {
  if (!equipmentId) return [];
  return data.alarms.filter((alarm) => alarm.equipmentId === equipmentId);
}

export function getRecommendedActions(data: WorkspaceMockData, equipmentId?: string, alarmId?: string) {
  if (!equipmentId) return [];

  return data.recommendedActions.filter((action) => {
    if (action.equipmentId !== equipmentId) return false;
    if (!alarmId) return true;
    return !action.alarmId || action.alarmId === alarmId;
  });
}

export function getZoneEquipment(data: WorkspaceMockData, zoneId?: string) {
  if (!zoneId) return [];
  return data.equipment.filter((equipment) => equipment.zoneId === zoneId);
}

export function getScopedEquipment(data: WorkspaceMockData, state: WorkspaceState) {
  return data.equipment.filter((equipment) => {
    if (state.selectedFloorId && equipment.floorId !== state.selectedFloorId) return false;
    if (state.selectedZoneId && equipment.zoneId !== state.selectedZoneId) return false;
    return true;
  });
}

export function getFilteredEquipment(data: WorkspaceMockData, state: WorkspaceState) {
  const query = state.searchQuery.trim().toLowerCase();

  return getScopedEquipment(data, state).filter((equipment) => {
    if (state.selectedSystemId && equipment.systemId !== state.selectedSystemId) return false;
    if (!matchesWorkspaceLayer(data, equipment, state.selectedLayer)) return false;
    if (!matchesStatus(equipment.status, state.statusFilter)) return false;

    if (!query) return true;

    return [
      equipment.name,
      equipment.displayName,
      equipment.sourceAlias,
      equipment.id,
      equipment.type,
      byId(data.zones, equipment.zoneId)?.name,
      byId(data.systems, equipment.systemId)?.name,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}

export function getObjectSummary(data: WorkspaceMockData) {
  const activeAlarms = data.alarms.filter((alarm) => alarm.status === "active");
  const criticalAlarms = activeAlarms.filter((alarm) => alarm.severity === "critical");
  const offlineEquipment = data.equipment.filter((equipment) => equipment.status === "offline");

  return {
    equipmentCount: data.equipment.length,
    activeAlarms: activeAlarms.length,
    criticalAlarms: criticalAlarms.length,
    offlineEquipment: offlineEquipment.length,
    warningZones: data.zones.filter((zone) => zone.status === "warning").length,
  };
}
