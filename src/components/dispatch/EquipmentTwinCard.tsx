"use client";

import type {
  EquipmentTwinAssemblyState,
  EquipmentTwinConfig,
} from "../../lib/dispatch/equipmentTwinTypes";
import { equipmentTwinSystemLabels } from "./equipmentTwins.config";

type EquipmentTwinCardProps = {
  equipment: EquipmentTwinConfig;
  state: EquipmentTwinAssemblyState;
  isActive: boolean;
  isRelated: boolean;
  onSelect: () => void;
  onToggleState: () => void;
};

export default function EquipmentTwinCard({
  equipment,
  state,
  isActive,
  isRelated,
  onSelect,
  onToggleState,
}: EquipmentTwinCardProps) {
  const isExplodedLocked = Boolean(equipment.explodedLocked);
  const displayedState = isExplodedLocked ? "assembled" : state;

  return (
    <article
      className={`equipmentTwinCard ${isActive ? "isActive" : ""} ${isRelated ? "isRelated" : ""}`}
      data-equipment-twin-id={equipment.id}
      data-selection-state={isActive ? "active" : isRelated ? "related" : "idle"}
      data-testid={`equipment-twin-card-${equipment.id}`}
    >
      <button
        aria-current={isActive ? "true" : undefined}
        className="equipmentTwinCardBody"
        type="button"
        onClick={onSelect}
      >
        <span className="equipmentTwinCardTopline">
          <span className="equipmentTwinStatus">{equipment.status}</span>
          {isActive ? <span className="equipmentTwinSelectionBadge">Выбрано</span> : null}
          {!isActive && isRelated ? <span className="equipmentTwinSelectionBadge related">Связано</span> : null}
        </span>
        <strong>{equipment.title}</strong>
        <small>{equipmentTwinSystemLabels[equipment.system]} · {equipment.location}</small>
        <span className="equipmentTwinMiniStatus">
          {displayedState === "exploded" ? "Разобрано" : "Собрано"} · Read-only
        </span>
      </button>
      <div className="equipmentTwinCardFooter">
        <button
          type="button"
          disabled={isExplodedLocked}
          onClick={(event) => {
            event.stopPropagation();
            onToggleState();
          }}
        >
          {isExplodedLocked
            ? equipment.explodedLockedLabel ?? "Разборка модели в подготовке"
            : displayedState === "exploded"
              ? "Собрать"
              : "Разобрать"}
        </button>
        <div>
          <span>Drag to rotate</span>
          <span>Scroll to zoom</span>
          <span>Click model to open passport</span>
        </div>
      </div>
      <style jsx>{`
        .equipmentTwinCard {
          display: grid;
          gap: 10px;
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.58);
          padding: 10px;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .equipmentTwinCard.isActive {
          border-color: rgba(34, 211, 238, 0.64);
          background: rgba(14, 165, 233, 0.14);
          box-shadow: 0 0 34px rgba(34, 211, 238, 0.2);
        }

        .equipmentTwinCard.isRelated {
          border-color: rgba(125, 211, 252, 0.36);
          background: rgba(14, 165, 233, 0.07);
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.07);
        }

        .equipmentTwinCardBody {
          display: grid;
          gap: 7px;
          width: 100%;
          border: 0;
          background: transparent;
          color: #dbeafe;
          cursor: pointer;
          padding: 0;
          text-align: left;
        }

        .equipmentTwinCardBody strong {
          color: #f8fafc;
          font-size: 14px;
          line-height: 1.2;
        }

        .equipmentTwinCardBody small {
          color: #93c5fd;
          font-size: 11px;
          line-height: 1.35;
        }

        .equipmentTwinCardTopline {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .equipmentTwinStatus,
        .equipmentTwinMiniStatus,
        .equipmentTwinSelectionBadge {
          width: fit-content;
          border: 1px solid rgba(34, 197, 94, 0.34);
          border-radius: 999px;
          color: #bbf7d0;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 7px;
        }

        .equipmentTwinSelectionBadge {
          border-color: rgba(34, 211, 238, 0.48);
          color: #e0f2fe;
          background: rgba(8, 145, 178, 0.18);
        }

        .equipmentTwinSelectionBadge.related {
          border-color: rgba(147, 197, 253, 0.3);
          color: #bfdbfe;
          background: rgba(30, 41, 59, 0.46);
        }

        .equipmentTwinMiniStatus {
          border-color: rgba(125, 211, 252, 0.22);
          color: #bfdbfe;
        }

        .equipmentTwinCardFooter {
          display: grid;
          gap: 8px;
        }

        .equipmentTwinCardFooter > button {
          border: 1px solid rgba(56, 189, 248, 0.34);
          border-radius: 8px;
          background: rgba(14, 165, 233, 0.1);
          color: #e0f2fe;
          cursor: pointer;
          padding: 8px 10px;
        }

        .equipmentTwinCardFooter > button:disabled {
          border-color: rgba(148, 163, 184, 0.22);
          background: rgba(15, 23, 42, 0.62);
          color: #94a3b8;
          cursor: default;
        }

        .equipmentTwinCardFooter div {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .equipmentTwinCardFooter span {
          color: #64748b;
          font-size: 10px;
          line-height: 1.2;
        }
      `}</style>
    </article>
  );
}
