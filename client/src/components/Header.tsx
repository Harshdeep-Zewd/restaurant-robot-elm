import React, { useState } from 'react';
import { Bot, Search, Plus, FolderPlus, ChevronDown, Check } from 'lucide-react';
import { Project } from '../types/elm';

interface HeaderProps {
  project: Project | null;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onCreateProject: (data: { key: string; name: string; description?: string }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  projects,
  onSelectProject,
  onCreateProject,
  searchQuery,
  setSearchQuery
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !name.trim()) return;

    onCreateProject({
      key: key.trim().toUpperCase(),
      name: name.trim(),
      description: desc.trim()
    });

    setShowModal(false);
    setKey('');
    setName('');
    setDesc('');
  };

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

        {/* Project Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '6px',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <span>{project ? project.name : 'Select Project'}</span>
            {project && <span className="badge badge-verified mono" style={{ fontSize: '0.7rem' }}>{project.key}</span>}
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '42px',
              left: 0,
              width: '320px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 200,
              padding: '8px'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 8px' }}>
                Engineering Workspaces ({projects.length})
              </div>

              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    setShowDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: project?.id === p.id ? 'var(--bg-hover)' : 'transparent',
                    color: project?.id === p.id ? 'var(--accent-cyan)' : 'var(--text-main)',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    marginBottom: '2px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.description || 'No description'}</div>
                  </div>
                  {project?.id === p.id && <Check size={16} color="var(--accent-cyan)" />}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setShowModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(2, 132, 199, 0.15)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  <Plus size={16} />
                  <span>+ Create New Project</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search engineering objects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '34px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Primary "+ New Project" Button */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <FolderPlus size={16} />
          <span>New Project</span>
        </button>

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
        </div>
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            width: '480px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Create New Engineering Project</h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. RoboClean Autonomous Floor Scrubber V2"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Project Key (Prefix) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  style={{ width: '100%' }}
                  placeholder="e.g. CLEAN"
                  className="mono"
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Prefix used for items: CLEAN-SYS-001, CLEAN-RISK-001.
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="Engineering scope and details..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 600
                  }}
                >
                  Create & Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
