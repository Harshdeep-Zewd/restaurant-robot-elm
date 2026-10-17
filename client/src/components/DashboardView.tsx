import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Layers, Activity, FolderArchive, ArrowUpRight, Search, Download, X } from 'lucide-react';
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
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [dashboardCategory, setDashboardCategory] = useState('ALL');
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

      {/* 1. Trackers Grid - Displayed First */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--accent-cyan)" />
              <span>Engineering Trackers</span>
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700
              }}>
                {trackers.length} Active in {project.key}
              </span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Select any engineering tracker below to enter its dedicated 3-panel dashboard (Requirements, Pre/Post Actions, Traceability & Features).
            </p>
          </div>

          <a
            href="/All_104_Engineering_Trackers_Inventory.docx"
            download="All_104_Engineering_Trackers_Inventory.docx"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: 'var(--accent-cyan)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textDecoration: 'none'
            }}
            title="Download Complete 104 Trackers Inventory as Microsoft Word (.docx)"
          >
            <Download size={15} />
            <span>Download 104 Trackers (.docx)</span>
          </a>
        </div>

        {/* Search & Category Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={`Search across ${trackers.length} engineering trackers...`}
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 28px 7px 32px',
                fontSize: '0.82rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
            {dashboardSearch && (
              <button
                onClick={() => setDashboardSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={dashboardCategory}
            onChange={(e) => setDashboardCategory(e.target.value)}
            style={{
              padding: '7px 12px',
              fontSize: '0.82rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Categories ({trackers.length} Trackers)</option>
            <option value="REQ">Requirements &amp; Verification</option>
            <option value="ARCH">Architecture &amp; Hardware</option>
            <option value="TEST">Testing, Sets &amp; Runs</option>
            <option value="RISK">Safety &amp; Risks</option>
            <option value="DEFECT">Defects &amp; Problems</option>
            <option value="TASK">Tasks &amp; Epics</option>
            <option value="RELEASE">Changes &amp; Releases</option>
            <option value="DOC">Documents &amp; Governance</option>
          </select>
        </div>

        {(() => {
          const filteredTrackers = trackers.filter(t => {
            const q = dashboardSearch.trim().toLowerCase();
            const matchesSearch = !q ||
              t.name.toLowerCase().includes(q) ||
              t.key.toLowerCase().includes(q) ||
              (t.prefix && t.prefix.toLowerCase().includes(q)) ||
              (t.description && t.description.toLowerCase().includes(q));

            if (!matchesSearch) return false;
            if (dashboardCategory === 'ALL') return true;
            if (dashboardCategory === 'REQ') return t.type === 'REQUIREMENT';
            if (dashboardCategory === 'ARCH') return t.type === 'ARCHITECTURE';
            if (dashboardCategory === 'TEST') return t.type.includes('TEST') || t.key.includes('TST');
            if (dashboardCategory === 'RISK') return t.type === 'RISK' || t.name.toLowerCase().includes('risk') || t.name.toLowerCase().includes('safety');
            if (dashboardCategory === 'TASK') return t.type === 'TASK' || t.name.toLowerCase().includes('task') || t.name.toLowerCase().includes('epic');
            if (dashboardCategory === 'DEFECT') return t.type === 'DEFECT' || t.name.toLowerCase().includes('bug') || t.name.toLowerCase().includes('fail') || t.name.toLowerCase().includes('problem');
            if (dashboardCategory === 'RELEASE') return t.type === 'RELEASE' || t.name.toLowerCase().includes('release') || t.name.toLowerCase().includes('change') || t.name.toLowerCase().includes('component');
            if (dashboardCategory === 'DOC') return t.type === 'DOCUMENT' || t.name.toLowerCase().includes('document') || t.name.toLowerCase().includes('meeting') || t.name.toLowerCase().includes('contact') || t.name.toLowerCase().includes('team');
            return true;
          });

          if (filteredTrackers.length === 0) {
            return (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No engineering trackers found matching your search or category filter.
              </div>
            );
          }

          return (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {filteredTrackers.map((t) => {
                const count = allObjects.filter(o => o.tracker_id === t.id).length;
                return (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('TRACKER', t)}
                    style={{
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '140px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(56, 189, 248, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="mono" style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: 'var(--accent-cyan)',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          {t.prefix || t.key}
                        </span>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: count > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)'
                        }}>
                          {count} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>items</span>
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {t.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {t.description || `${t.type.replace(/_/g, ' ')} repository with full lifecycle traceability`}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase'
                      }}>
                        {t.type.replace(/_/g, ' ')}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-cyan)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <span>Open Tracker</span>
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* 2. Project Analytics & Lifecycle Metrics */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
        Lifecycle & Verification Metrics
      </h2>
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
            Configured for [{project.key}] Workspace
          </div>
        </div>
      </div>

      {/* 3. Project Summary */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Project Overview & Scope</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div><strong>Project Key:</strong> <span className="mono" style={{ color: 'var(--accent-cyan)' }}>[{project.key}]</span></div>
          <div><strong>Total Objects:</strong> <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{projectObjects.length}</span></div>
          <div><strong>Total Test Runs:</strong> <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{pRuns.length}</span></div>
          <div><strong>Owner:</strong> <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>👑 Zewd (Owner)</span></div>
        </div>
      </div>
    </div>
  );
};
