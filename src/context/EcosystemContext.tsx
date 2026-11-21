import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ASSESSMENT_DOMAINS } from '../data/assessmentCatalog';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLIENTS,
  INITIAL_COMMISSION_LEDGER,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORGANIZATIONS,
  INITIAL_PROFESSIONALS,
  INITIAL_REPORTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from '../data/mockEcosystem';
import { ROLE_POLICIES } from '../data/rbac';
import type {
  AppointmentSlot,
  AssessmentInstrument,
  AuditLogEntry,
  ClientRecord,
  ClinicalDraftPayload,
  ClinicalReportRecord,
  CommissionLedgerEntry,
  DomainNode,
  LicensingStatus,
  ModuleId,
  OrganizationAccount,
  PlatformNotification,
  PlatformSettings,
  ProfessionalProfile,
  TransactionRecord,
  UserRole,
  VerificationStatus,
} from '../types/ecosystem';

interface CheckoutSimulationInput {
  clientName: string;
  referralCode?: string;
  instrumentId: string;
  paymentMethod: string;
  outcome: 'success' | 'duplicate_referral' | 'payment_failed';
  customCounsellorSplitPct?: number;
}

interface EcosystemContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  viewMode: 'landing' | 'workspace';
  enterWorkspace: (role?: UserRole, module?: ModuleId) => void;
  exitToLanding: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  domains: DomainNode[];
  allInstruments: AssessmentInstrument[];
  professionals: ProfessionalProfile[];
  clients: ClientRecord[];
  appointments: AppointmentSlot[];
  organizations: OrganizationAccount[];
  transactions: TransactionRecord[];
  commissionLedger: CommissionLedgerEntry[];
  reports: ClinicalReportRecord[];
  auditLogs: AuditLogEntry[];
  settings: PlatformSettings;
  notifications: PlatformNotification[];
  toast: string | null;
  showToast: (msg: string) => void;
  markAllNotificationsRead: () => void;
  registerCounsellor: (input: {
    name: string;
    roleType: 'Psychologist' | 'Counsellor';
    credential: string;
    rciOrLicenseId: string;
    city: string;
    commissionRatePct: number;
    specializations: string[];
  }) => ProfessionalProfile;
  updateProfessionalVerification: (id: string, status: VerificationStatus) => void;
  updateLicensingStatus: (instrumentId: string, status: LicensingStatus) => void;
  simulateReferralCheckout: (input: CheckoutSimulationInput) => { ok: boolean; message: string };
  reverseTransaction: (transactionId: string, reason: 'Refunded' | 'Chargeback') => void;
  approveCommissionPayout: (commissionId: string, nextStatus: 'Approved for Payout' | 'Paid Out') => void;
  submitDemoAssessment: (input: {
    clientId: string;
    instrumentId: string;
    totalScore: number;
  }) => ClinicalReportRecord | null;
  saveReportAiDraft: (reportId: string, draft: ClinicalDraftPayload, language: string) => void;
  approveClinicalReport: (reportId: string, approverName: string) => void;
  generateReportShareToken: (reportId: string) => string;
  toggleGuardianConsent: (clientId: string) => void;
  assignAssessmentToClient: (clientId: string, instrumentId: string) => void;
  allocateOrgSeats: (orgId: string, departmentName: string, additionalSeats: number) => void;
  updateSettings: (partial: Partial<PlatformSettings>) => void;
  bookAppointment: (input: {
    clientId: string;
    professionalId: string;
    dateTime: string;
    mode: AppointmentSlot['mode'];
  }) => void;
}

const EcosystemContext = createContext<EcosystemContextValue | null>(null);

export const EcosystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('pearl_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('pearl_role') as UserRole | null;
      return saved && ROLE_POLICIES[saved] ? saved : 'super_admin';
    } catch {
      return 'super_admin';
    }
  });
  const [activeModule, setActiveModuleState] = useState<ModuleId>('overview');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [domains, setDomains] = useState<DomainNode[]>(ASSESSMENT_DOMAINS);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>(INITIAL_PROFESSIONALS);
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS);
  const [appointments, setAppointments] = useState<AppointmentSlot[]>(INITIAL_APPOINTMENTS);
  const [organizations, setOrganizations] = useState<OrganizationAccount[]>(INITIAL_ORGANIZATIONS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [commissionLedger, setCommissionLedger] = useState<CommissionLedgerEntry[]>(INITIAL_COMMISSION_LEDGER);
  const [reports, setReports] = useState<ClinicalReportRecord[]>(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<PlatformNotification[]>(INITIAL_NOTIFICATIONS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('pearl_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((current) => (current === msg ? null : current));
    }, 3600);
  };

  const addAudit = (
    action: string,
    target: string,
    category: AuditLogEntry['category'] = 'Governance'
  ) => {
    const policy = ROLE_POLICIES[activeRole];
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      actorRole: policy.label,
      actorName: policy.actorName,
      action,
      target,
      category,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const allInstruments = useMemo(
    () =>
      domains.flatMap((d) =>
        d.categories.flatMap((c) => c.subcategories.flatMap((s) => s.instruments))
      ),
    [domains]
  );

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    try {
      localStorage.setItem('pearl_role', role);
    } catch {}
    const policy = ROLE_POLICIES[role];
    if (!policy.allowedModules.includes(activeModule)) {
      setActiveModuleState(policy.defaultModule);
    }
    showToast(`Switched workspace view to ${policy.label}`);
  };

  const setActiveModule = (module: ModuleId) => {
    const policy = ROLE_POLICIES[activeRole];
    if (policy.allowedModules.includes(module)) {
      setActiveModuleState(module);
    } else {
      showToast(`${policy.label} does not have permission for this module.`);
    }
  };

  const enterWorkspace = (role?: UserRole, module?: ModuleId) => {
    const targetRole = role ?? activeRole;
    const policy = ROLE_POLICIES[targetRole];
    setActiveRoleState(targetRole);
    if (module && policy.allowedModules.includes(module)) {
      setActiveModuleState(module);
    } else {
      setActiveModuleState(policy.defaultModule);
    }
    setViewMode('workspace');
  };

  const exitToLanding = () => setViewMode('landing');

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const registerCounsellor: EcosystemContextValue['registerCounsellor'] = (input) => {
    const cleanFirst = input.name.replace(/^Dr\.\s*/i, '').split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'PARTNER';
    const suffix = Math.floor(100 + Math.random() * 899);
    const code = `PEARL-${cleanFirst}${suffix}`;
    const newProf: ProfessionalProfile = {
      id: `prof-${Date.now()}`,
      name: input.name,
      roleType: input.roleType,
      credential: input.credential,
      rciOrLicenseId: input.rciOrLicenseId,
      specializations: input.specializations.length > 0 ? input.specializations : ['General Counselling'],
      city: input.city,
      verificationStatus: 'Verified',
      referralCode: code,
      commissionRatePct: input.commissionRatePct,
      activeClients: 0,
      totalReferrals: 0,
      clearedEarningsInr: 0,
      pendingEarningsInr: 0,
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setProfessionals((prev) => [newProf, ...prev]);
    addAudit(`Registered ${input.roleType} & issued code ${code}`, input.name, 'Referral');
    showToast(`Registered ${input.name} with referral code ${code}`);
    return newProf;
  };

  const updateProfessionalVerification = (id: string, status: VerificationStatus) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verificationStatus: status } : p))
    );
    const prof = professionals.find((p) => p.id === id);
    addAudit(`Updated verification to ${status}`, prof?.name ?? id, 'Governance');
    showToast(`Verification status updated to ${status}`);
  };

  const updateLicensingStatus = (instrumentId: string, status: LicensingStatus) => {
    setDomains((prev) =>
      prev.map((d) => ({
        ...d,
        categories: d.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            instruments: s.instruments.map((inst) =>
              inst.id === instrumentId ? { ...inst, licensingStatus: status } : inst
            ),
          })),
        })),
      }))
    );
    addAudit(`Changed licensing status to ${status}`, instrumentId.toUpperCase(), 'Governance');
    showToast(`Updated licensing status to ${status}`);
  };

  const simulateReferralCheckout: EcosystemContextValue['simulateReferralCheckout'] = (input) => {
    const instrument = allInstruments.find((i) => i.id === input.instrumentId);
    if (!instrument) return { ok: false, message: 'Selected assessment not found.' };

    const referrer = input.referralCode
      ? professionals.find((p) => p.referralCode.toUpperCase() === input.referralCode?.trim().toUpperCase())
      : undefined;

    if (input.outcome === 'duplicate_referral') {
      addAudit(
        'Blocked duplicate referral attribution',
        `${input.clientName} · ${input.referralCode || 'N/A'}`,
        'Referral'
      );
      showToast('Duplicate referral detected: client already attributed within active window.');
      return {
        ok: false,
        message: 'Duplicate referral attribution blocked. Client retains original partner link.',
      };
    }

    const gross = instrument.priceInr;
    const splitPct = referrer
      ? input.customCounsellorSplitPct ?? referrer.commissionRatePct
      : 0;
    const companyPct = 100 - splitPct;
    const counsellorCommission = Math.round((gross * splitPct) / 100);
    const companyShare = gross - counsellorCommission;
    const txnId = `txn-${Date.now().toString().slice(-4)}`;
    const invoiceNum = `INV-PC-2026-${Math.floor(1000 + Math.random() * 8999)}`;

    if (input.outcome === 'payment_failed') {
      const failedTxn: TransactionRecord = {
        id: txnId,
        timestamp: 'Just now',
        clientName: input.clientName,
        assessmentCode: instrument.code,
        assessmentName: instrument.name,
        grossAmountInr: gross,
        companySharePct: companyPct,
        companyShareInr: 0,
        counsellorSharePct: splitPct,
        counsellorCommissionInr: 0,
        referralCode: referrer?.referralCode,
        counsellorName: referrer?.name,
        paymentMethod: input.paymentMethod,
        status: 'Failed',
        invoiceNumber: invoiceNum,
        isSimulated: true,
      };
      setTransactions((prev) => [failedTxn, ...prev]);
      addAudit('Simulated payment gateway decline', `${input.clientName} · ${instrument.code}`, 'Financial');
      showToast('Simulated payment failed: no commission credited.');
      return { ok: false, message: 'Simulated gateway declined payment. No commission recorded.' };
    }

    const settledTxn: TransactionRecord = {
      id: txnId,
      timestamp: 'Just now',
      clientName: input.clientName,
      assessmentCode: instrument.code,
      assessmentName: instrument.name,
      grossAmountInr: gross,
      companySharePct: companyPct,
      companyShareInr: companyShare,
      counsellorSharePct: splitPct,
      counsellorCommissionInr: counsellorCommission,
      referralCode: referrer?.referralCode,
      counsellorName: referrer?.name,
      paymentMethod: input.paymentMethod,
      status: 'Settled',
      invoiceNumber: invoiceNum,
      isSimulated: true,
    };

    setTransactions((prev) => [settledTxn, ...prev]);

    if (referrer) {
      const ledgerEntry: CommissionLedgerEntry = {
        id: `com-${Date.now().toString().slice(-4)}`,
        transactionId: txnId,
        counsellorId: referrer.id,
        counsellorName: referrer.name,
        referralCode: referrer.referralCode,
        clientName: input.clientName,
        assessmentCode: instrument.code,
        grossAmountInr: gross,
        commissionPct: splitPct,
        commissionAmountInr: counsellorCommission,
        status: 'Pending Clearance',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setCommissionLedger((prev) => [ledgerEntry, ...prev]);
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === referrer.id
            ? {
                ...p,
                totalReferrals: p.totalReferrals + 1,
                activeClients: p.activeClients + 1,
                pendingEarningsInr: p.pendingEarningsInr + counsellorCommission,
              }
            : p
        )
      );
      addAudit(
        `Simulated ₹${gross} checkout → ₹${companyShare} Company / ₹${counsellorCommission} ${referrer.name}`,
        txnId.toUpperCase(),
        'Referral'
      );
      showToast(
        `Simulated ₹${gross.toLocaleString('en-IN')} settled: ₹${companyShare.toLocaleString('en-IN')} company · ₹${counsellorCommission.toLocaleString('en-IN')} commission`
      );
      return {
        ok: true,
        message: `Settled ₹${gross.toLocaleString('en-IN')} via ${referrer.referralCode} (${companyPct}% company ₹${companyShare.toLocaleString('en-IN')} / ${splitPct}% partner ₹${counsellorCommission.toLocaleString('en-IN')}).`,
      };
    }

    addAudit(`Simulated direct ₹${gross} checkout`, txnId.toUpperCase(), 'Financial');
    showToast(`Direct simulated checkout settled: ₹${gross.toLocaleString('en-IN')}`);
    return {
      ok: true,
      message: `Direct simulated payment of ₹${gross.toLocaleString('en-IN')} recorded.`,
    };
  };

  const reverseTransaction = (transactionId: string, reason: 'Refunded' | 'Chargeback') => {
    const txn = transactions.find((t) => t.id === transactionId);
    if (!txn || txn.status === 'Refunded' || txn.status === 'Chargeback') return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, status: reason } : t))
    );

    const linkedComm = commissionLedger.find((c) => c.transactionId === transactionId);
    if (linkedComm) {
      const amountToDeduct = linkedComm.commissionAmountInr;
      setCommissionLedger((prev) =>
        prev.map((c) =>
          c.transactionId === transactionId ? { ...c, status: 'Reversed', commissionAmountInr: 0 } : c
        )
      );
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === linkedComm.counsellorId
            ? {
                ...p,
                pendingEarningsInr: Math.max(0, p.pendingEarningsInr - amountToDeduct),
              }
            : p
        )
      );
    }

    addAudit(`Processed ${reason} & reversed commission`, transactionId.toUpperCase(), 'Financial');
    showToast(`Transaction marked ${reason}; associated referral commission reversed.`);
  };

  const approveCommissionPayout = (
    commissionId: string,
    nextStatus: 'Approved for Payout' | 'Paid Out'
  ) => {
    const entry = commissionLedger.find((c) => c.id === commissionId);
    if (!entry) return;

    setCommissionLedger((prev) =>
      prev.map((c) => (c.id === commissionId ? { ...c, status: nextStatus } : c))
    );

    if (nextStatus === 'Paid Out' && entry.status !== 'Paid Out') {
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === entry.counsellorId
            ? {
                ...p,
                pendingEarningsInr: Math.max(0, p.pendingEarningsInr - entry.commissionAmountInr),
                clearedEarningsInr: p.clearedEarningsInr + entry.commissionAmountInr,
              }
            : p
        )
      );
    }

    addAudit(`Commission ${nextStatus}`, `${entry.counsellorName} · ₹${entry.commissionAmountInr}`, 'Financial');
    showToast(`Commission for ${entry.counsellorName} marked ${nextStatus}.`);
  };

  const submitDemoAssessment: EcosystemContextValue['submitDemoAssessment'] = ({
    clientId,
    instrumentId,
    totalScore,
  }) => {
    const client = clients.find((c) => c.id === clientId);
    const instrument = allInstruments.find((i) => i.id === instrumentId);
    if (!client || !instrument) return null;

    const ratio = totalScore / Math.max(1, instrument.maxScore);
    const severityBand: 'Minimal' | 'Mild' | 'Moderate' | 'Elevated' =
      ratio < 0.25 ? 'Minimal' : ratio < 0.5 ? 'Mild' : ratio < 0.75 ? 'Moderate' : 'Elevated';

    const today = new Date().toISOString().slice(0, 10);
    const prof = professionals.find((p) => p.id === client.assignedProfessionalId) ?? professionals[0];
    const domain = domains.find((d) => d.id === instrument.domainId);

    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              lastAssessmentDate: today,
              sessions: [
                ...c.sessions,
                {
                  date: today,
                  instrumentCode: instrument.code,
                  instrumentName: instrument.name,
                  score: totalScore,
                  maxScore: instrument.maxScore,
                  severityBand,
                },
              ],
            }
          : c
      )
    );

    const report: ClinicalReportRecord = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      clientId: client.id,
      clientName: client.name,
      instrumentCode: instrument.code,
      instrumentName: instrument.name,
      domainName: domain?.name ?? 'Psychological Assessment',
      professionalId: prof.id,
      professionalName: prof.name,
      score: totalScore,
      maxScore: instrument.maxScore,
      severityBand,
      createdAt: today,
      reviewStatus: 'Pending Clinician Review',
      language: 'English',
    };

    setReports((prev) => [report, ...prev]);
    addAudit(
      `Completed simulated ${instrument.code} (${totalScore}/${instrument.maxScore})`,
      client.name,
      'Clinical'
    );
    showToast(`Assessment scored (${severityBand}) and queued for clinician review.`);
    return report;
  };

  const saveReportAiDraft = (reportId: string, draft: ClinicalDraftPayload, language: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, aiDraft: draft, language } : r))
    );
    addAudit(`Generated Gemini AI clinical draft (${language})`, reportId.toUpperCase(), 'Clinical');
  };

  const approveClinicalReport = (reportId: string, approverName: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              reviewStatus: 'Approved by Clinician',
              approvedBy: approverName,
              approvedAt: today,
            }
          : r
      )
    );
    addAudit(`Clinician signed off report`, `${reportId.toUpperCase()} by ${approverName}`, 'Clinical');
    showToast(`Report signed off and released by ${approverName}.`);
  };

  const generateReportShareToken = (reportId: string) => {
    const token = `PRC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const expires = new Date(Date.now() + 72 * 3600 * 1000).toISOString().slice(0, 10);
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, shareToken: token, shareExpiresAt: expires } : r
      )
    );
    addAudit(`Issued time-limited share link (${token})`, reportId.toUpperCase(), 'Security');
    showToast(`Encrypted share link generated (expires ${expires}).`);
    return token;
  };

  const toggleGuardianConsent = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, guardianConsentVerified: !c.guardianConsentVerified } : c
      )
    );
    const client = clients.find((c) => c.id === clientId);
    addAudit(
      `Updated guardian consent flag`,
      client?.name ?? clientId,
      'Security'
    );
    showToast(`Guardian consent status updated for ${client?.name ?? 'client'}.`);
  };

  const assignAssessmentToClient = (clientId: string, instrumentId: string) => {
    const client = clients.find((c) => c.id === clientId);
    const inst = allInstruments.find((i) => i.id === instrumentId);
    if (!client || !inst) return;
    addAudit(`Assigned ${inst.code} assessment`, client.name, 'Clinical');
    showToast(`Assigned ${inst.code} (${inst.name}) to ${client.name}.`);
  };

  const allocateOrgSeats = (orgId: string, departmentName: string, additionalSeats: number) => {
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id !== orgId) return org;
        return {
          ...org,
          totalSeats: org.totalSeats + additionalSeats,
          departments: org.departments.map((d) =>
            d.name === departmentName
              ? { ...d, allocatedSeats: d.allocatedSeats + additionalSeats }
              : d
          ),
        };
      })
    );
    const org = organizations.find((o) => o.id === orgId);
    addAudit(`Allocated +${additionalSeats} seats (${departmentName})`, org?.name ?? orgId, 'Governance');
    showToast(`Allocated +${additionalSeats} seats to ${departmentName}.`);
  };

  const updateSettings = (partial: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    addAudit('Updated platform governance settings', Object.keys(partial).join(', '), 'Governance');
    showToast('Platform settings saved.');
  };

  const bookAppointment: EcosystemContextValue['bookAppointment'] = (input) => {
    const client = clients.find((c) => c.id === input.clientId);
    const prof = professionals.find((p) => p.id === input.professionalId);
    if (!client || !prof) return;
    const slot: AppointmentSlot = {
      id: `apt-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      professionalId: prof.id,
      professionalName: prof.name,
      dateTime: input.dateTime,
      mode: input.mode,
      status: 'Confirmed',
    };
    setAppointments((prev) => [slot, ...prev]);
    addAudit(`Scheduled ${input.mode} session`, `${client.name} with ${prof.name}`, 'Clinical');
    showToast(`Booked ${input.mode} for ${client.name}.`);
  };

  return (
    <EcosystemContext.Provider
      value={{
        theme,
        toggleTheme,
        viewMode,
        enterWorkspace,
        exitToLanding,
        activeRole,
        setActiveRole,
        activeModule,
        setActiveModule,
        commandPaletteOpen,
        setCommandPaletteOpen,
        domains,
        allInstruments,
        professionals,
        clients,
        appointments,
        organizations,
        transactions,
        commissionLedger,
        reports,
        auditLogs,
        settings,
        notifications,
        toast,
        showToast,
        markAllNotificationsRead,
        registerCounsellor,
        updateProfessionalVerification,
        updateLicensingStatus,
        simulateReferralCheckout,
        reverseTransaction,
        approveCommissionPayout,
        submitDemoAssessment,
        saveReportAiDraft,
        approveClinicalReport,
        generateReportShareToken,
        toggleGuardianConsent,
        assignAssessmentToClient,
        allocateOrgSeats,
        updateSettings,
        bookAppointment,
      }}
    >
      {children}
    </EcosystemContext.Provider>
  );
};

export function useEcosystem(): EcosystemContextValue {
  const ctx = useContext(EcosystemContext);
  if (!ctx) throw new Error('useEcosystem must be used inside EcosystemProvider');
  return ctx;
}
