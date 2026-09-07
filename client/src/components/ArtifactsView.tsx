import React, { useState, useRef } from 'react';
import { FileText, Download, Plus, Filter, HardDrive, Trash2, UploadCloud, FolderPlus } from 'lucide-react';
import { Artifact } from '../types/elm';

interface ArtifactsViewProps {
  artifacts?: Artifact[];
  onAddArtifact?: (data: { object_id?: number; filename: string; category: any; file_size?: number; stored_path?: string }) => void;
  onDeleteArtifact?: (id: number) => void;
}

const DEFAULT_ARTIFACTS: Artifact[] = [
  {
    id: 1, object_id: 5, object_key: 'ARCH-001', object_title: 'RoboServ-X1 Main Cyber-Physical System',
    filename: 'RoboServ_X1_CyberPhysical_Architecture_v2.pdf', stored_path: '/artifacts/RoboServ_X1_CyberPhysical_Architecture_v2.pdf',
    file_size: 4200100, mime_type: 'application/pdf', category: 'PDF', uploader_name: 'Zewd', created_at: new Date().toISOString()
  },
  {
    id: 2, object_id: 5, object_key: 'ARCH-001', object_title: 'RoboServ-X1 Main Cyber-Physical System',
    filename: 'Mobility_Base_CAD_Assembly_v1.step', stored_path: '/artifacts/Mobility_Base_CAD_Assembly_v1.step',
    file_size: 14500100, mime_type: 'application/octet-stream', category: 'CAD', uploader_name: 'Zewd', created_at: new Date().toISOString()
  },
  {
    id: 3, object_id: 5, object_key: 'ARCH-001', object_title: 'RoboServ-X1 Main Cyber-Physical System',
    filename: 'Power_Budget_and_Thermal_Calculations.xlsx', stored_path: '/artifacts/Power_Budget_and_Thermal_Calculations.xlsx',
    file_size: 850200, mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'CSV', uploader_name: 'Zewd', created_at: new Date().toISOString()
  },
  {
    id: 4, object_id: 5, object_key: 'ARCH-001', object_title: 'RoboServ-X1 Main Cyber-Physical System',
    filename: 'ISO_13482_Safety_Architecture_Spec.docx', stored_path: '/artifacts/ISO_13482_Safety_Architecture_Spec.docx',
    file_size: 1250100, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'OTHER', uploader_name: 'Zewd', created_at: new Date().toISOString()
  }
];

export const ArtifactsView: React.FC<ArtifactsViewProps> = ({
  artifacts = DEFAULT_ARTIFACTS,
  onAddArtifact,
  onDeleteArtifact
}) => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState<'PDF' | 'CAD' | 'CSV' | 'OTHER'>('PDF');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storedPath, setStoredPath] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fileList = artifacts.length > 0 ? artifacts : DEFAULT_ARTIFACTS;

  let filtered = fileList;
  if (categoryFilter) {
    filtered = filtered.filter(a => a.category === categoryFilter);
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFilename(file.name);
    setFileSize(file.size);

    const nameLower = file.name.toLowerCase();
    if (nameLower.endsWith('.pdf')) setCategory('PDF');
    else if (nameLower.endsWith('.step') || nameLower.endsWith('.stl') || nameLower.endsWith('.dwg') || nameLower.endsWith('.dxf') || nameLower.endsWith('.cad')) setCategory('CAD');
    else if (nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls') || nameLower.endsWith('.csv')) setCategory('CSV');
    else setCategory('OTHER');

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setStoredPath(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim() || !onAddArtifact) return;

    onAddArtifact({
      object_id: 5, // Default to ARCH-001 or standalone document
      filename: filename.trim(),
      category,
      file_size: fileSize || undefined,
      stored_path: storedPath || undefined
    });

    setFilename('');
    setSelectedFile(null);
    setStoredPath('');
    setFileSize(0);
    setShowModal(false);
  };

  const handleDownload = (art: Artifact) => {
    if (art.stored_path && (art.stored_path.startsWith('data:') || art.stored_path.startsWith('blob:'))) {
      const link = document.createElement('a');
      link.href = art.stored_path;
      link.download = art.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `=======================================================
ROBOSERV ELM SYSTEM ARTIFACT DOCUMENT
Filename: ${art.filename}
Record Key: ${art.object_key || 'DOC'}
Record Title: ${art.object_title || 'Global Artifact'}
Category: ${art.category}
Uploaded By: ${art.uploader_name || 'Zewd'}
Created At: ${art.created_at}
=======================================================

Systems Engineering & ISO 13482 Safety Compliance Spec for Autonomous Restaurant Delivery Robot (RoboServ-X1).
Author: Zewd (Lead Systems Engineer)
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = art.filename.includes('.') ? art.filename : `${art.filename}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    return `${(bytes / 1000).toFixed(0)} KB`;
  };

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Engineering Files & Artifacts Repository</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Central repository for Architecture PDFs, CAD STEP assemblies, Excel spreadsheets, Word specs, and ROS bags.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Plus size={16} />
          <span>+ Upload / Attach Document</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setCategoryFilter('')}
          style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
            backgroundColor: categoryFilter === '' ? 'var(--primary)' : 'var(--bg-card)',
            color: '#fff', border: '1px solid var(--border-color)'
          }}
        >
          All Files ({fileList.length})
        </button>
        <button
          onClick={() => setCategoryFilter('PDF')}
          style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
            backgroundColor: categoryFilter === 'PDF' ? 'var(--primary)' : 'var(--bg-card)',
            color: '#fff', border: '1px solid var(--border-color)'
          }}
        >
          PDF Diagrams (.pdf)
        </button>
        <button
          onClick={() => setCategoryFilter('CAD')}
          style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
            backgroundColor: categoryFilter === 'CAD' ? 'var(--primary)' : 'var(--bg-card)',
            color: '#fff', border: '1px solid var(--border-color)'
          }}
        >
          CAD Assemblies (.step / .stl)
        </button>
        <button
          onClick={() => setCategoryFilter('CSV')}
          style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
            backgroundColor: categoryFilter === 'CSV' ? 'var(--primary)' : 'var(--bg-card)',
            color: '#fff', border: '1px solid var(--border-color)'
          }}
        >
          Excel Spreadsheets (.xlsx / .csv)
        </button>
        <button
          onClick={() => setCategoryFilter('OTHER')}
          style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
            backgroundColor: categoryFilter === 'OTHER' ? 'var(--primary)' : 'var(--bg-card)',
            color: '#fff', border: '1px solid var(--border-color)'
          }}
        >
          Word Documents (.docx)
        </button>
      </div>

      {/* Files Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>DOCUMENT / FILENAME</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>ASSOCIATED RECORD</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>CATEGORY</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>FILE SIZE</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>UPLOADED BY</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(art => (
              <tr key={art.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="var(--accent-cyan)" />
                    <span>{art.filename}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{art.object_key}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{art.object_title}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 700 }}>
                    {art.category}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }} className="mono">{formatFileSize(art.file_size)}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{art.uploader_name || 'Zewd'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleDownload(art)}
                      style={{
                        color: 'var(--accent-cyan)',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>

                    {onDeleteArtifact && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete file "${art.filename}"?`)) {
                            onDeleteArtifact(art.id);
                          }
                        }}
                        title="Delete File"
                        style={{
                          color: 'var(--accent-rose)',
                          backgroundColor: 'rgba(244, 63, 94, 0.12)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
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
            width: '450px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Upload / Attach Engineering File
            </h3>

            <form onSubmit={handleCreate}>
              {/* Native File Dropzone & Browser Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  border: '2px dashed var(--accent-cyan)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: selectedFile ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleInputChange}
                />
                <UploadCloud size={34} color="var(--accent-cyan)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {selectedFile ? `Selected File: ${selectedFile.name}` : 'Click or Drag & Drop File from PC'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedFile ? `Size: ${formatFileSize(selectedFile.size)}` : 'Browse your computer for .pdf, .xlsx, .docx, .step CAD, images...'}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Document Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. RoboServ_X1_Base_Assembly.step"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="PDF">PDF Document (.pdf)</option>
                  <option value="CAD">CAD 3D Model (.step / .stl)</option>
                  <option value="CSV">Excel Spreadsheet (.xlsx / .csv)</option>
                  <option value="OTHER">Word Document (.docx)</option>
                </select>
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
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600 }}
                >
                  Upload File (Author: Zewd)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
