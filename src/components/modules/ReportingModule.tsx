import React, { useState } from 'react';
import { CheckCircle2, Copy, Printer, Share2 } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ROLE_POLICIES } from '../../data/rbac';

export const ReportingModule: React.FC = () => {
  const {
    activeRole,
    reports,
    organizations,
    clients,
    approveClinicalReport,
    generateReportShareToken,
    showToast,
  } = useEcosystem();

  const policy = ROLE_POLICIES[activeRole];
  const [reportType, setReportType] = useState<'individual' | 'organizational' | 'comparative'>('individual');
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? '');

  const activeReport = reports.find((r) => r.id === selectedReportId) ?? reports[0];

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCreateShareLink = () => {
    if (!activeReport) return;
    generateReportShareToken(activeReport.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Clinical, Individual & Institutional Reporting
          </h1>
          <p className="text-sm text-zinc-600 dark:text-slate-400 mt-0.5">
            Print-ready PDF exports, longitudinal comparisons, and time-limited encrypted share tokens
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800">
            {(['individual', 'organizational', 'comparative'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                  reportType === t
                    ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {reportType === 'individual' && activeReport && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 divide-y divide-zinc-100 dark:divide-slate-800 overflow-hidden no-print">
            {reports.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className={`w-full text-left p-4 transition-colors cursor-pointer ${
                  rep.id === activeReport.id
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'hover:bg-zinc-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-num font-semibold text-indigo-800 dark:text-indigo-300">
                    {rep.instrumentCode}
                  </span>
                  <span
                    className={
                      rep.reviewStatus === 'Approved by Clinician'
                        ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                        : 'text-amber-700 dark:text-amber-400 font-medium'
                    }
                  >
                    {rep.reviewStatus}
                  </span>
                </div>
                <div className="font-display text-sm font-semibold text-zinc-950 dark:text-white mt-1">
                  {rep.clientName}
                </div>
                <div className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
                  {rep.createdAt} · {rep.professionalName}
                </div>
              </button>
            ))}
          </div>

          {/* Printable Report Canvas */}
          <div className="lg:col-span-8 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-8 space-y-6 print-only-full">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 dark:border-slate-800 pb-5">
              <div>
                <div className="text-xs text-zinc-500 dark:text-slate-400">
                  Pearl Counsellors · Confidential Assessment Report
                </div>
                <h2 className="font-display text-2xl font-semibold text-zinc-950 dark:text-white mt-1">
                  {activeReport.clientName} — {activeReport.instrumentName}
                </h2>
                <div className="text-xs text-zinc-500 dark:text-slate-400 mt-1">
                  Reviewing Clinician: {activeReport.professionalName} · Date: {activeReport.createdAt}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white">
                  {activeReport.score} / {activeReport.maxScore}
                </div>
                <div className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
                  {activeReport.severityBand} Band
                </div>
              </div>
            </div>

            {activeReport.aiDraft ? (
              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <h3 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
                    Clinical Overview
                  </h3>
                  <p className="text-zinc-700 dark:text-slate-300 mt-1">
                    {activeReport.aiDraft.executiveSummary}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
                    Score Interpretation & Patterns
                  </h3>
                  <p className="text-zinc-700 dark:text-slate-300 mt-1">
                    {activeReport.aiDraft.scoreInterpretation} {activeReport.aiDraft.responsePatterns}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
                    Longitudinal Context
                  </h3>
                  <p className="text-zinc-700 dark:text-slate-300 mt-1">
                    {activeReport.aiDraft.longitudinalComparison}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-slate-300">
                Assessment scored at {activeReport.score}/{activeReport.maxScore} ({activeReport.severityBand} band).
                Generate an AI clinical draft in the AI Intelligence module or add clinician narrative notes prior to release.
              </p>
            )}

            <div className="pt-5 border-t border-zinc-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 no-print">
              <div className="flex flex-wrap items-center gap-2">
                {activeReport.reviewStatus === 'Pending Clinician Review' && policy.canApproveClinicalReports && (
                  <button
                    onClick={() => approveClinicalReport(activeReport.id, policy.actorName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sign Off Report</span>
                  </button>
                )}
                <button
                  onClick={handleCreateShareLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Generate 72h Secure Share Link</span>
                </button>
              </div>

              {activeReport.shareToken && (
                <button
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(`https://pearlcounsellors.in/share/${activeReport.shareToken}`)
                      .catch(() => {});
                    showToast('Copied encrypted share URL');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono-num text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>/share/{activeReport.shareToken} (exp {activeReport.shareExpiresAt})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === 'organizational' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 space-y-4 print-only-full">
          <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">
            Organizational Anonymized Cohort Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-medium">Organization</th>
                  <th className="py-2.5 pr-4 font-medium">Sector</th>
                  <th className="py-2.5 pr-4 font-medium text-right">Participation</th>
                  <th className="py-2.5 font-medium text-right">Wellbeing Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td className="py-2.5 pr-4 font-medium text-zinc-950 dark:text-white">{org.name}</td>
                    <td className="py-2.5 pr-4 text-zinc-500 dark:text-slate-400">{org.type}</td>
                    <td className="py-2.5 pr-4 text-right font-mono-num">{org.completionRatePct}%</td>
                    <td className="py-2.5 text-right font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                      {org.wellbeingIndex}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'comparative' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 space-y-4 print-only-full">
          <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">
            Longitudinal Comparative Progress Report
          </h2>
          <div className="divide-y divide-zinc-100 dark:divide-slate-800">
            {clients.map((cli) => {
              const first = cli.sessions[0];
              const last = cli.sessions[cli.sessions.length - 1];
              return (
                <div key={cli.id} className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-medium text-zinc-950 dark:text-white">{cli.name}</div>
                    <div className="text-zinc-500 dark:text-slate-400">
                      {cli.sessions.length} recorded sessions · {cli.organizationName || 'Individual Care'}
                    </div>
                  </div>
                  {first && last && (
                    <div className="font-mono-num text-zinc-700 dark:text-slate-300">
                      Baseline ({first.date}): {first.score}/{first.maxScore} → Latest ({last.date}):{' '}
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {last.score}/{last.maxScore} ({last.severityBand})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
