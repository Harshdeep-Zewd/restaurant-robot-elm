import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Boxes,
  ShieldAlert,
  FlaskConical,
  GitCompare,
  GitBranch,
  FolderArchive,
  History,
  HardDrive
} from 'lucide-react';
import { Tracker } from '../types/elm';

export type ViewMode =
  | 'DASHBOARD'
  | 'TRACKER'
  | 'TRACEABILITY'
  | 'IMPACT'
  | 'TEST_EXECUTION'
  | 'RISK_MATRIX'
  | 'CHANGES'
  | 'BASELINES'
  | 'ARTIFACTS'
  | 'AUDIT';

interface SidebarProps {
  trackers: Tracker[];
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  selectedTracker: Tracker | null;
  setSelectedTracker: (tracker: Tracker | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  trackers,
  activeView,
  setActiveView,
  selectedTracker,
  setSelectedTracker
}) => {
  const getTrackerIcon = (type: string) => {
    switch (type) {
      case 'REQUIREMENT': return <FileText size={16} />;
      case 'ARCHITECTURE': return <Boxes size={16} />;
      case 'RISK': return <ShieldAlert size={16} />;
      case 'TEST_CASE':
      case 'TEST_SET': return <FlaskConical size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 60px)',
      overflowY: 'auto',
      padding: '16px 12px'
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px' }}>
        MAIN NAVIGATION
      </div>

      <button
        onClick={() => { setActiveView('DASHBOARD'); setSelectedTracker(null); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '6px',
          backgroundColor: activeView === 'DASHBOARD' ? 'var(--bg-hover)' : 'transparent',
          color: activeView === 'DASHBOARD' ? 'var(--accent-cyan)' : 'var(--text-main)',
          fontSize: '0.9rem',
          fontWeight: 500,
          marginBottom: '4px',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <LayoutDashboard size={18} />
        <span>Project Dashboard</span>
      </button>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '16px', marginBottom: '8px', paddingLeft: '8px' }}>
        ENGINEERING TRACKERS
      </div>

      {trackers.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            setSelectedTracker(t);
            setActiveView('TRACKER');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: activeView === 'TRACKER' && selectedTracker?.id === t.id ? 'var(--bg-hover)' : 'transparent',
            color: activeView === 'TRACKER' && selectedTracker?.id === t.id ? 'var(--accent-cyan)' : 'var(--text-main)',
            fontSize: '0.85rem',
            marginBottom: '2px',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getTrackerIcon(t.type)}
            <span>{t.name}</span>
          </div>
          <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-dark)', padding: '2px 6px', borderRadius: '10px', color: 'var(--text-muted)' }}>
            {t.object_count || 0}
          </span>
        </button>
      ))}

      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '16px', marginBottom: '8px', paddingLeft: '8px' }}>
        LIFECYCLE & ANALYTICS
      </div>

      <button
        onClick={() => setActiveView('TRACEABILITY')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: activeView === 'TRACEABILITY' ? 'var(--bg-hover)' : 'transparent',
          color: activeView === 'TRACEABILITY' ? 'var(--accent-cyan)' : 'var(--text-main)',
          fontSize: '0.85rem',
          marginBottom: '2px',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <GitCompare size={18} />
        <span>Traceability Matrix</span>
      </button>

      <button
        onClick={() => setActiveView('TEST_EXECUTION')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: activeView === 'TEST_EXECUTION' ? 'var(--bg-hover)' : 'transparent',
          color: activeView === 'TEST_EXECUTION' ? 'var(--accent-cyan)' : 'var(--text-main)',
          fontSize: '0.85rem',
          marginBottom: '2px',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <FlaskConical size={18} />
        <span>Test Runner Suite</span>
      </button>

      <button
        onClick={() => setActiveView('RISK_MATRIX')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: activeView === 'RISK_MATRIX' ? 'var(--bg-hover)' : 'transparent',
          color: activeView === 'RISK_MATRIX' ? 'var(--accent-cyan)' : 'var(--text-main)',
          fontSize: '0.85rem',
          marginBottom: '2px',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <ShieldAlert size={18} />
        <span>Risk & Hazard Matrix</span>
      </button>

      <button
        onClick={() => setActiveView('CHANGES')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: activeView === 'CHANGES' ? 'var(--bg-hover)' : 'transparent',
          color: activeView === 'CHANGES' ? 'var(--accent-cyan)' : 'var(--text-main)',
          fontSize: '0.85rem',
          marginBottom: '2px',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <GitBranch size={18} />
        <span>Change Requests</span>
      </button>

      <button
        onClick={() => setActiveView('BASELINES')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: activeView === 'BASELINES' ? 'var(--bg-hover)' : 'transparent',
          color: activeView === 'BASELINES' ? 'var(--accent-cyan)' : 'var(--text-main)',
          fontSize: '0.85rem',
          marginBottom: '2px',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <FolderArchive size={18} />
        <span>Baselines</span>
      </button>

      <button
        onClick={() => setActiveView('ARTIFACTS')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: activeView === 'ARTIFACTS' ? 'var(--bg-hover)' : 'transparent',
          color: activeView === 'ARTIFACTS' ? 'var(--accent-cyan)' : 'var(--text-main)',
          fontSize: '0.85rem',
          marginBottom: '2px',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <HardDrive size={18} />
        <span>Files & Artifacts</span>
      </button>

      <button
        onClick={() => setActiveView('AUDIT')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: activeView === 'AUDIT' ? 'var(--bg-hover)' : 'transparent',
          color: activeView === 'AUDIT' ? 'var(--accent-cyan)' : 'var(--text-main)',
          fontSize: '0.85rem',
          marginBottom: '2px',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <History size={18} />
        <span>Audit Trail</span>
      </button>
    </aside>
  );
};
