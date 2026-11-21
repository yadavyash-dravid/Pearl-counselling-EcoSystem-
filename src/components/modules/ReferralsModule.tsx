import React, { useMemo, useState } from 'react';
import { Check, Copy, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ROLE_POLICIES } from '../../data/rbac';
import { QrCodeSvg } from '../ui/QrCodeSvg';

export const ReferralsModule: React.FC = () => {
  const {
    activeRole,
    professionals,
    allInstruments,
    commissionLedger,
    transactions,
    simulateReferralCheckout,
    approveCommissionPayout,
    reverseTransaction,
    showToast,
  } = useEcosystem();

  const policy = ROLE_POLICIES[activeRole];

  const [tab, setTab] = useState<'simulator' | 'ledger'>('simulator');
  const [selectedProfId, setSelectedProfId] = useState(professionals[1]?.id ?? professionals[0]?.id);
  const [simClientName, setSimClientName] = useState('Anika Deshpande');
  const [simInstrumentId, setSimInstrumentId] = useState(
    allInstruments.find((i) => i.priceInr === 2000)?.id ?? allInstruments[0].id
  );
  const [simSplitPct, setSimSplitPct] = useState(30);
  const [simOutcome, setSimOutcome] = useState<'success' | 'duplicate_referral' | 'payment_failed'>('success');
  const [simResultMessage, setSimResultMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const selectedProf = useMemo(
    () => professionals.find((p) => p.id === selectedProfId) ?? professionals[0],
    [professionals, selectedProfId]
  );

  const selectedInstrument = useMemo(
    () => allInstruments.find((i) => i.id === simInstrumentId) ?? allInstruments[0],
    [allInstruments, simInstrumentId]
  );

  const referralUrl = `https://pearlcounsellors.in/r/${selectedProf.referralCode}`;
  const previewPartnerCut = Math.round((selectedInstrument.priceInr * simSplitPct) / 100);
  const previewCompanyCut = selectedInstrument.priceInr - previewPartnerCut;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedCode(text);
    showToast(`Copied ${text}`);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const res = simulateReferralCheckout({
      clientName: simClientName.trim() || 'Demo Client',
      referralCode: selectedProf.referralCode,
      instrumentId: selectedInstrument.id,
      paymentMethod: 'UPI (Simulated)',
      outcome: simOutcome,
      customCounsellorSplitPct: simSplitPct,
    });
    setSimResultMessage(res.message);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Referrals & Commissions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">
            Partner codes, QR attribution simulator, and commission payouts
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800 w-fit">
          <button
            onClick={() => setTab('simulator')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'simulator'
                ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-slate-400'
            }`}
          >
            Simulator & QR
          </button>
          <button
            onClick={() => setTab('ledger')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'ledger'
                ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-slate-400'
            }`}
          >
            Commission Ledger ({commissionLedger.length})
          </button>
        </div>
      </div>

      {tab === 'simulator' ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-zinc-950 dark:text-white">Partner Kit</span>
              <select
                value={selectedProf.id}
                onChange={(e) => {
                  setSelectedProfId(e.target.value);
                  const prof = professionals.find((p) => p.id === e.target.value);
                  if (prof) setSimSplitPct(prof.commissionRatePct);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-5">
              <QrCodeSvg value={referralUrl} size={104} className="shrink-0" />
              <div className="min-w-0 space-y-2">
                <div className="font-mono-num text-base font-semibold text-indigo-800 dark:text-indigo-300">
                  {selectedProf.referralCode}
                </div>
                <div className="text-xs text-zinc-500 dark:text-slate-400 truncate">{referralUrl}</div>
                <button
                  onClick={() => handleCopy(referralUrl)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {copiedCode === referralUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-slate-800 grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-zinc-500 dark:text-slate-400">Referrals</div>
                <div className="font-mono-num text-base font-semibold mt-0.5">{selectedProf.totalReferrals}</div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-slate-400">Pending</div>
                <div className="font-mono-num text-base font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                  ₹{selectedProf.pendingEarningsInr.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-slate-400">Paid Out</div>
                <div className="font-mono-num text-base font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  ₹{selectedProf.clearedEarningsInr.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleRunSimulation}
            className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6 space-y-5"
          >
            <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
              Checkout Attribution Simulator
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 dark:text-slate-400 mb-1.5">Client Name</label>
                <input
                  value={simClientName}
                  onChange={(e) => setSimClientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 dark:text-slate-400 mb-1.5">Assessment</label>
                <select
                  value={simInstrumentId}
                  onChange={(e) => setSimInstrumentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                >
                  {allInstruments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} — ₹{i.priceInr.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs text-zinc-500 dark:text-slate-400 mb-1.5">Scenario</label>
                <select
                  value={simOutcome}
                  onChange={(e) => setSimOutcome(e.target.value as typeof simOutcome)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                >
                  <option value="success">Successful Attribution</option>
                  <option value="duplicate_referral">Duplicate Referral Block</option>
                  <option value="payment_failed">Simulated Payment Failure</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-500 dark:text-slate-400">Partner Split</span>
                  <span className="font-mono-num font-medium">{simSplitPct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  step={5}
                  value={simSplitPct}
                  onChange={(e) => setSimSplitPct(Number(e.target.value))}
                  className="w-full accent-indigo-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono-num">
              <span className="text-zinc-600 dark:text-slate-300">
                Company ({100 - simSplitPct}%): ₹{previewCompanyCut.toLocaleString('en-IN')}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Partner ({simSplitPct}%): ₹{previewPartnerCut.toLocaleString('en-IN')}
              </span>
            </div>

            {simResultMessage && (
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 text-xs text-zinc-700 dark:text-slate-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0" />
                <span>{simResultMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
            >
              Simulate Checkout & Record Ledger
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                  <th className="py-3.5 px-5 font-medium">Partner</th>
                  <th className="py-3.5 px-4 font-medium">Client & Test</th>
                  <th className="py-3.5 px-4 font-medium text-right">Commission</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {commissionLedger.map((entry) => {
                  const linkedTxn = transactions.find((t) => t.id === entry.transactionId);
                  return (
                    <tr key={entry.id}>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-zinc-950 dark:text-white">{entry.counsellorName}</div>
                        <div className="font-mono-num text-zinc-500 dark:text-slate-400">{entry.referralCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-zinc-900 dark:text-slate-100">{entry.clientName}</div>
                        <div className="text-zinc-500 dark:text-slate-400">{entry.assessmentCode}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                        ₹{entry.commissionAmountInr.toLocaleString('en-IN')} ({entry.commissionPct}%)
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-medium ${
                            entry.status === 'Paid Out'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : entry.status === 'Reversed'
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                        {policy.canApprovePayouts && entry.status === 'Pending Clearance' && (
                          <button
                            onClick={() => approveCommissionPayout(entry.id, 'Approved for Payout')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-800 rounded cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {policy.canApprovePayouts && entry.status === 'Approved for Payout' && (
                          <button
                            onClick={() => approveCommissionPayout(entry.id, 'Paid Out')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 rounded cursor-pointer"
                          >
                            Settle
                          </button>
                        )}
                        {policy.canApprovePayouts &&
                          linkedTxn &&
                          linkedTxn.status === 'Settled' &&
                          entry.status !== 'Reversed' && (
                            <button
                              onClick={() => reverseTransaction(linkedTxn.id, 'Refunded')}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reverse</span>
                            </button>
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
    </div>
  );
};
