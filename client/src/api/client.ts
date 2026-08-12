const API_BASE = '/api';

export const api = {
  getProjects: async () => {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  getTrackers: async (projectId: number) => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/trackers`);
    return res.json();
  },

  getFolders: async (trackerId: number) => {
    const res = await fetch(`${API_BASE}/trackers/${trackerId}/folders`);
    return res.json();
  },

  getObjects: async (trackerId: number, params?: { folderId?: number; search?: string; status?: string; priority?: string }) => {
    const query = new URLSearchParams();
    if (params?.folderId) query.append('folderId', String(params.folderId));
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);

    const res = await fetch(`${API_BASE}/trackers/${trackerId}/objects?${query.toString()}`);
    return res.json();
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
