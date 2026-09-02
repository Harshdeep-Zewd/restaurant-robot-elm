import React, { useEffect, useState } from 'react';
import { X, Save, History, Link as LinkIcon } from 'lucide-react';
import { EngineeringObject } from '../types/elm';

interface ObjectDetailPaneProps {
  objectId: number;
  object?: EngineeringObject;
  onClose: () => void;
  onUpdateObject: (id: number, updates: Partial<EngineeringObject>) => void;
  onSelectForImpact?: (objId: number) => void;
}

export const ObjectDetailPane: React.FC<ObjectDetailPaneProps> = ({
  objectId,
  object,
  onClose,
  onUpdateObject,
  onSelectForImpact
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VERSIONS' | 'RELATIONSHIPS'>('OVERVIEW');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [changeReason, setChangeReason] = useState('');

  useEffect(() => {
    if (object) {
      setTitle(object.title);
      setDesc(object.description || '');
      setStatus(object.status);
      setPriority(object.priority);
    }
  }, [object]);

  if (!object) return null;

  const handleSave = () => {
    onUpdateObject(objectId, {
      title: title.trim(),
      description: desc.trim(),
      status,
      priority
    });
    setChangeReason('');
  };

  return (
    <div style={{
      width: '450px',
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{object.type}</div>
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
          Overview
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
                rows={5}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            {object.metadata && (
              <div style={{ backgroundColor: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  STRUCTURED METADATA
                </div>
                {Object.entries(object.metadata).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                    <span style={{ fontWeight: 600 }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

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
              REVISION HISTORY
            </div>
            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '3px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                <span className="mono">Version {object.version} (Current)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>{object.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>Status: {object.status}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
