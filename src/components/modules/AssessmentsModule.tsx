import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Play, Search, ShieldAlert, UserCheck } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ROLE_POLICIES } from '../../data/rbac';
import type { AssessmentInstrument, LicensingStatus, QualificationLevel } from '../../types/ecosystem';

export const AssessmentsModule: React.FC = () => {
  const {
    domains,
    allInstruments,
    clients,
    activeRole,
    submitDemoAssessment,
    assignAssessmentToClient,
    setActiveModule,
    toggleGuardianConsent,
  } = useEcosystem();

  const policy = ROLE_POLICIES[activeRole];

  const [selectedDomainId, setSelectedDomainId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('all');
  const [selectedInstrument, setSelectedInstrument] = useState<AssessmentInstrument>(allInstruments[0]);

  const [searchQuery, setSearchQuery] = useState('');
  const [licensingFilter, setLicensingFilter] = useState<'All' | LicensingStatus>('All');
  const [qualFilter, setQualFilter] = useState<'All' | QualificationLevel>('All');

  const [runnerOpen, setRunnerOpen] = useState(false);
  const [runnerClientId, setRunnerClientId] = useState(clients[0]?.id ?? '');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [lastScoredReportId, setLastScoredReportId] = useState<string | null>(null);
  const [assignClientId, setAssignClientId] = useState(clients[0]?.id ?? '');

  const currentDomain = useMemo(
    () => domains.find((d) => d.id === selectedDomainId),
    [domains, selectedDomainId]
  );

  const currentCategory = useMemo(
    () => currentDomain?.categories.find((c) => c.id === selectedCategoryId),
    [currentDomain, selectedCategoryId]
  );

  const visibleInstruments = useMemo(() => {
    return allInstruments.filter((inst) => {
      if (selectedDomainId !== 'all' && inst.domainId !== selectedDomainId) return false;
      if (selectedCategoryId !== 'all' && inst.categoryId !== selectedCategoryId) return false;
      if (selectedSubcategoryId !== 'all' && inst.subcategoryId !== selectedSubcategoryId) return false;
      if (licensingFilter !== 'All' && inst.licensingStatus !== licensingFilter) return false;
      if (qualFilter !== 'All' && inst.qualificationRequired !== qualFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inst.code.toLowerCase().includes(q) ||
          inst.name.toLowerCase().includes(q) ||
          inst.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    allInstruments,
    selectedDomainId,
    selectedCategoryId,
    selectedSubcategoryId,
    licensingFilter,
    qualFilter,
    searchQuery,
  ]);

  const runnerClient = clients.find((c) => c.id === runnerClientId);
  const minorConsentBlocked =
    runnerClient && runnerClient.ageGroup !== 'Adult' && !runnerClient.guardianConsentVerified;

  const handleSubmitRunner = () => {
    if (!runnerClient || minorConsentBlocked) return;
    const rawSum = selectedInstrument.demoItems.reduce((sum, item) => sum + (answers[item.id] ?? 1), 0);
    const maxDemoSum = selectedInstrument.demoItems.length * 3;
    const scaledScore = Math.round((rawSum / Math.max(1, maxDemoSum)) * selectedInstrument.maxScore);
    const created = submitDemoAssessment({
      clientId: runnerClient.id,
      instrumentId: selectedInstrument.id,
      totalScore: scaledScore,
    });
    if (created) setLastScoredReportId(created.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          Assessment Library
        </h1>
        <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">
          Browse by Domain → Category → Subcategory or run a simulated assessment
        </p>
      </div>

      {/* Clean Single-Row Filter Bar */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PHQ-9, WISC-V, RIASEC..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <select
          aria-label="Filter by Domain"
          value={selectedDomainId}
          onChange={(e) => {
            setSelectedDomainId(e.target.value);
            setSelectedCategoryId('all');
            setSelectedSubcategoryId('all');
          }}
          className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="all">All 16 Domains</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by Licensing Status"
          value={licensingFilter}
          onChange={(e) => setLicensingFilter(e.target.value as 'All' | LicensingStatus)}
          className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="All">All Licensing States</option>
          <option value="Integrated">Integrated</option>
          <option value="Licensed">Licensed</option>
          <option value="Pending">Pending</option>
          <option value="Demo-Only">Demo-Only</option>
          <option value="Future">Future</option>
        </select>

        <select
          aria-label="Filter by Qualification Level"
          value={qualFilter}
          onChange={(e) => setQualFilter(e.target.value as 'All' | QualificationLevel)}
          className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="All">All Qualifications</option>
          <option value="Level A">Level A</option>
          <option value="Level B">Level B</option>
          <option value="Level C">Level C</option>
        </select>
      </div>

      {/* Category & Subcategory Cascade when a Domain is picked */}
      {currentDomain && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            aria-label="Select Category"
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setSelectedSubcategoryId('all');
            }}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="all">All Categories in {currentDomain.name}</option>
            {currentDomain.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {currentCategory && (
            <select
              aria-label="Select Subcategory"
              value={selectedSubcategoryId}
              onChange={(e) => setSelectedSubcategoryId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="all">All Subcategories</option>
              {currentCategory.subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Calm 2-Column Split: List on Left, Focused Detail or Runner on Right */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-slate-800 text-xs font-medium text-zinc-500 dark:text-slate-400">
            {visibleInstruments.length} instruments
          </div>
          <div className="max-h-[540px] overflow-y-auto divide-y divide-zinc-100 dark:divide-slate-800/80">
            {visibleInstruments.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 dark:text-slate-400">
                No assessments match your filter.
              </div>
            ) : (
              visibleInstruments.map((inst) => {
                const active = inst.id === selectedInstrument.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => {
                      setSelectedInstrument(inst);
                      setRunnerOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 transition-colors cursor-pointer ${
                      active
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                        : 'hover:bg-zinc-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono-num font-semibold text-indigo-800 dark:text-indigo-300">
                        {inst.code}
                      </span>
                      <span className="font-mono-num text-zinc-500 dark:text-slate-400">
                        ₹{inst.priceInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-zinc-950 dark:text-white mt-1">{inst.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-slate-400 mt-1">
                      {inst.licensingStatus} · {inst.qualificationRequired} · {inst.durationMinutes} min
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-7 space-y-6">
          {!runnerOpen ? (
            <>
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-slate-800">
                <div>
                  <div className="text-xs text-zinc-500 dark:text-slate-400">
                    {selectedInstrument.code} · {selectedInstrument.licensingStatus} · {selectedInstrument.qualificationRequired}
                  </div>
                  <h2 className="font-display text-xl font-semibold text-zinc-950 dark:text-white mt-1">
                    {selectedInstrument.name}
                  </h2>
                </div>
                <div className="font-mono-num text-lg font-semibold text-zinc-950 dark:text-white shrink-0">
                  ₹{selectedInstrument.priceInr.toLocaleString('en-IN')}
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-slate-300 leading-relaxed">
                {selectedInstrument.summary}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <div className="text-zinc-500 dark:text-slate-400">Population</div>
                  <div className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                    {selectedInstrument.intendedPopulation}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 dark:text-slate-400">Administration</div>
                  <div className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                    {selectedInstrument.administrationMethod} · {selectedInstrument.durationMinutes} min
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-zinc-500 dark:text-slate-400">Domains Measured</div>
                  <div className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                    {selectedInstrument.domainsMeasured.join(' · ')}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setAnswers({});
                    setLastScoredReportId(null);
                    setRunnerOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Simulated Test</span>
                </button>

                {policy.canViewClinicalDetails && (
                  <div className="flex items-center gap-2">
                    <select
                      value={assignClientId}
                      onChange={(e) => setAssignClientId(e.target.value)}
                      className="px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignAssessmentToClient(assignClientId, selectedInstrument.id)}
                      className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-slate-800">
                <div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-400">Simulated Practice Session</div>
                  <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">
                    {selectedInstrument.code} — {selectedInstrument.name}
                  </h3>
                </div>
                <button
                  onClick={() => setRunnerOpen(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                >
                  Back
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-zinc-500 dark:text-slate-400">Client</span>
                <select
                  value={runnerClientId}
                  onChange={(e) => setRunnerClientId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.ageGroup})
                    </option>
                  ))}
                </select>
              </div>

              {minorConsentBlocked && runnerClient ? (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3 text-xs">
                  <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Guardian consent from {runnerClient.guardianName} is required for {runnerClient.name}.
                    </span>
                  </div>
                  <button
                    onClick={() => toggleGuardianConsent(runnerClient.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold bg-amber-700 text-white rounded-md cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verify Guardian Consent</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {selectedInstrument.demoItems.map((item, idx) => (
                      <div key={item.id} className="space-y-2 pb-4 border-b border-zinc-100 dark:border-slate-800 last:border-none">
                        <div className="text-xs font-medium text-zinc-900 dark:text-slate-100">
                          {idx + 1}. {item.prompt}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {item.options.map((opt) => {
                            const picked = answers[item.id] === opt.score;
                            return (
                              <button
                                key={opt.label}
                                onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: opt.score }))}
                                className={`text-left px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                                  picked
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-medium'
                                    : 'border-zinc-200 dark:border-slate-800 text-zinc-600 dark:text-slate-300'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {lastScoredReportId ? (
                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
                      <span className="inline-flex items-center gap-2 font-medium text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        Scored & queued ({lastScoredReportId.toUpperCase()})
                      </span>
                      <button
                        onClick={() => setActiveModule('intelligence')}
                        className="inline-flex items-center gap-1 font-semibold text-indigo-800 dark:text-indigo-300 hover:underline cursor-pointer"
                      >
                        <span>Open AI Draft</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmitRunner}
                      className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
                    >
                      Submit & Score Assessment
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
