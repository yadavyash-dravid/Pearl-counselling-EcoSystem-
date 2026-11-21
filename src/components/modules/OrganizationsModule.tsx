import React, { useMemo, useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import type { OrganizationType } from '../../types/ecosystem';

export const OrganizationsModule: React.FC = () => {
  const { organizations, allInstruments, allocateOrgSeats, showToast } = useEcosystem();

  const [typeFilter, setTypeFilter] = useState<'All' | OrganizationType>('All');
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id ?? '');
  const [selectedDept, setSelectedDept] = useState(organizations[0]?.departments[0]?.name ?? '');
  const [seatIncrement, setSeatIncrement] = useState(100);
  const [bulkInstrumentId, setBulkInstrumentId] = useState(allInstruments[0]?.id ?? '');

  const filteredOrgs = useMemo(
    () => organizations.filter((o) => (typeFilter === 'All' ? true : o.type === typeFilter)),
    [organizations, typeFilter]
  );

  const selectedOrg = useMemo(
    () => organizations.find((o) => o.id === selectedOrgId) ?? filteredOrgs[0] ?? organizations[0],
    [filteredOrgs, organizations, selectedOrgId]
  );

  const handleSelectOrg = (orgId: string) => {
    setSelectedOrgId(orgId);
    const org = organizations.find((o) => o.id === orgId);
    if (org?.departments[0]) setSelectedDept(org.departments[0].name);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Organizations
          </h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">
            Schools, universities, hospitals, clinics, and corporate cohorts
          </p>
        </div>

        <select
          aria-label="Filter by Institution Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'All' | OrganizationType)}
          className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-fit"
        >
          <option value="All">All Sectors ({organizations.length})</option>
          <option value="School">School</option>
          <option value="College">College</option>
          <option value="University">University</option>
          <option value="Hospital">Hospital</option>
          <option value="Clinic">Clinic</option>
          <option value="Corporate Client">Corporate Client</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 divide-y divide-zinc-100 dark:divide-slate-800 overflow-hidden">
          {filteredOrgs.map((org) => {
            const active = selectedOrg?.id === org.id;
            return (
              <button
                key={org.id}
                onClick={() => handleSelectOrg(org.id)}
                className={`w-full text-left px-5 py-4 transition-colors cursor-pointer ${
                  active ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : 'hover:bg-zinc-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
                  <span>
                    {org.type} · {org.city}
                  </span>
                  <span className="font-mono-num text-emerald-700 dark:text-emerald-400">
                    {org.wellbeingIndex}/100
                  </span>
                </div>
                <div className="font-display text-sm font-semibold text-zinc-950 dark:text-white mt-1">
                  {org.name}
                </div>
              </button>
            );
          })}
        </div>

        {selectedOrg && (
          <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-7 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-slate-800">
              <div>
                <div className="text-xs text-zinc-500 dark:text-slate-400">
                  {selectedOrg.type} · {selectedOrg.city} · {selectedOrg.primaryContact}
                </div>
                <h2 className="font-display text-xl font-semibold text-zinc-950 dark:text-white mt-1">
                  {selectedOrg.name}
                </h2>
              </div>
              <div className="text-right font-mono-num">
                <div className="text-lg font-semibold text-zinc-950 dark:text-white">
                  {selectedOrg.usedSeats.toLocaleString('en-IN')} / {selectedOrg.totalSeats.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-zinc-500 dark:text-slate-400">seats used</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                    <th className="py-2 pr-4 font-medium">Department</th>
                    <th className="py-2 pr-4 font-medium text-right">Completed</th>
                    <th className="py-2 font-medium text-right">Wellbeing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                  {selectedOrg.departments.map((dept) => (
                    <tr key={dept.name}>
                      <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-slate-100">{dept.name}</td>
                      <td className="py-3 pr-4 text-right font-mono-num">
                        {dept.completedAssessments.toLocaleString('en-IN')} / {dept.allocatedSeats.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                        {dept.wellbeingScore}/100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-slate-800 grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                >
                  {selectedOrg.departments.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => allocateOrgSeats(selectedOrg.id, selectedDept, seatIncrement)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+{seatIncrement}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={bulkInstrumentId}
                  onChange={(e) => setBulkInstrumentId(e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                >
                  {allInstruments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const inst = allInstruments.find((i) => i.id === bulkInstrumentId);
                    if (inst) showToast(`Queued bulk ${inst.code} wave for ${selectedOrg.name}`);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
