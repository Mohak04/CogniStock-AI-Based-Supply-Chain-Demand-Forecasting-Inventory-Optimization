import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

export const ForecastChart = ({ data = [], sku = "SKU-101", height = 340, onHorizonChange }) => {
  const [horizon, setHorizon] = useState(30);

  const handleHorizonClick = (h) => {
    setHorizon(h);
    if (onHorizonChange) onHorizonChange(h);
  };

  // Find cutoff date where historical data ends
  const cutoffItem = data.find((d) => d.cutoffMarker);
  const cutoffDate = cutoffItem ? cutoffItem.date : "2026-08-30";

  // Filter or slice based on horizon selection if needed
  const displayData = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1 font-sans">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>Date: {label}</span>
            <span className={item.isForecast ? "text-amber-400 font-mono text-[10px]" : "text-blue-400 font-mono text-[10px]"}>
              {item.isForecast ? "PROTOTYPE FORECAST" : "HISTORICAL ACTUAL"}
            </span>
          </div>

          {!item.isForecast ? (
            <div className="text-blue-400 flex items-center justify-between gap-4 pt-1">
              <span>Actual Units Sold:</span>
              <span className="font-bold font-mono">{item.actual}</span>
            </div>
          ) : (
            <>
              <div className="text-amber-400 flex items-center justify-between gap-4 pt-1">
                <span>Forecasted Demand:</span>
                <span className="font-bold font-mono">{item.forecast}</span>
              </div>
              <div className="text-slate-400 text-[11px] flex items-center justify-between gap-4">
                <span>Confidence Band (85%):</span>
                <span className="font-mono">{item.forecastLower} - {item.forecastUpper}</span>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Horizon Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 rounded" />
            <span className="text-slate-300 font-medium">Historical Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 rounded border border-dashed border-amber-400" />
            <span className="text-slate-300 font-medium">Prototype Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-amber-500/20 rounded border border-amber-500/30" />
            <span className="text-slate-400 text-[11px]">85% Confidence Band</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[7, 14, 30].map((h) => (
            <button
              key={h}
              onClick={() => handleHorizonClick(h)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition-colors ${
                horizon === h
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {h} Days Horizon
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={displayData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              tickLine={false}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Historical Boundary Marker */}
            {cutoffDate && (
              <ReferenceLine
                x={cutoffDate}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{
                  value: "Historical Cutoff │ Forecast →",
                  position: "top",
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontFamily: "monospace"
                }}
              />
            )}

            {/* Confidence Interval Band */}
            <Area
              type="monotone"
              dataKey="forecastUpper"
              stroke="none"
              fill="url(#forecastBand)"
              connectNulls
            />

            {/* Historical Actual Line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
              name="Historical Actual"
              connectNulls={false}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#f59e0b' }}
              activeDot={{ r: 5 }}
              name="Prototype Forecast"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
