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
import { Project, Tracker, EngineeringObject, Folder, RequirementType, SafetyLevel, TestSubProcess, Relationship } from './types/elm';

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

const INITIAL_FOLDERS: Folder[] = [
  { id: 1, tracker_id: 1, parent_id: null, name: 'Navigation & Perception', position: 1 },
  { id: 2, tracker_id: 1, parent_id: null, name: 'Safety & Emergency Stop', position: 2 },
  { id: 3, tracker_id: 1, parent_id: null, name: 'Payload & Thermal Containment', position: 3 }
];

const INITIAL_OBJECTS: EngineeringObject[] = [
  {
    id: 1, tracker_id: 1, tracker_name: 'System Requirements', folder_id: 1, folder_name: 'Navigation & Perception', object_key: 'SYS-REQ-001',
    title: 'Obstacle Detection & Local Rerouting Latency',
    description: 'The autonomous navigation system shall detect dynamic obstacles within 3.0 meters and compute a local collision avoidance trajectory within < 50 milliseconds.',
    type: 'REQUIREMENT', requirement_type: 'Functional Requirement', safety_level: 'ASIL-D', test_subprocess: 'System Testing',
    status: 'APPROVED', priority: 'CRITICAL', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { rationale: 'Prevent collision in high-density dining room environments.', source: 'ISO 13482 Standard', verificationMethod: 'Test' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 2, tracker_id: 1, tracker_name: 'System Requirements', folder_id: 2, folder_name: 'Safety & Emergency Stop', object_key: 'SYS-REQ-002',
    title: 'Physical & Software Emergency Braking Distance',
    description: 'When an emergency stop signal is triggered, the robot shall come to a complete stop within 0.35 meters from a cruising speed of 1.5 m/s.',
    type: 'REQUIREMENT', requirement_type: 'Functional Requirement', safety_level: 'ASIL-D', test_subprocess: 'HIL Testing',
    status: 'APPROVED', priority: 'CRITICAL', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { rationale: 'Guarantee patron safety when sudden obstacles step directly into path.', source: 'Safety Hazard Analysis SHA-2026-01', verificationMethod: 'Test' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 3, tracker_id: 1, tracker_name: 'System Requirements', folder_id: 3, folder_name: 'Payload & Thermal Containment', object_key: 'SYS-REQ-003',
    title: 'Active Hot Food Bay Thermal Maintenance',
    description: 'The insulated payload compartment shall maintain hot soup and plated meals at a minimum internal temperature of 65°C for up to 25 minutes of transit.',
    type: 'REQUIREMENT', requirement_type: 'Non-Functional Requirement', safety_level: 'Standard / Non-Safety', test_subprocess: 'Black-Box Testing',
    status: 'REVIEW', priority: 'MEDIUM', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { rationale: 'Ensure food quality and customer satisfaction during peak dining hours.', source: 'PRD §4.2', verificationMethod: 'Inspection' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 4, tracker_id: 2, tracker_name: 'Software Requirements', folder_id: null, folder_name: null, object_key: 'SW-REQ-001',
    title: 'ROS2 Nav2 DWB Dynamic Local Planner Configuration',
    description: 'The software stack shall integrate ROS2 Iron Nav2 DWB local planner tuned with 20Hz local costmap updates using Ouster 3D LiDAR point cloud scans.',
    type: 'REQUIREMENT', requirement_type: 'Parameter', safety_level: 'ASIL-C', test_subprocess: 'SW Testing',
    status: 'APPROVED', priority: 'HIGH', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { rationale: 'Real-time reactive navigation in tight restaurant table aisles.', source: 'Derived from SYS-REQ-001' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 5, tracker_id: 3, tracker_name: 'System Architecture', folder_id: null, folder_name: null, object_key: 'ARCH-001',
    title: 'RoboServ-X1 Main Cyber-Physical System',
    description: 'Top-level system architecture encapsulating Mobility Base, Sensor Suite, Thermal Bay, Compute, and Power.',
    type: 'ARCHITECTURE', requirement_type: 'Folder', safety_level: 'ASIL-D', test_subprocess: 'Integration Testing',
    status: 'APPROVED', priority: 'CRITICAL', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { archType: 'System', subsystems: ['Mobility', 'Sensors', 'Payload', 'Compute'] },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 6, tracker_id: 4, tracker_name: 'Risks & Hazards', folder_id: null, folder_name: null, object_key: 'RISK-001',
    title: 'Robot Collision with Fast-Moving Dining Room Patron',
    description: 'Hazard: Uncontrolled physical contact with customer in crowded dining area resulting in minor injury or food spill.',
    type: 'RISK', requirement_type: 'Non-Functional Requirement', safety_level: 'ASIL-D', test_subprocess: 'Field Testing',
    status: 'REVIEW', priority: 'CRITICAL', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { hazard: 'Kinetic collision at 1.5 m/s', severity: 5, exposure: 4, avoidance: 3, riskRating: 60, mitigation: 'SYS-REQ-001 & SYS-REQ-002' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 7, tracker_id: 5, tracker_name: 'System Test Cases', folder_id: null, folder_name: null, object_key: 'SYS-TST-001',
    title: 'Dynamic Pedestrian Avoidance & Latency Test',
    description: 'Verify that the robot detects a dynamic human target walking across its path at 1.0 m/s and computes a non-colliding path.',
    type: 'TEST_CASE', requirement_type: 'Functional Requirement', safety_level: 'ASIL-D', test_subprocess: 'System Testing',
    status: 'APPROVED', priority: 'CRITICAL', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { objective: 'Validate <50ms response time.', preconditions: 'Nav2 active in simulator.' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 8, tracker_id: 5, tracker_name: 'System Test Cases', folder_id: null, folder_name: null, object_key: 'SYS-TST-002',
    title: 'Emergency Stop Braking Distance Field Test',
    description: 'Perform hard emergency stop triggers at maximum operational velocity (1.5 m/s) and record stopping distance.',
    type: 'TEST_CASE', requirement_type: 'Functional Requirement', safety_level: 'ASIL-D', test_subprocess: 'HIL Testing',
    status: 'APPROVED', priority: 'CRITICAL', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { objective: 'Verify stopping distance <= 0.35m.', preconditions: 'Dry tile surface.' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 9, tracker_id: 6, tracker_name: 'Test Sets', folder_id: null, folder_name: null, object_key: 'TST-SET-001',
    title: 'Safety & ISO 13482 Validation Test Set',
    description: 'Comprehensive safety suite combining dynamic obstacle avoidance and e-stop braking tests.',
    type: 'TEST_SET', requirement_type: 'Functional Requirement', safety_level: 'ASIL-D', test_subprocess: 'System Testing',
    status: 'APPROVED', priority: 'CRITICAL', owner_id: 1, owner_name: 'Zewd', created_by_name: 'Zewd', version: 1,
    metadata: { targetRelease: 'Release 2.4' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }
];

const INITIAL_RELATIONSHIPS: Relationship[] = [
  { id: 1, source_id: 6, target_id: 1, relationship_type: 'MITIGATED_BY' }, // RISK-001 -> MITIGATED_BY -> SYS-REQ-001
  { id: 2, source_id: 1, target_id: 4, relationship_type: 'DERIVED_TO' },   // SYS-REQ-001 -> DERIVED_TO -> SW-REQ-001
  { id: 3, source_id: 1, target_id: 7, relationship_type: 'VERIFIED_BY' },  // SYS-REQ-001 -> VERIFIED_BY -> SYS-TST-001
  { id: 4, source_id: 2, target_id: 8, relationship_type: 'VERIFIED_BY' },  // SYS-REQ-002 -> VERIFIED_BY -> SYS-TST-002
  { id: 5, source_id: 1, target_id: 5, relationship_type: 'ALLOCATED_TO' }, // SYS-REQ-001 -> ALLOCATED_TO -> ARCH-001
  { id: 6, source_id: 7, target_id: 9, relationship_type: 'INCLUDED_IN' }   // SYS-TST-001 -> INCLUDED_IN -> TST-SET-001
];

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project>(INITIAL_PROJECTS[0]);
  const [allTrackers, setAllTrackers] = useState<Tracker[]>(INITIAL_TRACKERS);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(INITIAL_TRACKERS[0]);
  const [allFolders, setAllFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [allObjects, setAllObjects] = useState<EngineeringObject[]>(INITIAL_OBJECTS);
  const [relationships, setRelationships] = useState<Relationship[]>(INITIAL_RELATIONSHIPS);
  
  const [activeView, setActiveView] = useState<ViewMode>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactObjectId, setImpactObjectId] = useState<number | null>(null);

  // Filter trackers and compute object counts
  const currentTrackers = allTrackers
    .filter(t => t.project_id === activeProject.id)
    .map(t => ({
      ...t,
      object_count: allObjects.filter(o => o.tracker_id === t.id).length
    }));

  const handleSelectProject = (p: Project) => {
    setActiveProject(p);
    const pTrackers = currentTrackers.filter(t => t.project_id === p.id);
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

  const handleCreateObject = (data: {
    tracker_id: number;
    folder_id?: number | null;
    title: string;
    description?: string;
    requirement_type?: RequirementType;
    safety_level?: SafetyLevel;
    test_subprocess?: TestSubProcess;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    metadata?: any;
  }) => {
    const tracker = allTrackers.find(t => t.id === data.tracker_id);
    if (!tracker) return;

    const folder = allFolders.find(f => f.id === data.folder_id);
    const count = allObjects.filter(o => o.tracker_id === tracker.id).length;
    const object_key = `${tracker.prefix}${String(count + 1).padStart(3, '0')}`;

    const newObj: EngineeringObject = {
      id: Date.now(),
      tracker_id: tracker.id,
      tracker_name: tracker.name,
      folder_id: data.folder_id || null,
      folder_name: folder?.name || null,
      object_key,
      title: data.title,
      description: data.description || '',
      type: tracker.type,
      requirement_type: data.requirement_type || 'Functional Requirement',
      safety_level: data.safety_level || 'ASIL-D',
      test_subprocess: data.test_subprocess || 'System Testing',
      status: 'DRAFT',
      priority: data.priority || 'MEDIUM',
      owner_id: 1,
      owner_name: 'Zewd',
      created_by_name: 'Zewd',
      version: 1,
      metadata: data.metadata || { rationale: 'Created via workspace UI', author: 'Zewd' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setAllObjects(prev => [newObj, ...prev]);
  };

  const handleUpdateObject = (id: number, updates: Partial<EngineeringObject>) => {
    setAllObjects(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          ...updates,
          version: updates.title || updates.description || updates.status || updates.requirement_type || updates.safety_level ? o.version + 1 : o.version,
          updated_at: new Date().toISOString()
        };
      }
      return o;
    }));
  };

  // Traceability Linking Actions
  const handleAddRelationship = (source_id: number, target_id: number, relationship_type: any) => {
    const newRel: Relationship = {
      id: Date.now(),
      source_id,
      target_id,
      relationship_type
    };
    setRelationships(prev => [...prev, newRel]);
  };

  const handleDeleteRelationship = (id: number) => {
    setRelationships(prev => prev.filter(r => r.id !== id));
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
              objects={allObjects.filter(o => o.tracker_id === selectedTracker.id)}
              allObjects={allObjects}
              folders={allFolders.filter(f => f.tracker_id === selectedTracker.id)}
              relationships={relationships}
              onCreateObject={handleCreateObject}
              onUpdateObject={handleUpdateObject}
              onAddRelationship={handleAddRelationship}
              onDeleteRelationship={handleDeleteRelationship}
              onSelectObjectForImpact={handleSelectObjectForImpact}
            />
          )}

          {activeView === 'TRACEABILITY' && (
            <TraceabilityMatrixView
              trackers={currentTrackers}
              allObjects={allObjects}
              relationships={relationships}
              onAddRelationship={handleAddRelationship}
              onDeleteRelationship={handleDeleteRelationship}
            />
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
