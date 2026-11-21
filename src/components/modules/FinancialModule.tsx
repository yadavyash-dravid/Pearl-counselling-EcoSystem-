import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

export const FinancialModule: React.FC = () => {
  const {
    transactions,
    allInstruments,
    professionals,
    simulateReferralCheckout,
    reverseTransaction,
  } = useEcosystem();

  const [tab, setTab] = useState<'ledger' | 'checkout'>('ledger');
  const [gatewayClient, setGatewayClient] = useState('Meenakshi Iyer');
  const [gatewayInstId, setGatewayInstId] = useState(allInstruments[0]?.id ?? '');
  const [gatewayRefCode, setGatewayRefCode] = useState(professionals[0]?.referralCode ?? '');

  const settled = transactions.filter((t) => t.status === 'Settled');
  const totalGross = settled.reduce((s, t) => s + t.grossAmountInr, 0);
  const totalCompany = settled.reduce((s, t) => s + t.companyShareInr, 0);
  const totalCommission = settled.reduce((s, t) => s + t.counsellorCommissionInr, 0);

  const handleSimulatedCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    simulateReferralCheckout({
      clientName: gatewayClient.trim() || 'Demo Client',
      instrumentId: gatewayInstId,
      referralCode: gatewayRefCode || undefined,
      paymentMethod: 'Simulated Gateway Checkout',
      outcome: 'success',
    });
    setTab('ledger');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Financial Operations
          </h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">
            Simulated INR settlements, split tracking, and reversals
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-800 w-fit">
          <button
            onClick={() => setTab('ledger')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'ledger'
                ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-slate-400'
            }`}
          >
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setTab('checkout')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'checkout'
                ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-slate-400'
            }`}
          >
            Simulate Payment
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
          <div className="text-xs text-zinc-500 dark:text-slate-400">Settled Gross (Simulated)</div>
          <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white mt-2">
            ₹{totalGross.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
          <div className="text-xs text-zinc-500 dark:text-slate-400">Company Allocation</div>
          <div className="font-mono-num text-2xl font-semibold text-indigo-800 dark:text-indigo-400 mt-2">
            ₹{totalCompany.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800">
          <div className="text-xs text-zinc-500 dark:text-slate-400">Partner Commission Pool</div>
          <div className="font-mono-num text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
            ₹{totalCommission.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {tab === 'ledger' ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
                  <th className="py-3.5 px-5 font-medium">Invoice / Client</th>
                  <th className="py-3.5 px-4 font-medium">Assessment</th>
                  <th className="py-3.5 px-4 font-medium text-right">Gross</th>
                  <th className="py-3.5 px-4 font-medium text-right">Company</th>
                  <th className="py-3.5 px-4 font-medium text-right">Partner</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="py-3.5 px-5">
                      <div className="font-mono-num font-medium text-zinc-950 dark:text-white">
                        {txn.invoiceNumber}
                      </div>
                      <div className="text-zinc-500 dark:text-slate-400">{txn.clientName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-900 dark:text-slate-100">{txn.assessmentCode}</div>
                      <div className="text-zinc-500 dark:text-slate-400">{txn.referralCode || 'Direct'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num">
                      ₹{txn.grossAmountInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num">
                      ₹{txn.companyShareInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-emerald-700 dark:text-emerald-400">
                      ₹{txn.counsellorCommissionInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-medium">{txn.status}</td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      {txn.status === 'Settled' && (
                        <button
                          onClick={() => reverseTransaction(txn.id, 'Refunded')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-zinc-200 dark:border-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSimulatedCheckout}
          className="max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6 space-y-4"
        >
          <h2 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
            Simulated Payment Checkout
          </h2>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-slate-400 mb-1.5">Client Name</label>
            <input
              value={gatewayClient}
              onChange={(e) => setGatewayClient(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-slate-400 mb-1.5">Assessment Package</label>
            <select
              value={gatewayInstId}
              onChange={(e) => setGatewayInstId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
            >
              {allInstruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.code} · ₹{i.priceInr.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-slate-400 mb-1.5">Referral Partner</label>
            <select
              value={gatewayRefCode}
              onChange={(e) => setGatewayRefCode(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
            >
              <option value="">Direct (No Referral)</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.referralCode}>
                  {p.referralCode} — {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
          >
            Record Simulated Settlement
          </button>
        </form>
      )}
    </div>
  );
};
