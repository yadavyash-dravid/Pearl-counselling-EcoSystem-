import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { MODULE_METADATA, ROLE_LIST, ROLE_POLICIES } from '../../data/rbac';

interface SearchEntry {
  id: string;
  title: string;
  subtitle: string;
  group: string;
  onSelect: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    activeRole,
    setActiveRole,
    setActiveModule,
    enterWorkspace,
    allInstruments,
    professionals,
    clients,
    organizations,
  } = useEcosystem();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!commandPaletteOpen) setQuery('');
  }, [commandPaletteOpen]);

  const entries = useMemo<SearchEntry[]>(() => {
    const policy = ROLE_POLICIES[activeRole];
    const list: SearchEntry[] = [];

    policy.allowedModules.forEach((modId) => {
      const meta = MODULE_METADATA[modId];
      list.push({
        id: `mod-${modId}`,
        title: meta.label,
        subtitle: meta.description,
        group: 'Modules',
        onSelect: () => {
          enterWorkspace(activeRole, modId);
          setCommandPaletteOpen(false);
        },
      });
    });

    allInstruments.forEach((inst) => {
      list.push({
        id: `inst-${inst.id}`,
        title: `${inst.code} — ${inst.name}`,
        subtitle: `${inst.qualificationRequired} · ${inst.licensingStatus} · ₹${inst.priceInr.toLocaleString('en-IN')}`,
        group: 'Assessments',
        onSelect: () => {
          enterWorkspace(activeRole, 'assessments');
          setCommandPaletteOpen(false);
        },
      });
    });

    professionals.forEach((prof) => {
      list.push({
        id: `prof-${prof.id}`,
        title: prof.name,
        subtitle: `${prof.roleType} · ${prof.city} · Code ${prof.referralCode}`,
        group: 'Professionals & Referral Codes',
        onSelect: () => {
          if (policy.allowedModules.includes('professionals')) {
            setActiveModule('professionals');
          } else if (policy.allowedModules.includes('referrals')) {
            setActiveModule('referrals');
          }
          setCommandPaletteOpen(false);
        },
      });
    });

    if (policy.canViewClinicalDetails) {
      clients.forEach((cli) => {
        list.push({
          id: `cli-${cli.id}`,
          title: cli.name,
          subtitle: `${cli.ageGroup} · ${cli.organizationName || 'Individual Care'}`,
          group: 'Clients',
          onSelect: () => {
            setActiveModule('professionals');
            setCommandPaletteOpen(false);
          },
        });
      });
    }

    organizations.forEach((org) => {
      list.push({
        id: `org-${org.id}`,
        title: org.name,
        subtitle: `${org.type} · ${org.city} · ${org.usedSeats}/${org.totalSeats} seats`,
        group: 'Organizations',
        onSelect: () => {
          if (policy.allowedModules.includes('organizations')) {
            setActiveModule('organizations');
          }
          setCommandPaletteOpen(false);
        },
      });
    });

    ROLE_LIST.forEach((r) => {
      list.push({
        id: `role-${r.id}`,
        title: `Switch Role → ${r.label}`,
        subtitle: r.scopeSummary,
        group: 'Persona Switcher',
        onSelect: () => {
          setActiveRole(r.id);
          setCommandPaletteOpen(false);
        },
      });
    });

    return list;
  }, [
    activeRole,
    allInstruments,
    clients,
    enterWorkspace,
    organizations,
    professionals,
    setActiveModule,
    setActiveRole,
    setCommandPaletteOpen,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 14);
    return entries
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subtitle.toLowerCase().includes(q) ||
          e.group.toLowerCase().includes(q)
      )
      .slice(0, 18);
  }, [entries, query]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-[2px]"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Universal Command Palette"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 16 domains, PHQ-9, referral codes, organizations, or switch roles..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-slate-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-slate-200 rounded"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[56vh] overflow-y-auto divide-y divide-zinc-100 dark:divide-slate-800/70">
          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-slate-400">
              No matching assessments, professionals, or workspace routes found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.onSelect}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                      {item.group}
                    </span>
                    <span className="text-zinc-300 dark:text-slate-700">·</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-slate-100 truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-slate-950/60 border-t border-zinc-200 dark:border-slate-800 flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
          <span>Pearl Counsellors Universal Index</span>
          <span className="font-mono-num">Esc to close</span>
        </div>
      </div>
    </div>
  );
};
