import React, { useState } from 'react';
import { ArrowRight, Calendar, CheckCircle2, Clock, MapPin, Moon, ShieldCheck, Sun, Video, X } from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import type { ProfessionalProfile } from '../types/ecosystem';
import { ClientDashboard } from './ClientDashboard';

const CARE_TOPICS = [
  {
    id: 'mood',
    label: 'Stress, Mood & Burnout',
    instrumentCode: 'PHQ-9 & DASS-21',
    duration: '5–8 min check-in',
    description:
      'Gentle, structured check-ins to understand emotional exhaustion, sleep shifts, and daily energy levels before meeting your psychologist.',
    clinicianFocus: 'Mood & Anxiety Care',
  },
  {
    id: 'anxiety',
    label: 'Overthinking & Sleep',
    instrumentCode: 'GAD-7 & ISI',
    duration: '4–5 min check-in',
    description:
      'Clarify persistent worry, restlessness, and sleep continuity patterns so your counsellor can tailor practical coping tools from session one.',
    clinicianFocus: 'Anxiety & Restorative Sleep',
  },
  {
    id: 'child',
    label: 'Child & Teen Support',
    instrumentCode: 'Conners-4 & SDQ',
    duration: '10–15 min (Guardian-consented)',
    description:
      'Age-appropriate attention, classroom focus, and socio-emotional screenings with mandatory parent or guardian consent at every step.',
    clinicianFocus: 'Pediatric & Adolescent Care',
  },
  {
    id: 'career',
    label: 'Career & Academic Clarity',
    instrumentCode: 'RIASEC-PRO',
    duration: '15–18 min exploration',
    description:
      'Discover strengths, vocational interests, and stream or role fit backed by a 1:1 debrief session with a senior counselling psychologist.',
    clinicianFocus: 'Career & Life Transitions',
  },
];

const CLINICIAN_EXTRA: Record<
  string,
  { languages: string; experience: string; fee: string; nextSlot: string; bio: string }
> = {
  'prof-ananya': {
    languages: 'English · Hindi · Marathi',
    experience: '11+ years clinical practice',
    fee: '₹1,800 / session',
    nextSlot: 'Tomorrow, 10:30 AM IST',
    bio: 'Specializes in adult anxiety, mood recovery, and cognitive-behavioral diagnostics with structured evidence-based care plans.',
  },
  'prof-arjun': {
    languages: 'English · Malayalam · Hindi',
    experience: '14+ years counselling',
    fee: '₹1,500 / session',
    nextSlot: 'Today, 5:00 PM IST',
    bio: 'Supports working professionals and university students navigating burnout, career transitions, and chronic workplace stress.',
  },
  'prof-meera': {
    languages: 'English · Tamil · Hindi',
    experience: '9+ years pediatric care',
    fee: '₹2,000 / session',
    nextSlot: 'Tomorrow, 3:30 PM IST',
    bio: 'Focuses on child & adolescent attention profiles, school readiness, and collaborative family guidance.',
  },
};

export const LandingOverview: React.FC = () => {
  const {
    theme,
    toggleTheme,
    enterWorkspace,
    professionals,
    clients,
    bookAppointment,
    showToast,
  } = useEcosystem();

  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  // Client Consultation Booking Modal state
  const [bookingClinician, setBookingClinician] = useState<ProfessionalProfile | null>(null);
  const [bookingMode, setBookingMode] = useState<'Tele-Psychology' | 'In-Clinic'>('Tele-Psychology');
  const [bookingSlot, setBookingSlot] = useState('Tomorrow · 11:00 AM IST');
  const [bookingName, setBookingName] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const featuredClinicians = professionals.slice(0, 3);
  const activeTopic = CARE_TOPICS[selectedTopicIdx];

  const openBookingFor = (clinician: ProfessionalProfile) => {
    const extra = CLINICIAN_EXTRA[clinician.id];
    setBookingClinician(clinician);
    setBookingSlot(extra?.nextSlot ?? 'Tomorrow · 11:00 AM IST');
    setBookingConfirmed(false);
    setBookingName('');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingClinician) return;
    bookAppointment({
      clientId: clients[0]?.id ?? 'cli-rohan',
      professionalId: bookingClinician.id,
      dateTime: bookingSlot,
      mode: bookingMode,
    });
    setBookingConfirmed(true);
    showToast(`Consultation requested with ${bookingClinician.name} (${bookingSlot})`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#18181B] dark:bg-[#0B0F17] dark:text-[#F8FAFC] transition-colors">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-zinc-200/70 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap shrink-0"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0"
            >
              <defs>
                <radialGradient id="seaPearlCreamBase" cx="38%" cy="32%" r="72%">
                  <stop offset="0%" stopColor="#FFFDF9" />
                  <stop offset="32%" stopColor="#F8F0E3" />
                  <stop offset="65%" stopColor="#E9DBC5" />
                  <stop offset="100%" stopColor="#C4B093" />
                </radialGradient>
                <linearGradient id="seaPearlLuster" x1="6" y1="4" x2="30" y2="33" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                  <stop offset="42%" stopColor="#F5E6CE" stopOpacity="0.45" />
                  <stop offset="76%" stopColor="#D9C5A8" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#A99476" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="seaPearlFacetBright" x1="10" y1="6" x2="22" y2="26" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
                  <stop offset="55%" stopColor="#FBF4E8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#DFCEB4" stopOpacity="0.25" />
                </linearGradient>
                <linearGradient id="seaPearlRim" x1="6" y1="3" x2="30" y2="33" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#D6C4A8" />
                  <stop offset="50%" stopColor="#B49F80" />
                  <stop offset="100%" stopColor="#8F7B5E" />
                </linearGradient>
              </defs>

              <polygon
                points="18,2.5 24.2,6.8 27.6,12.5 30.8,19.8 24.8,28.8 18,33.5 10.8,28.2 5.2,19.6 7.4,13.2 13.2,5.6"
                fill="url(#seaPearlCreamBase)"
              />
              <polygon
                points="18,2.5 24.2,6.8 27.6,12.5 30.8,19.8 24.8,28.8 18,33.5 10.8,28.2 5.2,19.6 7.4,13.2 13.2,5.6"
                fill="url(#seaPearlLuster)"
              />
              <polygon
                points="18,2.5 20.2,8.4 13.8,14.6 10.4,18.2 7.4,13.2 13.2,5.6"
                fill="url(#seaPearlFacetBright)"
              />
              <polygon
                points="20.2,8.4 24.8,11.6 21.5,19.2 15.2,26.8 12.6,21.5 15.8,15.6"
                fill="#FFFFFF"
                fillOpacity="0.34"
              />
              <polygon
                points="24.8,11.6 27.6,12.5 30.8,19.8 24.8,28.8 18,33.5 20.6,23.2"
                fill="#C7B293"
                fillOpacity="0.32"
              />
              <path
                d="M18 2.8L20.2 8.4L14.4 14.2L12.8 18.6L16.2 14.8L20.2 8.4"
                stroke="#FFFFFF"
                strokeOpacity="0.92"
                strokeWidth="1.15"
                strokeLinejoin="round"
              />
              <path
                d="M20.2 8.4L24.8 11.6L27.5 12.5"
                stroke="#FFFFFF"
                strokeOpacity="0.85"
                strokeWidth="1.05"
                strokeLinecap="round"
              />
              <path
                d="M24.8 11.6L21.4 18.8L18 33.2"
                stroke="#FFFFFF"
                strokeOpacity="0.88"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.4 14.2L10.2 18.5L5.5 19.6"
                stroke="#FFFFFF"
                strokeOpacity="0.82"
                strokeWidth="1.05"
                strokeLinecap="round"
              />
              <path
                d="M10.2 18.5L12.4 25.4L18 33.2"
                stroke="#FFFFFF"
                strokeOpacity="0.78"
                strokeWidth="1.05"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon
                points="18,2.5 24.2,6.8 27.6,12.5 30.8,19.8 24.8,28.8 18,33.5 10.8,28.2 5.2,19.6 7.4,13.2 13.2,5.6"
                stroke="url(#seaPearlRim)"
                strokeWidth="0.9"
                strokeLinejoin="round"
              />
            </svg>
            <span>Pearl Counsellors</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-slate-300">
            <a href="#client-dashboard" className="hover:text-zinc-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Dashboard
            </a>
            <a href="#clinicians" className="hover:text-zinc-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Specialists
            </a>
            <a href="#care-areas" className="hover:text-zinc-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              How We Help
            </a>
            <a href="#journey" className="hover:text-zinc-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Your Journey
            </a>
          </nav>

          <div className="shrink-0">
            <button
              onClick={() => enterWorkspace('client', 'assessments')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Client Portal
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Above-Hero Client Trust & Quick-Start Strip */}
        <section className="border-b border-zinc-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40">
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-medium text-zinc-900 dark:text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                100% Confidential Care
              </span>
              <span aria-hidden="true" className="text-zinc-300 dark:text-slate-700">·</span>
              <span>RCI-Registered Psychologists</span>
              <span aria-hidden="true" className="text-zinc-300 dark:text-slate-700">·</span>
              <span>Online &amp; In-Clinic Sessions Across India</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#care-areas"
                className="text-indigo-800 dark:text-indigo-400 font-medium hover:underline whitespace-nowrap shrink-0"
              >
                Self-Check Assessments
              </a>
              <a
                href="#clinicians"
                className="text-zinc-700 dark:text-slate-300 font-medium hover:text-zinc-950 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Available Today →
              </a>
            </div>
          </div>
        </section>

        {/* Calm Client-Focused Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-14 pb-20 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-7">
              <p className="text-xs font-medium tracking-wide text-indigo-800 dark:text-indigo-400">
                Thoughtful Psychology &amp; Personal Guidance
              </p>
              <h1
                className="font-display font-semibold tracking-tight text-zinc-950 dark:text-white text-balance leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.4rem)' }}
              >
                Support for your mind, guided by verified psychologists.
              </h1>
              <p className="text-base text-zinc-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Start with a calm, science-backed check-in, connect with a licensed specialist who fits your needs,
                and receive a clear report reviewed by your clinician.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#clinicians"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Book a Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => enterWorkspace('client', 'assessments')}
                  className="px-4 py-3 text-sm font-medium text-zinc-700 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Take a Guided Check-In →
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="aspect-[16/11] rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-slate-800 bg-zinc-100 dark:bg-slate-900">
                {!heroImageFailed ? (
                  <img
                    src="/src/assets/images/hero_pearl_studio_1795269966109.jpg"
                    alt="Pearl Counsellors warm consultation space"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImageFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-end p-8 bg-gradient-to-br from-stone-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
                    <span className="font-display text-base font-medium text-zinc-800 dark:text-slate-200">
                      Pearl Counsellors Consultation Studio
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client-Centric Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-zinc-200/80 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white">
                16 Areas
              </div>
              <div className="text-xs text-zinc-500 dark:text-slate-400 mt-1">
                Mood, anxiety, child care &amp; career
              </div>
            </div>
            <div>
              <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white">
                5 Languages
              </div>
              <div className="text-xs text-zinc-500 dark:text-slate-400 mt-1">
                English, Hindi, Marathi, Tamil &amp; more
              </div>
            </div>
            <div>
              <div className="font-mono-num text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                100% Human
              </div>
              <div className="text-xs text-zinc-500 dark:text-slate-400 mt-1">
                Every report reviewed by a clinician
              </div>
            </div>
            <div>
              <div className="font-mono-num text-2xl font-semibold text-zinc-950 dark:text-white">
                Same Day
              </div>
              <div className="text-xs text-zinc-500 dark:text-slate-400 mt-1">
                Online video &amp; in-clinic slots
              </div>
            </div>
          </div>
        </section>

        {/* Minimalist Client Dashboard Landing Component */}
        <ClientDashboard />

        {/* Larger, Richer Specialist / Doctor Cards */}
        <section id="clinicians" className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200/80 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Meet our verified specialists
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-slate-400 mt-2 max-w-2xl">
                Experienced clinical psychologists and counsellors ready to guide your assessment and ongoing sessions.
              </p>
            </div>
            <button
              onClick={() => enterWorkspace('client', 'overview')}
              className="text-xs font-semibold text-indigo-800 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              View Client Care Dashboard →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredClinicians.map((c) => {
              const extra = CLINICIAN_EXTRA[c.id];
              return (
                <article
                  key={c.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between transition-colors hover:border-zinc-300 dark:hover:border-slate-700"
                >
                  <div>
                    <div className="aspect-[4/3] bg-zinc-100 dark:bg-slate-800 overflow-hidden">
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display text-2xl font-semibold text-zinc-500">
                          {c.name.slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <div className="text-xs text-zinc-500 dark:text-slate-400">
                          {c.roleType} · {c.rciOrLicenseId}
                        </div>
                        <h3 className="font-display text-xl font-semibold text-zinc-950 dark:text-white mt-1">
                          {c.name}
                        </h3>
                        <p className="text-xs font-medium text-indigo-800 dark:text-indigo-400 mt-0.5">
                          {c.credential}
                        </p>
                      </div>

                      <p className="text-sm text-zinc-600 dark:text-slate-300 leading-relaxed">
                        {extra?.bio ?? c.specializations.join(' · ')}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-slate-800 text-xs text-zinc-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>
                            {c.city} · {extra?.languages ?? 'English · Hindi'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>Tele-Psychology &amp; In-Clinic · {extra?.experience ?? 'Verified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Next available: {extra?.nextSlot ?? 'Tomorrow · 11:00 AM IST'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#FAF9F6]/70 dark:bg-slate-950/40 border-t border-zinc-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="font-mono-num text-sm font-semibold text-zinc-950 dark:text-white">
                      {extra?.fee ?? '₹1,500 / session'}
                    </div>
                    <button
                      onClick={() => openBookingFor(c)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Session</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Client-Friendly Interactive Care Topics */}
        <section id="care-areas" className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200/80 dark:border-slate-800">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-6">
                What brings you here today?
              </h2>
              {CARE_TOPICS.map((topic, idx) => {
                const active = idx === selectedTopicIdx;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicIdx(idx)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 text-zinc-950 dark:text-white'
                        : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-medium">{topic.label}</span>
                    {active && <ArrowRight className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-8 lg:p-10 space-y-6">
              <div className="text-xs text-zinc-500 dark:text-slate-400">
                {activeTopic.instrumentCode} · {activeTopic.duration} · {activeTopic.clinicianFocus}
              </div>
              <h3 className="font-display text-2xl font-semibold text-zinc-950 dark:text-white">
                {activeTopic.label}
              </h3>
              <p className="text-base text-zinc-600 dark:text-slate-300 leading-relaxed">
                {activeTopic.description}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => enterWorkspace('client', 'assessments')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg cursor-pointer"
                >
                  <span>Start Guided Check-In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => enterWorkspace('client', 'reporting')}
                  className="text-xs font-medium text-zinc-600 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                >
                  Preview Sample Report →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Calm 3-Step Client Journey */}
        <section id="journey" className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200/80 dark:border-slate-800">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-10">
            How your care journey works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="font-mono-num text-xs text-indigo-700 dark:text-indigo-400 font-semibold">01.</div>
              <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                Complete a private check-in
              </h3>
              <p className="text-sm text-zinc-600 dark:text-slate-400 leading-relaxed">
                Answer clear, age-appropriate questions at your own pace from home. Minor screenings always
                verify parent or guardian consent first.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-mono-num text-xs text-indigo-700 dark:text-indigo-400 font-semibold">02.</div>
              <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                Meet your matched specialist
              </h3>
              <p className="text-sm text-zinc-600 dark:text-slate-400 leading-relaxed">
                Review your observations 1:1 with an RCI-registered psychologist or counsellor over encrypted video
                or in-clinic consultation.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-mono-num text-xs text-indigo-700 dark:text-indigo-400 font-semibold">03.</div>
              <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                Receive your clinician-signed report
              </h3>
              <p className="text-sm text-zinc-600 dark:text-slate-400 leading-relaxed">
                Download a clean, plain-language summary in your preferred language and track progress gently over
                time.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80 dark:border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-slate-400">
          <span>Pearl Counsellors · Confidential Psychology &amp; Wellbeing Care</span>
          <div className="flex items-center gap-6">
            <a
              href="/pearl-logo.png"
              download="pearl-counsellors-logo.png"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Download Logo PNG
            </a>
            <button
              onClick={() => enterWorkspace('super_admin', 'overview')}
              className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Clinician &amp; Admin Portal
            </button>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{theme === 'light' ? 'Dark appearance' : 'Light appearance'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Consultation Booking Modal */}
      {bookingClinician && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 dark:bg-black/65 backdrop-blur-[2px]"
          onClick={() => setBookingClinician(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Book Consultation"
          >
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 dark:border-slate-800 pb-4">
              <div>
                <div className="text-xs text-zinc-500 dark:text-slate-400">Schedule Consultation</div>
                <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-white mt-0.5">
                  {bookingClinician.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-slate-400">
                  {bookingClinician.roleType} · {bookingClinician.city}
                </p>
              </div>
              <button
                onClick={() => setBookingClinician(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
                aria-label="Close booking dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="py-4 space-y-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 dark:text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                    Consultation Confirmed
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-slate-300">
                    {bookingMode} with {bookingClinician.name} on {bookingSlot}.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setBookingClinician(null);
                      enterWorkspace('client', 'overview');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
                  >
                    View in Client Portal
                  </button>
                  <button
                    onClick={() => setBookingClinician(null)}
                    className="px-4 py-2 text-xs font-medium border border-zinc-200 dark:border-slate-700 rounded-lg cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-600 dark:text-slate-400 mb-1.5">Your Name</label>
                  <input
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-slate-400 mb-1.5">Session Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Tele-Psychology', 'In-Clinic'] as const).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setBookingMode(mode)}
                        className={`py-2 px-3 rounded-lg border font-medium transition-colors cursor-pointer ${
                          bookingMode === mode
                            ? 'border-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                            : 'border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-slate-300'
                        }`}
                      >
                        {mode === 'Tele-Psychology' ? 'Online Video' : 'In-Clinic Visit'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-slate-400 mb-1.5">Preferred Time Slot</label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-slate-700 bg-[#FAF9F6] dark:bg-slate-950"
                  >
                    <option value={CLINICIAN_EXTRA[bookingClinician.id]?.nextSlot ?? 'Tomorrow · 11:00 AM IST'}>
                      {CLINICIAN_EXTRA[bookingClinician.id]?.nextSlot ?? 'Tomorrow · 11:00 AM IST'}
                    </option>
                    <option value="Tomorrow · 4:30 PM IST">Tomorrow · 4:30 PM IST</option>
                    <option value="Monday · 10:00 AM IST">Monday · 10:00 AM IST</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 font-semibold text-white bg-indigo-800 hover:bg-indigo-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
                >
                  Confirm Booking
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
