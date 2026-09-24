import React, { useEffect, useState } from 'react';
import { Play, CheckCircle2, XCircle, AlertOctagon, HelpCircle, Plus, Activity, Layers, User, Settings, Check, X } from 'lucide-react';
import { api } from '../api/client';
import { TestRun, Project, EngineeringObject, TestStep, Relationship, User as UserType } from '../types/elm';

interface TestExecutionViewProps {
  currentUser?: UserType | null;
  activeProject?: Project | null;
  allObjects?: EngineeringObject[];
  testSteps?: TestStep[];
  relationships?: Relationship[];
}

export const TestExecutionView: React.FC<TestExecutionViewProps> = ({
  currentUser,
  activeProject,
  allObjects = [],
  testSteps = [],
  relationships = []
}) => {
  const [runs, setRuns] = useState<TestRun[]>(() => {
    if (currentUser?.role === 'ADMIN_OWNER') {
      try {
        const saved = localStorage.getItem('roboserv_elm_test_runs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved test runs:', e);
      }
    }
    return [];
  });

  const [runDetailsMap, setRunDetailsMap] = useState<Record<number, any>>(() => {
    if (currentUser?.role === 'ADMIN_OWNER') {
      try {
        const saved = localStorage.getItem('roboserv_elm_test_run_details');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved test run details:', e);
      }
    }
    return {};
  });

  const [selectedRunId, setSelectedRunId] = useState<number | null>(() => {
    return runs.length > 0 ? runs[0].id : null;
  });
  
  // New Test Run Modal State
  const [showModal, setShowModal] = useState(false);
  const [newRunName, setNewRunName] = useState('');
  const [selectedTestSetId, setSelectedTestSetId] = useState<number | null>(null);
  const [testerName, setTesterName] = useState(currentUser?.name || 'Zewd');
  const [configName, setConfigName] = useState('RoboServ-X1 ISO 13482 Release 2.4');
  const [swVersion, setSwVersion] = useState('v2.4.1-rc3');

  // Filter available Test Sets in current workspace
  const availableTestSets = allObjects.filter(o => o.type === 'TEST_SET');
  const availableTestCases = allObjects.filter(o => o.type === 'TEST_CASE');

  // Auto-persist test runs and step execution details for Zewd (ADMIN_OWNER) account
  useEffect(() => {
    if (currentUser?.role === 'ADMIN_OWNER' && runs.length > 0) {
      localStorage.setItem('roboserv_elm_test_runs', JSON.stringify(runs));
    }
  }, [runs, currentUser]);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN_OWNER' && Object.keys(runDetailsMap).length > 0) {
      localStorage.setItem('roboserv_elm_test_run_details', JSON.stringify(runDetailsMap));
    }
  }, [runDetailsMap, currentUser]);

  useEffect(() => {
    if (runs.length === 0) {
      loadRuns();
    } else if (!selectedRunId) {
      setSelectedRunId(runs[0].id);
      loadRunDetail(runs[0].id);
    }
  }, []);

  const loadRuns = async () => {
    try {
      const data = await api.getTestRuns();
      if (Array.isArray(data) && data.length > 0) {
        setRuns(data);
        if (!selectedRunId) {
          setSelectedRunId(data[0].id);
          loadRunDetail(data[0].id);
        }
      } else {
        // Fallback default run if server returns empty
        const defaultRun: TestRun = {
          id: 1,
          project_id: activeProject?.id || 1,
          test_set_id: availableTestSets[0]?.id || 9,
          test_config_id: 1,
          name: 'Safety & ISO 13482 Validation Run #1',
          overall_status: 'PASS',
          tester_name: currentUser?.name || 'Zewd',
          test_set_key: availableTestSets[0]?.object_key || 'TST-SET-001',
          test_set_title: availableTestSets[0]?.title || 'Safety & ISO 13482 Validation Test Set',
          config_name: 'RoboServ-X1 Main Hardware Configuration',
          software_version: 'v2.4.0-release',
          started_at: new Date().toISOString()
        };
        setRuns([defaultRun]);
        setSelectedRunId(defaultRun.id);
        loadRunDetail(defaultRun.id);
      }
    } catch (e) {
      console.error('Failed to load test runs:', e);
    }
  };

  const loadRunDetail = async (runId: number) => {
    if (runDetailsMap[runId]) return;
    try {
      const detail = await api.getTestRunDetail(runId);
      if (detail && !detail.error) {
        setRunDetailsMap(prev => ({ ...prev, [runId]: detail }));
      } else {
        // Build mock detail if server endpoint fallback
        buildMockRunDetail(runId);
      }
    } catch (e) {
      buildMockRunDetail(runId);
    }
  };

  const buildMockRunDetail = (runId: number) => {
    const targetRun = runs.find(r => r.id === runId);
    
    // Find test cases included in the test set via relationships or default
    let includedCases = availableTestCases;
    if (targetRun?.test_set_id) {
      const relCases = relationships
        .filter(r => r.target_id === targetRun.test_set_id && r.relationship_type === 'INCLUDED_IN')
        .map(r => allObjects.find(o => o.id === r.source_id))
        .filter(Boolean) as EngineeringObject[];
      if (relCases.length > 0) includedCases = relCases;
    }

    const caseResults = includedCases.map(tc => {
      const tcSteps = testSteps.filter(s => s.test_case_id === tc.id);
      return {
        id: Date.now() + tc.id,
        test_run_id: runId,
        test_case_id: tc.id,
        case_key: tc.object_key,
        case_title: tc.title,
        status: 'PASS',
        steps: tcSteps.map(s => ({
          id: s.id * 100 + runId,
          test_run_result_id: Date.now() + tc.id,
          test_step_id: s.id,
          step_number: s.step_number,
          action: s.action,
          expected_result: s.expected_result,
          status: 'PASS',
          actual_result: 'Verified output matching expected result.'
        }))
      };
    });

    const detailObj = {
      id: runId,
      name: targetRun?.name || `Test Run #${runId}`,
      test_set_key: targetRun?.test_set_key || 'TST-SET-001',
      test_set_title: targetRun?.test_set_title || 'ISO 13482 Validation Test Set',
      config_name: targetRun?.config_name || 'Default Hardware Config',
      software_version: targetRun?.software_version || 'v2.4.0',
      tester_name: targetRun?.tester_name || currentUser?.name || 'Zewd',
      overall_status: targetRun?.overall_status || 'PASS',
      caseResults
    };

    setRunDetailsMap(prev => ({ ...prev, [runId]: detailObj }));
  };

  const handleOpenCreateModal = () => {
    setNewRunName(`Test Run #${runs.length + 1} - ${new Date().toLocaleDateString()}`);
    setSelectedTestSetId(availableTestSets[0]?.id || null);
    setTesterName(currentUser?.name || 'Zewd');
    setShowModal(true);
  };

  const handleCreateTestRunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRunName.trim()) return;

    const selectedSet = availableTestSets.find(s => s.id === selectedTestSetId) || availableTestSets[0];
    const newRunId = Date.now();

    const newRun: TestRun = {
      id: newRunId,
      project_id: activeProject?.id || 1,
      test_set_id: selectedSet?.id || 1,
      test_config_id: 1,
      name: newRunName.trim(),
      overall_status: 'IN_PROGRESS',
      tester_name: testerName.trim() || currentUser?.name || 'Zewd',
      test_set_key: selectedSet?.object_key || 'TST-SET-001',
      test_set_title: selectedSet?.title || 'System Test Set',
      config_name: configName.trim(),
      software_version: swVersion.trim(),
      started_at: new Date().toISOString()
    };

    // Find test cases included in selected Test Set
    let includedCases = availableTestCases;
    if (selectedSet) {
      const relCases = relationships
        .filter(r => r.target_id === selectedSet.id && r.relationship_type === 'INCLUDED_IN')
        .map(r => allObjects.find(o => o.id === r.source_id))
        .filter(Boolean) as EngineeringObject[];
      if (relCases.length > 0) includedCases = relCases;
    }

    const caseResults = includedCases.map(tc => {
      const tcSteps = testSteps.filter(s => s.test_case_id === tc.id);
      return {
        id: Date.now() + tc.id,
        test_run_id: newRunId,
        test_case_id: tc.id,
        case_key: tc.object_key,
        case_title: tc.title,
        status: 'NOT_RUN',
        steps: tcSteps.length > 0 ? tcSteps.map(s => ({
          id: s.id * 100 + newRunId,
          test_run_result_id: Date.now() + tc.id,
          test_step_id: s.id,
          step_number: s.step_number,
          action: s.action,
          expected_result: s.expected_result,
          status: 'NOT_RUN',
          actual_result: ''
        })) : [
          {
            id: Date.now() + 500,
            test_run_result_id: Date.now() + tc.id,
            test_step_id: 1,
            step_number: 1,
            action: `Execute test verification procedure for ${tc.title}`,
            expected_result: `System operates in compliance with ${tc.object_key} specification`,
            status: 'NOT_RUN',
            actual_result: ''
          }
        ]
      };
    });

    const detailObj = {
      id: newRunId,
      name: newRun.name,
      test_set_key: newRun.test_set_key,
      test_set_title: newRun.test_set_title,
      config_name: newRun.config_name,
      software_version: newRun.software_version,
      tester_name: newRun.tester_name,
      overall_status: 'NOT_RUN',
      caseResults
    };

    setRuns(prev => [newRun, ...prev]);
    setRunDetailsMap(prev => ({ ...prev, [newRunId]: detailObj }));
    setSelectedRunId(newRunId);
    setShowModal(false);
  };

  const handleUpdateStepStatus = (
    stepId: number,
    caseId: number,
    newStatus: 'PASS' | 'FAIL' | 'BLOCKED',
    actualNote?: string
  ) => {
    if (!selectedRunId) return;

    const currentDetail = runDetailsMap[selectedRunId];
    if (!currentDetail) return;

    const updatedCaseResults = currentDetail.caseResults.map((cr: any) => {
      if (cr.id === caseId) {
        const updatedSteps = cr.steps.map((st: any) => {
          if (st.id === stepId) {
            return {
              ...st,
              status: newStatus,
              actual_result: actualNote !== undefined ? actualNote : (st.actual_result || (newStatus === 'PASS' ? 'Step executed successfully.' : newStatus === 'FAIL' ? 'Observed failure during step.' : 'Step blocked.'))
            };
          }
          return st;
        });

        // Recalculate case status
        let newCaseStatus = 'PASS';
        if (updatedSteps.some((s: any) => s.status === 'FAIL')) newCaseStatus = 'FAIL';
        else if (updatedSteps.some((s: any) => s.status === 'BLOCKED')) newCaseStatus = 'BLOCKED';
        else if (updatedSteps.some((s: any) => s.status === 'NOT_RUN')) newCaseStatus = 'IN_PROGRESS';

        return {
          ...cr,
          status: newCaseStatus,
          steps: updatedSteps
        };
      }
      return cr;
    });

    // Recalculate overall run status
    let newOverallStatus = 'PASS';
    if (updatedCaseResults.some((c: any) => c.status === 'FAIL')) newOverallStatus = 'FAIL';
    else if (updatedCaseResults.some((c: any) => c.status === 'BLOCKED')) newOverallStatus = 'BLOCKED';
    else if (updatedCaseResults.some((c: any) => c.status === 'IN_PROGRESS' || c.status === 'NOT_RUN')) newOverallStatus = 'IN_PROGRESS';

    const updatedDetail = {
      ...currentDetail,
      overall_status: newOverallStatus,
      caseResults: updatedCaseResults
    };

    setRunDetailsMap(prev => ({ ...prev, [selectedRunId]: updatedDetail }));
    setRuns(prev => prev.map(r => r.id === selectedRunId ? { ...r, overall_status: newOverallStatus as any } : r));
  };

  const activeRunDetail = selectedRunId ? runDetailsMap[selectedRunId] : null;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Test Runs Sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-sidebar)', padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Test Execution Runs ({runs.length})
          </span>
        </div>

        {/* Prominent + New Test Run Button */}
        <button
          onClick={handleOpenCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}
        >
          <Plus size={16} />
          <span>+ New Test Run</span>
        </button>

        {/* Runs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {runs.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                setSelectedRunId(r.id);
                loadRunDetail(r.id);
              }}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: selectedRunId === r.id ? 'var(--bg-hover)' : 'var(--bg-card)',
                border: `1px solid ${selectedRunId === r.id ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedRunId === r.id ? 'var(--accent-cyan)' : 'var(--text-main)', marginBottom: '4px' }}>
                {r.name}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={12} color="var(--accent-cyan)" />
                <span>Test Set: <strong className="mono">{r.test_set_key || 'TST-SET-001'}</strong></span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} />
                <span>Tester: {r.tester_name || 'Zewd'}</span>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${(r.overall_status || 'PASS').toLowerCase().replace(/_/g, '-')}`}>
                  {r.overall_status || 'PASS'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {r.started_at ? new Date(r.started_at).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Step Execution Interface */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-dark)' }}>
        {activeRunDetail ? (
          <div>
            {/* Header info card */}
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeRunDetail.name}</h2>
                    <span className={`badge badge-${(activeRunDetail.overall_status || 'PASS').toLowerCase().replace(/_/g, '-')}`} style={{ fontSize: '0.85rem' }}>
                      {activeRunDetail.overall_status || 'PASS'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Target Test Set:</span>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }} className="mono">{activeRunDetail.test_set_key}</span>
                    <span>• {activeRunDetail.test_set_title}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', backgroundColor: 'var(--bg-dark)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Build Under Test</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '2px' }}>{activeRunDetail.config_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }} className="mono">{activeRunDetail.software_version}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Executed by: <strong>{activeRunDetail.tester_name}</strong></div>
                </div>
              </div>
            </div>

            {/* Test Case Execution Cards */}
            {activeRunDetail.caseResults?.length > 0 ? (
              activeRunDetail.caseResults.map((cr: any) => (
                <div key={cr.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div>
                      <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)', backgroundColor: 'rgba(56, 189, 248, 0.12)', padding: '3px 8px', borderRadius: '4px', marginRight: '10px' }}>
                        {cr.case_key}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'inline', color: 'var(--text-main)' }}>{cr.case_title}</h3>
                    </div>
                    <span className={`badge badge-${(cr.status || 'NOT_RUN').toLowerCase().replace(/_/g, '-')}`}>
                      {cr.status || 'NOT_RUN'}
                    </span>
                  </div>

                  {/* Ordered Step List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cr.steps?.map((step: any) => (
                      <div key={step.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                            Procedure Step #{step.step_number}
                          </span>

                          {/* Interactive Step Pass / Fail / Blocked Controls */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleUpdateStepStatus(step.id, cr.id, 'PASS')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                backgroundColor: step.status === 'PASS' ? 'var(--accent-emerald)' : 'rgba(16, 185, 129, 0.15)',
                                color: step.status === 'PASS' ? '#000' : 'var(--accent-emerald)',
                                border: `1px solid ${step.status === 'PASS' ? 'var(--accent-emerald)' : 'rgba(16, 185, 129, 0.4)'}`,
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CheckCircle2 size={14} />
                              <span>PASS</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStepStatus(step.id, cr.id, 'FAIL')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                backgroundColor: step.status === 'FAIL' ? 'var(--accent-rose)' : 'rgba(239, 68, 68, 0.15)',
                                color: step.status === 'FAIL' ? '#fff' : 'var(--accent-rose)',
                                border: `1px solid ${step.status === 'FAIL' ? 'var(--accent-rose)' : 'rgba(239, 68, 68, 0.4)'}`,
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <XCircle size={14} />
                              <span>FAIL</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStepStatus(step.id, cr.id, 'BLOCKED')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                backgroundColor: step.status === 'BLOCKED' ? 'var(--accent-amber)' : 'rgba(245, 158, 11, 0.15)',
                                color: step.status === 'BLOCKED' ? '#000' : 'var(--accent-amber)',
                                border: `1px solid ${step.status === 'BLOCKED' ? 'var(--accent-amber)' : 'rgba(245, 158, 11, 0.4)'}`,
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <AlertOctagon size={14} />
                              <span>BLOCKED</span>
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                          <strong>Action:</strong> {step.action}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                          <strong>Expected Result:</strong> {step.expected_result}
                        </div>

                        {/* Actual Result Telemetry / Notes */}
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                            Recorded Telemetry / Actual Result Output:
                          </label>
                          <input
                            type="text"
                            value={step.actual_result || ''}
                            onChange={(e) => handleUpdateStepStatus(step.id, cr.id, step.status === 'NOT_RUN' ? 'PASS' : step.status, e.target.value)}
                            placeholder="Enter measured output, logs, or verification notes..."
                            style={{ width: '100%', fontSize: '0.8rem', backgroundColor: 'var(--bg-card)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px', backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                No test cases registered for this test run.
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>
            Select a Test Execution Run from the left sidebar or click <strong>+ New Test Run</strong> to initialize execution.
          </div>
        )}
      </div>

      {/* New Test Run Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            width: '480px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-cyan)' }}>
              Create New Test Execution Run
            </h3>

            <form onSubmit={handleCreateTestRunSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Test Run Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRunName}
                  onChange={(e) => setNewRunName(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. Safety Braking & Navigation Qualification Run #2"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Select Target Test Set *
                </label>
                <select
                  value={selectedTestSetId || ''}
                  onChange={(e) => setSelectedTestSetId(Number(e.target.value))}
                  style={{ width: '100%' }}
                >
                  {availableTestSets.length > 0 ? (
                    availableTestSets.map(ts => (
                      <option key={ts.id} value={ts.id}>
                        [{ts.object_key}] {ts.title}
                      </option>
                    ))
                  ) : (
                    <option value={1}>[TST-SET-001] ISO 13482 Validation Test Set</option>
                  )}
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Loads all test cases registered inside this test set.
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Build Under Test / Configuration
                </label>
                <input
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. RoboServ-X1 ISO 13482 Hardware Revision 3"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Software / Firmware Version
                </label>
                <input
                  type="text"
                  value={swVersion}
                  onChange={(e) => setSwVersion(e.target.value)}
                  style={{ width: '100%' }}
                  className="mono"
                  placeholder="e.g. v2.4.1-rc3"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Tester Name
                </label>
                <input
                  type="text"
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. Zewd"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Create & Launch Test Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

