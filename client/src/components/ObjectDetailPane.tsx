import React, { useEffect, useState } from 'react';
import { X, Save, History, ShieldAlert, Cpu, Activity, User, Folder } from 'lucide-react';
import { EngineeringObject, RequirementType, SafetyLevel, TestSubProcess, Folder as FolderType } from '../types/elm';

interface ObjectDetailPaneProps {
  objectId: number;
  object?: EngineeringObject;
  folders?: FolderType[];
  onClose: () => void;
  onUpdateObject: (id: number, updates: Partial<EngineeringObject>) => void;
  onSelectForImpact?: (objId: number) => void;
}

export const ObjectDetailPane: React.FC<ObjectDetailPaneProps> = ({
  objectId,
  object,
  folders,
  onClose,
  onUpdateObject,
  onSelectForImpact
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VERSIONS'>('OVERVIEW');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [reqType, setReqType] = useState<RequirementType>('Functional Requirement');
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>('ASIL-D');
  const [testProcess, setTestProcess] = useState<TestSubProcess>('System Testing');
  const [folderId, setFolderId] = useState<number | null>(null);

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

  const selectedFolder = folders?.find(f => f.id === folderId);

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

  return (
    <div style={{
      width: '460px',
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
            flex: 1,
            padding: '10px 0',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: activeTab === 'OVERVIEW' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottom: activeTab === 'OVERVIEW' ? '2px solid var(--accent-cyan)' : 'none',
            background: 'transparent'
          }}
        >
          Overview & Metadata
        </button>
        <button
          onClick={() => setActiveTab('VERSIONS')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: activeTab === 'VERSIONS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottom: activeTab === 'VERSIONS' ? '2px solid var(--accent-cyan)' : 'none',
            background: 'transparent'
          }}
        >
          Versions (v{object.version})
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

            {/* Author / Creator Badge */}
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
                  {folders?.map(f => (
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
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} />
              <span>Save & Create Version (v{object.version + 1})</span>
            </button>
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
    </div>
  );
};
