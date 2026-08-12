import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, ViewMode } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TrackerTableView } from './components/TrackerTableView';
import { TraceabilityMatrixView } from './components/TraceabilityMatrixView';
import { ImpactAnalysisView } from './components/ImpactAnalysisView';
import { TestExecutionView } from './components/TestExecutionView';
import { RisksMatrixView } from './components/RisksMatrixView';
import { BaselinesView } from './components/BaselinesView';
import { ArtifactsView } from './components/ArtifactsView';
import { AuditView } from './components/AuditView';
import { api } from './api/client';
import { Project, Tracker } from './types/elm';

export const App: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactObjectId, setImpactObjectId] = useState<number | null>(null);

  useEffect(() => {
    api.getProjects().then((pList) => {
      if (pList.length > 0) {
        setProject(pList[0]);
        api.getTrackers(pList[0].id).then(setTrackers).catch(console.error);
      }
    }).catch(console.error);
  }, []);

  const handleNavigate = (view: ViewMode, tracker?: Tracker) => {
    setActiveView(view);
    if (tracker) setSelectedTracker(tracker);
  };

  const handleSelectObjectForImpact = (objId: number) => {
    setImpactObjectId(objId);
    setActiveView('IMPACT');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
      <Header
        project={project}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          trackers={trackers}
          activeView={activeView}
          setActiveView={setActiveView}
          selectedTracker={selectedTracker}
          setSelectedTracker={setSelectedTracker}
        />

        <main style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'DASHBOARD' && (
            <DashboardView onNavigate={handleNavigate} trackers={trackers} />
          )}

          {activeView === 'TRACKER' && selectedTracker && (
            <TrackerTableView
              tracker={selectedTracker}
              onSelectObjectForImpact={handleSelectObjectForImpact}
            />
          )}

          {activeView === 'TRACEABILITY' && (
            <TraceabilityMatrixView trackers={trackers} />
          )}

          {activeView === 'IMPACT' && impactObjectId && (
            <ImpactAnalysisView objectId={impactObjectId} onBack={() => setActiveView('TRACKER')} />
          )}

          {activeView === 'TEST_EXECUTION' && (
            <TestExecutionView />
          )}

          {activeView === 'RISK_MATRIX' && (
            <RisksMatrixView />
          )}

          {activeView === 'BASELINES' && (
            <BaselinesView />
          )}

          {activeView === 'ARTIFACTS' && (
            <ArtifactsView />
          )}

          {activeView === 'AUDIT' && (
            <AuditView />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
