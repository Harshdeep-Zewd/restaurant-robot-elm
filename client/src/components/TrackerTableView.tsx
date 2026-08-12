import React, { useEffect, useState } from 'react';
import { Plus, Filter, Folder, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { Tracker, Folder as FolderType, EngineeringObject } from '../types/elm';
import { ObjectDetailPane } from './ObjectDetailPane';

interface TrackerTableViewProps {
  tracker: Tracker;
  onSelectObjectForImpact?: (objId: number) => void;
}

export const TrackerTableView: React.FC<TrackerTableViewProps> = ({ tracker, onSelectObjectForImpact }) => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [objects, setObjects] = useState<EngineeringObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');

  useEffect(() => {
    api.getFolders(tracker.id).then(setFolders).catch(console.error);
    setSelectedFolderId(null);
    loadObjects(null, search, statusFilter);
  }, [tracker]);

  const loadObjects = (folderId: number | null, searchQuery: string, status: string) => {
    api.getObjects(tracker.id, {
      folderId: folderId || undefined,
      search: searchQuery || undefined,
      status: status || undefined
    }).then(setObjects).catch(console.error);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await api.createObject({
      tracker_id: tracker.id,
      folder_id: selectedFolderId,
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      owner_id: 1,
      metadata: { rationale: 'User created requirement', source: 'Manual entry' }
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    loadObjects(selectedFolderId, search, statusFilter);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-approved">{status}</span>;
      case 'VERIFIED': return <span className="badge badge-verified">{status}</span>;
      case 'REVIEW': return <span className="badge badge-review">{status}</span>;
      default: return <span className="badge badge-draft">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <span className="badge badge-critical">{priority}</span>;
      case 'HIGH': return <span className="badge badge-high">{priority}</span>;
      case 'MEDIUM': return <span className="badge badge-medium">{priority}</span>;
      default: return <span className="badge badge-low">{priority}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Left Folder Tree Sidebar */}
      <div style={{
        width: '220px',
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-sidebar)',
        padding: '16px 12px',
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Folders / Categories
        </div>

        <button
          onClick={() => { setSelectedFolderId(null); loadObjects(null, search, statusFilter); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '6px',
            backgroundColor: selectedFolderId === null ? 'var(--bg-hover)' : 'transparent',
            color: selectedFolderId === null ? 'var(--accent-cyan)' : 'var(--text-main)',
            width: '100%',
            textAlign: 'left',
            fontSize: '0.85rem',
            marginBottom: '4px'
          }}
        >
          <Folder size={16} />
          <span>All Items</span>
        </button>

        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => { setSelectedFolderId(f.id); loadObjects(f.id, search, statusFilter); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              backgroundColor: selectedFolderId === f.id ? 'var(--bg-hover)' : 'transparent',
              color: selectedFolderId === f.id ? 'var(--accent-cyan)' : 'var(--text-main)',
              width: '100%',
              textAlign: 'left',
              fontSize: '0.85rem',
              marginBottom: '2px'
            }}
          >
            <ChevronRight size={14} />
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      {/* Main Table Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Table Filter & Action Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{tracker.name}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Showing {objects.length} engineering objects in {tracker.prefix}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); loadObjects(selectedFolderId, search, e.target.value); }}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="REVIEW">REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="VERIFIED">VERIFIED</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <Plus size={16} />
              <span>New {tracker.name.slice(0, -1)}</span>
            </button>
          </div>
        </div>

        {/* Structured Engineering Data Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>KEY</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TITLE & SUMMARY</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>PRIORITY</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>VER</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>OWNER</th>
              </tr>
            </thead>
            <tbody>
              {objects.map((obj) => (
                <tr
                  key={obj.id}
                  onClick={() => setSelectedObjectId(obj.id)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: selectedObjectId === obj.id ? 'var(--bg-hover)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent-cyan)' }} className="mono">
                    {obj.object_key}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{obj.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '450px' }}>
                      {obj.description}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(obj.status)}</td>
                  <td style={{ padding: '12px 16px' }}>{getPriorityBadge(obj.priority)}</td>
                  <td style={{ padding: '12px 16px' }} className="mono">v{obj.version}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{obj.owner_name || 'Alex Chen'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Split-Pane Inspector */}
      {selectedObjectId && (
        <ObjectDetailPane
          objectId={selectedObjectId}
          onClose={() => setSelectedObjectId(null)}
          onUpdate={() => loadObjects(selectedFolderId, search, statusFilter)}
          onSelectForImpact={onSelectObjectForImpact}
        />
      )}

      {/* Modal for Object Creation */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            width: '500px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Create New {tracker.name.slice(0, -1)}</h3>
            
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. LiDAR Occlusion Field of View Limit"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Description & Rationale</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="Detailed engineering specification..."
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Priority</label>
                <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} style={{ width: '100%' }}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600 }}
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
