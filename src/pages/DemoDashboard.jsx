import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  Heart, 
  Stethoscope, 
  Cpu, 
  ArrowRight, 
  ArrowLeft, 
  Menu, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  ExternalLink,
  Layers,
  Database
} from 'lucide-react';
import DatasetExplorer, { DATASET_STRUCTURE } from '../components/DatasetExplorer';
import Dashboard from './Dashboard';
import NewDiagnosis from './NewDiagnosis';
import ResultsPage from './ResultsPage';
import { getHealthStatus } from '../services/api';
import { 
  DEMO_DATASETS, 
  trackDemoFileOrigin, 
  isDemoFileCompatible, 
  getDemoMismatchMessage 
} from '../utils/demoDatasetIsolation';

export default function DemoDashboard({
  onSelectModule,
  onViewDiagnosis
}) {
  // Active cancer selection in Dataset Explorer
  const [selectedCancer, setSelectedCancer] = useState('lung');
  const [selectedSubclass, setSelectedSubclass] = useState('Bengin cases');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedFileOrigin, setSelectedFileOrigin] = useState(null);
  const [demoMismatchNotice, setDemoMismatchNotice] = useState(null);

  // View mode for right-side container: 'dashboard' | 'workstation' | 'results'
  const [rightView, setRightView] = useState('dashboard');
  const [activeDiagnosisResult, setActiveDiagnosisResult] = useState(null);

  // Mobile sidebar drawer state
  const [isMobileExplorerOpen, setIsMobileExplorerOpen] = useState(false);

  // Live health status for top connection banner
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await getHealthStatus();
        setHealth(data);
      } catch {
        setHealth({ status: 'offline', models: {} });
      }
    };
    checkHealth();
  }, []);

  const handleSelectSubclass = (cancerType, subclass, image = null, imageUrl = null) => {
    setSelectedCancer(cancerType);
    setSelectedSubclass(subclass);
    setSelectedImage(image);
    setSelectedImageUrl(imageUrl);
    setDemoMismatchNotice(null);
    if (image) {
      setSelectedFileOrigin(trackDemoFileOrigin(cancerType, subclass, image, imageUrl));
    } else {
      setSelectedFileOrigin(null);
    }
    // When on mobile, close the drawer on selection
    if (window.innerWidth <= 860) {
      setIsMobileExplorerOpen(false);
    }
  };

  const handleLaunchWorkstation = (cancerType = selectedCancer) => {
    // Cross-dataset workstation validation
    if (selectedFileOrigin && !isDemoFileCompatible(selectedFileOrigin, cancerType)) {
      const notice = getDemoMismatchMessage(selectedFileOrigin, cancerType);
      setDemoMismatchNotice(notice);
      // Clear stale Demo-selected file state to prevent cross-loading
      setSelectedImage(null);
      setSelectedImageUrl(null);
      setSelectedFileOrigin(null);
      setActiveDiagnosisResult(null);
    } else {
      setDemoMismatchNotice(null);
    }
    setSelectedCancer(cancerType);
    setRightView('workstation');
  };

  const handleDemoModuleChange = (newCancerType) => {
    if (selectedFileOrigin && !isDemoFileCompatible(selectedFileOrigin, newCancerType)) {
      const notice = getDemoMismatchMessage(selectedFileOrigin, newCancerType);
      setDemoMismatchNotice(notice);
      setSelectedImage(null);
      setSelectedImageUrl(null);
      setSelectedFileOrigin(null);
      setActiveDiagnosisResult(null);
    }
    setSelectedCancer(newCancerType);
  };

  const handleDiagnosisComplete = (resultData) => {
    setActiveDiagnosisResult(resultData);
    setRightView('results');
  };

  const handleViewDiagnosisFromDashboard = (resultData) => {
    setActiveDiagnosisResult(resultData);
    setRightView('results');
    if (onViewDiagnosis) {
      onViewDiagnosis(resultData);
    }
  };

  const currentConfig = DATASET_STRUCTURE.find(c => c.cancerType === selectedCancer) || DATASET_STRUCTURE[0];
  const isModelConnected = health?.status === 'healthy' || (health?.models && health.models[selectedCancer]);

  return (
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 74px - 72px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Mobile Explorer Toggle Bar */}
      <div className="mobile-explorer-bar" style={{
        display: 'none',
        position: 'fixed',
        bottom: '1.25rem',
        left: '1.25rem',
        zIndex: 60
      }}>
        <button
          onClick={() => setIsMobileExplorerOpen(!isMobileExplorerOpen)}
          className="btn-primary"
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          {isMobileExplorerOpen ? <X size={16} /> : <Database size={16} />}
          {isMobileExplorerOpen ? 'Close Explorer' : 'Cancer Datasets'}
        </button>
      </div>

      {/* LEFT PANEL: VS Code-Style Dataset Explorer */}
      <div 
        className={`demo-left-panel ${isMobileExplorerOpen ? 'mobile-open' : ''}`}
        style={{
          flexShrink: 0,
          zIndex: 40
        }}
      >
        <DatasetExplorer
          selectedCancerType={selectedCancer}
          selectedSubclass={selectedSubclass}
          selectedImage={selectedImage}
          onSelectSubclass={handleSelectSubclass}
          style={{ height: '100%' }}
        />
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileExplorerOpen && (
        <div
          onClick={() => setIsMobileExplorerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 35
          }}
        />
      )}

      {/* RIGHT PANEL: Original Existing Dashboard and Workstation Modules */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Dynamic Model Connection & Active Dataset Banner */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0.75rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(36, 59, 83, 0.03)'
        }}>
          {/* Breadcrumb info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              backgroundColor: `${currentConfig.color}18`,
              border: `1px solid ${currentConfig.color}45`,
              color: currentConfig.color,
              fontSize: '0.775rem',
              fontWeight: 800
            }}>
              <Sparkles size={14} /> DEMO MODE
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Active Dataset Selection:
              <span style={{ color: 'var(--text-primary)', fontWeight: 800, marginLeft: '0.4rem' }}>
                {currentConfig.name}
              </span>
              <span style={{ color: currentConfig.color, fontWeight: 800, margin: '0 0.35rem' }}>›</span>
              <span style={{
                color: '#fff',
                backgroundColor: currentConfig.color,
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.78rem'
              }}>
                {selectedSubclass}
              </span>
              {selectedImage && (
                <>
                  <span style={{ color: currentConfig.color, fontWeight: 800, margin: '0 0.35rem' }}>›</span>
                  <span style={{
                    color: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.78rem'
                  }}>
                    {selectedCancer === 'liver' ? '🧊 ' : '🖼 '}{selectedImage}
                  </span>
                </>
              )}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              color: isModelConnected ? '#236c53' : '#b53838',
              backgroundColor: isModelConnected ? 'rgba(112, 201, 168, 0.16)' : 'rgba(239, 139, 139, 0.16)',
              border: `1px solid ${isModelConnected ? 'rgba(112, 201, 168, 0.4)' : 'rgba(239, 139, 139, 0.4)'}`,
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isModelConnected ? '#70C9A8' : '#EF8B8B',
                boxShadow: isModelConnected ? '0 0 6px #70C9A8' : 'none'
              }} />
              {isModelConnected ? `Model Connected: ${currentConfig.engineName}` : 'Model Offline'}
            </div>
          </div>

          {/* Action switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {rightView !== 'dashboard' && (
              <button
                onClick={() => setRightView('dashboard')}
                className="btn-secondary"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.825rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700
                }}
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
            )}

            {rightView === 'dashboard' && (
              <button
                onClick={() => handleLaunchWorkstation(selectedCancer)}
                className="btn-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontWeight: 800
                }}
              >
                Launch {currentConfig.name} Workstation <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Dataset Mismatch Alert Banner (Demo-Only) */}
          {demoMismatchNotice && (
            <div style={{
              width: '100%',
              padding: '0.65rem 1.1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 139, 139, 0.14)',
              border: '1px solid rgba(239, 139, 139, 0.45)',
              color: '#b53838',
              fontSize: '0.815rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginTop: '0.35rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <span>{demoMismatchNotice}</span>
              </div>
              <button
                onClick={() => setDemoMismatchNotice(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#b53838',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
                title="Dismiss notice"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* View Content Router within Right Panel */}
        <div style={{ flex: 1 }}>
          {rightView === 'dashboard' && (
            <Dashboard 
              onSelectModule={(modId) => handleLaunchWorkstation(modId)}
              onViewDiagnosis={handleViewDiagnosisFromDashboard}
            />
          )}

          {rightView === 'workstation' && (
            <NewDiagnosis
              key={`demo-${selectedCancer}-${selectedImage || 'none'}`}
              initialCancerType={selectedCancer}
              initialScanUrl={
                selectedFileOrigin && isDemoFileCompatible(selectedFileOrigin, selectedCancer)
                  ? selectedImageUrl
                  : null
              }
              initialScanName={
                selectedImage && selectedFileOrigin && isDemoFileCompatible(selectedFileOrigin, selectedCancer)
                  ? (selectedImage.endsWith('.nii') 
                      ? selectedImage 
                      : `${selectedImage}.${selectedCancer === 'breast' ? 'png' : 'jpg'}`) 
                  : null
              }
              isDemo={true}
              demoFileOrigin={selectedFileOrigin}
              demoNotice={demoMismatchNotice}
              onDemoModuleChange={handleDemoModuleChange}
              onClearDemoNotice={() => setDemoMismatchNotice(null)}
              onDiagnosisComplete={handleDiagnosisComplete}
            />
          )}

          {rightView === 'results' && activeDiagnosisResult && (
            <ResultsPage
              diagnosis={activeDiagnosisResult}
              onNewAnalysis={() => setRightView('workstation')}
              onBackToHistory={() => setRightView('dashboard')}
            />
          )}
        </div>
      </div>

      {/* Embedded CSS for Explorer Responsiveness */}
      <style>{`
        @media (max-width: 860px) {
          .demo-left-panel {
            position: fixed !important;
            top: 74px;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 50 !important;
          }
          .demo-left-panel.mobile-open {
            transform: translateX(0) !important;
          }
          .mobile-explorer-bar {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
