// Centralized Client-Side State Engine for Phase 1
import { Project, Tracker, Folder, EngineeringObject } from '../types/elm';

export interface ELMState {
  projects: Project[];
  activeProjectId: number;
  trackers: Tracker[];
  folders: Folder[];
  objects: EngineeringObject[];
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1,
    key: 'ROBO',
    name: 'RoboServ-X1 Autonomous Delivery Robot',
    description: 'Systems Engineering Lifecycle Management & ISO 13482 Safety Compliance Workspace.'
  }
];

const DEFAULT_TRACKERS: Tracker[] = [
  { id: 1, project_id: 1, key: 'SYS-REQ', name: 'System Requirements', type: 'REQUIREMENT', prefix: 'SYS-REQ-', object_count: 3 },
  { id: 2, project_id: 1, key: 'SW-REQ', name: 'Software Requirements', type: 'REQUIREMENT', prefix: 'SW-REQ-', object_count: 1 },
  { id: 3, project_id: 1, key: 'ARCH', name: 'System Architecture', type: 'ARCHITECTURE', prefix: 'ARCH-', object_count: 2 },
  { id: 4, project_id: 1, key: 'RISK', name: 'Risks & Hazards', type: 'RISK', prefix: 'RISK-', object_count: 2 },
  { id: 5, project_id: 1, key: 'SYS-TST', name: 'System Test Cases', type: 'TEST_CASE', prefix: 'SYS-TST-', object_count: 2 },
  { id: 6, project_id: 1, key: 'TST-SET', name: 'Test Sets', type: 'TEST_SET', prefix: 'TST-SET-', object_count: 1 }
];

export const getInitialState = (): ELMState => {
  return {
    projects: DEFAULT_PROJECTS,
    activeProjectId: 1,
    trackers: DEFAULT_TRACKERS,
    folders: [],
    objects: []
  };
};
