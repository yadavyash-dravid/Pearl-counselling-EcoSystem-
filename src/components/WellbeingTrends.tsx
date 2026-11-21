import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useEcosystem } from '../context/EcosystemContext';

interface DailyTrendPoint {
  dateLabel: string;
  mood: number;
  stress: number;
  note: string;
}

const CLIENT_30_DAY_SERIES: Record<string, DailyTrendPoint[]> = {
  'cli-rohan': [
    { dateLabel: '23 Oct', mood: 5.2, stress: 7.4, note: 'Heavy sprint deadline week' },
    { dateLabel: '26 Oct', mood: 5.6, stress: 6.9, note: 'Started evening walk routine' },
    { dateLabel: '29 Oct', mood: 5.4, stress: 7.1, note: 'Interrupted sleep mid-week' },
    { dateLabel: '01 Nov', mood: 6.0, stress: 6.3, note: 'First cognitive reframing check-in' },
    { dateLabel: '04 Nov', mood: 6.3, stress: 5.8, note: 'More consistent morning energy' },
    { dateLabel: '07 Nov', mood: 6.1, stress: 6.0, note: 'Busy client review day' },
    { dateLabel: '10 Nov', mood: 6.8, stress: 5.1, note: 'Weekend rest & journaling' },
    { dateLabel: '13 Nov', mood: 7.1, stress: 4.6, note: 'Settled sleep schedule' },
    { dateLabel: '16 Nov', mood: 7.5, stress: 4.2, note: 'PHQ-9 follow-up improved to Mild' },
    { dateLabel: '19 Nov', mood: 7.6, stress: 3.9, note: 'Steady focus through afternoon' },
    { dateLabel: '21 Nov', mood: 7.9, stress: 3.5, note: 'Calm baseline entering weekend' },
  ],
  'cli-aarav': [
    { dateLabel: '23 Oct', mood: 5.8, stress: 6.8, note: 'Pre-mock exam nervousness' },
    { dateLabel: '26 Oct', mood: 6.0, stress: 6.5, note: 'Started 5-min breathing breaks' },
    { dateLabel: '29 Oct', mood: 6.2, stress: 6.1, note: 'Better study pacing' },
    { dateLabel: '01 Nov', mood: 6.5, stress: 5.7, note: 'Screen-free wind-down helped' },
    { dateLabel: '04 Nov', mood: 6.3, stress: 5.9, note: 'Math unit test pressure' },
    { dateLabel: '07 Nov', mood: 6.9, stress: 5.0, note: 'Post-session clarity with Dr. Iyer' },
    { dateLabel: '10 Nov', mood: 7.1, stress: 4.7, note: 'Restful weekend hours' },
    { dateLabel: '14 Nov', mood: 7.4, stress: 4.3, note: 'GAD-7 eased into Mild range' },
    { dateLabel: '17 Nov', mood: 7.3, stress: 4.4, note: 'Balanced school & sport schedule' },
    { dateLabel: '19 Nov', mood: 7.7, stress: 3.8, note: 'Confident class presentation' },
    { dateLabel: '21 Nov', mood: 8.0, stress: 3.4, note: 'Steady sleep & calm focus' },
  ],
};

interface CustomTooltipPayloadItem {
  dataKey?: string;
  value?: number;
  payload?: DailyTrendPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
}

const WellbeingTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 px-3.5 py-2.5 shadow-lg text-xs space-y-1.5 min-w-[175px]">
      <div className="font-medium text-zinc-950 dark:text-white">{label}</div>
      {point && (
        <>
          <div className="flex items-center justify-between gap-4">
            <span className="text-indigo-700 dark:text-indigo-400">Mood score</span>
            <span className="font-mono-num font-semibold text-zinc-950 dark:text-white">
              {point.mood.toFixed(1)} / 10
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-amber-700 dark:text-amber-400">Stress load</span>
            <span className="font-mono-num font-semibold text-zinc-950 dark:text-white">
              {point.stress.toFixed(1)} / 10
            </span>
          </div>
          <div className="pt-1 border-t border-zinc-100 dark:border-slate-800 text-[11px] text-zinc-500 dark:text-slate-400 leading-snug max-w-[200px]">
            {point.note}
          </div>
        </>
      )}
    </div>
  );
};

interface WellbeingTrendsProps {
  clientId: string;
  clientName: string;
}

export const WellbeingTrends: React.FC<WellbeingTrendsProps> = ({ clientId, clientName }) => {
  const { theme } = useEcosystem();
  const [seriesFilter, setSeriesFilter] = useState<'both' | 'mood' | 'stress'>('both');

  const data = useMemo(
    () => CLIENT_30_DAY_SERIES[clientId] ?? CLIENT_30_DAY_SERIES['cli-rohan'],
    [clientId]
  );

  const metrics = useMemo(() => {
    const first = data[0];
    const latest = data[data.length - 1];
    const avgMood = data.reduce((sum, d) => sum + d.mood, 0) / data.length;
    const avgStress = data.reduce((sum, d) => sum + d.stress, 0) / data.length;
    const moodDelta = latest.mood - first.mood;
    const stressDelta = latest.stress - first.stress;
    return {
      latestMood: latest.mood.toFixed(1),
      latestStress: latest.stress.toFixed(1),
      avgMood: avgMood.toFixed(1),
      avgStress: avgStress.toFixed(1),
      moodDelta: `${moodDelta >= 0 ? '+' : ''}${moodDelta.toFixed(1)}`,
      stressDelta: `${stressDelta >= 0 ? '+' : ''}${stressDelta.toFixed(1)}`,
    };
  }, [data]);

  const isDark = theme === 'dark';
  const moodStroke = isDark ? '#818CF8' : '#3730A3';
  const stressStroke = isDark ? '#F59E0B' : '#B45309';
  const gridColor = isDark ? '#1E293B' : '#E4E4E7';
  const tickColor = isDark ? '#94A3B8' : '#71717A';

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <article className="mt-6 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-slate-800">
        <div>
          <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
            Wellbeing Trends
          </h3>
          <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
            {clientName} · Daily mood &amp; stress check-ins over the last 30 days (0–10 scale)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap items-center gap-5 text-xs">
            <div>
              <span className="text-zinc-500 dark:text-slate-400">Mood </span>
              <span className="font-mono-num font-semibold text-indigo-800 dark:text-indigo-400">
                {metrics.latestMood} / 10
              </span>
              <span className="font-mono-num text-emerald-700 dark:text-emerald-400 ml-1.5">
                ({metrics.moodDelta})
              </span>
            </div>
            <span aria-hidden="true" className="text-zinc-300 dark:text-slate-700">·</span>
            <div>
              <span className="text-zinc-500 dark:text-slate-400">Stress </span>
              <span className="font-mono-num font-semibold text-amber-700 dark:text-amber-400">
                {metrics.latestStress} / 10
              </span>
              <span className="font-mono-num text-emerald-700 dark:text-emerald-400 ml-1.5">
                ({metrics.stressDelta})
              </span>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800"
            role="group"
            aria-label="Filter wellbeing trend series"
          >
            {(['both', 'mood', 'stress'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSeriesFilter(option)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  seriesFilter === option
                    ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {option === 'both' ? 'Mood & Stress' : option === 'mood' ? 'Mood Only' : 'Stress Only'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-5 h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="wellbeingMoodFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={moodStroke} stopOpacity={isDark ? 0.28 : 0.16} />
                <stop offset="95%" stopColor={moodStroke} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="wellbeingStressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stressStroke} stopOpacity={isDark ? 0.22 : 0.14} />
                <stop offset="95%" stopColor={stressStroke} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              dy={8}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2.5, 5, 7.5, 10]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <Tooltip content={<WellbeingTooltip />} />

            {(seriesFilter === 'both' || seriesFilter === 'mood') && (
              <Area
                type="monotone"
                dataKey="mood"
                name="Mood"
                stroke={moodStroke}
                strokeWidth={2.25}
                fill="url(#wellbeingMoodFill)"
                activeDot={{ r: 4.5, strokeWidth: 0, fill: moodStroke }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={350}
              />
            )}

            {(seriesFilter === 'both' || seriesFilter === 'stress') && (
              <Area
                type="monotone"
                dataKey="stress"
                name="Stress"
                stroke={stressStroke}
                strokeWidth={2}
                strokeDasharray="4 3"
                fill="url(#wellbeingStressFill)"
                activeDot={{ r: 4.5, strokeWidth: 0, fill: stressStroke }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={350}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 bg-indigo-800 dark:bg-indigo-400 inline-block" aria-hidden="true" />
            <span>Mood (higher reflects calmer wellbeing)</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="w-4 h-0.5 border-t-2 border-dashed border-amber-700 dark:border-amber-400 inline-block"
              aria-hidden="true"
            />
            <span>Stress load (lower reflects relief)</span>
          </span>
        </div>
        <span className="font-mono-num">
          30d avg: Mood {metrics.avgMood} · Stress {metrics.avgStress}
        </span>
      </div>
    </article>
  );
};
