import React, { useEffect, useState } from 'react';
import { HardDrive, Upload, FileCode, FileSpreadsheet, Film, FileText, Image } from 'lucide-react';
import { api } from '../api/client';
import { Artifact } from '../types/elm';

export const ArtifactsView: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = () => {
    api.getArtifacts().then(setArtifacts).catch(console.error);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CAD': return <FileCode size={20} color="var(--accent-cyan)" />;
      case 'ROS_BAG': return <Film size={20} color="var(--accent-purple)" />;
      case 'CSV': return <FileSpreadsheet size={20} color="var(--accent-emerald)" />;
      default: return <FileText size={20} color="var(--text-muted)" />;
    }
  };

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Engineering Files & Artifacts Repository</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Separate file object storage for CAD models, ROS 2 bag logs, CSV telemetry, PDFs & Datasheets
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 16px' }}>TYPE</th>
              <th style={{ padding: '14px 16px' }}>FILENAME</th>
              <th style={{ padding: '14px 16px' }}>CATEGORY</th>
              <th style={{ padding: '14px 16px' }}>LINKED OBJECT</th>
              <th style={{ padding: '14px 16px' }}>SIZE</th>
              <th style={{ padding: '14px 16px' }}>UPLOADED BY</th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 16px' }}>{getCategoryIcon(a.category)}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{a.filename}</td>
                <td style={{ padding: '12px 16px' }}><span className="badge badge-verified">{a.category}</span></td>
                <td style={{ padding: '12px 16px' }} className="mono">{a.object_key || 'Global'}</td>
                <td style={{ padding: '12px 16px' }} className="mono">{(a.file_size / 1024).toFixed(1)} KB</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{a.uploader_name || 'Alex Chen'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
