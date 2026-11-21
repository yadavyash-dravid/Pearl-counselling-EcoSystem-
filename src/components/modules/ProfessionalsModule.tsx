import React, { useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, ShieldCheck, UserCheck, UserPlus } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ROLE_POLICIES } from '../../data/rbac';
import type { VerificationStatus } from '../../types/ecosystem';

export const ProfessionalsModule: React.FC = () => {
  const {
    activeRole,
    professionals,
    clients,
    appointments,
    registerCounsellor,
    updateProfessionalVerification,
    toggleGuardianConsent,
    bookAppointment,
  } = useEcosystem();

  const policy = ROLE_POLICIES[activeRole];

  const [tab, setTab] = useState<'directory' | 'clients' | 'appointments'>(
    activeRole === 'guardian' ? 'clients' : 'directory'
  );
  const [roleFilter, setRoleFilter] = useState<'All' | 'Psychologist' | 'Counsellor'>('All');
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Registration form state
  const [newName, setNewName] = useState('');
  const [newRoleType, setNewRoleType] = useState<'Counsellor' | 'Psychologist'>('Counsellor');
  const [newCredential, setNewCredential] = useState('M.A. Counselling Psychology');
  const [newLicenseId, setNewLicenseId] = useState('');
  const [newCity, setNewCity] = useState('Pune');
  const [newRate, setNewRate] = useState(30);

  // Appointment form state
  const [aptClientId, setAptClientId] = useState(clients[0]?.id ?? '');
  const [aptProfId, setAptProfId] = useState(professionals[0]?.id ?? '');
  const [aptDate, setAptDate] = useState('2026-11-24 · 16:00 IST');
  const [aptMode, setAptMode] = useState<'Tele-Psychology' | 'In-Clinic' | 'Assessment Review'>('Tele-Psychology');

  const filteredProfessionals = useMemo(
    () =>
      professionals.filter((p) => {
        if (roleFilter !== 'All' && p.roleType !== roleFilter) return false;
        return true;
      }),
    [professionals, roleFilter]
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLicenseId.trim()) return;
    registerCounsellor({
      name: newName.trim(),
      roleType: newRoleType,
      credential: newCredential.trim(),
      rciOrLicenseId: newLicenseId.trim(),
      city: newCity.trim(),
      commissionRatePct: newRate,
      specializations: [newRoleType === 'Psychologist' ? 'Clinical Psychometrics' : 'Adult & Career Counselling'],
    });
    setNewName('');
    setNewLicenseId('');
    setShowRegisterForm(false);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    bookAppointment({
      clientId: aptClientId,
      professionalId: aptProfId,
      dateTime: aptDate,
      mode: aptMode,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Professional Network & Client Care
          </h1>
          <p className="text-sm text-zinc-600 dark:text-slate-400 mt-0.5">
            Credentialed psychologists, partner counsellors, verification queue, and minor guardian consent
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800">
            {(['directory', 'clients', 'appointments'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                  tab === t
                    ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {(activeRole === 'super_admin' || activeRole === 'platform_admin') && (
            <button
              onClick={() => setShowRegisterForm((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Onboard Professional</span>
            </button>
          )}
        </div>
      </div>

      {/* Onboarding Form */}
      {showRegisterForm && (
        <form
          onSubmit={handleRegister}
          className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between border-b border-zinc-100 dark:border-slate-800 pb-3">
            <h2 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
              Register New Professional & Issue Referral Code
            </h2>
            <button
              type="button"
              onClick={() => setShowRegisterForm(false)}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div>
            <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Full Name</label>
            <input
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Dr. Kavya Menon"
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Role Type</label>
            <select
              value={newRoleType}
              onChange={(e) => setNewRoleType(e.target.value as 'Counsellor' | 'Psychologist')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
            >
              <option value="Counsellor">Counsellor</option>
              <option value="Psychologist">Clinical Psychologist</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">RCI / Registration ID</label>
            <input
              required
              value={newLicenseId}
              onChange={(e) => setNewLicenseId(e.target.value)}
              placeholder="e.g., RCI-A92310"
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Qualification</label>
            <input
              value={newCredential}
              onChange={(e) => setNewCredential(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">City</label>
            <input
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Referral Split (%)</label>
            <input
              type="number"
              min={10}
              max={45}
              value={newRate}
              onChange={(e) => setNewRate(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950 font-mono-num"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
            >
              Create Profile & Generate Referral Code
            </button>
          </div>
        </form>
      )}

      {/* Directory Tab */}
      {tab === 'directory' && (
        <div className="space-y-4">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800 w-fit">
            {(['All', 'Psychologist', 'Counsellor'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  roleFilter === r
                    ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {filteredProfessionals.map((prof) => (
              <div
                key={prof.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-5 flex gap-4"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-slate-800 shrink-0">
                  {prof.avatarUrl ? (
                    <img
                      src={prof.avatarUrl}
                      alt={prof.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-sm font-semibold text-zinc-500">
                      {prof.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-slate-400">
                        {prof.roleType} · {prof.city} · {prof.rciOrLicenseId}
                      </div>
                      <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                        {prof.name}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-medium shrink-0 ${
                        prof.verificationStatus === 'Verified'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {prof.verificationStatus}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-slate-300">
                    {prof.credential} · {prof.specializations.join(' · ')}
                  </p>

                  <div className="pt-2 border-t border-zinc-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono-num text-zinc-600 dark:text-slate-400">
                      Code: {prof.referralCode} · {prof.activeClients} clients · {prof.commissionRatePct}% split
                    </span>

                    {(activeRole === 'super_admin' || activeRole === 'platform_admin') &&
                      prof.verificationStatus !== 'Verified' && (
                        <button
                          onClick={() => updateProfessionalVerification(prof.id, 'Verified' as VerificationStatus)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify Credential</span>
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clients & Guardian Consent Tab */}
      {tab === 'clients' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
                Client Registry & Guardian Consent Controls
              </h2>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                Child & adolescent clients require verified guardian consent before assessment release
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                  <th className="py-3 px-5 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Age Group</th>
                  <th className="py-3 px-4 font-medium">Assigned Clinician</th>
                  <th className="py-3 px-4 font-medium">Latest Session</th>
                  <th className="py-3 px-4 font-medium">Guardian Consent</th>
                  <th className="py-3 px-5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {clients.map((cli) => {
                  const prof = professionals.find((p) => p.id === cli.assignedProfessionalId);
                  const latest = cli.sessions[cli.sessions.length - 1];
                  return (
                    <tr key={cli.id} className="hover:bg-zinc-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-5">
                        <div className="font-medium text-zinc-950 dark:text-white">{cli.name}</div>
                        <div className="text-zinc-500 dark:text-slate-400">
                          {cli.organizationName || 'Individual Care'}
                          {cli.referredByCode ? ` · Ref ${cli.referredByCode}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-slate-300">{cli.ageGroup}</td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-slate-300">{prof?.name ?? 'Unassigned'}</td>
                      <td className="py-3 px-4 font-mono-num text-zinc-700 dark:text-slate-300">
                        {policy.canViewClinicalDetails && latest
                          ? `${latest.instrumentCode}: ${latest.score}/${latest.maxScore} (${latest.severityBand})`
                          : latest
                          ? `${latest.instrumentCode} completed`
                          : 'No sessions'}
                      </td>
                      <td className="py-3 px-4">
                        {cli.guardianConsentVerified ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            Verified {cli.guardianName ? `(${cli.guardianName})` : ''}
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 font-medium">
                            Pending ({cli.guardianName || 'Guardian'})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        {cli.ageGroup !== 'Adult' ? (
                          <button
                            onClick={() => toggleGuardianConsent(cli.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{cli.guardianConsentVerified ? 'Revoke' : 'Verify Consent'}</span>
                          </button>
                        ) : (
                          <span className="text-zinc-400">Self-consent</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {tab === 'appointments' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-5 space-y-3">
            <h2 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
              Scheduled Clinical & Review Appointments
            </h2>
            <div className="divide-y divide-zinc-100 dark:divide-slate-800">
              {appointments.map((apt) => (
                <div key={apt.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-zinc-950 dark:text-white">
                      {apt.clientName} with {apt.professionalName}
                    </div>
                    <div className="text-zinc-500 dark:text-slate-400 mt-0.5">{apt.mode}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-num text-zinc-700 dark:text-slate-300">{apt.dateTime}</div>
                    <div className="text-emerald-700 dark:text-emerald-400 mt-0.5">{apt.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleBook}
            className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
              <h2 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
                Schedule Session
              </h2>
            </div>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Client</label>
              <select
                value={aptClientId}
                onChange={(e) => setAptClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Professional</label>
              <select
                value={aptProfId}
                onChange={(e) => setAptProfId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.roleType})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Slot Date & Time</label>
              <input
                value={aptDate}
                onChange={(e) => setAptDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950 font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-slate-400 mb-1">Session Mode</label>
              <select
                value={aptMode}
                onChange={(e) => setAptMode(e.target.value as typeof aptMode)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              >
                <option value="Tele-Psychology">Tele-Psychology</option>
                <option value="In-Clinic">In-Clinic</option>
                <option value="Assessment Review">Assessment Review</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
            >
              Confirm Appointment Slot
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
