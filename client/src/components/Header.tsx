import React from 'react';
import { Bot, Search, GitBranch, Github, Shield, Bell } from 'lucide-react';
import { Project } from '../types/elm';

interface HeaderProps {
  project: Project | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ project, searchQuery, setSearchQuery }) => {
  return (
    <header style={{
      height: '60px',
      backgroundColor: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          padding: '6px 12px',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 700
        }}>
          <Bot size={22} />
          <span>RoboServ ELM</span>
        </div>

        {project && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span>/</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{project.name}</span>
            <span className="badge badge-verified mono" style={{ fontSize: '0.7rem' }}>{project.key}-X1</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search engineering objects (SYS-REQ, RISK)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '34px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '6px',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: 'var(--accent-cyan)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          <GitBranch size={14} />
          <span>v2.4.1-rc3</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderLeft: '1px solid var(--border-color)',
          paddingLeft: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#000',
            fontSize: '0.85rem'
          }}>
            AC
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Alex Chen</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead Systems Engineer</div>
          </div>
        </div>
      </div>
    </header>
  );
};
