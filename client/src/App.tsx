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
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactObjectId, setImpactObjectId] = useState<number | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async (autoSelectId?: number) => {
    try {
      const pList = await api.getProjects();
      setProjects(pList);
      if (pList.length > 0) {
        const targetProj = autoSelectId ? pList.find((p: Project) => p.id === autoSelectId) || pList[0] : pList[0];
        selectProject(targetProj);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectProject = async (p: Project) => {
    setProject(p);
    try {
      const tList = await api.getTrackers(p.id);
      setTrackers(tList);
      if (tList.length > 0) {
        setSelectedTracker(tList[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (data: { key: string; name: string; description?: string }) => {
    try {
      const res = await api.createProject(data);
      if (res.id) {
        await loadProjects(res.id);
        setActiveView('DASHBOARD');
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        projects={projects}
        onSelectProject={selectProject}
        onCreateProject={handleCreateProject}
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
