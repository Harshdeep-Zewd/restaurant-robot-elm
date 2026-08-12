import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { api } from '../api/client';

export const RisksMatrixView: React.FC = () => {
  const [risks, setRisks] = useState<any[]>([]);

  useEffect(() => {
    // Fetch risks from tracker #4
    api.getObjects(4).then(setRisks).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Risk & Hazard Management</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Structured hazard analysis, Risk Score Matrix (Severity x Exposure x Avoidance), and requirement mitigations
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Risk Grid Overview */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>5x5 Severity vs Exposure Risk Heatmap</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
            {[5, 4, 3, 2, 1].map((severity) => (
              [1, 2, 3, 4, 5].map((exposure) => {
                const score = severity * exposure * 2;
                const isHigh = score >= 30;
                return (
                  <div
                    key={`${severity}-${exposure}`}
                    style={{
                      backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${isHigh ? '#ef4444' : '#10b981'}`,
                      borderRadius: '6px',
                      padding: '12px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isHigh ? '#fca5a5' : '#34d399'
                    }}
                  >
                    S{severity}xE{exposure}
                  </div>
                );
              })
            ))}
          </div>
        </div>

        {/* Risk Summary */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Active Hazard Register</h2>

          {risks.map((risk) => {
            const meta = risk.metadata || {};
            return (
              <div key={risk.id} style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{risk.object_key}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                    Risk Rating: {meta.riskRating || 60}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '6px' }}>{risk.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{risk.description}</div>

                <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                  <strong>Mitigation:</strong> {meta.mitigation || 'SYS-REQ-001 & SYS-REQ-002'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
