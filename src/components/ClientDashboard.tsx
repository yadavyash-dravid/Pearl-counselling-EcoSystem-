import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Calendar,
  Check,
  ClipboardList,
  FileText,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import { WellbeingTrends } from './WellbeingTrends';

interface ClientTaskItem {
  id: string;
  title: string;
  dueLabel: string;
  category: 'Assessment' | 'Reflection' | 'Session';
  completed: boolean;
  actionModule?: 'assessments' | 'reporting' | 'overview';
}

const INITIAL_CLIENT_TASKS: Record<string, ClientTaskItem[]> = {
  'cli-rohan': [
    {
      id: 'task-rohan-1',
      title: 'Complete GAD-7 sleep & worry follow-up',
      dueLabel: 'Due 24 Nov · 4 min',
      category: 'Assessment',
      completed: false,
      actionModule: 'assessments',
    },
    {
      id: 'task-rohan-2',
      title: 'Review clinician-signed PHQ-9 summary',
      dueLabel: 'Ready to read',
      category: 'Reflection',
      completed: true,
      actionModule: 'reporting',
    },
    {
      id: 'task-rohan-3',
      title: 'Note 3 evening wind-down wins before session',
      dueLabel: 'Before 22 Nov session',
      category: 'Reflection',
      completed: false,
    },
  ],
  'cli-aarav': [
    {
      id: 'task-aarav-1',
      title: 'Complete brief pre-session mood check-in',
      dueLabel: 'Due 22 Nov · 5 min',
      category: 'Assessment',
      completed: false,
      actionModule: 'assessments',
    },
    {
      id: 'task-aarav-2',
      title: 'Guardian consent verification with Kavita Sharma',
      dueLabel: 'Verified for Term 2',
      category: 'Session',
      completed: true,
    },
    {
      id: 'task-aarav-3',
      title: 'Practice 5-minute exam focus breathing exercise',
      dueLabel: 'Daily routine',
      category: 'Reflection',
      completed: false,
    },
  ],
};

export const ClientDashboard: React.FC = () => {
  const { clients, reports, appointments, professionals, enterWorkspace, showToast } = useEcosystem();

  const showcaseClients = useMemo(
    () => clients.filter((c) => c.id === 'cli-rohan' || c.id === 'cli-aarav'),
    [clients]
  );

  const [selectedClientId, setSelectedClientId] = useState<string>(showcaseClients[0]?.id ?? 'cli-rohan');
  const [tasksByClient, setTasksByClient] = useState<Record<string, ClientTaskItem[]>>(INITIAL_CLIENT_TASKS);

  const activeClient = useMemo(
    () => showcaseClients.find((c) => c.id === selectedClientId) ?? clients[0],
    [showcaseClients, selectedClientId, clients]
  );

  const assignedClinician = useMemo(
    () => professionals.find((p) => p.id === activeClient?.assignedProfessionalId),
    [professionals, activeClient]
  );

  const clientAppointments = useMemo(
    () => appointments.filter((a) => a.clientId === activeClient?.id),
    [appointments, activeClient]
  );

  const clientReports = useMemo(
    () => reports.filter((r) => r.clientId === activeClient?.id),
    [reports, activeClient]
  );

  const tasks = tasksByClient[activeClient?.id ?? 'cli-rohan'] ?? [];
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const recentSessions = useMemo(() => {
    if (!activeClient) return [];
    return [...activeClient.sessions].reverse().slice(0, 3);
  }, [activeClient]);

  const wellbeingInsights = useMemo(() => {
    if (!activeClient || activeClient.sessions.length === 0) {
      return {
        headline: 'Begin your first guided check-in',
        deltaPct: 0,
        improving: true,
        summary: 'Complete a short check-in to unlock personalized progress patterns and focus areas.',
        highlights: [
          { label: 'Focus', detail: 'Establish a calm baseline before your first consultation.' },
          { label: 'Cadence', detail: 'Bi-weekly check-ins take under 5 minutes.' },
        ],
      };
    }

    const sessions = activeClient.sessions;
    const first = sessions[0];
    const latest = sessions[sessions.length - 1];
    const scoreDrop = first.score - latest.score;
    const improving = scoreDrop >= 0;
    const deltaPct = first.score > 0 ? Math.round((Math.abs(scoreDrop) / first.score) * 100) : 0;

    return {
      headline:
        sessions.length > 1 && improving
          ? `${deltaPct}% symptom relief across ${sessions.length} check-ins`
          : `Current band: ${latest.severityBand}`,
      deltaPct,
      improving,
      summary:
        activeClient.id === 'cli-aarav'
          ? `Worry scores eased from ${first.score} to ${latest.score} (${latest.instrumentCode}). Steady sleep and structured study breaks are helping before exams.`
          : `Stress and low-mood indicators moved from ${first.score} to ${latest.score} (${latest.instrumentCode}). Morning energy and routine consistency show steady gains.`,
      highlights: [
        {
          label: 'Strongest Habit',
          detail:
            activeClient.id === 'cli-aarav'
              ? 'Consistent 15-minute screen-free wind-down before sleep.'
              : 'Regular check-in cadence and cognitive reframing exercises.',
        },
        {
          label: 'Next Session Focus',
          detail: assignedClinician
            ? `Review ${latest.instrumentCode} progress with ${assignedClinician.name}.`
            : 'Discuss coping routines for high-focus workdays.',
        },
      ],
    };
  }, [activeClient, assignedClinician]);

  const toggleTask = (taskId: string) => {
    if (!activeClient) return;
    setTasksByClient((prev) => {
      const current = prev[activeClient.id] ?? [];
      const target = current.find((t) => t.id === taskId);
      const next = current.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      if (target) {
        showToast(target.completed ? `Marked "${target.title}" as pending` : `Completed "${target.title}"`);
      }
      return { ...prev, [activeClient.id]: next };
    });
  };

  if (!activeClient) return null;

  return (
    <section
      id="client-dashboard"
      className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200/80 dark:border-slate-800"
    >
      {/* Header Row with Clean Profile Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-medium tracking-wide text-indigo-800 dark:text-indigo-400">
            Personal Care Space
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white mt-1.5 text-balance">
            Your Client Dashboard
          </h2>
          <p className="text-sm text-zinc-600 dark:text-slate-400 mt-2 max-w-xl">
            Track recent check-ins, upcoming tasks, and gentle wellbeing takeaways at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {showcaseClients.length > 1 && (
            <div
              className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800"
              role="tablist"
              aria-label="Preview client profile"
            >
              {showcaseClients.map((client) => {
                const isSelected = client.id === activeClient.id;
                return (
                  <button
                    key={client.id}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 text-zinc-950 dark:text-white shadow-sm'
                        : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {client.name}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => enterWorkspace('client', 'overview')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Open Full Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Minimalist Equal-Elevation Cards */}
      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Recent Assessments */}
        <article className="rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-slate-800">
              <div>
                <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                  Recent Assessments
                </h3>
                <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
                  {activeClient.sessions.length} completed · Last on {activeClient.lastAssessmentDate}
                </p>
              </div>
              <FileText className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-slate-800 mt-2">
              {recentSessions.map((session, index) => {
                const ratioPct = Math.min(100, Math.round((session.score / session.maxScore) * 100));
                const matchingReport = clientReports.find((r) => r.instrumentCode === session.instrumentCode);
                return (
                  <div key={`${session.date}-${index}`} className="py-4 space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-900 dark:text-slate-100 truncate">
                        {session.instrumentCode}
                      </span>
                      <span className="font-mono-num text-xs font-semibold text-zinc-950 dark:text-white shrink-0">
                        {session.score} / {session.maxScore}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-700 dark:bg-indigo-500 transition-all duration-200"
                        style={{ width: `${ratioPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-slate-400">
                      <span>
                        {session.severityBand} · {session.date}
                      </span>
                      <span>
                        {matchingReport ? matchingReport.reviewStatus.replace(' by Clinician', '') : 'Logged'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => enterWorkspace('client', 'reporting')}
              className="text-xs font-medium text-zinc-600 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              View Reports
            </button>
            <button
              onClick={() => enterWorkspace('client', 'assessments')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>New Check-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        {/* Card 2: Pending Tasks */}
        <article className="rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-slate-800">
              <div>
                <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                  Pending Tasks
                </h3>
                <p className="font-mono-num text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
                  {pendingCount} remaining · {tasks.length - pendingCount} of {tasks.length} done
                </p>
              </div>
              <ClipboardList className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-slate-800 mt-2">
              {tasks.map((task) => (
                <div key={task.id} className="py-3.5 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      task.completed
                        ? 'bg-emerald-700 border-emerald-700 text-white dark:bg-emerald-600 dark:border-emerald-600'
                        : 'border-zinc-300 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-400'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`text-left text-sm font-medium leading-snug transition-colors cursor-pointer ${
                        task.completed
                          ? 'line-through text-zinc-400 dark:text-slate-500'
                          : 'text-zinc-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </button>
                    <div className="flex items-center justify-between gap-2 mt-1 text-xs text-zinc-500 dark:text-slate-400">
                      <span>
                        {task.category} · {task.dueLabel}
                      </span>
                      {task.actionModule && !task.completed && (
                        <button
                          type="button"
                          onClick={() => enterWorkspace('client', task.actionModule)}
                          className="font-medium text-indigo-800 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Open →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-slate-800">
            {clientAppointments[0] ? (
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-slate-300 truncate">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">Next: {clientAppointments[0].professionalName}</span>
                </span>
                <span className="font-mono-num text-zinc-900 dark:text-white font-medium whitespace-nowrap shrink-0">
                  {clientAppointments[0].dateTime}
                </span>
              </div>
            ) : (
              <a
                href="#clinicians"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-400 hover:underline"
              >
                <span>Schedule your next consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </article>

        {/* Card 3: Personalized Wellbeing Insights */}
        <article className="rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-slate-800">
              <div>
                <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-white">
                  Wellbeing Insights
                </h3>
                <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
                  Personalized for {activeClient.name}
                </p>
              </div>
              <Activity className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
            </div>

            <div className="py-5 space-y-3 border-b border-zinc-100 dark:border-slate-800">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {wellbeingInsights.improving ? (
                  <TrendingDown className="w-4 h-4 shrink-0" />
                ) : (
                  <TrendingUp className="w-4 h-4 shrink-0" />
                )}
                <span className="font-mono-num">{wellbeingInsights.headline}</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-slate-300 leading-relaxed">
                {wellbeingInsights.summary}
              </p>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-slate-800">
              {wellbeingInsights.highlights.map((item) => (
                <div key={item.label} className="py-3.5 space-y-1">
                  <div className="text-xs font-medium text-zinc-500 dark:text-slate-400">
                    {item.label}
                  </div>
                  <div className="text-sm text-zinc-900 dark:text-slate-100 leading-snug">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-500 dark:text-slate-400 truncate">
              Reviewed with {assignedClinician?.name ?? 'your specialist'}
            </span>
            <a
              href="#care-areas"
              className="text-xs font-semibold text-indigo-800 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0"
            >
              Care Guides →
            </a>
          </div>
        </article>
      </div>

      <WellbeingTrends clientId={activeClient.id} clientName={activeClient.name} />
    </section>
  );
};
