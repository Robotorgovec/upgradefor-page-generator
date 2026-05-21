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
  isHighlighted: boolean;
  onSelect: () => void;
  onToggleState: () => void;
};

export default function EquipmentTwinCard({
  equipment,
  state,
  isActive,
  isHighlighted,
  onSelect,
  onToggleState,
}: EquipmentTwinCardProps) {
  return (
    <article
      className={`equipmentTwinCard ${isActive ? "isActive" : ""} ${isHighlighted ? "isHighlighted" : ""}`}
    >
      <button className="equipmentTwinCardBody" type="button" onClick={onSelect}>
        <span className="equipmentTwinStatus">{equipment.status}</span>
        <strong>{equipment.title}</strong>
        <small>{equipmentTwinSystemLabels[equipment.system]} · {equipment.location}</small>
        <span className="equipmentTwinMiniStatus">
          {state === "exploded" ? "Разобрано" : "Собрано"} · Read-only
        </span>
      </button>
      <div className="equipmentTwinCardFooter">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleState();
          }}
        >
          {state === "exploded" ? "Собрать" : "Разобрать"}
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

        .equipmentTwinCard.isActive,
        .equipmentTwinCard.isHighlighted {
          border-color: rgba(34, 211, 238, 0.64);
          background: rgba(14, 165, 233, 0.14);
          box-shadow: 0 0 26px rgba(34, 211, 238, 0.12);
        }

        .equipmentTwinCard.isActive {
          box-shadow: 0 0 34px rgba(34, 211, 238, 0.2);
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

        .equipmentTwinStatus,
        .equipmentTwinMiniStatus {
          width: fit-content;
          border: 1px solid rgba(34, 197, 94, 0.34);
          border-radius: 999px;
          color: #bbf7d0;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 7px;
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
