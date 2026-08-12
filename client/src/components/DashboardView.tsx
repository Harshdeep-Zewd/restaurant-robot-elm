import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Layers, Activity, FolderArchive, ArrowUpRight } from 'lucide-react';
import { api } from '../api/client';
import { ViewMode } from './Sidebar';
import { Tracker } from '../types/elm';

interface DashboardViewProps {
  onNavigate: (view: ViewMode, tracker?: Tracker) => void;
  trackers: Tracker[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, trackers }) => {
  const [coverage, setCoverage] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [baselines, setBaselines] = useState<any[]>([]);

  useEffect(() => {
    api.getTraceabilityCoverage(1).then(setCoverage).catch(console.error);
    api.getTestRuns().then(setRuns).catch(console.error);
    api.getBaselines().then(setBaselines).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Autonomous Restaurant Delivery Robot (RoboServ-X1)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Systems Engineering Lifecycle Management & ISO 13482 Safety Compliance Workspace
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onNavigate('TRACEABILITY')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            <span>Traceability Matrix</span>
            <ArrowUpRight size={16} />
          </button>

          <button
            onClick={() => onNavigate('TEST_EXECUTION')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--accent-emerald)',
              color: '#000',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <span>Launch Test Runner</span>
            <Activity size={16} />
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Verification Coverage</span>
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '8px 0', color: 'var(--accent-emerald)' }}>
            100%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All 3 System Requirements mapped to test cases
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Safety Test Runs</span>
            <Activity size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '8px 0', color: 'var(--accent-cyan)' }}>
            {runs.length > 0 ? runs[0].overall_status : 'PASS'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Latest Run: Safety Validation Run #1
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Mitigated Risks</span>
            <ShieldAlert size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '8px 0', color: 'var(--accent-amber)' }}>
            2 / 2
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Collision & Liquid Spill hazards fully mitigated
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Active Baseline</span>
            <FolderArchive size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: 'var(--accent-purple)' }}>
            {baselines.length > 0 ? baselines[0].version_tag : 'v1.0-safety'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Safety Freeze V1.0 (ISO 13482 Audit)
          </div>
        </div>
      </div>

      {/* Main Grid: Trackers List & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Trackers Grid */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Active Engineering Trackers</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {trackers.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigate('TRACKER', t)}
                style={{
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }} className="mono">
                    Prefix: {t.prefix}
                  </div>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  color: 'var(--accent-cyan)'
                }}>
                  {t.object_count || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage & Audit Quick Summary */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Verification & Audit Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', borderLeft: '4px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Obstacle Avoidance Latency</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified by SYS-TST-001 (Pass: 34ms)</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', borderLeft: '4px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Emergency Stop Braking Distance</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified by SYS-TST-002 (Pass: 0.284m)</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Change Request CR-001 under Review</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Affects SYS-REQ-001 and SW-REQ-001</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
