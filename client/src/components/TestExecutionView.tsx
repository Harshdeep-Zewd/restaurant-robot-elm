import React, { useEffect, useState } from 'react';
import { Play, CheckCircle2, XCircle, AlertOctagon, HelpCircle, Upload, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { TestRun } from '../types/elm';

export const TestExecutionView: React.FC = () => {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [activeRunDetail, setActiveRunDetail] = useState<any>(null);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = () => {
    api.getTestRuns().then((data) => {
      setRuns(data);
      if (data.length > 0 && !selectedRunId) {
        setSelectedRunId(data[0].id);
        loadRunDetail(data[0].id);
      }
    }).catch(console.error);
  };

  const loadRunDetail = (runId: number) => {
    api.getTestRunDetail(runId).then(setActiveRunDetail).catch(console.error);
  };

  const handleStepStatus = async (stepResultId: number, status: 'PASS' | 'FAIL' | 'BLOCKED', actualResult: string) => {
    if (!selectedRunId) return;
    await api.updateStepResult(selectedRunId, {
      test_step_result_id: stepResultId,
      status,
      actual_result: actualResult
    });
    loadRunDetail(selectedRunId);
    loadRuns();
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Test Runs Sidebar */}
      <div style={{ width: '280px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-sidebar)', padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Test Execution Runs
        </div>

        {runs.map((r) => (
          <div
            key={r.id}
            onClick={() => { setSelectedRunId(r.id); loadRunDetail(r.id); }}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: selectedRunId === r.id ? 'var(--bg-hover)' : 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              marginBottom: '8px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {r.name}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tester: {r.tester_name || 'Elena Rostova'}
            </div>
            <div style={{ marginTop: '6px' }}>
              <span className={`badge badge-${r.overall_status?.toLowerCase().replace('_', '-')}`}>{r.overall_status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Step Execution Interface */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-dark)' }}>
        {activeRunDetail ? (
          <div>
            {/* Header info */}
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{activeRunDetail.name}</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Test Set: <span style={{ color: 'var(--accent-cyan)' }} className="mono">{activeRunDetail.test_set_key}</span> - {activeRunDetail.test_set_title}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Build Under Test Configuration</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>{activeRunDetail.config_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mono">{activeRunDetail.software_version}</div>
                </div>
              </div>
            </div>

            {/* Test Case Execution Cards */}
            {activeRunDetail.caseResults?.map((cr: any) => (
              <div key={cr.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{cr.case_key}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'inline', marginLeft: '12px' }}>{cr.case_title}</h3>
                  </div>
                  <span className={`badge badge-${cr.status.toLowerCase().replace('_', '-')}`}>{cr.status}</span>
                </div>

                {/* Ordered Step List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cr.steps?.map((step: any) => (
                    <div key={step.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Step #{step.step_number}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleStepStatus(step.id, 'PASS', 'Verified output matching expected result.')}
                            style={{ padding: '4px 10px', borderRadius: '4px', backgroundColor: step.status === 'PASS' ? 'var(--accent-emerald)' : 'var(--bg-card)', color: step.status === 'PASS' ? '#000' : 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.75rem' }}
                          >
                            PASS
                          </button>

                          <button
                            onClick={() => handleStepStatus(step.id, 'FAIL', 'Failure observed during execution.')}
                            style={{ padding: '4px 10px', borderRadius: '4px', backgroundColor: step.status === 'FAIL' ? 'var(--accent-rose)' : 'var(--bg-card)', color: step.status === 'FAIL' ? '#fff' : 'var(--accent-rose)', fontWeight: 700, fontSize: '0.75rem' }}
                          >
                            FAIL
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Action: {step.action}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>Expected Result: {step.expected_result}</div>

                      {step.actual_result && (
                        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                          <strong>Recorded Actual Result:</strong> {step.actual_result}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>Select a Test Execution Run from the sidebar</div>
        )}
      </div>
    </div>
  );
};
