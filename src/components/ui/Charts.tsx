import React, { useState } from 'react';

interface RevenuePoint {
  month: string;
  companyInr: number;
  commissionInr: number;
  assessments: number;
}

export const RevenueTrendChart: React.FC<{ data: RevenuePoint[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const w = 560;
  const h = 210;
  const padX = 44;
  const padY = 24;
  const maxVal = Math.max(...data.map((d) => d.companyInr + d.commissionInr), 1);

  const getX = (i: number) => padX + (i / Math.max(1, data.length - 1)) * (w - padX * 2);
  const getY = (val: number) => h - padY - (val / maxVal) * (h - padY * 2);

  const companyPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.companyInr).toFixed(1)}`)
    .join(' ');
  const commissionPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.commissionInr).toFixed(1)}`)
    .join(' ');
  const companyArea = `${companyPath} L ${getX(data.length - 1).toFixed(1)} ${(h - padY).toFixed(1)} L ${getX(0).toFixed(1)} ${(h - padY).toFixed(1)} Z`;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-indigo-600 dark:bg-indigo-400 inline-block" />
            Company Net Revenue (70%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-600 dark:bg-emerald-400 inline-block" />
            Counsellor Commissions (30%)
          </span>
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <span className="font-mono-num text-zinc-800 dark:text-slate-200">
            {data[hoveredIdx].month}: ₹{(data[hoveredIdx].companyInr / 1000).toFixed(0)}k net · ₹
            {(data[hoveredIdx].commissionInr / 1000).toFixed(0)}k partner · {data[hoveredIdx].assessments} tests
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-52 overflow-visible">
        <defs>
          <linearGradient id="companyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((tick) => {
          const y = getY(maxVal * tick);
          return (
            <g key={tick}>
              <line
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                className="stroke-zinc-200 dark:stroke-slate-800"
                strokeDasharray="3 3"
              />
              <text
                x={padX - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-zinc-400 dark:fill-slate-500 text-[10px] font-mono"
              >
                ₹{Math.round((maxVal * tick) / 100000)}L
              </text>
            </g>
          );
        })}
        <path d={companyArea} fill="url(#companyGrad)" />
        <path d={companyPath} fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" />
        <path d={commissionPath} fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.companyInr);
          return (
            <g
              key={d.month}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <rect x={cx - 24} y={0} width={48} height={h} fill="transparent" />
              <circle
                cx={cx}
                cy={cy}
                r={hoveredIdx === i ? 5 : 3.2}
                className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900"
                strokeWidth="1.5"
              />
              <circle
                cx={cx}
                cy={getY(d.commissionInr)}
                r={hoveredIdx === i ? 4.5 : 2.8}
                className="fill-emerald-700 dark:fill-emerald-400 stroke-white dark:stroke-slate-900"
                strokeWidth="1.5"
              />
              <text
                x={cx}
                y={h - 4}
                textAnchor="middle"
                className="fill-zinc-500 dark:fill-slate-400 text-[11px]"
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const HorizontalDistributionChart: React.FC<{
  items: { label: string; value: number; unit?: string }[];
}> = ({ items }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-700 dark:text-slate-300 font-medium truncate pr-3">{item.label}</span>
              <span className="font-mono-num text-zinc-600 dark:text-slate-400 shrink-0">
                {item.value.toLocaleString('en-IN')}
                {item.unit ? ` ${item.unit}` : ''}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ReferralFunnelChart: React.FC<{
  stages: { stage: string; count: number; conversion: string }[];
}> = ({ stages }) => {
  const topCount = stages[0]?.count || 1;
  return (
    <div className="space-y-2.5">
      {stages.map((s, idx) => {
        const widthPct = Math.max(18, Math.round((s.count / topCount) * 100));
        return (
          <div key={s.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-700 dark:text-slate-300 font-medium">
                0{idx + 1}. {s.stage}
              </span>
              <span className="font-mono-num text-zinc-500 dark:text-slate-400">
                {s.count.toLocaleString('en-IN')} · {s.conversion}
              </span>
            </div>
            <div className="h-6 w-full rounded-md bg-zinc-100 dark:bg-slate-800/80 flex items-center px-1">
              <div
                className="h-4 rounded bg-indigo-600/90 dark:bg-indigo-500/90 transition-all duration-300"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const LongitudinalTrajectoryChart: React.FC<{
  points: { date: string; score: number; maxScore: number; band: string }[];
}> = ({ points }) => {
  if (points.length === 0) return null;
  const w = 440;
  const h = 150;
  const padX = 36;
  const padY = 20;
  const maxVal = Math.max(...points.map((p) => p.maxScore), 30);
  const getX = (i: number) =>
    points.length === 1 ? w / 2 : padX + (i / (points.length - 1)) * (w - padX * 2);
  const getY = (val: number) => h - padY - (val / maxVal) * (h - padY * 2);
  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.score).toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      {[0.25, 0.5, 0.75].map((r) => (
        <line
          key={r}
          x1={padX}
          x2={w - padX}
          y1={getY(maxVal * r)}
          y2={getY(maxVal * r)}
          className="stroke-zinc-200 dark:stroke-slate-800"
          strokeDasharray="3 3"
        />
      ))}
      {points.length > 1 && (
        <path d={line} fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" />
      )}
      {points.map((p, i) => (
        <g key={`${p.date}-${i}`}>
          <circle
            cx={getX(i)}
            cy={getY(p.score)}
            r={4.5}
            className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900"
            strokeWidth="1.5"
          />
          <text
            x={getX(i)}
            y={getY(p.score) - 9}
            textAnchor="middle"
            className="fill-zinc-800 dark:fill-slate-200 text-[10px] font-mono"
          >
            {p.score}/{p.maxScore}
          </text>
          <text
            x={getX(i)}
            y={h - 4}
            textAnchor="middle"
            className="fill-zinc-500 dark:fill-slate-400 text-[10px]"
          >
            {p.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  );
};
