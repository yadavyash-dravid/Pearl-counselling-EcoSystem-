import React from 'react';
import { LandingOverview } from './components/LandingOverview';
import { CommandPalette } from './components/ui/CommandPalette';
import { WorkspaceShell } from './components/WorkspaceShell';
import { EcosystemProvider, useEcosystem } from './context/EcosystemContext';

const PearlCounsellorsRoot: React.FC = () => {
  const { viewMode, toast } = useEcosystem();

  return (
    <>
      {viewMode === 'landing' ? <LandingOverview /> : <WorkspaceShell />}
      <CommandPalette />
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl bg-zinc-900 text-white dark:bg-slate-100 dark:text-slate-950 text-xs font-medium shadow-lg border border-zinc-800 dark:border-slate-300 no-print"
        >
          {toast}
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <EcosystemProvider>
      <PearlCounsellorsRoot />
    </EcosystemProvider>
  );
}
