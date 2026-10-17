import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Folder, FolderPlus, ChevronRight, ListOrdered, Paperclip,
  CheckSquare, Trash2, Search, Save, ArrowRight, Link as LinkIcon,
  ShieldAlert, Activity, FileText, Download, CheckCircle2, AlertTriangle,
  Layers, UploadCloud, ExternalLink, X, Clock, User
} from 'lucide-react';
import {
  Tracker, Folder as FolderType, EngineeringObject, RequirementType,
  SafetyLevel, TestSubProcess, Relationship, TestStep, Artifact
} from '../types/elm';

interface TrackerTableViewProps {
  tracker: Tracker;
  objects: EngineeringObject[];
  allObjects: EngineeringObject[];
  folders: FolderType[];
  relationships: Relationship[];
  testSteps?: TestStep[];
  artifacts?: Artifact[];
  onCreateFolder?: (tracker_id: number, name: string) => number | void;
  onCreateObject: (data: {
    tracker_id: number;
    folder_id?: number | null;
    title: string;
    description?: string;
    pre_action?: string;
    post_action?: string;
    requirement_type?: RequirementType;
    safety_level?: SafetyLevel;
    test_subprocess?: TestSubProcess;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    test_step_action?: string;
    test_step_expected?: string;
    included_test_case_ids?: number[];
    metadata?: any;
  }) => void;
  onUpdateObject: (id: number, updates: Partial<EngineeringObject>) => void;
  onDeleteObject?: (id: number) => void;
  onAddRelationship: (source_id: number, target_id: number, type: string) => void;
  onDeleteRelationship: (id: number) => void;
  onAddTestStep?: (test_case_id: number, action: string, expected_result: string) => void;
  onDeleteTestStep?: (id: number) => void;
  onAddArtifact?: (data: { object_id?: number; filename: string; category: any; file_size?: number; stored_path?: string }) => void;
  onDeleteArtifact?: (id: number) => void;
  onSelectObjectForImpact?: (objId: number) => void;
}

export const TrackerTableView: React.FC<TrackerTableViewProps> = ({
  tracker,
  objects,
  allObjects,
  folders,
  relationships,
  testSteps = [],
  artifacts = [],
  onCreateFolder,
  onCreateObject,
  onUpdateObject,
  onDeleteObject,
  onAddRelationship,
  onDeleteRelationship,
  onAddTestStep,
  onDeleteTestStep,
  onAddArtifact,
  onDeleteArtifact,
  onSelectObjectForImpact
}) => {
  // Navigation & Filter state
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Middle Panel Active Form State
  const [title, setTitle] = useState('');
  const [preAction, setPreAction] = useState('');
  const [desc, setDesc] = useState('');
  const [ownerName, setOwnerName] = useState('Zewd');
  const [postAction, setPostAction] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>('ASIL-D');
  const [reqType, setReqType] = useState<RequirementType>('Functional Requirement');
  const [testProcess, setTestProcess] = useState<TestSubProcess>('System Testing');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Test Steps state (inside Middle Panel)
  const [newStepAction, setNewStepAction] = useState('');
  const [newStepExpected, setNewStepExpected] = useState('');

  // Test Sets: Include Test Case state
  const [addTestCaseId, setAddTestCaseId] = useState<number | null>(null);

  // Create Object Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalPreAction, setModalPreAction] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalPostAction, setModalPostAction] = useState('');
  const [modalSafetyLevel, setModalSafetyLevel] = useState<SafetyLevel>('ASIL-D');
  const [modalPriority, setModalPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [modalFolderId, setModalFolderId] = useState<number | null>(null);

  // Create Folder Modal State
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Link Relationship Modal State (Right Panel)
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [targetObjId, setTargetObjId] = useState<number | null>(null);
  const [relType, setRelType] = useState<string>('VERIFIED_BY');

  // File Upload State (Right Panel)
  const [showFileModal, setShowFileModal] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<'PDF' | 'CAD' | 'CSV' | 'OTHER'>('PDF');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isTestCaseTracker = tracker.enable_test_steps ?? (tracker.type === 'TEST_CASE' || tracker.key === 'SYS-TST' || tracker.prefix.includes('TST-'));
  const isTestSetTracker = tracker.type === 'TEST_SET' || tracker.key === 'TST-SET' || tracker.prefix.includes('SET-');

  // Filter items in Left Panel
  let filteredObjects = objects;
  if (selectedFolderId !== null) {
    filteredObjects = filteredObjects.filter(o => o.folder_id === selectedFolderId);
  }
  if (statusFilter) {
    filteredObjects = filteredObjects.filter(o => o.status === statusFilter);
  }
  if (search.trim()) {
    const s = search.toLowerCase();
    filteredObjects = filteredObjects.filter(o =>
      o.object_key.toLowerCase().includes(s) ||
      o.title.toLowerCase().includes(s) ||
      o.description.toLowerCase().includes(s) ||
      (o.pre_action && o.pre_action.toLowerCase().includes(s)) ||
      (o.post_action && o.post_action.toLowerCase().includes(s))
    );
  }

  // Automatically select the first object if none is selected
  useEffect(() => {
    if (filteredObjects.length > 0) {
      if (!selectedObjectId || !filteredObjects.some(o => o.id === selectedObjectId)) {
        setSelectedObjectId(filteredObjects[0].id);
      }
    } else {
      setSelectedObjectId(null);
    }
  }, [filteredObjects, tracker.id]);

  // Sync active object into form fields
  const activeObject = allObjects.find(o => o.id === selectedObjectId);

  useEffect(() => {
    if (activeObject) {
      setTitle(activeObject.title || '');
      setPreAction(activeObject.pre_action || '');
      setDesc(activeObject.description || '');
      setOwnerName(activeObject.owner_name || 'Zewd');
      setPostAction(activeObject.post_action || '');
      setStatus(activeObject.status || 'DRAFT');
      setPriority(activeObject.priority || 'MEDIUM');
      setSafetyLevel(activeObject.safety_level || 'ASIL-D');
      setReqType(activeObject.requirement_type || 'Functional Requirement');
      setTestProcess(activeObject.test_subprocess || 'System Testing');
      setSaveSuccessMsg(false);
    }
  }, [activeObject?.id]);

  // Save handler for Middle Panel
  const handleSaveMiddlePanel = () => {
    if (!activeObject) return;

    onUpdateObject(activeObject.id, {
      title: title.trim(),
      pre_action: preAction.trim(),
      description: desc.trim(),
      owner_name: ownerName.trim(),
      post_action: postAction.trim(),
      status,
      priority,
      safety_level: safetyLevel,
      requirement_type: reqType,
      test_subprocess: testProcess
    });

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Add Step for Test Cases
  const handleAddTestStepInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeObject || !newStepAction.trim() || !onAddTestStep) return;

    onAddTestStep(
      activeObject.id,
      newStepAction.trim(),
      newStepExpected.trim() || 'Verified system output complies with requirements.'
    );

    setNewStepAction('');
    setNewStepExpected('');
  };

  // Add Test Case to Test Set
  const handleAddTestCaseToSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeObject || !addTestCaseId || !onAddRelationship) return;
    onAddRelationship(addTestCaseId, activeObject.id, 'INCLUDED_IN');
    setAddTestCaseId(null);
  };

  // Create Object Submit
  const handleCreateObjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    onCreateObject({
      tracker_id: tracker.id,
      folder_id: modalFolderId || selectedFolderId,
      title: modalTitle.trim(),
      pre_action: modalPreAction.trim(),
      description: modalDesc.trim(),
      post_action: modalPostAction.trim(),
      safety_level: modalSafetyLevel,
      priority: modalPriority,
      requirement_type: reqType,
      test_subprocess: testProcess
    });

    setShowCreateModal(false);
    setModalTitle('');
    setModalPreAction('');
    setModalDesc('');
    setModalPostAction('');
  };

  // Create Folder Submit
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !onCreateFolder) return;
    const createdId = onCreateFolder(tracker.id, newFolderName.trim());
    if (typeof createdId === 'number') {
      setSelectedFolderId(createdId);
    }
    setNewFolderName('');
    setShowFolderModal(false);
  };

  // Create Link Submit (Right Panel)
  const handleCreateLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeObject || !targetObjId || !onAddRelationship) return;
    onAddRelationship(activeObject.id, targetObjId, relType);
    setShowLinkModal(false);
    setTargetObjId(null);
  };

  // File Upload Submit (Right Panel)
  const handleFileUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeObject || !newFilename.trim() || !onAddArtifact) return;

    onAddArtifact({
      object_id: activeObject.id,
      filename: newFilename.trim(),
      category: newFileCategory,
      file_size: Math.floor(Math.random() * 5000000) + 500000,
      stored_path: `/artifacts/${newFilename.trim()}`
    });

    setNewFilename('');
    setShowFileModal(false);
  };

  // Right Panel Links & Files
  const outgoingLinks = activeObject ? relationships.filter(r => r.source_id === activeObject.id) : [];
  const incomingLinks = activeObject ? relationships.filter(r => r.target_id === activeObject.id) : [];
  const activeObjectFiles = activeObject ? artifacts.filter(a => a.object_id === activeObject.id) : [];

  // Included test cases in Test Set
  const includedTestCaseRels = activeObject ? relationships.filter(r => r.target_id === activeObject.id && r.relationship_type === 'INCLUDED_IN') : [];
  const includedTestCases = includedTestCaseRels.map(r => {
    const tcObj = allObjects.find(o => o.id === r.source_id);
    return { relId: r.id, tcObj };
  }).filter(item => item.tcObj !== undefined);

  const availableTestCases = allObjects.filter(o =>
    (o.type === 'TEST_CASE' || o.object_key.startsWith('SYS-TST')) &&
    !includedTestCaseRels.some(r => r.source_id === o.id)
  );

  const activeSteps = activeObject ? testSteps.filter(s => s.test_case_id === activeObject.id) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden', backgroundColor: 'var(--bg-dark)' }}>
      {/* Top Tracker Sub-Navbar */}
      <div style={{
        height: '52px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="mono" style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--accent-cyan)',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '3px 8px',
            borderRadius: '5px'
          }}>
            {tracker.prefix || tracker.key}
          </span>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {tracker.name} Dashboard
          </h1>
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: 'var(--bg-dark)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 600
          }}>
            {objects.length} Total Objects
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)'
            }}
          >
            <Plus size={16} />
            <span>+ New Requirement</span>
          </button>
        </div>
      </div>

      {/* 3-Panel Split Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ══════════════════════════════════════════════════════════════════
            LEFT PANEL: Inventory List & Folder Navigation
            ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          width: '320px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Search & Status Filter */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search requirements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '32px',
                  paddingRight: '8px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: '0.75rem',
                  padding: '5px 8px',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>

              <button
                onClick={() => setShowFolderModal(true)}
                title="New Folder"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-cyan)',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <FolderPlus size={14} />
                <span>Folder</span>
              </button>
            </div>
          </div>

          {/* Folder Filter Chips */}
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <button
              onClick={() => setSelectedFolderId(null)}
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                backgroundColor: selectedFolderId === null ? 'var(--primary)' : 'var(--bg-dark)',
                color: selectedFolderId === null ? '#fff' : 'var(--text-muted)'
              }}
            >
              All ({objects.length})
            </button>
            {folders.map(f => {
              const fCount = objects.filter(o => o.folder_id === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    backgroundColor: selectedFolderId === f.id ? 'var(--primary)' : 'var(--bg-dark)',
                    color: selectedFolderId === f.id ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {f.name} ({fCount})
                </button>
              );
            })}
          </div>

          {/* Requirements Scrollable List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {filteredObjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>No requirements found.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + Add Requirement
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredObjects.map((obj) => {
                  const isSelected = selectedObjectId === obj.id;
                  return (
                    <div
                      key={obj.id}
                      onClick={() => setSelectedObjectId(obj.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                        border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 10px rgba(56, 189, 248, 0.15)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="mono" style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: 'var(--accent-cyan)',
                          backgroundColor: 'var(--bg-dark)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {obj.object_key}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor:
                            obj.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' :
                            obj.status === 'REVIEW' ? 'rgba(245, 158, 11, 0.15)' :
                            'rgba(148, 163, 184, 0.15)',
                          color:
                            obj.status === 'APPROVED' ? 'var(--accent-emerald)' :
                            obj.status === 'REVIEW' ? 'var(--accent-amber)' :
                            'var(--text-muted)'
                        }}>
                          {obj.status}
                        </span>
                      </div>

                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        lineHeight: '1.3',
                        marginBottom: '4px'
                      }}>
                        {obj.title}
                      </div>

                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '6px'
                      }}>
                        <span>👤 {obj.owner_name || 'Zewd'}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: obj.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-dark)',
                          color: obj.priority === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--text-muted)'
                        }}>
                          {obj.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MIDDLE PANEL: Requirement Descriptive Specifications & Pre/Post Actions
            ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 32px',
          backgroundColor: 'var(--bg-dark)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!activeObject ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)'
            }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                No Requirement Selected
              </h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center', marginBottom: '20px' }}>
                Select an engineering object from the left panel or create a new requirement to inspect and edit its specifications.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                + Create Requirement
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: '820px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* 1. Object Key & Status Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: '12px 18px',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="mono" style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--accent-cyan)',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    [{activeObject.object_key}]
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tracker.name} • Version v{activeObject.version}.0
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '5px 10px',
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color:
                        status === 'APPROVED' ? 'var(--accent-emerald)' :
                        status === 'REVIEW' ? 'var(--accent-amber)' :
                        'var(--text-main)'
                    }}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="VERIFIED">VERIFIED</option>
                  </select>

                  <select
                    value={safetyLevel}
                    onChange={(e) => setSafetyLevel(e.target.value as SafetyLevel)}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '5px 10px',
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--accent-cyan)'
                    }}
                  >
                    <option value="ASIL-D">ASIL-D</option>
                    <option value="ASIL-C">ASIL-C</option>
                    <option value="ASIL-B">ASIL-B</option>
                    <option value="ASIL-A">ASIL-A</option>
                    <option value="SIL-3">SIL-3</option>
                    <option value="SIL-2">SIL-2</option>
                    <option value="Standard / Non-Safety">Standard / Non-Safety</option>
                  </select>

                  {onDeleteObject && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete requirement ${activeObject.object_key} (${activeObject.title})?`)) {
                          onDeleteObject(activeObject.id);
                        }
                      }}
                      title="Delete Object"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        color: 'var(--accent-rose)',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Title (Editable) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Requirement Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  placeholder="e.g. Dynamic Collision Avoidance Trajectory Computation"
                />
              </div>

              {/* 3. ⚡ Pre-Action (Initial / Preconditions) */}
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.04)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: 'var(--accent-amber)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⚡ PRE-ACTION
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Initial System State, Hardware Preconditions & Entry Criteria
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={preAction}
                  onChange={(e) => setPreAction(e.target.value)}
                  placeholder="Describe starting system state, sensor calibration, battery thresholds, environmental setup, or prerequisites before executing this requirement/test..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    color: 'var(--text-main)',
                    resize: 'vertical',
                    lineHeight: '1.4'
                  }}
                />
              </div>

              {/* 4. Description (Full rich text specification) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Detailed Specification & Description
                </label>
                <textarea
                  rows={5}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Full engineering specification text, functional requirements, architectural interfaces, or validation acceptance criteria..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    resize: 'vertical',
                    lineHeight: '1.5'
                  }}
                />
              </div>

              {/* 5. 👤 Owner Name: Zewd */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: '12px 16px',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#000',
                  fontSize: '0.85rem'
                }}>
                  Z
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ASSIGNED OWNER / LEAD ENGINEER
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--accent-amber)',
                        backgroundColor: 'var(--bg-dark)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        width: '200px'
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      👑 Project Owner
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. 🧪 Test Steps (if Test Case tracker) */}
              {isTestCaseTracker && (
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ListOrdered size={18} color="var(--accent-cyan)" />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Test Execution Steps ({activeSteps.length})
                      </h4>
                    </div>
                  </div>

                  {activeSteps.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', backgroundColor: 'var(--bg-dark)', borderRadius: '6px' }}>
                      No test steps recorded yet. Add sequential verification procedures below.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {activeSteps.map((step, idx) => (
                        <div key={step.id} style={{
                          display: 'grid',
                          gridTemplateColumns: '36px 1fr 1fr 36px',
                          gap: '12px',
                          alignItems: 'center',
                          backgroundColor: 'var(--bg-dark)',
                          border: '1px solid var(--border-color)',
                          padding: '10px 12px',
                          borderRadius: '6px'
                        }}>
                          <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', textAlign: 'center', fontSize: '0.85rem' }}>
                            #{idx + 1}
                          </span>
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>ACTION</div>
                            <div>{step.action}</div>
                          </div>
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>EXPECTED RESULT</div>
                            <div style={{ color: 'var(--accent-emerald)' }}>{step.expected_result}</div>
                          </div>
                          {onDeleteTestStep && (
                            <button
                              onClick={() => onDeleteTestStep(step.id)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--accent-rose)',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title="Delete Step"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Step Inline Form */}
                  <form onSubmit={handleAddTestStepInline} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder="Step action (e.g. Trigger optical obstacle)..."
                      value={newStepAction}
                      onChange={(e) => setNewStepAction(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '8px 10px' }}
                    />
                    <input
                      type="text"
                      placeholder="Expected outcome (e.g. Robot stops <0.35m)..."
                      value={newStepExpected}
                      onChange={(e) => setNewStepExpected(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '8px 10px' }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--primary)',
                        color: '#fff',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Step
                    </button>
                  </form>
                </div>
              )}

              {/* If Test Set tracker: Included Test Cases */}
              {isTestSetTracker && (
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '18px'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                    Included Test Cases in this Suite ({includedTestCases.length})
                  </h4>

                  {includedTestCases.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', backgroundColor: 'var(--bg-dark)', borderRadius: '6px' }}>
                      No test cases assigned to this test set yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      {includedTestCases.map(item => (
                        <div key={item.relId} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'var(--bg-dark)',
                          border: '1px solid var(--border-color)',
                          padding: '8px 12px',
                          borderRadius: '6px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                              [{item.tcObj?.object_key}]
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              {item.tcObj?.title}
                            </span>
                          </div>
                          {onDeleteRelationship && (
                            <button
                              onClick={() => onDeleteRelationship(item.relId)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--accent-rose)', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Test Case to Set Form */}
                  {availableTestCases.length > 0 && (
                    <form onSubmit={handleAddTestCaseToSet} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <select
                        value={addTestCaseId || ''}
                        onChange={(e) => setAddTestCaseId(Number(e.target.value) || null)}
                        style={{ flex: 1, fontSize: '0.8rem' }}
                      >
                        <option value="">Select a test case to include...</option>
                        {availableTestCases.map(tc => (
                          <option key={tc.id} value={tc.id}>
                            [{tc.object_key}] {tc.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={!addTestCaseId}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Include Test Case
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* 7. 🎯 Post-Action (Exit / Postconditions) */}
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: 'var(--accent-emerald)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🎯 POST-ACTION
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Final Exit State, Postconditions, Safety Hold & Verification Output
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={postAction}
                  onChange={(e) => setPostAction(e.target.value)}
                  placeholder="Describe final system state upon completion, telemetry broadcast, mechanical brake engagement, audit confirmation, or expected postconditions..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: 'var(--text-main)',
                    resize: 'vertical',
                    lineHeight: '1.4'
                  }}
                />
              </div>

              {/* 8. [Save Changes] Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  {saveSuccessMsg && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--accent-emerald)',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={16} />
                      <span>Changes saved successfully to workspace!</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSaveMiddlePanel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            RIGHT PANEL: Features, Traceability & Artifacts
            ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          width: '380px',
          flexShrink: 0,
          borderLeft: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px'
        }}>
          {!activeObject ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Layers size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.85rem' }}>Features inspector will appear when an engineering object is selected.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Section 1: Traceability & Relationships */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LinkIcon size={16} color="var(--accent-cyan)" />
                    <span>Traceability & Links ({outgoingLinks.length + incomingLinks.length})</span>
                  </h3>
                  <button
                    onClick={() => setShowLinkModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: 'var(--accent-cyan)',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={12} />
                    <span>+ Link</span>
                  </button>
                </div>

                {outgoingLinks.length === 0 && incomingLinks.length === 0 ? (
                  <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', backgroundColor: 'var(--bg-dark)', borderRadius: '6px' }}>
                    No traceability links established yet. Click "+ Link" to allocate architecture, verify with test cases, or mitigate hazards.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Outgoing Links */}
                    {outgoingLinks.map(rel => {
                      const targetObj = allObjects.find(o => o.id === rel.target_id);
                      return (
                        <div key={rel.id} style={{
                          backgroundColor: 'var(--bg-dark)',
                          border: '1px solid var(--border-color)',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: 'var(--accent-cyan)',
                              backgroundColor: 'rgba(56, 189, 248, 0.12)',
                              padding: '2px 6px',
                              borderRadius: '3px'
                            }}>
                              ➔ {rel.relationship_type.replace(/_/g, ' ')}
                            </span>
                            <button
                              onClick={() => onDeleteRelationship(rel.id)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                              title="Delete Link"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            <span className="mono" style={{ color: 'var(--accent-cyan)', marginRight: '6px' }}>[{targetObj?.object_key || 'OBJ'}]</span>
                            {targetObj?.title || 'Linked Object'}
                          </div>
                        </div>
                      );
                    })}

                    {/* Incoming Links */}
                    {incomingLinks.map(rel => {
                      const sourceObj = allObjects.find(o => o.id === rel.source_id);
                      return (
                        <div key={rel.id} style={{
                          backgroundColor: 'var(--bg-dark)',
                          border: '1px solid var(--border-color)',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: 'var(--accent-amber)',
                              backgroundColor: 'rgba(245, 158, 11, 0.12)',
                              padding: '2px 6px',
                              borderRadius: '3px'
                            }}>
                              ⬅ {rel.relationship_type.replace(/_/g, ' ')} by
                            </span>
                            <button
                              onClick={() => onDeleteRelationship(rel.id)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                              title="Delete Link"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            <span className="mono" style={{ color: 'var(--accent-amber)', marginRight: '6px' }}>[{sourceObj?.object_key || 'OBJ'}]</span>
                            {sourceObj?.title || 'Source Object'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Attached CAD / PDFs / Logs */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Paperclip size={16} color="var(--accent-purple)" />
                    <span>Attached Files ({activeObjectFiles.length})</span>
                  </h3>
                  <button
                    onClick={() => setShowFileModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'rgba(168, 85, 247, 0.12)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      color: 'var(--accent-purple)',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={12} />
                    <span>+ File</span>
                  </button>
                </div>

                {activeObjectFiles.length === 0 ? (
                  <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', backgroundColor: 'var(--bg-dark)', borderRadius: '6px' }}>
                    No CAD, specification PDFs, or logs attached to this item.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeObjectFiles.map(file => (
                      <div key={file.id} style={{
                        backgroundColor: 'var(--bg-dark)',
                        border: '1px solid var(--border-color)',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.filename}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {file.category} • {(file.file_size / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {onDeleteArtifact && (
                            <button
                              onClick={() => onDeleteArtifact(file.id)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--accent-rose)', cursor: 'pointer' }}
                              title="Remove File"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Version History & Audit Trail */}
              <div style={{
                backgroundColor: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                padding: '14px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Clock size={14} />
                  <span>Version & Governance Trail</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Current Revision:</strong> <span className="mono">v{activeObject.version}.0</span></div>
                  <div><strong>Created:</strong> {new Date(activeObject.created_at).toLocaleDateString()}</div>
                  <div><strong>Author:</strong> 👑 Zewd (Owner)</div>
                  <div><strong>Safety Integrity:</strong> {activeObject.safety_level}</div>
                </div>
              </div>

              {/* Section 4: Quick Impact Analysis Link */}
              {onSelectObjectForImpact && (
                <button
                  onClick={() => onSelectObjectForImpact(activeObject.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(2, 132, 199, 0.1)',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    color: 'var(--accent-cyan)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Activity size={16} />
                  <span>Run Traceability Impact Analysis →</span>
                </button>
              )}

            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODALS: Create Object, Folder, Link, File
          ══════════════════════════════════════════════════════════════════ */}

      {/* 1. Create Requirement Modal */}
      {showCreateModal && (
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
            width: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '14px' }}>
              Create New {tracker.name.replace(/s$/, '')}
            </h3>

            <form onSubmit={handleCreateObjectSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. Dynamic Table Rerouting Latency"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--accent-amber)' }}>
                  ⚡ Pre-Action (Initial System State & Preconditions)
                </label>
                <textarea
                  rows={2}
                  value={modalPreAction}
                  onChange={(e) => setModalPreAction(e.target.value)}
                  style={{ width: '100%', resize: 'none' }}
                  placeholder="Starting state, sensor thresholds, battery status before trigger..."
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Specification / Description
                </label>
                <textarea
                  rows={3}
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  style={{ width: '100%', resize: 'none' }}
                  placeholder="Full functional requirements description..."
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--accent-emerald)' }}>
                  🎯 Post-Action (Exit State & Postconditions)
                </label>
                <textarea
                  rows={2}
                  value={modalPostAction}
                  onChange={(e) => setModalPostAction(e.target.value)}
                  style={{ width: '100%', resize: 'none' }}
                  placeholder="Final safe state, telemetry feedback, mechanical brake lock..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Safety Classification
                  </label>
                  <select
                    value={modalSafetyLevel}
                    onChange={(e) => setModalSafetyLevel(e.target.value as SafetyLevel)}
                    style={{ width: '100%' }}
                  >
                    <option value="ASIL-D">ASIL-D</option>
                    <option value="ASIL-C">ASIL-C</option>
                    <option value="ASIL-B">ASIL-B</option>
                    <option value="ASIL-A">ASIL-A</option>
                    <option value="SIL-3">SIL-3</option>
                    <option value="SIL-2">SIL-2</option>
                    <option value="Standard / Non-Safety">Standard / Non-Safety</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Create Folder Modal */}
      {showFolderModal && (
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
            width: '400px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', color: 'var(--accent-cyan)' }}>
              Create New Folder
            </h3>
            <form onSubmit={handleCreateFolderSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Folder Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. Navigation Subsystem Specs"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Link Relationship Modal (Right Panel) */}
      {showLinkModal && activeObject && (
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
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              Link Traceability Relationship
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Connect <strong>[{activeObject.object_key}]</strong> to upstream architecture, verification test cases, or safety hazards.
            </p>

            <form onSubmit={handleCreateLinkSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Relationship Type
                </label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="VERIFIED_BY">VERIFIED_BY (Test Cases)</option>
                  <option value="ALLOCATED_TO">ALLOCATED_TO (Architecture)</option>
                  <option value="MITIGATED_BY">MITIGATED_BY (Risk / Safety)</option>
                  <option value="DERIVED_TO">DERIVED_TO (Subsystem Reqs)</option>
                  <option value="DEPENDS_ON">DEPENDS_ON (General Dependency)</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target Engineering Object *
                </label>
                <select
                  required
                  value={targetObjId || ''}
                  onChange={(e) => setTargetObjId(Number(e.target.value) || null)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select target object to trace...</option>
                  {allObjects.filter(o => o.id !== activeObject.id).map(o => (
                    <option key={o.id} value={o.id}>
                      [{o.object_key}] {o.title} ({o.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetObjId}
                  style={{ padding: '8px 18px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Establish Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Attach File Modal (Right Panel) */}
      {showFileModal && activeObject && (
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
            width: '440px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '8px' }}>
              Attach File to [{activeObject.object_key}]
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Upload CAD models (.step), test logs, or technical specification PDFs.
            </p>

            <form onSubmit={handleFileUploadSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Filename *
                </label>
                <input
                  type="text"
                  required
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. Nav2_LocalPlanner_Bench_Results.pdf"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={newFileCategory}
                  onChange={(e) => setNewFileCategory(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="PDF">PDF Specification</option>
                  <option value="CAD">CAD / STEP Assembly</option>
                  <option value="CSV">CSV / Excel Telemetry</option>
                  <option value="OTHER">Other Technical Attachment</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFilename.trim()}
                  style={{ padding: '8px 18px', borderRadius: '6px', backgroundColor: 'var(--accent-purple)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Attach File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
