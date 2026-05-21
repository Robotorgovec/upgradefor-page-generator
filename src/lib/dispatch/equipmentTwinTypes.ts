export type EquipmentTwinId =
  | "ahu-pv1"
  | "chiller"
  | "cooling-tower-small"
  | "fancoil-fc92"
  | "multi-split-system";

export type EquipmentTwinSystem = "ventilation" | "cooling" | "conditioning";

export type EquipmentTwinAssemblyState = "assembled" | "exploded";

export type EquipmentTwinExplodedTransform = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

export type EquipmentTwinConfig = {
  id: EquipmentTwinId;
  title: string;
  shortTitle: string;
  system: EquipmentTwinSystem;
  status: string;
  modelPath: string;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  inventoryNumber: string;
  year: string;
  lastEvent: string;
  serviceNote: string;
  trends: string[];
  relatedSystems: string[];
  explodedTransforms: Record<string, EquipmentTwinExplodedTransform>;
};
