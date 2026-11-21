export type UserRole =
  | 'super_admin'
  | 'platform_admin'
  | 'counsellor'
  | 'psychologist'
  | 'client'
  | 'guardian'
  | 'org_admin'
  | 'hr_pro'
  | 'school_admin'
  | 'finance_admin';

export type ModuleId =
  | 'overview'
  | 'assessments'
  | 'professionals'
  | 'referrals'
  | 'organizations'
  | 'intelligence'
  | 'financial'
  | 'reporting'
  | 'admin';

export type LicensingStatus = 'Licensed' | 'Integrated' | 'Pending' | 'Demo-Only' | 'Future';

export type QualificationLevel = 'Level A' | 'Level B' | 'Level C';

export type VerificationStatus = 'Verified' | 'Pending Review' | 'Additional Docs Needed';

export interface DemoItem {
  id: string;
  prompt: string;
  options: { label: string; score: number }[];
}

export interface AssessmentInstrument {
  id: string;
  code: string;
  name: string;
  domainId: string;
  categoryId: string;
  subcategoryId: string;
  intendedPopulation: string;
  domainsMeasured: string[];
  administrationMethod: 'Digital Self-Report' | 'Clinician-Administered' | 'Adaptive Cognitive' | 'Structured Interview';
  durationMinutes: number;
  qualificationRequired: QualificationLevel;
  licensingStatus: LicensingStatus;
  priceInr: number;
  maxScore: number;
  summary: string;
  demoItems: DemoItem[];
}

export interface SubcategoryNode {
  id: string;
  name: string;
  description: string;
  instruments: AssessmentInstrument[];
}

export interface CategoryNode {
  id: string;
  name: string;
  summary: string;
  subcategories: SubcategoryNode[];
}

export interface DomainNode {
  id: string;
  name: string;
  description: string;
  accentLabel: string;
  categories: CategoryNode[];
}

export interface ProfessionalProfile {
  id: string;
  name: string;
  roleType: 'Psychologist' | 'Counsellor';
  credential: string;
  rciOrLicenseId: string;
  specializations: string[];
  city: string;
  verificationStatus: VerificationStatus;
  avatarUrl?: string;
  referralCode: string;
  commissionRatePct: number;
  activeClients: number;
  totalReferrals: number;
  clearedEarningsInr: number;
  pendingEarningsInr: number;
  joinedDate: string;
}

export interface ClientSessionPoint {
  date: string;
  instrumentCode: string;
  instrumentName: string;
  score: number;
  maxScore: number;
  severityBand: 'Minimal' | 'Mild' | 'Moderate' | 'Elevated';
}

export interface ClientRecord {
  id: string;
  name: string;
  ageGroup: 'Adult' | 'Adolescent (13-17)' | 'Child (6-12)';
  guardianName?: string;
  guardianConsentVerified: boolean;
  assignedProfessionalId: string;
  referredByCode?: string;
  organizationName?: string;
  lastAssessmentDate: string;
  sessions: ClientSessionPoint[];
}

export interface AppointmentSlot {
  id: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  dateTime: string;
  mode: 'Tele-Psychology' | 'In-Clinic' | 'Assessment Review';
  status: 'Confirmed' | 'Completed' | 'Rescheduled';
}

export type OrganizationType =
  | 'School'
  | 'College'
  | 'University'
  | 'Hospital'
  | 'Clinic'
  | 'Corporate Client';

export interface DepartmentQuota {
  name: string;
  allocatedSeats: number;
  completedAssessments: number;
  wellbeingScore: number;
}

export interface OrganizationAccount {
  id: string;
  name: string;
  type: OrganizationType;
  city: string;
  primaryContact: string;
  totalSeats: number;
  usedSeats: number;
  completionRatePct: number;
  wellbeingIndex: number;
  contractValueInr: number;
  departments: DepartmentQuota[];
}

export type TransactionStatus = 'Settled' | 'Pending' | 'Refunded' | 'Chargeback' | 'Failed';

export interface TransactionRecord {
  id: string;
  timestamp: string;
  clientName: string;
  assessmentCode: string;
  assessmentName: string;
  grossAmountInr: number;
  companySharePct: number;
  companyShareInr: number;
  counsellorSharePct: number;
  counsellorCommissionInr: number;
  referralCode?: string;
  counsellorName?: string;
  paymentMethod: string;
  status: TransactionStatus;
  invoiceNumber: string;
  isSimulated: true;
}

export interface CommissionLedgerEntry {
  id: string;
  transactionId: string;
  counsellorId: string;
  counsellorName: string;
  referralCode: string;
  clientName: string;
  assessmentCode: string;
  grossAmountInr: number;
  commissionPct: number;
  commissionAmountInr: number;
  status: 'Pending Clearance' | 'Approved for Payout' | 'Paid Out' | 'Reversed';
  createdAt: string;
}

export interface ClinicalDraftPayload {
  executiveSummary: string;
  scoreInterpretation: string;
  responsePatterns: string;
  longitudinalComparison: string;
  recommendedNextSteps: string[];
  clinicalCautionNote: string;
}

export interface ClinicalReportRecord {
  id: string;
  clientId: string;
  clientName: string;
  instrumentCode: string;
  instrumentName: string;
  domainName: string;
  professionalId: string;
  professionalName: string;
  score: number;
  maxScore: number;
  severityBand: string;
  createdAt: string;
  reviewStatus: 'Pending Clinician Review' | 'Approved by Clinician';
  approvedBy?: string;
  approvedAt?: string;
  language: string;
  shareToken?: string;
  shareExpiresAt?: string;
  aiDraft?: ClinicalDraftPayload;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: string;
  actorName: string;
  action: string;
  target: string;
  category: 'Clinical' | 'Financial' | 'Governance' | 'Referral' | 'Security';
}

export interface PlatformSettings {
  brandTitle: string;
  whiteLabelAccent: string;
  defaultCompanySplitPct: number;
  defaultCounsellorSplitPct: number;
  retentionYears: number;
  requireGuardianConsentForMinors: boolean;
  requireClinicianSignOffForAiDrafts: boolean;
  dpdpConsentNoticeEnabled: boolean;
}

export interface PlatformNotification {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  unread: boolean;
  module: ModuleId;
}
