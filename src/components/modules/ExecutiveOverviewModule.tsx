import React, { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { MONTHLY_REVENUE_SERIES } from '../../data/mockEcosystem';
import { ROLE_POLICIES } from '../../data/rbac';
import {
  HorizontalDistributionChart,
  LongitudinalTrajectoryChart,
  ReferralFunnelChart,
  RevenueTrendChart,
} from '../ui/Charts';

export const ExecutiveOverviewModule: React.FC = () => {
  const {
    activeRole,
    setActiveModule,
    domains,
    professionals,
    clients,
    organizations,
    transactions,
    commissionLedger,
    reports,
    appointments,
  } = useEcosystem();

  const policy = ROLE_POLICIES[activeRole];
  const [timeframe, setTimeframe] = useState<'30d' | '6m' | 'fy'>('6m');
  const [chartTab, setChartTab] = useState<'revenue' | 'funnel' | 'cohorts'>('revenue');

  const scaleFactor = timeframe === '30d' ? 0.25 : timeframe === '6m' ? 1 : 1.85;
  const settledTxns = transactions.filter((t) => t.status === 'Settled');
  const liveGrossInr = settledTxns.reduce((sum, t) => sum + t.grossAmountInr, 0);
  const pendingCommissionsInr = commissionLedger
    .filter((c) => c.status === 'Pending Clearance' || c.status === 'Approved for Payout')
    .reduce((sum, c) => sum + c.commissionAmountInr, 0);

  const totalAssessmentsPlatform = Math.round(2838 * scaleFactor) + reports.length;
  const avgCompletionRate = (
    organizations.reduce((acc, o) => acc + o.completionRatePct, 0) / Math.max(1, organizations.length)
  ).toFixed(1);

  const primaryClient = clients[0];

  const domainDistribution = useMemo(() => {
    return domains.slice(0, 5).map((d, idx) => ({
      label: d.name,
      value: Math.round((680 - idx * 90) * scaleFactor),
      unit: 'runs',
    }));
  }, [domains, scaleFactor]);

  const funnelStages = useMemo(
    () => [
      { stage: 'Referral Scans', count: Math.round(4820 * scaleFactor), conversion: '100%' },
      { stage: 'Client Registrations', count: Math.round(1940 * scaleFactor), conversion: '40.2%' },
      { stage: 'Assessment Checkouts', count: Math.round(1380 * scaleFactor), conversion: '71.1%' },
      { stage: 'Cleared Payouts', count: Math.round(1290 * scaleFactor), conversion: '93.5%' },
    ],
    [scaleFactor]
  );

  const chartSeries = useMemo(
    () =>
      MONTHLY_REVENUE_SERIES.map((m) => ({
        ...m,
        companyInr: Math.round(m.companyInr * (timeframe === '30d' ? 0.45 : timeframe === 'fy' ? 1.4 : 1)),
        commissionInr: Math.round(m.commissionInr * (timeframe === '30d' ? 0.45 : timeframe === 'fy' ? 1.4 : 1)),
      })),
    [timeframe]
  );

  const isClientOrGuardian = activeRole === 'client' || activeRole === 'guardian';

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            {policy.label}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">{policy.scopeSummary}</p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800 w-fit">
          {(['30d', '6m', 'fy'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-slate-400'
              }`}
            >
              {tf === '30d' ? '30 Days' : tf === '6m' ? '6 Months' : 'FY 26–27'}
            </button>
          ))}
        </div>
      </div>

      {/* Minimal 4-KPI Strip */}
      {isClientOrGuardian ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
            <div className="text-xs text-zinc-500 dark:text-slate-400">Assigned Assessments</div>
            <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white mt-2">
              {primaryClient.sessions.length + 1}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
            <div className="text-xs text-zinc-500 dark:text-slate-400">Approved Reports</div>
            <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white mt-2">
              {reports.filter((r) => r.reviewStatus === 'Approved by Clinician').length}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
            <div className="text-xs text-zinc-500 dark:text-slate-400">Consent Status</div>
            <div className="font-display text-lg font-semibold text-zinc-950 dark:text-white mt-2">
              {activeRole === 'guardian' ? 'Guardian Active' : 'Verified'}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
            <div className="text-xs text-zinc-500 dark:text-slate-400">Next Session</div>
            <div className="font-display text-sm font-semibold text-zinc-950 dark:text-white mt-2">
              {appointments[0]?.dateTime}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
            <div className="text-xs text-zinc-500 dark:text-slate-400">Assessments Completed</div>
            <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white mt-2">
              {totalAssessmentsPlatform.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
            <div className="text-xs text-zinc-500 dark:text-slate-400">Active Clients</div>
            <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white mt-2">
              {(7801 + clients.length).toLocaleString('en-IN')}
            </div>
          </div>

          {policy.canViewFinancialLedger || activeRole === 'counsellor' ? (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
              <div className="text-xs text-zinc-500 dark:text-slate-400">Simulated Revenue</div>
              <div className="font-mono-num text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                ₹{(Math.round(3701000 * scaleFactor) + liveGrossInr).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-slate-400 mt-1">
                Pending payouts: ₹{pendingCommissionsInr.toLocaleString('en-IN')}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
              <div className="text-xs text-zinc-500 dark:text-slate-400">Verified Clinicians</div>
              <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white mt-2">
                {professionals.filter((p) => p.verificationStatus === 'Verified').length} / {professionals.length}
              </div>
            </div>
          )}

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
            <div className="text-xs text-zinc-500 dark:text-slate-400">Cohort Completion</div>
            <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white mt-2">
              {avgCompletionRate}%
            </div>
          </div>
        </div>
      )}

      {/* Single Focused Analytical View with Clean Tabs */}
      {!isClientOrGuardian ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800">
              <button
                onClick={() => setChartTab('revenue')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartTab === 'revenue'
                    ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-slate-400'
                }`}
              >
                Revenue & Splits
              </button>
              <button
                onClick={() => setChartTab('funnel')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartTab === 'funnel'
                    ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-slate-400'
                }`}
              >
                Referrals & Domains
              </button>
              <button
                onClick={() => setChartTab('cohorts')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartTab === 'cohorts'
                    ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-slate-400'
                }`}
              >
                Organizations
              </button>
            </div>

            {policy.canViewClinicalDetails && (
              <button
                onClick={() => setActiveModule('intelligence')}
                className="text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Open AI Insights →
              </button>
            )}
          </div>

          {chartTab === 'revenue' && <RevenueTrendChart data={chartSeries} />}

          {chartTab === 'funnel' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-sm font-semibold text-zinc-950 dark:text-white mb-4">
                  Referral Conversion Funnel
                </h3>
                <ReferralFunnelChart stages={funnelStages} />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-zinc-950 dark:text-white mb-4">
                  Top Domains
                </h3>
                <HorizontalDistributionChart items={domainDistribution} />
              </div>
            </div>
          )}

          {chartTab === 'cohorts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4 font-medium">Organization</th>
                    <th className="py-2.5 pr-4 font-medium">Sector</th>
                    <th className="py-2.5 pr-4 font-medium text-right">Seats</th>
                    <th className="py-2.5 font-medium text-right">Wellbeing Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                  {organizations.map((org) => (
                    <tr key={org.id}>
                      <td className="py-3 pr-4 font-medium text-zinc-950 dark:text-white">{org.name}</td>
                      <td className="py-3 pr-4 text-zinc-500 dark:text-slate-400">{org.type}</td>
                      <td className="py-3 pr-4 text-right font-mono-num">
                        {org.usedSeats.toLocaleString('en-IN')} / {org.totalSeats.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                        {org.wellbeingIndex}/100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6">
            <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white mb-4">
              Progress Trajectory — {primaryClient.name}
            </h2>
            <LongitudinalTrajectoryChart
              points={primaryClient.sessions.map((s) => ({
                date: s.date,
                score: s.score,
                maxScore: s.maxScore,
                band: s.severityBand,
              }))}
            />
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                Upcoming Consultations
              </h2>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-slate-800">
              {appointments.map((apt) => (
                <div key={apt.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-slate-100">{apt.professionalName}</div>
                    <div className="text-zinc-500 dark:text-slate-400">{apt.mode}</div>
                  </div>
                  <div className="font-mono-num text-zinc-700 dark:text-slate-300">{apt.dateTime}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
