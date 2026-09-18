import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Database, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Layers,
  Sparkles,
  FileCode,
  FileImage,
  Activity
} from 'lucide-react';
import { getHealthStatus } from '../services/api';

export const LUNG_DATASET_IMAGES = {
  'Bengin cases': [
    'Bengin case (1)',
    'Bengin case (2)',
    'Bengin case (3)',
    'Bengin case (4)',
    'Bengin case (5)',
    'Bengin case (6)',
    'Bengin case (7)',
    'Bengin case (8)',
    'Bengin case (9)',
    'Bengin case (10)'
  ],
  'Malignant cases': [
    'Malignant case (1)',
    'Malignant case (2)',
    'Malignant case (3)',
    'Malignant case (4)',
    'Malignant case (5)',
    'Malignant case (6)',
    'Malignant case (7)',
    'Malignant case (8)',
    'Malignant case (9)',
    'Malignant case (10)'
  ],
  'Normal cases': [
    'Normal case (1)',
    'Normal case (2)',
    'Normal case (3)',
    'Normal case (4)',
    'Normal case (5)',
    'Normal case (6)',
    'Normal case (7)',
    'Normal case (8)',
    'Normal case (9)',
    'Normal case (10)'
  ]
};

export const BREAST_DATASET_IMAGES = {
  'Benign': [
    'benign (1)',
    'benign (2)',
    'benign (3)',
    'benign (4)',
    'benign (5)',
    'benign (6)',
    'benign (7)',
    'benign (8)',
    'benign (9)',
    'benign (10)'
  ],
  'Malignant': [
    'malignant (1)',
    'malignant (2)',
    'malignant (3)',
    'malignant (4)',
    'malignant (5)',
    'malignant (6)',
    'malignant (7)',
    'malignant (8)',
    'malignant (9)',
    'malignant (10)'
  ],
  'Normal': [
    'normal (1)',
    'normal (2)',
    'normal (3)',
    'normal (4)',
    'normal (5)',
    'normal (6)',
    'normal (7)',
    'normal (8)',
    'normal (9)',
    'normal (10)'
  ]
};

export const BRAIN_DATASET_IMAGES = {
  'Glioma': [
    'Te-gl_2',
    'Te-gl_3',
    'Te-gl_4',
    'Te-gl_5',
    'Te-gl_6',
    'Te-gl_7',
    'Te-gl_8',
    'Te-gl_9',
    'Te-gl_10'
  ],
  'Meningioma': [
    'Te-aug-me_1',
    'Te-aug-me_2',
    'Te-aug-me_3',
    'Te-aug-me_4',
    'Te-aug-me_5',
    'Te-aug-me_6',
    'Te-aug-me_7',
    'Te-aug-me_8',
    'Te-aug-me_9',
    'Te-aug-me_10'
  ],
  'No Tumor': [
    'Te-no_2',
    'Te-no_3',
    'Te-no_4',
    'Te-no_5',
    'Te-no_6',
    'Te-no_7',
    'Te-no_8',
    'Te-no_9',
    'Te-no_10'
  ],
  'Pituitary': [
    'Te-pi_1',
    'Te-pi_2',
    'Te-pi_3',
    'Te-pi_4',
    'Te-pi_5',
    'Te-pi_6',
    'Te-pi_7',
    'Te-pi_8',
    'Te-pi_9',
    'Te-pi_10'
  ]
};


export const DATASET_STRUCTURE = [
  {
    id: 'breast',
    name: 'Breast',
    cancerType: 'breast',
    engineName: 'Breast Sonogram Engine',
    modelName: 'EfficientNet-B0 3-Class Classifier',
    modelFile: 'best_busi_3class_efficientnet_b0.pth',
    color: '#EF8B8B',
    subfolders: [
      {
        id: 'breast_benign',
        name: 'Benign',
        files: BREAST_DATASET_IMAGES['Benign']
      },
      {
        id: 'breast_malignant',
        name: 'Malignant',
        files: BREAST_DATASET_IMAGES['Malignant']
      },
      {
        id: 'breast_normal',
        name: 'Normal',
        files: BREAST_DATASET_IMAGES['Normal']
      }
    ],
    subclasses: ['Benign', 'Malignant', 'Normal']
  },
  {
    id: 'brain',
    name: 'Brain',
    cancerType: 'brain',
    engineName: 'Brain MRI Engine',
    modelName: 'Hybrid ResNet Engine',
    modelFile: 'brain_mri_resnet50_v0.1.0.pt',
    color: '#9B8AFB',
    subfolders: [
      {
        id: 'brain_glioma',
        name: 'Glioma',
        files: BRAIN_DATASET_IMAGES['Glioma']
      },
      {
        id: 'brain_meningioma',
        name: 'Meningioma',
        files: BRAIN_DATASET_IMAGES['Meningioma']
      },
      {
        id: 'brain_notumor',
        name: 'No Tumor',
        files: BRAIN_DATASET_IMAGES['No Tumor']
      },
      {
        id: 'brain_pituitary',
        name: 'Pituitary',
        files: BRAIN_DATASET_IMAGES['Pituitary']
      }
    ],
    subclasses: ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary']
  },
  {
    id: 'lung',
    name: 'Lung',
    cancerType: 'lung',
    engineName: 'Lung CT Engine',
    modelName: 'Deep CNN (EfficientNet-B0)',
    modelFile: 'efficientnet_b0_finetuned_best.pt',
    color: '#5B8DEF',
    subfolders: [
      {
        id: 'bengin_cases',
        name: 'Bengin cases',
        files: LUNG_DATASET_IMAGES['Bengin cases']
      },
      {
        id: 'malignant_cases',
        name: 'Malignant cases',
        files: LUNG_DATASET_IMAGES['Malignant cases']
      },
      {
        id: 'normal_cases',
        name: 'Normal cases',
        files: LUNG_DATASET_IMAGES['Normal cases']
      }
    ],
    subclasses: ['Bengin cases', 'Malignant cases', 'Normal cases']
  },
  {
    id: 'kidney',
    name: 'Kidney',
    cancerType: 'kidney',
    engineName: 'Kidney CT Engine',
    modelName: '3D Volumetric U-Net + SVM',
    modelFile: '3dunet_kits19_pytorch.ptc',
    color: '#70C9A8',
    subclasses: ['Non-Malignant', 'Malignant']
  }
];

export default function DatasetExplorer({
  selectedCancerType,
  selectedSubclass,
  selectedImage,
  onSelectSubclass,
  className = '',
  style = {}
}) {
  // Root folder and 4 cancer categories expand/collapse state
  const [isRootOpen, setIsRootOpen] = useState(true);
  const [openFolders, setOpenFolders] = useState({
    breast: true,
    brain: true,
    lung: true,
    kidney: true
  });

  // Expand/collapse states for category subfolders (Lung, Breast, and Brain)
  const [openSubfolders, setOpenSubfolders] = useState({
    'bengin_cases': true,
    'malignant_cases': true,
    'normal_cases': true,
    'breast_benign': true,
    'breast_malignant': true,
    'breast_normal': true,
    'brain_glioma': true,
    'brain_meningioma': true,
    'brain_notumor': true,
    'brain_pituitary': true
  });

  // Health and real model status
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const fetchHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await getHealthStatus();
      setHealth(data);
    } catch (err) {
      console.error('Failed to fetch health status:', err);
      setHealthError('Unavailable');
      setHealth({ status: 'offline', models: {} });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const toggleFolder = (folderId, e) => {
    e?.stopPropagation();
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleSubfolder = (subfolderId, e) => {
    e?.stopPropagation();
    setOpenSubfolders(prev => ({
      ...prev,
      [subfolderId]: !prev[subfolderId]
    }));
  };

  const isModelConnected = (cancerType) => {
    if (!health || health.status === 'offline') return false;
    if (health.models && cancerType in health.models) {
      return Boolean(health.models[cancerType]);
    }
    return health.status === 'healthy';
  };

  const activeModelsCount = health?.models
    ? Object.values(health.models).filter(Boolean).length
    : (health?.status === 'healthy' ? 9 : 0);
  const totalModelsCount = health?.models && Object.keys(health.models).length > 0
    ? Object.keys(health.models).length
    : 9;

  const currentFolderConfig = DATASET_STRUCTURE.find(f => f.cancerType === selectedCancerType);
  const isCurrentModelOnline = isModelConnected(selectedCancerType);

  return (
    <aside 
      className={`vscode-explorer ${className}`}
      style={{
        width: '320px',
        minWidth: '290px',
        maxWidth: '350px',
        backgroundColor: '#13161c',
        color: '#cccccc',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '0.815rem',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        zIndex: 20,
        ...style
      }}
    >
      {/* VS Code Title Bar */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <Database size={15} color="#5B8DEF" />
          <span style={{
            fontSize: '0.725rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#e2e8f0',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Cancer Dataset Explorer
          </span>
        </div>
        <button
          onClick={fetchHealth}
          title="Refresh AI Model Connection Status"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <RefreshCw size={13} className={healthLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Model Connection Status Widget */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(0, 0, 0, 0.22)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Model Connection Status
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: health?.status === 'healthy' ? '#70C9A8' : (healthError ? '#EF8B8B' : '#F4C96B'),
              boxShadow: health?.status === 'healthy' ? '0 0 8px #70C9A8' : 'none'
            }} />
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: health?.status === 'healthy' ? '#70C9A8' : '#EF8B8B'
            }}>
              {health?.status === 'healthy' ? 'Connected' : (healthError ? 'Offline' : 'Checking...')}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Cpu size={12} color="#94a3b8" />
          <span>{activeModelsCount}/{totalModelsCount} Live Neural Engines Ready</span>
        </div>
      </div>

      {/* Tree View Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem 0',
        lineHeight: 1.5
      }}>
        {/* Top-Level Folder: CANCER DATASETS */}
        <div>
          <div
            onClick={() => setIsRootOpen(!isRootOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
              color: '#f8fafc',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.04em'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isRootOpen ? <ChevronDown size={14} color="#94a3b8" /> : <ChevronRight size={14} color="#94a3b8" />}
            {isRootOpen ? <FolderOpen size={16} color="#5B8DEF" /> : <Folder size={16} color="#5B8DEF" />}
            <span>CANCER DATASETS</span>
          </div>

          {/* 5 Main Folders */}
          {isRootOpen && (
            <div style={{ paddingLeft: '0.85rem' }}>
              {DATASET_STRUCTURE.map((folder) => {
                const isOpen = openFolders[folder.id];
                const isSelectedCancer = selectedCancerType === folder.cancerType;
                const isFolderModelReady = isModelConnected(folder.cancerType);

                return (
                  <div key={folder.id} style={{ margin: '1px 0' }}>
                    {/* Cancer Type Folder Header */}
                    <div
                      onClick={(e) => toggleFolder(folder.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: isSelectedCancer ? '#ffffff' : '#cbd5e1',
                        backgroundColor: isSelectedCancer ? 'rgba(91, 141, 239, 0.12)' : 'transparent',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelectedCancer) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelectedCancer) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                        {isOpen ? <ChevronDown size={13} color="#94a3b8" /> : <ChevronRight size={13} color="#94a3b8" />}
                        {isOpen ? (
                          <FolderOpen size={15} color={folder.color} />
                        ) : (
                          <Folder size={15} color={folder.color} />
                        )}
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{folder.name}</span>
                      </div>

                      {/* Status indicator pill */}
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: isFolderModelReady ? `${folder.color}20` : 'rgba(239, 139, 139, 0.15)',
                        color: isFolderModelReady ? folder.color : '#EF8B8B',
                        fontWeight: 700,
                        border: `1px solid ${isFolderModelReady ? `${folder.color}40` : 'rgba(239, 139, 139, 0.4)'}`
                      }}>
                        {folder.subfolders ? `${folder.subfolders.reduce((acc, sf) => acc + sf.files.length, 0)} images` : `${folder.subclasses.length} classes`}
                      </span>
                    </div>

                    {/* Substructure Rendering */}
                    {isOpen && (
                      <div style={{
                        paddingLeft: '1.25rem',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
                        marginLeft: '0.9rem',
                        marginTop: '2px',
                        marginBottom: '4px'
                      }}>
                        {/* If folder has subfolders (like Lung and Breast) */}
                        {folder.subfolders ? (
                          folder.subfolders.map((subfolder) => {
                            const isSubfolderOpen = openSubfolders[subfolder.id];
                            const isSubfolderActive = 
                              selectedCancerType === folder.cancerType && 
                              selectedSubclass === subfolder.name;

                            return (
                              <div key={subfolder.id} style={{ margin: '2px 0' }}>
                                {/* Subfolder Header */}
                                <div
                                  onClick={(e) => {
                                    toggleSubfolder(subfolder.id, e);
                                    if (onSelectSubclass) {
                                      onSelectSubclass(folder.cancerType, subfolder.name);
                                    }
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.3rem 0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: isSubfolderActive ? '#ffffff' : '#cbd5e1',
                                    backgroundColor: isSubfolderActive ? 'rgba(91, 141, 239, 0.18)' : 'transparent',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSubfolderActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSubfolderActive) e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    {isSubfolderOpen ? <ChevronDown size={12} color="#94a3b8" /> : <ChevronRight size={12} color="#94a3b8" />}
                                    {isSubfolderOpen ? (
                                      <FolderOpen size={14} color={folder.color} />
                                    ) : (
                                      <Folder size={14} color={folder.color} />
                                    )}
                                    <span>{subfolder.name}</span>
                                  </div>
                                  <span style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600 }}>
                                    {subfolder.files.length}
                                  </span>
                                </div>

                                {/* List of 10 Real Images */}
                                {isSubfolderOpen && (
                                  <div style={{
                                    paddingLeft: '1.2rem',
                                    borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                                    marginLeft: '0.75rem',
                                    marginTop: '2px'
                                  }}>
                                    {subfolder.files.map((fileName) => {
                                      const isImageSelected = 
                                        selectedCancerType === folder.cancerType && 
                                        selectedImage === fileName;

                                      const isNifti = fileName.endsWith('.nii') || folder.cancerType === 'liver';
                                      const fullFileName = fileName.endsWith('.nii') 
                                        ? fileName 
                                        : `${fileName}.${folder.cancerType === 'breast' ? 'png' : 'jpg'}`;
                                      const imagePath = `/datasets/${folder.name}/${subfolder.name}/${fullFileName}`;

                                      return (
                                        <div
                                          key={fileName}
                                          onClick={() => {
                                            if (onSelectSubclass) {
                                              onSelectSubclass(folder.cancerType, subfolder.name, fileName, imagePath);
                                            }
                                          }}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            padding: '0.28rem 0.5rem',
                                            margin: '1px 0',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.77rem',
                                            color: isImageSelected ? '#ffffff' : '#94a3b8',
                                            backgroundColor: isImageSelected ? '#094771' : 'transparent',
                                            borderLeft: isImageSelected ? `3px solid ${folder.color}` : '3px solid transparent',
                                            transition: 'all 0.12s ease'
                                          }}
                                          onMouseEnter={(e) => {
                                            if (!isImageSelected) {
                                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                                              e.currentTarget.style.color = '#e2e8f0';
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!isImageSelected) {
                                              e.currentTarget.style.backgroundColor = 'transparent';
                                              e.currentTarget.style.color = '#94a3b8';
                                            }
                                          }}
                                        >
                                          <span style={{ fontSize: '0.85rem' }}>{isNifti ? '🧊' : '🖼'}</span>
                                          <span style={{
                                            fontWeight: isImageSelected ? 700 : 500,
                                            flex: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {fileName}
                                          </span>

                                          {isImageSelected && (
                                            <span style={{
                                              fontSize: '0.6rem',
                                              padding: '1px 4px',
                                              borderRadius: '3px',
                                              backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                              color: '#fff',
                                              fontWeight: 700
                                            }}>
                                              ACTIVE
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          /* Standard Subclasses List for other categories */
                          folder.subclasses.map((subclass) => {
                            const isSubclassSelected = 
                              selectedCancerType === folder.cancerType && 
                              selectedSubclass === subclass;

                            return (
                              <div
                                key={subclass}
                                onClick={() => onSelectSubclass(folder.cancerType, subclass)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  padding: '0.32rem 0.6rem',
                                  margin: '1px 0',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.79rem',
                                  color: isSubclassSelected ? '#ffffff' : '#94a3b8',
                                  backgroundColor: isSubclassSelected ? '#094771' : 'transparent',
                                  borderLeft: isSubclassSelected ? `3px solid ${folder.color}` : '3px solid transparent',
                                  transition: 'all 0.12s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSubclassSelected) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                                    e.currentTarget.style.color = '#e2e8f0';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSubclassSelected) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#94a3b8';
                                  }
                                }}
                              >
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: isSubclassSelected ? folder.color : 'rgba(255, 255, 255, 0.25)',
                                  boxShadow: isSubclassSelected ? `0 0 6px ${folder.color}` : 'none',
                                  flexShrink: 0
                                }} />
                                <span style={{
                                  fontWeight: isSubclassSelected ? 700 : 500,
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {subclass}
                                </span>

                                {isSubclassSelected && (
                                  <span style={{
                                    fontSize: '0.625rem',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    color: '#fff',
                                    fontWeight: 700
                                  }}>
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Model Details & Image Inspector */}
      {currentFolderConfig && (
        <div style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.75)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Connected Model
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: isCurrentModelOnline ? '#70C9A8' : '#EF8B8B',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isCurrentModelOnline ? '#70C9A8' : '#EF8B8B',
                boxShadow: isCurrentModelOnline ? '0 0 6px #70C9A8' : 'none'
              }} />
              {isCurrentModelOnline ? 'Online' : 'Unavailable'}
            </span>
          </div>

          <div style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: currentFolderConfig.color,
            marginBottom: '0.2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {currentFolderConfig.engineName}
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
            {currentFolderConfig.modelName}
          </div>

          {selectedImage && (selectedCancerType === 'lung' || selectedCancerType === 'breast' || selectedCancerType === 'brain') && (
            <div style={{
              marginTop: '0.45rem',
              paddingTop: '0.45rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                {selectedCancerType === 'breast' ? 'Selected Ultrasound Scan File:' : selectedCancerType === 'brain' ? 'Selected Brain MRI Scan File:' : 'Selected CT Scan File:'}
              </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img 
                      src={`/datasets/${currentFolderConfig.name}/${selectedSubclass}/${selectedImage}.${selectedCancerType === 'breast' ? 'png' : 'jpg'}`} 
                      alt={selectedImage}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '4px',
                        objectFit: 'cover',
                        backgroundColor: '#000',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.74rem', color: '#fff', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedImage}.{selectedCancerType === 'breast' ? 'png' : 'jpg'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#70C9A8', fontWeight: 600 }}>
                        {selectedCancerType === 'breast' ? 'BUSI Authentic Ultrasound Scan' : selectedCancerType === 'brain' ? 'Brain Tumor Authentic MRI Scan' : 'IQ-OTHNCCD Authentic Scan'}
                      </div>
                    </div>
                  </div>
                </div>
          )}
        </div>
      )}
    </aside>
  );
}
