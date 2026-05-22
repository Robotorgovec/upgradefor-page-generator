"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";

import type { EquipmentTwinAssemblyState } from "../../lib/dispatch/equipmentTwinTypes";
import type { EquipmentModel } from "../../lib/dispatch/types";
import { getEquipmentTwinById } from "./equipmentTwins.config";

const EquipmentTwinViewer = dynamic(() => import("./EquipmentTwinViewer"), {
  ssr: false,
  loading: () => (
    <div className="workspaceModelPlaceholder" aria-live="polite">
      <strong>Загрузка 3D-модуля</strong>
      <span>Первичный workspace уже доступен, модель подгружается отдельно.</span>
    </div>
  ),
});

type EquipmentModelViewerProps = {
  equipment: EquipmentModel;
};

type ModelBoundaryState = {
  hasError: boolean;
};

class ModelViewerBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  ModelBoundaryState
> {
  state: ModelBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: { children: React.ReactNode; fallback: React.ReactNode }) {
    if (previousProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default function EquipmentModelViewer({ equipment }: EquipmentModelViewerProps) {
  const [assemblyState, setAssemblyState] = useState<EquipmentTwinAssemblyState>("assembled");

  if (!equipment.model3d) {
    return (
      <div className="workspaceModelPlaceholder">
        <strong>3D-модель не привязана</strong>
        <span>Паспорт, телеметрия и аварии доступны без 3D. Привязка модели добавляется в registry.</span>
      </div>
    );
  }

  const twin = getEquipmentTwinById(equipment.model3d.twinId);

  return (
    <div className="workspaceModelWrap">
      <div className="workspaceModelToolbar">
        <div>
          <span>3D Model</span>
          <strong>{equipment.displayName}</strong>
        </div>
        <button
          type="button"
          onClick={() => setAssemblyState((state) => (state === "assembled" ? "exploded" : "assembled"))}
        >
          {assemblyState === "assembled" ? "Разобрать" : "Собрать"}
        </button>
      </div>
      <ModelViewerBoundary
        fallback={
          <div className="workspaceModelPlaceholder">
            <strong>3D viewer unavailable</strong>
            <span>Модель не удалось отрисовать. Остальные вкладки inspector остаются доступными.</span>
          </div>
        }
      >
        <EquipmentTwinViewer equipment={twin} state={assemblyState} onOpenPassport={() => undefined} />
      </ModelViewerBoundary>
      <style jsx>{`
        .workspaceModelWrap {
          display: grid;
          gap: 10px;
        }

        .workspaceModelToolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .workspaceModelToolbar span {
          display: block;
          color: #6b7280;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .workspaceModelToolbar strong {
          display: block;
          color: #111827;
          font-size: 14px;
        }

        .workspaceModelToolbar button {
          min-height: 36px;
          border: 1px solid #9ca3af;
          border-radius: 8px;
          background: #ffffff;
          color: #111827;
          cursor: pointer;
          font-weight: 800;
          padding: 8px 12px;
        }

        :global(.workspaceModelPlaceholder) {
          display: grid;
          min-height: 280px;
          place-content: center;
          gap: 8px;
          border: 1px dashed #a3a3a3;
          border-radius: 8px;
          background:
            linear-gradient(90deg, rgba(20, 184, 166, 0.08), rgba(245, 158, 11, 0.06)),
            #f8fafc;
          color: #111827;
          padding: 24px;
          text-align: center;
        }

        :global(.workspaceModelPlaceholder strong) {
          font-size: 18px;
        }

        :global(.workspaceModelPlaceholder span) {
          max-width: 420px;
          color: #4b5563;
          font-size: 13px;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}
