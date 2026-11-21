import React, { useState } from 'react';
import { Lock, Settings2, ShieldCheck } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ROLE_LIST } from '../../data/rbac';
import type { LicensingStatus } from '../../types/ecosystem';

const LICENSING_STATES: LicensingStatus[] = ['Licensed', 'Integrated', 'Pending', 'Demo-Only', 'Future'];

export const AdminModule: React.FC = () => {
  const {
    allInstruments,
    auditLogs,
    settings,
    updateLicensingStatus,
    updateSettings,
  } = useEcosystem();

  const [tab, setTab] = useState<'rbac' | 'licensing' | 'audit' | 'settings'>('rbac');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Administration, Licensing & Governance
          </h1>
          <p className="text-sm text-zinc-600 dark:text-slate-400 mt-0.5">
            10-role RBAC matrix, psychometric licensing registry, immutable audit trail, and white-label controls
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800 w-fit">
          {(['rbac', 'licensing', 'audit', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md uppercase transition-colors cursor-pointer ${
                tab === t
                  ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* RBAC Matrix */}
      {tab === 'rbac' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
            <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
              10-Role Separation & Permissions Matrix
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                  <th className="py-3 px-5 font-medium">Role & Persona</th>
                  <th className="py-3 px-4 font-medium">Clinical Details</th>
                  <th className="py-3 px-4 font-medium">Financial Ledger</th>
                  <th className="py-3 px-4 font-medium">Approve Payouts</th>
                  <th className="py-3 px-4 font-medium">Sign Off Reports</th>
                  <th className="py-3 px-5 font-medium">Modules Permitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {ROLE_LIST.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-5">
                      <div className="font-medium text-zinc-950 dark:text-white">{r.label}</div>
                      <div className="text-zinc-500 dark:text-slate-400">{r.actorName}</div>
                    </td>
                    <td className="py-3 px-4">{r.canViewClinicalDetails ? 'Permitted' : 'Restricted'}</td>
                    <td className="py-3 px-4">{r.canViewFinancialLedger ? 'Permitted' : 'Restricted'}</td>
                    <td className="py-3 px-4">{r.canApprovePayouts ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4">{r.canApproveClinicalReports ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-5 font-mono-num text-zinc-600 dark:text-slate-400">
                      {r.allowedModules.length} modules
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Licensing Registry */}
      {tab === 'licensing' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-slate-800">
            <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
              Assessment Licensing & Publisher Registry
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[520px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                  <th className="py-3 px-5 font-medium">Instrument</th>
                  <th className="py-3 px-4 font-medium">Qualification</th>
                  <th className="py-3 px-4 font-medium text-right">Fee (INR)</th>
                  <th className="py-3 px-5 font-medium text-right">Licensing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {allInstruments.map((inst) => (
                  <tr key={inst.id}>
                    <td className="py-2.5 px-5">
                      <span className="font-mono-num font-semibold text-indigo-800 dark:text-indigo-300 mr-2">
                        {inst.code}
                      </span>
                      <span className="text-zinc-900 dark:text-slate-100">{inst.name}</span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-600 dark:text-slate-400">{inst.qualificationRequired}</td>
                    <td className="py-2.5 px-4 text-right font-mono-num">
                      ₹{inst.priceInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-5 text-right">
                      <select
                        value={inst.licensingStatus}
                        onChange={(e) => updateLicensingStatus(inst.id, e.target.value as LicensingStatus)}
                        className="px-2.5 py-1 text-xs rounded border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                      >
                        {LICENSING_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {tab === 'audit' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
              Immutable Ecosystem Audit Trail
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-medium text-zinc-950 dark:text-white">{log.action}</span>
                  <span className="text-zinc-400 mx-2">·</span>
                  <span className="text-zinc-600 dark:text-slate-300">{log.target}</span>
                </div>
                <div className="text-zinc-500 dark:text-slate-400 font-mono-num">
                  {log.actorName} ({log.actorRole}) · {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Settings & White-Label Controls */}
      {tab === 'settings' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 space-y-5 max-w-2xl">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-slate-800 pb-3">
            <Settings2 className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
            <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
              White-Label, Retention & DPDP Consent Configuration
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-600 dark:text-slate-400 mb-1">Workspace Brand Title</label>
              <input
                value={settings.brandTitle}
                onChange={(e) => updateSettings({ brandTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-zinc-600 dark:text-slate-400 mb-1">Clinical Data Retention (Years)</label>
              <input
                type="number"
                min={1}
                max={25}
                value={settings.retentionYears}
                onChange={(e) => updateSettings({ retentionYears: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950 font-mono-num"
              />
            </div>
          </div>

          <div className="space-y-3 text-xs pt-2">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF9F6] dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 cursor-pointer">
              <span>Enforce Parent / Guardian consent before minor assessment release</span>
              <input
                type="checkbox"
                checked={settings.requireGuardianConsentForMinors}
                onChange={(e) => updateSettings({ requireGuardianConsentForMinors: e.target.checked })}
                className="accent-indigo-700"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF9F6] dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 cursor-pointer">
              <span>Require qualified clinician sign-off on all AI report drafts</span>
              <input
                type="checkbox"
                checked={settings.requireClinicianSignOffForAiDrafts}
                onChange={(e) => updateSettings({ requireClinicianSignOffForAiDrafts: e.target.checked })}
                className="accent-indigo-700"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF9F6] dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 cursor-pointer">
              <span>Display India DPDP Act explicit data consent notice on intake</span>
              <input
                type="checkbox"
                checked={settings.dpdpConsentNoticeEnabled}
                onChange={(e) => updateSettings({ dpdpConsentNoticeEnabled: e.target.checked })}
                className="accent-indigo-700"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
