import React, { useState } from 'react';
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
import { Project, Tracker } from './types/elm';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    key: 'ROBO',
    name: 'RoboServ-X1 Autonomous Delivery Robot',
    description: 'Systems Engineering Lifecycle Management & ISO 13482 Safety Compliance Workspace.'
  }
];

const INITIAL_TRACKERS: Tracker[] = [
  { id: 1, project_id: 1, key: 'SYS-REQ', name: 'System Requirements', type: 'REQUIREMENT', prefix: 'SYS-REQ-', object_count: 3 },
  { id: 2, project_id: 1, key: 'SW-REQ', name: 'Software Requirements', type: 'REQUIREMENT', prefix: 'SW-REQ-', object_count: 1 },
  { id: 3, project_id: 1, key: 'ARCH', name: 'System Architecture', type: 'ARCHITECTURE', prefix: 'ARCH-', object_count: 2 },
  { id: 4, project_id: 1, key: 'RISK', name: 'Risks & Hazards', type: 'RISK', prefix: 'RISK-', object_count: 2 },
  { id: 5, project_id: 1, key: 'SYS-TST', name: 'System Test Cases', type: 'TEST_CASE', prefix: 'SYS-TST-', object_count: 2 },
  { id: 6, project_id: 1, key: 'TST-SET', name: 'Test Sets', type: 'TEST_SET', prefix: 'TST-SET-', object_count: 1 }
];

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project>(INITIAL_PROJECTS[0]);
  const [allTrackers, setAllTrackers] = useState<Tracker[]>(INITIAL_TRACKERS);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(INITIAL_TRACKERS[0]);
  const [activeView, setActiveView] = useState<ViewMode>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactObjectId, setImpactObjectId] = useState<number | null>(null);

  // Filter trackers for active project
  const currentTrackers = allTrackers.filter(t => t.project_id === activeProject.id);

  const handleSelectProject = (p: Project) => {
    setActiveProject(p);
    const pTrackers = allTrackers.filter(t => t.project_id === p.id);
    setSelectedTracker(pTrackers.length > 0 ? pTrackers[0] : null);
    setActiveView('DASHBOARD');
  };

  const handleCreateProject = (data: { key: string; name: string; description?: string }) => {
    const newProjectId = Date.now();
    const upperKey = data.key.toUpperCase().trim();

    const newProject: Project = {
      id: newProjectId,
      key: upperKey,
      name: data.name.trim(),
      description: data.description || ''
    };

    // Auto-generate standard trackers for the new project
    const newTrackers: Tracker[] = [
      { id: newProjectId * 10 + 1, project_id: newProjectId, key: 'SYS-REQ', name: 'System Requirements', type: 'REQUIREMENT', prefix: `${upperKey}-SYS-`, object_count: 0 },
      { id: newProjectId * 10 + 2, project_id: newProjectId, key: 'SW-REQ', name: 'Software Requirements', type: 'REQUIREMENT', prefix: `${upperKey}-SW-`, object_count: 0 },
      { id: newProjectId * 10 + 3, project_id: newProjectId, key: 'ARCH', name: 'System Architecture', type: 'ARCHITECTURE', prefix: `${upperKey}-ARCH-`, object_count: 0 },
      { id: newProjectId * 10 + 4, project_id: newProjectId, key: 'RISK', name: 'Risks & Hazards', type: 'RISK', prefix: `${upperKey}-RISK-`, object_count: 0 },
      { id: newProjectId * 10 + 5, project_id: newProjectId, key: 'SYS-TST', name: 'System Test Cases', type: 'TEST_CASE', prefix: `${upperKey}-TST-`, object_count: 0 },
      { id: newProjectId * 10 + 6, project_id: newProjectId, key: 'TST-SET', name: 'Test Sets', type: 'TEST_SET', prefix: `${upperKey}-SET-`, object_count: 0 }
    ];

    setProjects(prev => [newProject, ...prev]);
    setAllTrackers(prev => [...prev, ...newTrackers]);
    setActiveProject(newProject);
    setSelectedTracker(newTrackers[0]);
    setActiveView('DASHBOARD');
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
        project={activeProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          trackers={currentTrackers}
          activeView={activeView}
          setActiveView={setActiveView}
          selectedTracker={selectedTracker}
          setSelectedTracker={setSelectedTracker}
        />

        <main style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'DASHBOARD' && (
            <DashboardView onNavigate={handleNavigate} trackers={currentTrackers} />
          )}

          {activeView === 'TRACKER' && selectedTracker && (
            <TrackerTableView
              tracker={selectedTracker}
              onSelectObjectForImpact={handleSelectObjectForImpact}
            />
          )}

          {activeView === 'TRACEABILITY' && (
            <TraceabilityMatrixView trackers={currentTrackers} />
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
