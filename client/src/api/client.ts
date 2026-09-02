const API_BASE = '/api';

// LocalStorage Persistence Keys
const LOCAL_PROJECTS_KEY = 'robo_elm_projects';
const LOCAL_OBJECTS_KEY = 'robo_elm_objects';

const getLocalProjects = (): any[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalProject = (project: any) => {
  try {
    const current = getLocalProjects();
    const updated = [project, ...current.filter(p => p.id !== project.id)];
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

export const api = {
  getProjects: async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const serverProjects = await res.json();
      const localProjects = getLocalProjects();
      
      // Merge server projects with local projects without duplicates
      const mergedMap = new Map();
      if (Array.isArray(serverProjects)) {
        serverProjects.forEach(p => mergedMap.set(p.id, p));
      }
      localProjects.forEach(p => mergedMap.set(p.id, p));

      return Array.from(mergedMap.values());
    } catch (e) {
      return getLocalProjects();
    }
  },

  createProject: async (data: { key: string; name: string; description?: string }) => {
    const upperKey = data.key.toUpperCase().trim();
    let newProject: any = null;

    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const serverRes = await res.json();
      if (serverRes.id) {
        newProject = {
          id: serverRes.id,
          key: upperKey,
          name: data.name.trim(),
          description: data.description || '',
          created_at: new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('Server offline, using local fallback:', e);
    }

    if (!newProject) {
      newProject = {
        id: Date.now(),
        key: upperKey,
        name: data.name.trim(),
        description: data.description || '',
        created_at: new Date().toISOString()
      };
    }

    saveLocalProject(newProject);
    return { success: true, id: newProject.id, key: upperKey };
  },

  getTrackers: async (projectId: number) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/trackers`);
      const trackers = await res.json();
      if (Array.isArray(trackers) && trackers.length > 0) {
        return trackers;
      }
    } catch (e) {
      // Fallback below
    }

    // Default Trackers Fallback for any Project ID
    const localProjs = getLocalProjects();
    const proj = localProjs.find(p => p.id === projectId);
    const key = proj?.key || 'PROJ';

    return [
      { id: projectId * 10 + 1, project_id: projectId, key: 'SYS-REQ', name: 'System Requirements', type: 'REQUIREMENT', prefix: `${key}-SYS-`, object_count: 0 },
      { id: projectId * 10 + 2, project_id: projectId, key: 'SW-REQ', name: 'Software Requirements', type: 'REQUIREMENT', prefix: `${key}-SW-`, object_count: 0 },
      { id: projectId * 10 + 3, project_id: projectId, key: 'ARCH', name: 'System Architecture', type: 'ARCHITECTURE', prefix: `${key}-ARCH-`, object_count: 0 },
      { id: projectId * 10 + 4, project_id: projectId, key: 'RISK', name: 'Risks & Hazards', type: 'RISK', prefix: `${key}-RISK-`, object_count: 0 },
      { id: projectId * 10 + 5, project_id: projectId, key: 'SYS-TST', name: 'System Test Cases', type: 'TEST_CASE', prefix: `${key}-TST-`, object_count: 0 },
      { id: projectId * 10 + 6, project_id: projectId, key: 'TST-SET', name: 'Test Sets', type: 'TEST_SET', prefix: `${key}-SET-`, object_count: 0 }
    ];
  },

  getFolders: async (trackerId: number) => {
    try {
      const res = await fetch(`${API_BASE}/trackers/${trackerId}/folders`);
      return res.json();
    } catch (e) {
      return [];
    }
  },

  getObjects: async (trackerId: number, params?: { folderId?: number; search?: string; status?: string; priority?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.folderId) query.append('folderId', String(params.folderId));
      if (params?.search) query.append('search', params.search);
      if (params?.status) query.append('status', params.status);
      if (params?.priority) query.append('priority', params.priority);

      const res = await fetch(`${API_BASE}/trackers/${trackerId}/objects?${query.toString()}`);
      return res.json();
    } catch (e) {
      return [];
    }
  },

  getObjectDetail: async (id: number) => {
    const res = await fetch(`${API_BASE}/objects/${id}`);
    return res.json();
  },

  createObject: async (data: any) => {
    const res = await fetch(`${API_BASE}/objects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateObject: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/objects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getTraceabilityMatrix: async (sourceTrackerId: number, targetTrackerId: number) => {
    const res = await fetch(`${API_BASE}/traceability/matrix?sourceTrackerId=${sourceTrackerId}&targetTrackerId=${targetTrackerId}`);
    return res.json();
  },

  getTraceabilityCoverage: async (projectId: number) => {
    const res = await fetch(`${API_BASE}/traceability/coverage?projectId=${projectId}`);
    return res.json();
  },

  getImpactAnalysis: async (objectId: number) => {
    const res = await fetch(`${API_BASE}/traceability/impact/${objectId}`);
    return res.json();
  },

  createRelationship: async (data: { source_id: number; target_id: number; relationship_type: string }) => {
    const res = await fetch(`${API_BASE}/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getTestConfigs: async () => {
    const res = await fetch(`${API_BASE}/tests/configs`);
    return res.json();
  },

  getTestSets: async () => {
    const res = await fetch(`${API_BASE}/tests/sets`);
    return res.json();
  },

  getTestRuns: async () => {
    const res = await fetch(`${API_BASE}/tests/runs`);
    return res.json();
  },

  getTestRunDetail: async (id: number) => {
    const res = await fetch(`${API_BASE}/tests/runs/${id}`);
    return res.json();
  },

  createTestRun: async (data: any) => {
    const res = await fetch(`${API_BASE}/tests/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateStepResult: async (runId: number, data: { test_step_result_id: number; status: string; actual_result?: string; notes?: string }) => {
    const res = await fetch(`${API_BASE}/tests/runs/${runId}/step-result`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getChanges: async () => {
    const res = await fetch(`${API_BASE}/changes`);
    return res.json();
  },

  getBaselines: async () => {
    const res = await fetch(`${API_BASE}/baselines`);
    return res.json();
  },

  getBaselineDetail: async (id: number) => {
    const res = await fetch(`${API_BASE}/baselines/${id}`);
    return res.json();
  },

  createBaseline: async (data: any) => {
    const res = await fetch(`${API_BASE}/baselines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getArtifacts: async () => {
    const res = await fetch(`${API_BASE}/artifacts`);
    return res.json();
  },

  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/audit`);
    return res.json();
  }
};
