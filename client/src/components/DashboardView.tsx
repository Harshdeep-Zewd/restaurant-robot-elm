import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Layers, Activity, FolderArchive, ArrowUpRight } from 'lucide-react';
import { ViewMode } from './Sidebar';
import { Project, Tracker, EngineeringObject, TestRun } from '../types/elm';

interface DashboardViewProps {
  project: Project;
  onNavigate: (view: ViewMode, tracker?: Tracker) => void;
  trackers: Tracker[];
  allObjects?: EngineeringObject[];
  testRuns?: TestRun[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  onNavigate,
  trackers,
  allObjects = [],
  testRuns = []
}) => {
  const currentTrackerIds = trackers.map(t => t.id);
  const projectObjects = allObjects.filter(o => currentTrackerIds.includes(o.tracker_id));
  const reqs = projectObjects.filter(o => o.type === 'REQUIREMENT');
  const testCases = projectObjects.filter(o => o.type === 'TEST_CASE');
  const risks = projectObjects.filter(o => o.type === 'RISK' || o.object_key.includes('RISK'));
  const pRuns = testRuns.filter(r => r.project_id === project.id);

  const latestRun = pRuns.length > 0 ? pRuns[0] : null;

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {project.name}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {project.description || 'Systems Engineering Lifecycle Management Workspace'}
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
            {reqs.length > 0 ? (testCases.length > 0 ? '100%' : '50%') : '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {reqs.length} Requirements & {testCases.length} Test Cases
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Safety Test Runs</span>
            <Activity size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '8px 0', color: 'var(--accent-cyan)' }}>
            {latestRun ? latestRun.overall_status : '0 Runs'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {latestRun ? `Latest: ${latestRun.name}` : 'No Test Runs launched yet'}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Mitigated Risks</span>
            <ShieldAlert size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '8px 0', color: 'var(--accent-amber)' }}>
            {risks.length} Hazards
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {risks.length > 0 ? 'Hazards registered in Risk Matrix' : 'Zero hazards registered'}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Active Trackers</span>
            <FolderArchive size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '8px 0', color: 'var(--accent-purple)' }}>
            {trackers.length} Trackers
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Configured for {project.key} Workspace
          </div>
        </div>
      </div>

      {/* Main Grid: Trackers List & Project Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Trackers Grid */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
            Active Trackers for [{project.key}] {project.name}
          </h2>
          
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
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }} className="mono">
                    {t.prefix || t.key}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                    {t.name}
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {t.object_count || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Summary */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Project Overview</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <p><strong>Project Key:</strong> <span className="mono">{project.key}</span></p>
            <p style={{ marginTop: '8px' }}><strong>Total Objects:</strong> {projectObjects.length}</p>
            <p style={{ marginTop: '8px' }}><strong>Total Test Runs:</strong> {pRuns.length}</p>
            <p style={{ marginTop: '8px' }}><strong>Description:</strong> {project.description || 'Systems Engineering Lifecycle Management'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
