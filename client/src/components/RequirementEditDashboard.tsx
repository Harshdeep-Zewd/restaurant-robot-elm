import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Save, X, Plus, ListOrdered, CheckCircle2, ShieldAlert,
  Clock, User, FileText, Link as LinkIcon, Paperclip, Bold, Italic,
  Underline, List, Table, Image, Code, Check
} from 'lucide-react';
import {
  EngineeringObject, Tracker, Folder as FolderType, Relationship,
  TestStep, Artifact, SafetyLevel, RequirementType, TestSubProcess
} from '../types/elm';

interface RequirementEditDashboardProps {
  object: EngineeringObject;
  tracker: Tracker;
  allObjects: EngineeringObject[];
  folders: FolderType[];
  relationships: Relationship[];
  testSteps?: TestStep[];
  artifacts?: Artifact[];
  onUpdateObject: (id: number, updates: Partial<EngineeringObject>) => void;
  onAddTestStep?: (test_case_id: number, action: string, expected_result: string) => void;
  onDeleteTestStep?: (id: number) => void;
  onAddRelationship?: (source_id: number, target_id: number, type: string) => void;
  onDeleteRelationship?: (id: number) => void;
  onDone: () => void;
}

export const RequirementEditDashboard: React.FC<RequirementEditDashboardProps> = ({
  object,
  tracker,
  allObjects,
  folders,
  relationships,
  testSteps = [],
  artifacts = [],
  onUpdateObject,
  onAddTestStep,
  onDeleteTestStep,
  onAddRelationship,
  onDeleteRelationship,
  onDone
}) => {
  // View mode tab: [All] | [Required] | [Editable]
  const [viewTab, setViewTab] = useState<'ALL' | 'REQUIRED' | 'EDITABLE'>('ALL');

  // Form Fields
  const [title, setTitle] = useState(object.title || '');
  const [status, setStatus] = useState(object.status || 'DRAFT');
  const [startDate, setStartDate] = useState(object.start_date || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(object.end_date || '');
  const [spentEffort, setSpentEffort] = useState(object.spent_effort || '0h');
  const [plannedEffort, setPlannedEffort] = useState(object.planned_effort || '16h');
  const [resolution, setResolution] = useState(object.resolution || 'Unresolved');
  const [folderId, setFolderId] = useState<number | null>(object.folder_id || null);
  const [ownerName, setOwnerName] = useState(object.owner_name || 'Zewd');
  const [category, setCategory] = useState(object.category || 'Functional Requirement');
  const [release, setRelease] = useState(object.release || 'Release 2.4');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(object.priority || 'MEDIUM');
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>(object.safety_level || 'ASIL-D');
  const [preAction, setPreAction] = useState(object.pre_action || '');
  const [description, setDescription] = useState(object.description || '');
  const [postAction, setPostAction] = useState(object.post_action || '');

  // Test Steps local state
  const [newStepAction, setNewStepAction] = useState('');
  const [newStepExpected, setNewStepExpected] = useState('');

  // Association local state
  const [assocType, setAssocType] = useState('depends');
  const [assocTargetId, setAssocTargetId] = useState<number | null>(null);

  // Success indicator
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isTestCaseTracker = tracker.enable_test_steps ?? (tracker.type === 'TEST_CASE' || tracker.key === 'SYS-TST' || tracker.prefix.includes('TST-'));
  const isTestSetTracker = tracker.type === 'TEST_SET' || tracker.key === 'TST-SET' || tracker.prefix.includes('SET-');

  const objSteps = testSteps.filter(s => s.test_case_id === object.id);
  const outgoingLinks = relationships.filter(r => r.source_id === object.id);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Summary / Title is required!");
      return;
    }

    const selectedFolder = folders.find(f => f.id === folderId);

    onUpdateObject(object.id, {
      title: title.trim(),
      status,
      start_date: startDate,
      end_date: endDate,
      spent_effort: spentEffort,
      planned_effort: plannedEffort,
      resolution,
      folder_id: folderId,
      folder_name: selectedFolder?.name || null,
      owner_name: ownerName.trim(),
      category,
      release,
      priority,
      safety_level: safetyLevel,
      pre_action: preAction.trim(),
      description: description.trim(),
      post_action: postAction.trim(),
      version: (object.version || 1) + 1
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onDone();
    }, 700);
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepAction.trim() || !onAddTestStep) return;
    onAddTestStep(object.id, newStepAction.trim(), newStepExpected.trim() || 'Verified output complies with specification.');
    setNewStepAction('');
    setNewStepExpected('');
  };

  const handleAddAssociation = () => {
    if (!assocTargetId || !onAddRelationship) return;
    const rel = assocType === 'depends' ? 'DEPENDS_ON' : assocType === 'verified by' ? 'VERIFIED_BY' : 'ALLOCATED_TO';
    onAddRelationship(object.id, assocTargetId, rel);
    setAssocTargetId(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 60px)',
      backgroundColor: 'var(--bg-dark)',
      overflowY: 'auto'
    }}>
      {/* Top Application Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onDone}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            <span>← Back to Tracker</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mono" style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--accent-cyan)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              [{object.object_key}]
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Edit Requirement Specification
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Current: v{object.version}.0 ➔ Next: v{(object.version || 1) + 1}.0)
            </span>
          </div>
        </div>

        {/* Top Actions: Save, Cancel, and View Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Filter Tabs like Codebeamer */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            {(['REQUIRED', 'EDITABLE', 'ALL'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: viewTab === tab ? 'var(--primary)' : 'transparent',
                  color: viewTab === tab ? '#fff' : 'var(--text-muted)'
                }}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={onDone}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-dark)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              borderRadius: '6px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)'
            }}
          >
            {savedSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{savedSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Body - Styled like Codebeamer / Enterprise ALM */}
      <div style={{ maxWidth: '1180px', width: '100%', margin: '24px auto', padding: '0 24px 60px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* 3-Column Structured Metadata Grid */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px'
        }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Tracker
              </label>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {tracker.name} ({tracker.prefix})
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>
            </div>

            {viewTab !== 'REQUIRED' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Spent Effort
                  </label>
                  <input
                    type="text"
                    value={spentEffort}
                    onChange={(e) => setSpentEffort(e.target.value)}
                    placeholder="e.g. 4h"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  >
                    <option value="Unresolved">Unresolved</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Verified">Verified</option>
                    <option value="Won't Fix">Won't Fix</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Parent Folder
              </label>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(Number(e.target.value) || null)}
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <option value="">None (Top Level Root)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Owner
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 700 }}
              />
            </div>

            {viewTab !== 'REQUIRED' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  >
                    <option value="Functional Requirement">Functional Requirement</option>
                    <option value="Non-Functional Requirement">Non-Functional Requirement</option>
                    <option value="Interface">Interface</option>
                    <option value="Safety Critical">Safety Critical</option>
                    <option value="Parameter">Parameter</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Release
                  </label>
                  <input
                    type="text"
                    value={release}
                    onChange={(e) => setRelease(e.target.value)}
                    placeholder="e.g. Release 2.4"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Normal / Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Assigned To
              </label>
              <input
                type="text"
                value="Zewd (Owner)"
                disabled
                style={{ width: '100%', fontSize: '0.8rem', opacity: 0.8 }}
              />
            </div>

            {viewTab !== 'REQUIRED' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Planned Effort
                  </label>
                  <input
                    type="text"
                    value={plannedEffort}
                    onChange={(e) => setPlannedEffort(e.target.value)}
                    placeholder="e.g. 16h"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Severity / Safety Level
                  </label>
                  <select
                    value={safetyLevel}
                    onChange={(e) => setSafetyLevel(e.target.value as SafetyLevel)}
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  >
                    <option value="ASIL-D">ASIL-D</option>
                    <option value="ASIL-C">ASIL-C</option>
                    <option value="ASIL-B">ASIL-B</option>
                    <option value="ASIL-A">ASIL-A</option>
                    <option value="SIL-3">SIL-3</option>
                    <option value="SIL-2">SIL-2</option>
                    <option value="Standard / Non-Safety">Standard / Non-Safety</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary / Title * */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            Summary / Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', fontSize: '1.15rem', fontWeight: 700, padding: '10px 14px' }}
            placeholder="e.g. Obstacle Detection & Local Rerouting Latency"
          />
        </div>

        {/* ⚡ Pre-Action (Initial / Preconditions) */}
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '10px',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: 'var(--accent-amber)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              ⚡ PRE-ACTION
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Initial System State, Hardware Preconditions & Entry Criteria *
            </span>
          </div>
          <textarea
            rows={3}
            value={preAction}
            onChange={(e) => setPreAction(e.target.value)}
            placeholder="Specify starting system state, sensor calibration, battery thresholds, environmental constraints before trigger..."
            style={{ width: '100%', padding: '10px 12px', fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>

        {/* Detailed Specification & Description * */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Description / Specification *
            </label>

            {/* Rich Editor Formatting Mock Bar like Codebeamer */}
            <div style={{ display: 'flex', gap: '4px', color: 'var(--text-muted)' }}>
              <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}><Bold size={14} /></button>
              <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}><Italic size={14} /></button>
              <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}><Underline size={14} /></button>
              <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}><List size={14} /></button>
              <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}><Table size={14} /></button>
              <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}><Code size={14} /></button>
            </div>
          </div>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Full technical requirements text, acceptance criteria, architectural interfaces..."
            style={{ width: '100%', padding: '12px 14px', fontSize: '0.9rem', resize: 'vertical', lineHeight: '1.5' }}
          />
        </div>

        {/* 🧪 Test Steps Management (if Test Case tracker) */}
        {isTestCaseTracker && (
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ListOrdered size={16} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                Test Case Verification Steps ({objSteps.length})
              </h4>
            </div>

            {objSteps.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {objSteps.map((step, idx) => (
                  <div key={step.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 1fr 32px',
                    gap: '12px',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem'
                  }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', textAlign: 'center' }}>#{idx + 1}</span>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTION</div>
                      <div>{step.action}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPECTED OUTCOME</div>
                      <div style={{ color: 'var(--accent-emerald)' }}>{step.expected_result}</div>
                    </div>
                    {onDeleteTestStep && (
                      <button
                        onClick={() => onDeleteTestStep(step.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Step Form */}
            <form onSubmit={handleAddStep} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
              <input
                type="text"
                placeholder="Test action procedure..."
                value={newStepAction}
                onChange={(e) => setNewStepAction(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '8px 10px' }}
              />
              <input
                type="text"
                placeholder="Expected result..."
                value={newStepExpected}
                onChange={(e) => setNewStepExpected(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '8px 10px' }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                + Add Step
              </button>
            </form>
          </div>
        )}

        {/* 🎯 Post-Action (Exit / Postconditions) */}
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '10px',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--accent-emerald)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              🎯 POST-ACTION
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Final System State, Postconditions, Safety Hold & Verification Output *
            </span>
          </div>
          <textarea
            rows={3}
            value={postAction}
            onChange={(e) => setPostAction(e.target.value)}
            placeholder="Describe final exit system state, telemetry dispatch, mechanical brake holding, postcondition verification..."
            style={{ width: '100%', padding: '10px 12px', fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>

        {/* Association Bar like Codebeamer */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LinkIcon size={14} color="var(--accent-cyan)" />
            <span>Association / Trace:</span>
          </span>

          <select
            value={assocType}
            onChange={(e) => setAssocType(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '6px 8px' }}
          >
            <option value="depends">depends on</option>
            <option value="verified by">verified by</option>
            <option value="allocated to">allocated to</option>
          </select>

          <select
            value={assocTargetId || ''}
            onChange={(e) => setAssocTargetId(Number(e.target.value) || null)}
            style={{ flex: 1, minWidth: '220px', fontSize: '0.8rem', padding: '6px 8px' }}
          >
            <option value="">None (Select target object)...</option>
            {allObjects.filter(o => o.id !== object.id).map(o => (
              <option key={o.id} value={o.id}>[{o.object_key}] {o.title}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddAssociation}
            disabled={!assocTargetId}
            style={{
              padding: '6px 14px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Link
          </button>
        </div>

        {/* Bottom Save Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', paddingTop: '10px' }}>
          <button
            type="button"
            onClick={onDone}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 28px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
            }}
          >
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
