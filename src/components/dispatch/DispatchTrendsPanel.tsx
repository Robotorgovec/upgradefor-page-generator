"use client";

import { useId, useMemo, useState } from "react";
import type {
  DispatchTrendKey,
  DispatchTrendPeriod,
  DispatchTrendPoint,
  DispatchTrendSeriesItem,
} from "../../data/dispatchDemo";

type DispatchTrendsPanelProps = {
  trendSeries: DispatchTrendSeriesItem[];
  selectedTrendKey: DispatchTrendKey;
  onTrendChange: (trendKey: DispatchTrendKey) => void;
};

type HoveredPoint = DispatchTrendPoint & {
  x: number;
  y: number;
};

const periods: Array<{ key: DispatchTrendPeriod; label: string }> = [
  { key: "24h", label: "24 часа" },
  { key: "7d", label: "7 дней" },
  { key: "30d", label: "30 дней" },
];

const viewBox = {
  width: 360,
  height: 180,
  paddingX: 28,
  paddingY: 22,
};

function formatTrendValue(value: number | null | undefined, unit: string) {
  if (typeof value !== "number") {
    return "DATA_ERROR";
  }

  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return `${rounded} ${unit}`;
}

export default function DispatchTrendsPanel({
  trendSeries,
  selectedTrendKey,
  onTrendChange,
}: DispatchTrendsPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<DispatchTrendPeriod>("24h");
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);
  const chartId = useId().replace(/:/g, "");

  const selectedTrend =
    trendSeries.find((trend) => trend.key === selectedTrendKey) ?? trendSeries[0];

  const chart = useMemo(() => {
    const points = selectedTrend?.periods[selectedPeriod] ?? [];
    const values = points
      .map((point) => point.value)
      .filter((value): value is number => typeof value === "number");
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 0;
    const range = Math.max(maxValue - minValue, 1);
    const innerWidth = viewBox.width - viewBox.paddingX * 2;
    const innerHeight = viewBox.height - viewBox.paddingY * 2;

    const plottedPoints = points.map((point, index) => {
      const x =
        viewBox.paddingX +
        (points.length === 1 ? innerWidth / 2 : (innerWidth / (points.length - 1)) * index);
      const y =
        typeof point.value === "number"
          ? viewBox.paddingY + innerHeight - ((point.value - minValue) / range) * innerHeight
          : viewBox.paddingY + 12;

      return { ...point, x, y };
    });
    const validPlottedPoints = plottedPoints.filter(
      (point): point is typeof point & { value: number } => typeof point.value === "number",
    );
    const invalidPoints = plottedPoints.filter((point) => point.quality === "DATA_ERROR");
    const averageValue =
      values.length > 0 ? values.reduce((total, value) => total + value, 0) / values.length : null;
    const latestValidPoint = validPlottedPoints[validPlottedPoints.length - 1] ?? null;

    return {
      plottedPoints,
      validPlottedPoints,
      invalidPoints,
      polyline: validPlottedPoints.map((point) => `${point.x},${point.y}`).join(" "),
      minValue,
      maxValue,
      averageValue,
      latestValidPoint,
    };
  }, [selectedPeriod, selectedTrend]);

  if (!selectedTrend) {
    return null;
  }

  const gridId = `dispatch-trend-grid-${chartId}`;
  const fillId = `dispatch-trend-fill-${chartId}`;

  return (
    <section className="dispatchTrendsPanel">
      <div className="dispatchTrendsPanel__header">
        <div>
          <p className="dispatchTrendsPanel__eyebrow">Тренды</p>
          <h2 className="dispatchTrendsPanel__title">Параметры диспетчеризации</h2>
        </div>

        <div className="dispatchTrendsPanel__periods" aria-label="Период тренда">
          {periods.map((period) => (
            <button
              key={period.key}
              type="button"
              className={selectedPeriod === period.key ? "isActive" : undefined}
              onClick={() => {
                setSelectedPeriod(period.key);
                setHoveredPoint(null);
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dispatchTrendsPanel__tabs" role="tablist" aria-label="Показатель тренда">
        {trendSeries.map((trend) => {
          const isSelected = trend.key === selectedTrend.key;

          return (
            <button
              key={trend.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={isSelected ? "isActive" : undefined}
              onClick={() => {
                onTrendChange(trend.key);
                setHoveredPoint(null);
              }}
            >
              <span className="dispatchTrendsPanel__tabLabel">
                <span className="dispatchTrendsPanel__tabDot" style={{ backgroundColor: trend.color }} />
                {trend.label}
              </span>
              <span className="dispatchTrendsPanel__tabUnit">{trend.unit}</span>
            </button>
          );
        })}
      </div>

      <div className="dispatchTrendsPanel__summary" data-testid="dispatch-trends-summary">
        <article data-testid="dispatch-trends-current">
          <span>Текущее</span>
          <strong>{formatTrendValue(chart.latestValidPoint?.value, selectedTrend.unit)}</strong>
          <small>{chart.latestValidPoint ? `last valid · ${chart.latestValidPoint.label}` : "Нет валидных точек"}</small>
        </article>
        <article>
          <span>Среднее</span>
          <strong>{formatTrendValue(chart.averageValue, selectedTrend.unit)}</strong>
          <small>{chart.validPlottedPoints.length} valid points</small>
        </article>
        <article>
          <span>Диапазон</span>
          <strong>
            {formatTrendValue(chart.minValue, selectedTrend.unit)} – {formatTrendValue(chart.maxValue, selectedTrend.unit)}
          </strong>
          <small>min / max за период</small>
        </article>
        <article className={chart.invalidPoints.length ? "isDataError" : undefined}>
          <span>Data health</span>
          <strong>
            {chart.validPlottedPoints.length}/{chart.plottedPoints.length} valid
          </strong>
          <small>
            {chart.invalidPoints.length
              ? "DATA_ERROR excluded from calculations"
              : "Все точки участвуют в расчете"}
          </small>
        </article>
      </div>

      <div className="dispatchTrendsPanel__chartWrap">
        {hoveredPoint ? (
          <div
            className={`dispatchTrendsPanel__tooltip ${
              hoveredPoint.quality === "DATA_ERROR" ? "isDataError" : ""
            }`}
            style={{
              left: `${Math.min(Math.max((hoveredPoint.x / viewBox.width) * 100, 8), 72)}%`,
              top: `${Math.min(Math.max((hoveredPoint.y / viewBox.height) * 100, 6), 70)}%`,
            }}
          >
            <span>{hoveredPoint.label}</span>
            {hoveredPoint.quality === "DATA_ERROR"
              ? hoveredPoint.qualityMessage ?? "DATA_ERROR"
              : `${hoveredPoint.value} ${selectedTrend.unit}`}
          </div>
        ) : null}

        <svg
          role="img"
          aria-label={`График: ${selectedTrend.label}`}
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          className="dispatchTrendsPanel__chart"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <pattern id={gridId} width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(125,211,252,0.16)" strokeWidth="1" />
            </pattern>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={selectedTrend.color} stopOpacity="0.24" />
              <stop offset="100%" stopColor={selectedTrend.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width={viewBox.width} height={viewBox.height} rx="18" fill={`url(#${gridId})`} />

          {chart.validPlottedPoints.length > 1 ? (
            <polygon
              points={`${viewBox.paddingX},${viewBox.height - viewBox.paddingY} ${chart.polyline} ${
                viewBox.width - viewBox.paddingX
              },${viewBox.height - viewBox.paddingY}`}
              fill={`url(#${fillId})`}
            />
          ) : null}

          <polyline
            points={chart.polyline}
            fill="none"
            stroke={selectedTrend.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />

          {chart.validPlottedPoints.map((point) => (
            <g key={`${point.label}-${point.value}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="10"
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(point)}
                onFocus={() => setHoveredPoint(point)}
                tabIndex={0}
              />
              <circle cx={point.x} cy={point.y} r="4" fill="#020617" stroke={selectedTrend.color} strokeWidth="3" />
            </g>
          ))}

          {chart.latestValidPoint ? (
            <g aria-hidden="true">
              <line
                x1={chart.latestValidPoint.x}
                x2={chart.latestValidPoint.x}
                y1={viewBox.paddingY}
                y2={viewBox.height - viewBox.paddingY}
                className="dispatchTrendsPanel__currentLine"
              />
              <circle
                cx={chart.latestValidPoint.x}
                cy={chart.latestValidPoint.y}
                r="7"
                fill="transparent"
                stroke="#f8fafc"
                strokeWidth="2"
              />
            </g>
          ) : null}

          {chart.invalidPoints.map((point) => (
            <g key={`${point.label}-DATA_ERROR`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(point)}
                onFocus={() => setHoveredPoint(point)}
                tabIndex={0}
              />
              <path
                d={`M ${point.x} ${point.y - 7} L ${point.x + 7} ${point.y} L ${point.x} ${point.y + 7} L ${point.x - 7} ${point.y} Z`}
                fill="#7f1d1d"
                stroke="#fca5a5"
                strokeWidth="2"
              />
              <text x={point.x} y={point.y + 3} textAnchor="middle" className="dispatchTrendsPanel__dataErrorIcon">
                !
              </text>
            </g>
          ))}

          {chart.plottedPoints.map((point) => (
            <text key={point.label} x={point.x} y={viewBox.height - 7} textAnchor="middle">
              {point.label}
            </text>
          ))}
        </svg>

        <div className="dispatchTrendsPanel__range">
          <span>
            min: {chart.minValue} {selectedTrend.unit}
          </span>
          <span>
            max: {chart.maxValue} {selectedTrend.unit}
          </span>
          {chart.invalidPoints.length ? (
            <span className="dispatchTrendsPanel__quality">
              DATA_ERROR: {chart.invalidPoints.length} point(s) excluded
            </span>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .dispatchTrendsPanel {
          border: 1px solid rgba(56, 189, 248, 0.26);
          border-radius: 8px;
          background: linear-gradient(145deg, rgba(8, 20, 38, 0.84), rgba(2, 8, 23, 0.74));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 52px rgba(0,0,0,0.34);
          padding: 16px;
          backdrop-filter: blur(18px);
        }

        .dispatchTrendsPanel__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .dispatchTrendsPanel__eyebrow {
          margin: 0;
          color: #67e8f9;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .dispatchTrendsPanel__title {
          margin: 4px 0 0;
          color: #f8fafc;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
        }

        .dispatchTrendsPanel__periods {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.72);
          padding: 4px;
        }

        .dispatchTrendsPanel__periods button,
        .dispatchTrendsPanel__tabs button {
          border: 0;
          font: inherit;
          cursor: pointer;
        }

        .dispatchTrendsPanel__periods button {
          border-radius: 8px;
          background: transparent;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 600;
          padding: 7px 12px;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .dispatchTrendsPanel__periods button:hover,
        .dispatchTrendsPanel__periods button.isActive {
          background: rgba(14, 165, 233, 0.2);
          color: #e0f2fe;
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.12);
        }

        .dispatchTrendsPanel__tabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .dispatchTrendsPanel__tabs button {
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.66);
          color: #bfdbfe;
          min-width: 0;
          min-height: 54px;
          padding: 10px 12px;
          text-align: left;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .dispatchTrendsPanel__tabs button:hover {
          border-color: rgba(34, 211, 238, 0.62);
          background: rgba(14, 165, 233, 0.14);
        }

        .dispatchTrendsPanel__tabs button.isActive {
          border-color: rgba(34, 211, 238, 0.72);
          background: rgba(14, 165, 233, 0.2);
          color: #ffffff;
          box-shadow: 0 0 24px rgba(34, 211, 238, 0.14);
        }

        .dispatchTrendsPanel__tabLabel {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .dispatchTrendsPanel__tabDot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          flex: 0 0 auto;
        }

        .dispatchTrendsPanel__tabUnit {
          display: block;
          margin-top: 4px;
          color: #93c5fd;
          font-size: 12px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .dispatchTrendsPanel__tabs button.isActive .dispatchTrendsPanel__tabUnit {
          color: #bae6fd;
        }

        .dispatchTrendsPanel__summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .dispatchTrendsPanel__summary article {
          min-width: 0;
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.5);
          padding: 10px;
        }

        .dispatchTrendsPanel__summary article.isDataError {
          border-color: rgba(248, 113, 113, 0.48);
          background: rgba(127, 29, 29, 0.22);
          box-shadow: inset 3px 0 0 rgba(248, 113, 113, 0.82);
        }

        .dispatchTrendsPanel__summary span {
          display: block;
          color: #93c5fd;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .dispatchTrendsPanel__summary strong {
          display: block;
          margin-top: 5px;
          color: #f8fafc;
          font-size: 14px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .dispatchTrendsPanel__summary small {
          display: block;
          margin-top: 4px;
          color: #93c5fd;
          font-size: 11px;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .dispatchTrendsPanel__summary article.isDataError strong,
        .dispatchTrendsPanel__summary article.isDataError small {
          color: #fecaca;
        }

        .dispatchTrendsPanel__chartWrap {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.58);
          padding: 12px;
        }

        .dispatchTrendsPanel__tooltip {
          position: absolute;
          z-index: 1;
          pointer-events: none;
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 8px;
          background: #020617;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 10px;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.22);
        }

        .dispatchTrendsPanel__tooltip span {
          display: block;
          color: #93c5fd;
          font-weight: 600;
        }

        .dispatchTrendsPanel__tooltip.isDataError {
          border-color: rgba(248, 113, 113, 0.72);
          background: rgba(127, 29, 29, 0.94);
          color: #fee2e2;
        }

        .dispatchTrendsPanel__tooltip.isDataError span {
          color: #fecaca;
        }

        .dispatchTrendsPanel__chart {
          display: block;
          width: 100%;
          height: 224px;
        }

        .dispatchTrendsPanel__chart text {
          fill: #93c5fd;
          font-size: 10px;
        }

        .dispatchTrendsPanel__dataErrorIcon {
          fill: #fee2e2 !important;
          font-size: 10px !important;
          font-weight: 900 !important;
        }

        .dispatchTrendsPanel__currentLine {
          stroke: rgba(248, 250, 252, 0.62);
          stroke-dasharray: 4 5;
          stroke-width: 1.5;
        }

        .dispatchTrendsPanel__range {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
          color: #93c5fd;
          font-size: 12px;
        }

        .dispatchTrendsPanel__quality {
          color: #fca5a5;
          font-weight: 800;
        }

        @media (max-width: 640px) {
          .dispatchTrendsPanel {
            padding: 16px;
          }

          .dispatchTrendsPanel__header {
            flex-direction: column;
          }

          .dispatchTrendsPanel__tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dispatchTrendsPanel__summary {
            grid-template-columns: 1fr;
          }

          .dispatchTrendsPanel__periods,
          .dispatchTrendsPanel__periods button {
            width: 100%;
          }

          .dispatchTrendsPanel__periods button {
            flex: 1 1 30%;
          }
        }
      `}</style>
    </section>
  );
}
