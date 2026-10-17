import React, { useState } from 'react';
import {
  FileText, Paperclip, Image as ImageIcon, Table, ExternalLink,
  Plus, Trash2, X, Download, Eye, ArrowUp, ArrowDown
} from 'lucide-react';
import { CustomColumn } from '../types/elm';

interface CustomColumnCardProps {
  column: CustomColumn;
  readOnly?: boolean;
  onUpdateContent?: (content: any) => void;
  onDeleteColumn?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const CustomColumnCard: React.FC<CustomColumnCardProps> = ({
  column,
  readOnly = true,
  onUpdateContent,
  onDeleteColumn,
  onMoveUp,
  onMoveDown
}) => {
  // Local state for inline file addition
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('1.5 MB');

  // Local state for inline image addition
  const [newImgTitle, setNewImgTitle] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('');

  // Local state for inline table row addition
  const [newParam, setNewParam] = useState('');
  const [newVal, setNewVal] = useState('');
  const [newTolerance, setNewTolerance] = useState('');

  // Icon & theme colors by type
  const getTypeMeta = () => {
    switch (column.type) {
      case 'FILES':
        return {
          icon: <Paperclip size={15} color="var(--accent-purple)" />,
          badgeColor: 'rgba(168, 85, 247, 0.2)',
          textColor: 'var(--accent-purple)',
          borderColor: 'rgba(168, 85, 247, 0.35)',
          label: 'FILES & REPORTS'
        };
      case 'IMAGES':
        return {
          icon: <ImageIcon size={15} color="var(--accent-emerald)" />,
          badgeColor: 'rgba(16, 185, 129, 0.2)',
          textColor: 'var(--accent-emerald)',
          borderColor: 'rgba(16, 185, 129, 0.35)',
          label: 'IMAGES & SCHEMATICS'
        };
      case 'TABLE':
        return {
          icon: <Table size={15} color="var(--accent-amber)" />,
          badgeColor: 'rgba(245, 158, 11, 0.2)',
          textColor: 'var(--accent-amber)',
          borderColor: 'rgba(245, 158, 11, 0.35)',
          label: 'SPECIFICATION TABLE'
        };
      case 'LINK':
        return {
          icon: <ExternalLink size={15} color="var(--accent-cyan)" />,
          badgeColor: 'rgba(56, 189, 248, 0.2)',
          textColor: 'var(--accent-cyan)',
          borderColor: 'rgba(56, 189, 248, 0.35)',
          label: 'EXTERNAL LINK'
        };
      case 'TEXT':
      default:
        return {
          icon: <FileText size={15} color="var(--accent-cyan)" />,
          badgeColor: 'rgba(56, 189, 248, 0.2)',
          textColor: 'var(--accent-cyan)',
          borderColor: 'rgba(56, 189, 248, 0.35)',
          label: 'CUSTOM SECTION'
        };
    }
  };

  const meta = getTypeMeta();

  // Content helpers
  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !onUpdateContent) return;
    const currentFiles = Array.isArray(column.content) ? column.content : [];
    const updated = [
      ...currentFiles,
      {
        id: Date.now(),
        name: newFileName.trim(),
        size: newFileSize.trim() || '1.0 MB',
        date: new Date().toISOString().split('T')[0]
      }
    ];
    onUpdateContent(updated);
    setNewFileName('');
  };

  const handleDeleteFile = (fileIdx: number) => {
    if (!onUpdateContent || !Array.isArray(column.content)) return;
    const updated = column.content.filter((_, idx) => idx !== fileIdx);
    onUpdateContent(updated);
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgTitle.trim() || !onUpdateContent) return;
    const currentImages = Array.isArray(column.content) ? column.content : [];
    const updated = [
      ...currentImages,
      {
        id: Date.now(),
        title: newImgTitle.trim(),
        url: newImgUrl.trim() || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80'
      }
    ];
    onUpdateContent(updated);
    setNewImgTitle('');
    setNewImgUrl('');
  };

  const handleDeleteImage = (imgIdx: number) => {
    if (!onUpdateContent || !Array.isArray(column.content)) return;
    const updated = column.content.filter((_, idx) => idx !== imgIdx);
    onUpdateContent(updated);
  };

  const handleAddTableRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParam.trim() || !onUpdateContent) return;
    const currentRows = Array.isArray(column.content) ? column.content : [];
    const updated = [
      ...currentRows,
      {
        id: Date.now(),
        parameter: newParam.trim(),
        value: newVal.trim() || 'N/A',
        tolerance: newTolerance.trim() || '-'
      }
    ];
    onUpdateContent(updated);
    setNewParam('');
    setNewVal('');
    setNewTolerance('');
  };

  const handleDeleteTableRow = (rowIdx: number) => {
    if (!onUpdateContent || !Array.isArray(column.content)) return;
    const updated = column.content.filter((_, idx) => idx !== rowIdx);
    onUpdateContent(updated);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: `1px solid ${meta.borderColor}`,
      borderRadius: '10px',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            backgroundColor: meta.badgeColor,
            color: meta.textColor,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {meta.icon}
            <span>{meta.label}</span>
          </span>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {column.name}
          </h4>

          {/* Placement Indicator Badge */}
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-dark)',
            padding: '2px 7px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)'
          }}>
            📍 {column.placement === 'ABOVE' ? 'Above' : 'Below'} {
              column.position_reference === 'TITLE' ? 'Title' :
              column.position_reference === 'PRE_ACTION' ? 'Pre-Action' :
              column.position_reference === 'DESCRIPTION' ? 'Description' :
              column.position_reference === 'TEST_STEPS' ? 'Test Steps' :
              'Post-Action'
            }
          </span>
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                title="Move section up"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '3px 6px',
                  borderRadius: '4px'
                }}
              >
                <ArrowUp size={13} />
              </button>
            )}

            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                title="Move section down"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '3px 6px',
                  borderRadius: '4px'
                }}
              >
                <ArrowDown size={13} />
              </button>
            )}

            {onDeleteColumn && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove custom column "${column.name}"?`)) {
                    onDeleteColumn();
                  }
                }}
                title="Delete this section"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-rose)',
                  cursor: 'pointer',
                  padding: '4px',
                  marginLeft: '4px'
                }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body Content according to type */}
      {/* 1. TEXT / NOTES */}
      {column.type === 'TEXT' && (
        <div>
          {readOnly ? (
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              backgroundColor: 'var(--bg-dark)',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)'
            }}>
              {column.content ? column.content : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes recorded for this section.</span>}
            </div>
          ) : (
            <textarea
              rows={3}
              value={typeof column.content === 'string' ? column.content : ''}
              onChange={(e) => onUpdateContent && onUpdateContent(e.target.value)}
              placeholder={`Enter technical specifications or notes for ${column.name}...`}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '0.85rem',
                backgroundColor: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-main)',
                resize: 'vertical'
              }}
            />
          )}
        </div>
      )}

      {/* 2. FILES & REPORTS */}
      {column.type === 'FILES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.isArray(column.content) && column.content.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {column.content.map((file: any, idx: number) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={14} color="var(--accent-purple)" />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{file.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({file.size})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <Download size={13} />
                      <span>Download</span>
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(idx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
              No files or reports attached to this section yet.
            </div>
          )}

          {!readOnly && (
            <form onSubmit={handleAddFile} style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                placeholder="Report or file name (e.g. Nav_Test_Report.pdf)..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              />
              <input
                type="text"
                placeholder="Size (e.g. 2.4 MB)"
                value={newFileSize}
                onChange={(e) => setNewFileSize(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--accent-purple)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Add File
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. IMAGES & CAD SCHEMATICS */}
      {column.type === 'IMAGES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array.isArray(column.content) && column.content.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {column.content.map((img: any, idx: number) => (
                <div key={idx} style={{
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    height: '110px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    overflow: 'hidden'
                  }}>
                    {img.url && img.url.startsWith('http') ? (
                      <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)' }}>
                        <ImageIcon size={28} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>CAD Schematics</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {img.title}
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
              No images or CAD schematics attached yet.
            </div>
          )}

          {!readOnly && (
            <form onSubmit={handleAddImage} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                placeholder="Image / Schematic Title..."
                value={newImgTitle}
                onChange={(e) => setNewImgTitle(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              />
              <input
                type="text"
                placeholder="Image URL (optional)..."
                value={newImgUrl}
                onChange={(e) => setNewImgUrl(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--accent-emerald)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Add Image
              </button>
            </form>
          )}
        </div>
      )}

      {/* 4. TABLE / ATTRIBUTES */}
      {column.type === 'TABLE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array.isArray(column.content) && column.content.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 700 }}>Parameter</th>
                    <th style={{ padding: '8px 12px', color: 'var(--accent-amber)', fontWeight: 700 }}>Value / Limit</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 700 }}>Tolerance / Criteria</th>
                    {!readOnly && <th style={{ width: '30px' }} />}
                  </tr>
                </thead>
                <tbody>
                  {column.content.map((row: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{row.parameter}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--accent-amber)', fontWeight: 700 }}>{row.value}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{row.tolerance}</td>
                      {!readOnly && (
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteTableRow(idx)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                          >
                            <X size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
              No parameters defined in this specification table yet.
            </div>
          )}

          {!readOnly && (
            <form onSubmit={handleAddTableRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                placeholder="Parameter (e.g. Operating Voltage)..."
                value={newParam}
                onChange={(e) => setNewParam(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
              <input
                type="text"
                placeholder="Value (e.g. 48V DC)..."
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
              <input
                type="text"
                placeholder="Tolerance (e.g. +/- 5%)..."
                value={newTolerance}
                onChange={(e) => setNewTolerance(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 8px' }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--accent-amber)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Add Row
              </button>
            </form>
          )}
        </div>
      )}

      {/* 5. EXTERNAL LINK */}
      {column.type === 'LINK' && (
        <div>
          {readOnly ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a
                href={typeof column.content === 'object' ? column.content?.url : column.content}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--accent-cyan)',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={14} />
                <span>
                  {typeof column.content === 'object' && column.content?.title
                    ? column.content.title
                    : 'Open External Document / CAD Assembly'}
                </span>
              </a>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {typeof column.content === 'object' ? column.content?.url : column.content}
              </span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Link Title (e.g. Onshape 3D Assembly CAD)..."
                value={typeof column.content === 'object' ? column.content?.title || '' : ''}
                onChange={(e) => onUpdateContent && onUpdateContent({
                  ...(typeof column.content === 'object' ? column.content : {}),
                  title: e.target.value
                })}
                style={{ fontSize: '0.82rem', padding: '8px 10px' }}
              />
              <input
                type="text"
                placeholder="URL (e.g. https://cad.onshape.com/...)..."
                value={typeof column.content === 'object' ? column.content?.url || '' : (typeof column.content === 'string' ? column.content : '')}
                onChange={(e) => onUpdateContent && onUpdateContent({
                  ...(typeof column.content === 'object' ? column.content : {}),
                  url: e.target.value
                })}
                style={{ fontSize: '0.82rem', padding: '8px 10px' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
