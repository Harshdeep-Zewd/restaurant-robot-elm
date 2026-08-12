import React, { useEffect, useState } from 'react';
import { GitBranch, ArrowLeft, ArrowRight, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

interface ImpactAnalysisViewProps {
  objectId: number;
  onBack: () => void;
}

export const ImpactAnalysisView: React.FC<ImpactAnalysisViewProps> = ({ objectId, onBack }) => {
  const [impactData, setImpactData] = useState<any>(null);

  useEffect(() => {
    api.getImpactAnalysis(objectId).then(setImpactData).catch(console.error);
  }, [objectId]);

  if (!impactData) return null;

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Tracker</span>
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Transitive Change Impact Analysis</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Assessing upstream & downstream engineering dependencies for <span style={{ color: 'var(--accent-cyan)' }} className="mono">{impactData.root?.object_key}</span>
        </p>
      </div>

      {/* Root Object Card */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--accent-cyan)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{impactData.root?.object_key}</span>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '4px' }}>{impactData.root?.title}</h2>
        <span className="badge badge-approved" style={{ marginTop: '8px' }}>{impactData.root?.status}</span>
      </div>

      {/* Downstream & Upstream Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Downstream Impact */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRight size={18} />
            <span>Downstream Impacted Objects ({impactData.downstreamImpact?.length || 0})</span>
          </h3>

          {impactData.downstreamImpact?.map((item: any) => (
            <div key={item.id} style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{item.relationship_type}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }} className="mono">{item.object_key}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.title}</div>
            </div>
          ))}
        </div>

        {/* Upstream Impact */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={18} />
            <span>Upstream Parent Dependencies ({impactData.upstreamImpact?.length || 0})</span>
          </h3>

          {impactData.upstreamImpact?.map((item: any) => (
            <div key={item.id} style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>{item.relationship_type} BY</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }} className="mono">{item.object_key}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
