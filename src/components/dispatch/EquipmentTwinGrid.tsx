"use client";

import type {
  EquipmentTwinAssemblyState,
  EquipmentTwinId,
} from "../../lib/dispatch/equipmentTwinTypes";
import EquipmentTwinCard from "./EquipmentTwinCard";
import EquipmentTwinViewer from "./EquipmentTwinViewer";
import { equipmentTwins, getEquipmentTwinById } from "./equipmentTwins.config";

type EquipmentTwinGridProps = {
  selectedTwinId: EquipmentTwinId;
  twinStates: Record<EquipmentTwinId, EquipmentTwinAssemblyState>;
  relatedTwinIds: EquipmentTwinId[];
  onSelectTwin: (id: EquipmentTwinId) => void;
  onToggleTwinState: (id: EquipmentTwinId) => void;
  onOpenPassport: () => void;
};

export default function EquipmentTwinGrid({
  selectedTwinId,
  twinStates,
  relatedTwinIds,
  onSelectTwin,
  onToggleTwinState,
  onOpenPassport,
}: EquipmentTwinGridProps) {
  const activeEquipment = getEquipmentTwinById(selectedTwinId);
  const relatedIds = new Set(relatedTwinIds);
  const isExplodedLocked = Boolean(activeEquipment.explodedLocked);
  const activeTwinState = isExplodedLocked ? "assembled" : twinStates[activeEquipment.id];

  return (
    <section
      className="equipmentTwinSection"
      aria-label="3D equipment twins selector"
      data-active-twin-id={selectedTwinId}
      data-related-twin-ids={relatedTwinIds.join(",")}
      data-testid="dispatch-equipment-twin-selector"
      data-viewer-scope="equipment-twin-selector"
    >
      <div className="equipmentTwinHeader">
        <div>
          <p className="eyebrow">3D equipment twins</p>
          <h3>{activeEquipment.title}</h3>
        </div>
        <button
          type="button"
          disabled={isExplodedLocked}
          onClick={() => onToggleTwinState(activeEquipment.id)}
        >
          {isExplodedLocked
            ? activeEquipment.explodedLockedLabel ?? "Разборка модели в подготовке"
            : twinStates[activeEquipment.id] === "exploded"
              ? "Собрать"
              : "Разобрать"}
        </button>
      </div>

      <EquipmentTwinViewer
        equipment={activeEquipment}
        state={activeTwinState}
        onOpenPassport={onOpenPassport}
      />

      <div className="equipmentTwinCards" aria-label="Equipment twin selectors">
        {equipmentTwins.map((equipment) => (
          <EquipmentTwinCard
            key={equipment.id}
            equipment={equipment}
            state={equipment.explodedLocked ? "assembled" : twinStates[equipment.id]}
            isActive={equipment.id === selectedTwinId}
            isRelated={equipment.id !== selectedTwinId && relatedIds.has(equipment.id)}
            onSelect={() => onSelectTwin(equipment.id)}
            onToggleState={() => onToggleTwinState(equipment.id)}
          />
        ))}
      </div>

      <style jsx>{`
        .equipmentTwinSection {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 12px;
          border: 1px solid rgba(125, 211, 252, 0.2);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.54);
          margin: 16px 0;
          padding: 14px;
        }

        .equipmentTwinHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .equipmentTwinHeader h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 18px;
          line-height: 1.2;
        }

        .equipmentTwinHeader button {
          border: 1px solid rgba(56, 189, 248, 0.34);
          border-radius: 8px;
          background: rgba(14, 165, 233, 0.1);
          color: #e0f2fe;
          cursor: pointer;
          padding: 9px 11px;
        }

        .equipmentTwinHeader button:disabled {
          border-color: rgba(148, 163, 184, 0.24);
          background: rgba(15, 23, 42, 0.62);
          color: #94a3b8;
          cursor: default;
        }

        .equipmentTwinCards {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
        }

        @media (max-width: 1280px) {
          .equipmentTwinCards {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .equipmentTwinHeader {
            display: grid;
          }

          .equipmentTwinCards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
