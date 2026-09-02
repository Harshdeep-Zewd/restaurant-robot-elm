const API_BASE = '/api';

// LocalStorage Persistence Keys
const LOCAL_PROJECTS_KEY = 'robo_elm_projects';

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

const safeFetchJSON = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    console.warn(`Non-JSON response from ${url}:`, text);
    return { error: text || 'Server response was not JSON' };
  } catch (err: any) {
    console.warn(`Fetch error for ${url}:`, err);
    return { error: err.message || 'Network request failed' };
  }
};

export const api = {
  getProjects: async () => {
    const serverProjects = await safeFetchJSON(`${API_BASE}/projects`);
    const localProjects = getLocalProjects();
    
    const mergedMap = new Map();
    if (Array.isArray(serverProjects)) {
      serverProjects.forEach(p => mergedMap.set(p.id, p));
    }
    localProjects.forEach(p => mergedMap.set(p.id, p));

    return Array.from(mergedMap.values());
  },

  createProject: async (data: { key: string; name: string; description?: string }) => {
    const upperKey = data.key.toUpperCase().trim();
    let newProject: any = null;

    const serverRes = await safeFetchJSON(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (serverRes && serverRes.id) {
      newProject = {
        id: serverRes.id,
        key: upperKey,
        name: data.name.trim(),
        description: data.description || '',
        created_at: new Date().toISOString()
      };
    } else {
      // Create local project if server endpoint was unreachable
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
    const trackers = await safeFetchJSON(`${API_BASE}/projects/${projectId}/trackers`);
    if (Array.isArray(trackers) && trackers.length > 0) {
      return trackers;
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
    const res = await safeFetchJSON(`${API_BASE}/trackers/${trackerId}/folders`);
    return Array.isArray(res) ? res : [];
  },

  getObjects: async (trackerId: number, params?: { folderId?: number; search?: string; status?: string; priority?: string }) => {
    const query = new URLSearchParams();
    if (params?.folderId) query.append('folderId', String(params.folderId));
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);

    const res = await safeFetchJSON(`${API_BASE}/trackers/${trackerId}/objects?${query.toString()}`);
    return Array.isArray(res) ? res : [];
  },

  getObjectDetail: async (id: number) => {
    return safeFetchJSON(`${API_BASE}/objects/${id}`);
  },

  createObject: async (data: any) => {
    return safeFetchJSON(`${API_BASE}/objects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  updateObject: async (id: number, data: any) => {
    return safeFetchJSON(`${API_BASE}/objects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  getTraceabilityMatrix: async (sourceTrackerId: number, targetTrackerId: number) => {
    return safeFetchJSON(`${API_BASE}/traceability/matrix?sourceTrackerId=${sourceTrackerId}&targetTrackerId=${targetTrackerId}`);
  },

  getTraceabilityCoverage: async (projectId: number) => {
    return safeFetchJSON(`${API_BASE}/traceability/coverage?projectId=${projectId}`);
  },

  getImpactAnalysis: async (objectId: number) => {
    return safeFetchJSON(`${API_BASE}/traceability/impact/${objectId}`);
  },

  createRelationship: async (data: { source_id: number; target_id: number; relationship_type: string }) => {
    return safeFetchJSON(`${API_BASE}/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  getTestConfigs: async () => {
    const res = await safeFetchJSON(`${API_BASE}/tests/configs`);
    return Array.isArray(res) ? res : [];
  },

  getTestSets: async () => {
    const res = await safeFetchJSON(`${API_BASE}/tests/sets`);
    return Array.isArray(res) ? res : [];
  },

  getTestRuns: async () => {
    const res = await safeFetchJSON(`${API_BASE}/tests/runs`);
    return Array.isArray(res) ? res : [];
  },

  getTestRunDetail: async (id: number) => {
    return safeFetchJSON(`${API_BASE}/tests/runs/${id}`);
  },

  createTestRun: async (data: any) => {
    return safeFetchJSON(`${API_BASE}/tests/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  updateStepResult: async (runId: number, data: { test_step_result_id: number; status: string; actual_result?: string; notes?: string }) => {
    return safeFetchJSON(`${API_BASE}/tests/runs/${runId}/step-result`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  getChanges: async () => {
    const res = await safeFetchJSON(`${API_BASE}/changes`);
    return Array.isArray(res) ? res : [];
  },

  getBaselines: async () => {
    const res = await safeFetchJSON(`${API_BASE}/baselines`);
    return Array.isArray(res) ? res : [];
  },

  getBaselineDetail: async (id: number) => {
    return safeFetchJSON(`${API_BASE}/baselines/${id}`);
  },

  createBaseline: async (data: any) => {
    return safeFetchJSON(`${API_BASE}/baselines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  getArtifacts: async () => {
    const res = await safeFetchJSON(`${API_BASE}/artifacts`);
    return Array.isArray(res) ? res : [];
  },

  getAuditLogs: async () => {
    const res = await safeFetchJSON(`${API_BASE}/audit`);
    return Array.isArray(res) ? res : [];
  }
};
