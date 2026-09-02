import React, { useEffect, useState } from 'react';
import { X, Save, Link as LinkIcon, Trash2, ArrowRight, ArrowLeft, Plus, CheckCircle2, ListOrdered } from 'lucide-react';
import { EngineeringObject, RequirementType, SafetyLevel, TestSubProcess, Folder as FolderType, Relationship, TestStep } from '../types/elm';

interface ObjectDetailPaneProps {
  objectId: number;
  object?: EngineeringObject;
  allObjects?: EngineeringObject[];
  folders?: FolderType[];
  relationships?: Relationship[];
  testSteps?: TestStep[];
  onClose: () => void;
  onUpdateObject: (id: number, updates: Partial<EngineeringObject>) => void;
  onAddRelationship?: (source_id: number, target_id: number, type: string) => void;
  onDeleteRelationship?: (id: number) => void;
  onAddTestStep?: (test_case_id: number, action: string, expected_result: string) => void;
  onDeleteTestStep?: (id: number) => void;
  onSelectForImpact?: (objId: number) => void;
}

export const ObjectDetailPane: React.FC<ObjectDetailPaneProps> = ({
  objectId,
  object,
  allObjects = [],
  folders = [],
  relationships = [],
  testSteps = [],
  onClose,
  onUpdateObject,
  onAddRelationship,
  onDeleteRelationship,
  onAddTestStep,
  onDeleteTestStep,
  onSelectForImpact
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STEPS' | 'TRACEABILITY' | 'VERSIONS'>('OVERVIEW');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [reqType, setReqType] = useState<RequirementType>('Functional Requirement');
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>('ASIL-D');
  const [testProcess, setTestProcess] = useState<TestSubProcess>('System Testing');
  const [folderId, setFolderId] = useState<number | null>(null);

  // Link Modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [targetObjId, setTargetObjId] = useState<number | null>(null);
  const [relType, setRelType] = useState<string>('VERIFIED_BY');

  // New Test Step State
  const [newAction, setNewAction] = useState('');
  const [newExpectedResult, setNewExpectedResult] = useState('');

  useEffect(() => {
    if (object) {
      setTitle(object.title);
      setDesc(object.description || '');
      setStatus(object.status);
      setPriority(object.priority);
      setReqType(object.requirement_type || 'Functional Requirement');
      setSafetyLevel(object.safety_level || 'ASIL-D');
      setTestProcess(object.test_subprocess || 'System Testing');
      setFolderId(object.folder_id || null);
    }
  }, [object]);

  if (!object) return null;

  const isTestCase = object.type === 'TEST_CASE';
  const caseSteps = testSteps.filter(s => s.test_case_id === objectId);
  const selectedFolder = folders.find(f => f.id === folderId);

  const outgoingLinks = relationships.filter(r => r.source_id === objectId);
  const incomingLinks = relationships.filter(r => r.target_id === objectId);

  const handleSave = () => {
    onUpdateObject(objectId, {
      title: title.trim(),
      description: desc.trim(),
      status,
      priority,
      requirement_type: reqType,
      safety_level: safetyLevel,
      test_subprocess: testProcess,
      folder_id: folderId,
      folder_name: selectedFolder?.name || null
    });
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetObjId || !onAddRelationship) return;

    onAddRelationship(objectId, targetObjId, relType);
    setShowLinkModal(false);
    setTargetObjId(null);
  };

  const handleCreateTestStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.trim() || !newExpectedResult.trim() || !onAddTestStep) return;

    onAddTestStep(objectId, newAction.trim(), newExpectedResult.trim());
    setNewAction('');
    setNewExpectedResult('');
  };

  return (
    <div style={{
      width: '480px',
      backgroundColor: 'var(--bg-sidebar)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 50
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-card)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {object.object_key}
            </span>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              v{object.version}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Tracker: <strong style={{ color: 'var(--text-main)' }}>{object.tracker_name || object.type}</strong>
          </div>
        </div>

        <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'transparent' }}>
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          style={{
            flex: 1, padding: '10px 0', fontSize: '0.8rem', fontWeight: 600,
            color: activeTab === 'OVERVIEW' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottom: activeTab === 'OVERVIEW' ? '2px solid var(--accent-cyan)' : 'none', background: 'transparent'
          }}
        >
          Overview
        </button>

        {isTestCase && (
          <button
            onClick={() => setActiveTab('STEPS')}
            style={{
              flex: 1, padding: '10px 0', fontSize: '0.8rem', fontWeight: 600,
              color: activeTab === 'STEPS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === 'STEPS' ? '2px solid var(--accent-cyan)' : 'none', background: 'transparent'
            }}
          >
            Test Steps ({caseSteps.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('TRACEABILITY')}
          style={{
            flex: 1, padding: '10px 0', fontSize: '0.8rem', fontWeight: 600,
            color: activeTab === 'TRACEABILITY' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottom: activeTab === 'TRACEABILITY' ? '2px solid var(--accent-cyan)' : 'none', background: 'transparent'
          }}
        >
          Traceability ({outgoingLinks.length + incomingLinks.length})
        </button>

        <button
          onClick={() => setActiveTab('VERSIONS')}
          style={{
            flex: 1, padding: '10px 0', fontSize: '0.8rem', fontWeight: 600,
            color: activeTab === 'VERSIONS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottom: activeTab === 'VERSIONS' ? '2px solid var(--accent-cyan)' : 'none', background: 'transparent'
          }}
        >
          Versions
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {activeTab === 'OVERVIEW' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', fontSize: '0.9rem', fontWeight: 600 }}
              />
            </div>

            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created By Author</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Zewd</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  REQUIREMENT TYPE
                </label>
                <select value={reqType} onChange={(e) => setReqType(e.target.value as any)} style={{ width: '100%', fontSize: '0.8rem' }}>
                  <option value="Functional Requirement">Functional Requirement</option>
                  <option value="Non-Functional Requirement">Non-Functional Requirement</option>
                  <option value="Variable">Variable</option>
                  <option value="Parameter">Parameter</option>
                  <option value="Folder">Folder</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  PARENT FOLDER
                </label>
                <select value={folderId || ''} onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)} style={{ width: '100%', fontSize: '0.8rem' }}>
                  <option value="">No Parent Folder</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  SAFETY LEVEL (ASIL/SIL)
                </label>
                <select value={safetyLevel} onChange={(e) => setSafetyLevel(e.target.value as any)} style={{ width: '100%', fontSize: '0.8rem' }}>
                  <option value="ASIL-D">ASIL-D (Highest Safety)</option>
                  <option value="ASIL-C">ASIL-C</option>
                  <option value="ASIL-B">ASIL-B</option>
                  <option value="ASIL-A">ASIL-A</option>
                  <option value="SIL-3">SIL-3</option>
                  <option value="SIL-2">SIL-2</option>
                  <option value="SIL-1">SIL-1</option>
                  <option value="Standard / Non-Safety">Standard / Non-Safety</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  TEST-SUB PROCESS
                </label>
                <select value={testProcess} onChange={(e) => setTestProcess(e.target.value as any)} style={{ width: '100%', fontSize: '0.8rem' }}>
                  <option value="System Testing">System Testing</option>
                  <option value="Integration Testing">Integration Testing</option>
                  <option value="SW Testing">SW Testing</option>
                  <option value="Unit Testing">Unit Testing</option>
                  <option value="HIL Testing">HIL (Hardware-in-Loop)</option>
                  <option value="Black-Box Testing">Black-Box Testing</option>
                  <option value="Grey-Box Testing">Grey-Box Testing</option>
                  <option value="White-Box Testing">White-Box Testing</option>
                  <option value="Field Testing">Field Testing</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  STATUS
                </label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  PRIORITY
                </label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} style={{ width: '100%' }}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                DESCRIPTION & RATIONALE
              </label>
              <textarea
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <button
              onClick={handleSave}
              style={{
                width: '100%', padding: '10px', borderRadius: '6px',
                backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <Save size={16} />
              <span>Save & Create Version (v{object.version + 1})</span>
            </button>
          </div>
        )}

        {/* Step-by-Step Test Procedure Tab */}
        {activeTab === 'STEPS' && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListOrdered size={18} color="var(--accent-cyan)" />
              <span>Test Case Procedure Steps ({caseSteps.length})</span>
            </div>

            {/* List of Test Steps */}
            <div style={{ marginBottom: '24px' }}>
              {caseSteps.length > 0 ? (
                caseSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    style={{
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        STEP {idx + 1}
                      </span>
                      {onDeleteTestStep && (
                        <button onClick={() => onDeleteTestStep(step.id)} style={{ color: 'var(--accent-rose)', background: 'transparent' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Action / Instruction
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '2px' }}>
                        {step.action}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                        Expected Result
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                        {step.expected_result}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-dark)', borderRadius: '8px' }}>
                  No test steps created yet. Add your first Action & Expected Result below.
                </div>
              )}
            </div>

            {/* Add New Step Form */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-cyan)' }}>
                + Add Step #{caseSteps.length + 1}
              </div>

              <form onSubmit={handleCreateTestStep}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Action *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                    placeholder="e.g. Accelerate robot base to 1.5 m/s and trigger wireless e-stop..."
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Expected Result *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newExpectedResult}
                    onChange={(e) => setNewExpectedResult(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                    placeholder="e.g. Robot mechanical brakes engage, stopping base within <= 0.35m."
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '8px', borderRadius: '6px',
                    backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '0.85rem'
                  }}
                >
                  + Add Test Step to Procedure
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Traceability & Object Links Tab */}
        {activeTab === 'TRACEABILITY' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Object Traceability Engine</span>
              <button
                onClick={() => setShowLinkModal(true)}
                style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '4px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} />
                <span>Link Object ID</span>
              </button>
            </div>

            {/* Outgoing Links */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowRight size={14} />
                <span>FORWARD TRACEABILITY (OUTGOING ATTACHMENTS)</span>
              </div>

              {outgoingLinks.length > 0 ? (
                outgoingLinks.map(rel => {
                  const target = allObjects.find(o => o.id === rel.target_id);
                  return (
                    <div key={rel.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '10px 12px', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700 }}>{rel.relationship_type}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }} className="mono">{target?.object_key}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{target?.title}</div>
                      </div>
                      {onDeleteRelationship && (
                        <button onClick={() => onDeleteRelationship(rel.id)} style={{ color: 'var(--accent-rose)', background: 'transparent' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-dark)', padding: '10px', borderRadius: '6px' }}>
                  No outgoing links. Click "+ Link Object ID" to attach a test case or downstream item.
                </div>
              )}
            </div>

            {/* Incoming Links */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} />
                <span>BACKWARD TRACEABILITY (INCOMING ATTACHMENTS)</span>
              </div>

              {incomingLinks.length > 0 ? (
                incomingLinks.map(rel => {
                  const source = allObjects.find(o => o.id === rel.source_id);
                  return (
                    <div key={rel.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '10px 12px', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>{rel.relationship_type} BY</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }} className="mono">{source?.object_key}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{source?.title}</div>
                      </div>
                      {onDeleteRelationship && (
                        <button onClick={() => onDeleteRelationship(rel.id)} style={{ color: 'var(--accent-rose)', background: 'transparent' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-dark)', padding: '10px', borderRadius: '6px' }}>
                  No incoming links attached.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'VERSIONS' && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
              REVISION HISTORY (AUTHOR: ZEWD)
            </div>
            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '3px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                <span className="mono">Version {object.version} (Current)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Author: Zewd</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>{object.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                Type: {object.requirement_type || 'Functional Requirement'} | Safety: {object.safety_level || 'ASIL-D'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Linking Object IDs */}
      {showLinkModal && (
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
            width: '450px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
              Link <span className="mono" style={{ color: 'var(--accent-cyan)' }}>{object.object_key}</span> to Target Object ID
            </h3>

            <form onSubmit={handleCreateLink}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Relationship Type
                </label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="VERIFIED_BY">VERIFIED_BY (Req ➔ Test Case)</option>
                  <option value="MITIGATED_BY">MITIGATED_BY (Risk ➔ Requirement)</option>
                  <option value="DERIVED_TO">DERIVED_TO (Sys Req ➔ SW Req)</option>
                  <option value="ALLOCATED_TO">ALLOCATED_TO (Req ➔ Architecture)</option>
                  <option value="INCLUDED_IN">INCLUDED_IN (Test Case ➔ Test Set)</option>
                  <option value="EXECUTED_AS">EXECUTED_AS (Test Set ➔ Test Run)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Select Target Object ID *
                </label>
                <select
                  required
                  value={targetObjId || ''}
                  onChange={(e) => setTargetObjId(Number(e.target.value))}
                  style={{ width: '100%' }}
                >
                  <option value="">Select Target Object ID...</option>
                  {allObjects
                    .filter(o => o.id !== objectId)
                    .map(o => (
                      <option key={o.id} value={o.id}>
                        {o.object_key} - {o.title} ({o.type})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetObjId}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600 }}
                >
                  Link Objects Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
