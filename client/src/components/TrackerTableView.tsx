import React, { useState } from 'react';
import { Plus, Folder, ChevronRight, ListOrdered } from 'lucide-react';
import { Tracker, Folder as FolderType, EngineeringObject, RequirementType, SafetyLevel, TestSubProcess, Relationship, TestStep } from '../types/elm';
import { ObjectDetailPane } from './ObjectDetailPane';

interface TrackerTableViewProps {
  tracker: Tracker;
  objects: EngineeringObject[];
  allObjects: EngineeringObject[];
  folders: FolderType[];
  relationships: Relationship[];
  testSteps?: TestStep[];
  onCreateObject: (data: {
    tracker_id: number;
    folder_id?: number | null;
    title: string;
    description?: string;
    requirement_type?: RequirementType;
    safety_level?: SafetyLevel;
    test_subprocess?: TestSubProcess;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    test_step_action?: string;
    test_step_expected?: string;
    metadata?: any;
  }) => void;
  onUpdateObject: (id: number, updates: Partial<EngineeringObject>) => void;
  onAddRelationship: (source_id: number, target_id: number, type: string) => void;
  onDeleteRelationship: (id: number) => void;
  onAddTestStep?: (test_case_id: number, action: string, expected_result: string) => void;
  onDeleteTestStep?: (id: number) => void;
  onSelectObjectForImpact?: (objId: number) => void;
}

export const TrackerTableView: React.FC<TrackerTableViewProps> = ({
  tracker,
  objects,
  allObjects,
  folders,
  relationships,
  testSteps = [],
  onCreateObject,
  onUpdateObject,
  onAddRelationship,
  onDeleteRelationship,
  onAddTestStep,
  onDeleteTestStep,
  onSelectObjectForImpact
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Record Form Fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFolderId, setNewFolderId] = useState<number | null>(null);
  const [newReqType, setNewReqType] = useState<RequirementType>('Functional Requirement');
  const [newSafetyLevel, setNewSafetyLevel] = useState<SafetyLevel>('ASIL-D');
  const [newTestProcess, setNewTestProcess] = useState<TestSubProcess>('System Testing');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');

  // Test Case Specific Step 1 Fields
  const [newStepAction, setNewStepAction] = useState('');
  const [newStepExpected, setNewStepExpected] = useState('');

  const isTestCaseTracker = tracker.type === 'TEST_CASE' || tracker.key.includes('TST');

  let filteredObjects = objects;

  if (selectedFolderId !== null) {
    filteredObjects = filteredObjects.filter(o => o.folder_id === selectedFolderId);
  }
  if (statusFilter) {
    filteredObjects = filteredObjects.filter(o => o.status === statusFilter);
  }
  if (search.trim()) {
    const s = search.toLowerCase();
    filteredObjects = filteredObjects.filter(o =>
      o.object_key.toLowerCase().includes(s) ||
      o.title.toLowerCase().includes(s) ||
      o.description.toLowerCase().includes(s) ||
      (o.requirement_type && o.requirement_type.toLowerCase().includes(s)) ||
      (o.safety_level && o.safety_level.toLowerCase().includes(s))
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateObject({
      tracker_id: tracker.id,
      folder_id: newFolderId || selectedFolderId,
      title: newTitle.trim(),
      description: newDesc.trim(),
      requirement_type: newReqType,
      safety_level: newSafetyLevel,
      test_subprocess: newTestProcess,
      priority: newPriority,
      test_step_action: newStepAction.trim() || undefined,
      test_step_expected: newStepExpected.trim() || undefined,
      metadata: { rationale: 'Created via workspace UI', author: 'Zewd' }
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewStepAction('');
    setNewStepExpected('');
    setNewPriority('MEDIUM');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-approved">{status}</span>;
      case 'VERIFIED': return <span className="badge badge-verified">{status}</span>;
      case 'REVIEW': return <span className="badge badge-review">{status}</span>;
      default: return <span className="badge badge-draft">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <span className="badge badge-critical">{priority}</span>;
      case 'HIGH': return <span className="badge badge-high">{priority}</span>;
      case 'MEDIUM': return <span className="badge badge-medium">{priority}</span>;
      default: return <span className="badge badge-low">{priority}</span>;
    }
  };

  const getSafetyBadge = (level?: SafetyLevel) => {
    if (!level) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
    if (level.startsWith('ASIL')) {
      return <span style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{level}</span>;
    }
    if (level.startsWith('SIL')) {
      return <span style={{ color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{level}</span>;
    }
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{level}</span>;
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Folder Tree Sidebar */}
      <div style={{
        width: '220px',
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-sidebar)',
        padding: '16px 12px',
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Folders / Sub-systems
        </div>

        <button
          onClick={() => setSelectedFolderId(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '6px',
            backgroundColor: selectedFolderId === null ? 'var(--bg-hover)' : 'transparent',
            color: selectedFolderId === null ? 'var(--accent-cyan)' : 'var(--text-main)',
            width: '100%',
            textAlign: 'left',
            fontSize: '0.85rem',
            marginBottom: '4px'
          }}
        >
          <Folder size={16} />
          <span>All Items ({objects.length})</span>
        </button>

        {folders.map((f) => {
          const count = objects.filter(o => o.folder_id === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: selectedFolderId === f.id ? 'var(--bg-hover)' : 'transparent',
                color: selectedFolderId === f.id ? 'var(--accent-cyan)' : 'var(--text-main)',
                width: '100%',
                textAlign: 'left',
                fontSize: '0.85rem',
                marginBottom: '2px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ChevronRight size={14} />
                <span>{f.name}</span>
              </div>
              <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-dark)', padding: '2px 6px', borderRadius: '10px', color: 'var(--text-muted)' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{tracker.name}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Showing {filteredObjects.length} engineering objects in {tracker.prefix}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="REVIEW">REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="VERIFIED">VERIFIED</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <Plus size={16} />
              <span>New {tracker.name.slice(0, -1)}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredObjects.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>KEY</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>TITLE & SUMMARY</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>REQ TYPE</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>SAFETY LEVEL</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>TEST PROCESS</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>PRIORITY</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>VER</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>CREATED BY</th>
                </tr>
              </thead>
              <tbody>
                {filteredObjects.map((obj) => (
                  <tr
                    key={obj.id}
                    onClick={() => setSelectedObjectId(obj.id)}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: selectedObjectId === obj.id ? 'var(--bg-hover)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--accent-cyan)' }} className="mono">
                      {obj.object_key}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{obj.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                        {obj.description}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        {obj.requirement_type || 'Functional Requirement'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{getSafetyBadge(obj.safety_level)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                        {obj.test_subprocess || 'System Testing'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{getStatusBadge(obj.status)}</td>
                    <td style={{ padding: '12px 14px' }}>{getPriorityBadge(obj.priority)}</td>
                    <td style={{ padding: '12px 14px' }} className="mono">v{obj.version}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {obj.created_by_name || obj.owner_name || 'Zewd'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>No items found in {tracker.name}</div>
              <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Click below to create the first engineering record for this tracker.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}
              >
                + Create {tracker.name.slice(0, -1)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inspector with Test Steps */}
      {selectedObjectId && (
        <ObjectDetailPane
          objectId={selectedObjectId}
          object={allObjects.find(o => o.id === selectedObjectId)}
          allObjects={allObjects}
          folders={folders}
          relationships={relationships}
          testSteps={testSteps}
          onClose={() => setSelectedObjectId(null)}
          onUpdateObject={onUpdateObject}
          onAddRelationship={onAddRelationship}
          onDeleteRelationship={onDeleteRelationship}
          onAddTestStep={onAddTestStep}
          onDeleteTestStep={onDeleteTestStep}
          onSelectForImpact={onSelectObjectForImpact}
        />
      )}

      {/* Expanded Modal with Test Steps section for Test Cases */}
      {showCreateModal && (
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
            width: '580px',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Create New {tracker.name.slice(0, -1)}</h3>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. LiDAR Occlusion Field of View Limit"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Requirement Type</label>
                  <select
                    value={newReqType}
                    onChange={(e) => setNewReqType(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="Functional Requirement">Functional Requirement</option>
                    <option value="Non-Functional Requirement">Non-Functional Requirement</option>
                    <option value="Variable">Variable</option>
                    <option value="Parameter">Parameter</option>
                    <option value="Folder">Folder</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Parent Folder</label>
                  <select
                    value={newFolderId || ''}
                    onChange={(e) => setNewFolderId(e.target.value ? Number(e.target.value) : null)}
                    style={{ width: '100%' }}
                  >
                    <option value="">No Parent Folder (Root)</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Safety Level (SIL / ASIL)</label>
                  <select
                    value={newSafetyLevel}
                    onChange={(e) => setNewSafetyLevel(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Test-Sub Process</label>
                  <select
                    value={newTestProcess}
                    onChange={(e) => setNewTestProcess(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Created By</label>
                  <input
                    type="text"
                    disabled
                    value="Zewd"
                    style={{ width: '100%', backgroundColor: 'var(--bg-dark)', color: 'var(--accent-cyan)', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Initial Test Step Section (Shown for Test Case trackers) */}
              {isTestCaseTracker && (
                <div style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ListOrdered size={16} />
                    <span>Initial Test Step #1 (Procedure Step)</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Step 1: Action / Instruction
                    </label>
                    <input
                      type="text"
                      value={newStepAction}
                      onChange={(e) => setNewStepAction(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                      placeholder="e.g. Accelerate base to 1.5 m/s and hit wireless e-stop button..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Step 1: Expected Result
                    </label>
                    <input
                      type="text"
                      value={newStepExpected}
                      onChange={(e) => setNewStepExpected(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                      placeholder="e.g. Mechanical brakes engage and stop robot within <= 0.35m."
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Description & Rationale</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="Detailed engineering specification..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600 }}
                >
                  Create Record (Author: Zewd)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
