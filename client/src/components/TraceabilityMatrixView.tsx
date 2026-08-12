import React, { useEffect, useState } from 'react';
import { GitCompare, Check, X, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { Tracker } from '../types/elm';

interface TraceabilityMatrixViewProps {
  trackers: Tracker[];
}

export const TraceabilityMatrixView: React.FC<TraceabilityMatrixViewProps> = ({ trackers }) => {
  const [sourceTrackerId, setSourceTrackerId] = useState<number>(trackers[0]?.id || 1);
  const [targetTrackerId, setTargetTrackerId] = useState<number>(trackers[4]?.id || 5);
  const [matrixData, setMatrixData] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);

  useEffect(() => {
    if (sourceTrackerId && targetTrackerId) {
      api.getTraceabilityMatrix(sourceTrackerId, targetTrackerId).then(setMatrixData).catch(console.error);
    }
    api.getTraceabilityCoverage(1).then(setCoverage).catch(console.error);
  }, [sourceTrackerId, targetTrackerId]);

  const hasLink = (sourceId: number, targetId: number) => {
    if (!matrixData?.links) return false;
    return matrixData.links.some((l: any) => l.source_id === sourceId && l.target_id === targetId);
  };

  const toggleLink = async (sourceId: number, targetId: number) => {
    const existing = matrixData.links.find((l: any) => l.source_id === sourceId && l.target_id === targetId);
    if (existing) {
      await api.createRelationship({ source_id: sourceId, target_id: targetId, relationship_type: 'VERIFIED_BY' });
    } else {
      await api.createRelationship({ source_id: sourceId, target_id: targetId, relationship_type: 'VERIFIED_BY' });
    }
    api.getTraceabilityMatrix(sourceTrackerId, targetTrackerId).then(setMatrixData);
  };

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bidirectional Traceability Matrix</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time relationship mapping & verification coverage matrix
          </p>
        </div>

        {/* Tracker Selectors */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <select value={sourceTrackerId} onChange={(e) => setSourceTrackerId(Number(e.target.value))}>
            {trackers.map(t => <option key={t.id} value={t.id}>Source: {t.name}</option>)}
          </select>

          <ArrowRight size={16} color="var(--text-muted)" />

          <select value={targetTrackerId} onChange={(e) => setTargetTrackerId(Number(e.target.value))}>
            {trackers.map(t => <option key={t.id} value={t.id}>Target: {t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Coverage Alerts Banner */}
      {coverage && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={24} color="var(--accent-emerald)" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>Requirement Verification</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>{coverage.stats.unverifiedCount === 0 ? '100% Requirements Verified' : `${coverage.stats.unverifiedCount} Unverified Requirements`}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GitCompare size={24} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Test Case Allocation</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>{coverage.stats.orphanTestCount === 0 ? 'All Test Cases Mapped to Reqs' : `${coverage.stats.orphanTestCount} Tests Without Requirements`}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} color="var(--accent-amber)" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)' }}>Risk Mitigation Coverage</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>{coverage.stats.unmitigatedRiskCount === 0 ? 'All Risks Have Mitigations' : `${coverage.stats.unmitigatedRiskCount} Unmitigated Risks`}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2D Matrix Table */}
      {matrixData && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'left', minWidth: '220px' }}>
                  SOURCE \ TARGET
                </th>
                {matrixData.targets?.map((target: any) => (
                  <th key={target.id} style={{ padding: '12px', fontSize: '0.8rem', minWidth: '120px' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }} className="mono">{target.object_key}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                      {target.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.sources?.map((source: any) => (
                <tr key={source.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left', backgroundColor: 'var(--bg-sidebar)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }} className="mono">{source.object_key}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{source.title}</div>
                  </td>
                  {matrixData.targets?.map((target: any) => {
                    const isLinked = hasLink(source.id, target.id);
                    return (
                      <td
                        key={target.id}
                        onClick={() => toggleLink(source.id, target.id)}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          backgroundColor: isLinked ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        {isLinked ? (
                          <div style={{ display: 'inline-flex', padding: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)', color: '#000' }}>
                            <Check size={14} />
                          </div>
                        ) : (
                          <span style={{ color: 'var(--border-color)', fontSize: '1.2rem' }}>•</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
