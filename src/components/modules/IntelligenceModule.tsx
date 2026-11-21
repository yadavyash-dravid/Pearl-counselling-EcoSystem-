import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ROLE_POLICIES } from '../../data/rbac';
import type { ClinicalDraftPayload } from '../../types/ecosystem';

interface OrgInsightPayload {
  headlineFinding: string;
  trendAnalysis: string;
  departmentPriorities: string[];
  programRecommendations: string[];
  privacyComplianceNote: string;
}

export const IntelligenceModule: React.FC = () => {
  const {
    activeRole,
    reports,
    clients,
    organizations,
    domains,
    saveReportAiDraft,
    approveClinicalReport,
  } = useEcosystem();

  const policy = ROLE_POLICIES[activeRole];

  const [tab, setTab] = useState<'clinical' | 'organizational' | 'assistant'>(
    activeRole === 'org_admin' || activeRole === 'hr_pro' || activeRole === 'school_admin'
      ? 'organizational'
      : 'clinical'
  );

  // Clinical Draft State
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? '');
  const [language, setLanguage] = useState('English');
  const [reportTone, setReportTone] = useState('Clinical Summary');
  const [clinicianNotes, setClinicianNotes] = useState(
    'Client reports improved sleep hygiene over past 3 weeks; receptive to structured behavioral activation.'
  );
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Org Insights State
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id ?? '');
  const [orgFocus, setOrgFocus] = useState('Burnout Prevention & Resilience Support');
  const [orgInsights, setOrgInsights] = useState<OrgInsightPayload | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);

  // Assistant State
  const [assistantQuery, setAssistantQuery] = useState(
    'Which assessments are recommended for adolescent academic anxiety and require guardian consent?'
  );
  const [assistantAnswer, setAssistantAnswer] = useState<string | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);

  const selectedReport = useMemo(
    () => reports.find((r) => r.id === selectedReportId) ?? reports[0],
    [reports, selectedReportId]
  );

  const selectedOrg = useMemo(
    () => organizations.find((o) => o.id === selectedOrgId) ?? organizations[0],
    [organizations, selectedOrgId]
  );

  const handleGenerateClinicalDraft = async () => {
    if (!selectedReport) return;
    setDraftLoading(true);
    setDraftError(null);

    const client = clients.find((c) => c.id === selectedReport.clientId);
    const historyStr = client
      ? client.sessions
          .map((s) => `${s.date}: ${s.instrumentCode} ${s.score}/${s.maxScore} (${s.severityBand})`)
          .join(' -> ')
      : '';

    try {
      const res = await fetch('/api/ai/clinical-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: selectedReport.clientName,
          assessmentTitle: `${selectedReport.instrumentCode} — ${selectedReport.instrumentName}`,
          domain: selectedReport.domainName,
          scoreSummary: `Total Score ${selectedReport.score}/${selectedReport.maxScore} (${selectedReport.severityBand} band) recorded on ${selectedReport.createdAt}.`,
          historicalContext: historyStr,
          clinicianNotes,
          language,
          reportTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDraftError(data.error || 'Failed to generate AI clinical draft.');
      } else {
        saveReportAiDraft(selectedReport.id, data.draft as ClinicalDraftPayload, language);
      }
    } catch {
      setDraftError('Network error communicating with Pearl Counsellors AI server.');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleGenerateOrgInsights = async () => {
    if (!selectedOrg) return;
    setOrgLoading(true);
    setOrgError(null);

    const summary =
      `Total seats: ${selectedOrg.totalSeats}, Used: ${selectedOrg.usedSeats}, Completion: ${selectedOrg.completionRatePct}%, Overall Wellbeing Index: ${selectedOrg.wellbeingIndex}/100. ` +
      'Departments: ' +
      selectedOrg.departments
        .map(
          (d) =>
            `${d.name} (${d.completedAssessments}/${d.allocatedSeats} completed, Wellbeing ${d.wellbeingScore}/100)`
        )
        .join('; ');

    try {
      const res = await fetch('/api/ai/org-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: selectedOrg.name,
          organizationType: selectedOrg.type,
          cohortSummary: summary,
          focusArea: orgFocus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrgError(data.error || 'Failed to analyze organizational cohort.');
      } else {
        setOrgInsights(data.insights as OrgInsightPayload);
      }
    } catch {
      setOrgError('Network error communicating with Pearl Counsellors AI server.');
    } finally {
      setOrgLoading(false);
    }
  };

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantQuery.trim()) return;
    setAssistantLoading(true);
    setAssistantError(null);

    const catalogSummary = domains
      .map(
        (d) =>
          `${d.name}: ${d.categories
            .flatMap((c) => c.subcategories.flatMap((s) => s.instruments.map((i) => `${i.code} (${i.qualificationRequired}, ${i.licensingStatus})`)))
            .join(', ')}`
      )
      .join('\n');

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: assistantQuery,
          role: policy.label,
          contextCatalog: catalogSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssistantError(data.error || 'Assistant request failed.');
      } else {
        setAssistantAnswer(data.answer);
      }
    } catch {
      setAssistantError('Network error communicating with Pearl Counsellors AI server.');
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            AI Clinical & Organizational Intelligence
          </h1>
          <p className="text-sm text-zinc-600 dark:text-slate-400 mt-0.5">
            Live Gemini synthesis with strict non-diagnostic guardrails and mandatory clinician sign-off
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800 w-fit">
          {policy.canViewClinicalDetails && (
            <button
              onClick={() => setTab('clinical')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                tab === 'clinical'
                  ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-slate-400'
              }`}
            >
              Clinical Report Drafts
            </button>
          )}
          <button
            onClick={() => setTab('organizational')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'organizational'
                ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-slate-400'
            }`}
          >
            Cohort Wellbeing AI
          </button>
          <button
            onClick={() => setTab('assistant')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'assistant'
                ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-slate-400'
            }`}
          >
            Workflow Copilot
          </button>
        </div>
      </div>

      {/* Clinical Guardrail Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 flex items-start gap-3 text-xs text-zinc-700 dark:text-slate-300">
        <ShieldCheck className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-950 dark:text-white">Clinical AI Safety Policy:</span>{' '}
          Gemini models never diagnose patients, fabricate scores, or alter validated psychometric thresholds.
          All AI-generated report drafts remain locked in <span className="font-medium">Pending Clinician Review</span> until signed off by a qualified Psychologist or Counsellor.
        </div>
      </div>

      {/* Tab 1: Clinical Report Drafts */}
      {tab === 'clinical' && selectedReport && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
              Configure Report Synthesis
            </h2>

            <div>
              <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">
                Completed Assessment Record
              </label>
              <select
                value={selectedReport.id}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.clientName} · {r.instrumentCode} ({r.score}/{r.maxScore} · {r.reviewStatus})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Output Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Format Tone</label>
                <select
                  value={reportTone}
                  onChange={(e) => setReportTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                >
                  <option value="Clinical Summary">Clinical Summary</option>
                  <option value="Client-Friendly Feedback">Client-Friendly Feedback</option>
                  <option value="Guardian Brief">Parent / Guardian Brief</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">
                Clinician Contextual Observations
              </label>
              <textarea
                rows={3}
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              />
            </div>

            <button
              onClick={handleGenerateClinicalDraft}
              disabled={draftLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {draftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{draftLoading ? 'Synthesizing Draft with Gemini...' : 'Generate Live Gemini Clinical Draft'}</span>
            </button>

            {draftError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{draftError}</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-slate-800 pb-4">
              <div>
                <div className="text-xs text-zinc-500 dark:text-slate-400">
                  {selectedReport.clientName} · {selectedReport.instrumentCode} · Score{' '}
                  <span className="font-mono-num">
                    {selectedReport.score}/{selectedReport.maxScore}
                  </span>{' '}
                  ({selectedReport.severityBand})
                </div>
                <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-white mt-0.5">
                  AI Draft Output & Clinician Sign-Off
                </h3>
              </div>

              {selectedReport.reviewStatus === 'Approved by Clinician' ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved by {selectedReport.approvedBy}</span>
                </div>
              ) : (
                policy.canApproveClinicalReports &&
                selectedReport.aiDraft && (
                  <button
                    onClick={() => approveClinicalReport(selectedReport.id, policy.actorName)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Sign Off Report</span>
                  </button>
                )
              )}
            </div>

            {selectedReport.aiDraft ? (
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <div className="font-semibold text-zinc-950 dark:text-white mb-1">
                    Executive Summary ({selectedReport.language})
                  </div>
                  <p className="text-zinc-700 dark:text-slate-300">{selectedReport.aiDraft.executiveSummary}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-[#FAF9F6] dark:bg-slate-950 border border-zinc-200 dark:border-slate-800">
                    <div className="font-semibold text-zinc-950 dark:text-white mb-1">Score Interpretation</div>
                    <p className="text-zinc-600 dark:text-slate-300">{selectedReport.aiDraft.scoreInterpretation}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#FAF9F6] dark:bg-slate-950 border border-zinc-200 dark:border-slate-800">
                    <div className="font-semibold text-zinc-950 dark:text-white mb-1">Response Patterns</div>
                    <p className="text-zinc-600 dark:text-slate-300">{selectedReport.aiDraft.responsePatterns}</p>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-zinc-950 dark:text-white mb-1">Longitudinal Comparison</div>
                  <p className="text-zinc-700 dark:text-slate-300">
                    {selectedReport.aiDraft.longitudinalComparison}
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-zinc-950 dark:text-white mb-1">
                    Recommended Clinician Discussion Points
                  </div>
                  <ul className="space-y-1 text-zinc-700 dark:text-slate-300">
                    {selectedReport.aiDraft.recommendedNextSteps.map((step, i) => (
                      <li key={i}>· {step}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                  {selectedReport.aiDraft.clinicalCautionNote}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 dark:text-slate-400">
                No AI draft generated yet for {selectedReport.clientName}. Click &ldquo;Generate Live Gemini Clinical Draft&rdquo; to synthesize a structured summary.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Organizational Wellbeing Insights */}
      {tab === 'organizational' && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
              Anonymized Cohort Analytics
            </h2>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Institution</label>
              <select
                value={selectedOrg.id}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              >
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Analytical Focus</label>
              <input
                value={orgFocus}
                onChange={(e) => setOrgFocus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              />
            </div>
            <button
              onClick={handleGenerateOrgInsights}
              disabled={orgLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer disabled:opacity-60"
            >
              {orgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{orgLoading ? 'Analyzing Cohort...' : 'Analyze Cohort with Gemini'}</span>
            </button>

            {orgError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{orgError}</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6">
            {orgInsights ? (
              <div className="space-y-4 text-xs leading-relaxed">
                <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">
                  {orgInsights.headlineFinding}
                </h3>
                <p className="text-zinc-700 dark:text-slate-300">{orgInsights.trendAnalysis}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#FAF9F6] dark:bg-slate-950 border border-zinc-200 dark:border-slate-800">
                    <div className="font-semibold text-zinc-950 dark:text-white mb-2">Department Priorities</div>
                    <ul className="space-y-1.5 text-zinc-600 dark:text-slate-300">
                      {orgInsights.departmentPriorities.map((d, i) => (
                        <li key={i}>· {d}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-[#FAF9F6] dark:bg-slate-950 border border-zinc-200 dark:border-slate-800">
                    <div className="font-semibold text-zinc-950 dark:text-white mb-2">Program Recommendations</div>
                    <ul className="space-y-1.5 text-zinc-600 dark:text-slate-300">
                      {orgInsights.programRecommendations.map((r, i) => (
                        <li key={i}>· {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="text-zinc-500 dark:text-slate-400 pt-2 border-t border-zinc-100 dark:border-slate-800">
                  {orgInsights.privacyComplianceNote}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 dark:text-slate-400">
                Select an institutional cohort and run Gemini Cohort Analytics to synthesize de-identified department wellbeing recommendations.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Assessment Navigation & Workflow Copilot */}
      {tab === 'assistant' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 space-y-4">
          <form onSubmit={handleAskAssistant} className="space-y-3">
            <label className="block font-display text-sm font-semibold text-zinc-950 dark:text-white">
              Assessment Navigation & Workflow Assistant ({policy.label})
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={assistantQuery}
                onChange={(e) => setAssistantQuery(e.target.value)}
                placeholder="Ask about instrument selection, qualification tiers, or workflow routing..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              />
              <button
                type="submit"
                disabled={assistantLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                {assistantLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Ask Gemini</span>
              </button>
            </div>
          </form>

          {assistantError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{assistantError}</span>
            </div>
          )}

          {assistantAnswer && (
            <div className="p-4 rounded-lg bg-[#FAF9F6] dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 text-xs text-zinc-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {assistantAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
