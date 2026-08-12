import React, { useEffect, useState } from 'react';
import { X, History, Link as LinkIcon, Paperclip, Activity, GitBranch, Save, Plus, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

interface ObjectDetailPaneProps {
  objectId: number;
  onClose: () => void;
  onUpdate: () => void;
  onSelectForImpact?: (objId: number) => void;
}

export const ObjectDetailPane: React.FC<ObjectDetailPaneProps> = ({ objectId, onClose, onUpdate, onSelectForImpact }) => {
  const [detail, setDetail] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VERSIONS' | 'RELATIONSHIPS' | 'STEPS' | 'FILES'>('OVERVIEW');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Link Modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [targetKey, setTargetKey] = useState('');
  const [relType, setRelType] = useState('VERIFIED_BY');

  useEffect(() => {
    loadDetail();
  }, [objectId]);

  const loadDetail = () => {
    api.getObjectDetail(objectId).then((data) => {
      setDetail(data);
      setTitle(data.title);
      setDesc(data.description || '');
      setStatus(data.status);
    }).catch(console.error);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await api.updateObject(objectId, {
      title,
      description: desc,
      status,
      change_reason: changeReason || 'Updated details'
    });
    setIsSaving(false);
    setChangeReason('');
    loadDetail();
    onUpdate();
  };

  const handleAddLink = async () => {
    if (!targetKey.trim()) return;
    // Find target object by key
    // For demo simplicity, prompt user or use mock ID lookup
    alert(`Link requested: ${detail.object_key} -> ${relType} -> ${targetKey}`);
    setShowLinkModal(false);
  };

  if (!detail) return null;

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
              {detail.object_key}
            </span>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              v{detail.version}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{detail.tracker_name}</div>
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
          onClick={() => setActiveTab('RELATIONSHIPS')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: activeTab === 'RELATIONSHIPS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottom: activeTab === 'RELATIONSHIPS' ? '2px solid var(--accent-cyan)' : 'none',
            background: 'transparent'
          }}
        >
          Traceability ({detail.outgoingRelationships?.length + detail.incomingRelationships?.length || 0})
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
          Versions ({detail.versions?.length || 0})
        </button>
        {detail.testSteps && detail.testSteps.length > 0 && (
          <button
            onClick={() => setActiveTab('STEPS')}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: activeTab === 'STEPS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === 'STEPS' ? '2px solid var(--accent-cyan)' : 'none',
              background: 'transparent'
            }}
          >
            Steps ({detail.testSteps.length})
          </button>
        )}
      </div>

      {/* Content Area */}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                STATUS / WORKFLOW
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>
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

            {/* Metadata Fields */}
            {detail.metadata && (
              <div style={{ backgroundColor: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  STRUCTURED METADATA
                </div>
                {Object.entries(detail.metadata).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                    <span style={{ fontWeight: 600 }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                CHANGE REASON (REQUIRED FOR NEW VERSION)
              </label>
              <input
                type="text"
                placeholder="State why this update was made..."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
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
              <span>Save Changes & Create Version</span>
            </button>
          </div>
        )}

        {activeTab === 'RELATIONSHIPS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Traceability Links</span>
              <button
                onClick={() => setShowLinkModal(true)}
                style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                + Link Object
              </button>
            </div>

            {/* Outgoing */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                OUTGOING RELATIONSHIPS (FORWARD TRACEABILITY)
              </div>
              {detail.outgoingRelationships?.map((r: any) => (
                <div key={r.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '10px', borderRadius: '6px', marginBottom: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{r.relationship_type}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }} className="mono">{r.target_key}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{r.target_title}</div>
                </div>
              ))}
            </div>

            {/* Incoming */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                INCOMING RELATIONSHIPS (BACKWARD TRACEABILITY)
              </div>
              {detail.incomingRelationships?.map((r: any) => (
                <div key={r.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '10px', borderRadius: '6px', marginBottom: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>{r.relationship_type} BY</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }} className="mono">{r.source_key}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{r.source_title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'VERSIONS' && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
              IMMUTABLE REVISION HISTORY
            </div>
            {detail.versions?.map((v: any) => (
              <div key={v.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '3px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span className="mono">Version {v.version}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(v.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>{v.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  Reason: {v.change_reason}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'STEPS' && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
              ORDERED TEST STEPS DEFINITION
            </div>
            {detail.testSteps?.map((step: any) => (
              <div key={step.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                  Step #{step.step_number}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Action: {step.action}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  Expected: {step.expected_result}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
