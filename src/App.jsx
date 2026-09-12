import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import NewDiagnosis from './pages/NewDiagnosis';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import DemoDashboard from './pages/DemoDashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Clinical UI Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '2.5rem', textAlign: 'center' }} className="glass-panel">
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 139, 139, 0.15)',
            border: '1px solid rgba(239, 139, 139, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <span style={{ fontSize: '1.75rem', color: '#EF8B8B', fontWeight: 800 }}>!</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>
            Clinical Interface Notice
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            An unexpected error occurred while rendering the current view. You can return to the diagnostic workstation or reset to the main dashboard.
          </p>
          <div style={{ display: 'inline-flex', gap: '0.85rem' }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              className="btn-primary"
              style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
            >
              Reset to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/demo' || hash === '#/demo' || hash === '#demo') return 'demo';
      if (path === '/dashboard' || hash === '#/dashboard') return 'dashboard';
      if (path === '/new-diagnosis' || hash === '#/new-diagnosis') return 'new-diagnosis';
      if (path === '/history' || hash === '#/history') return 'history';
    }
    return 'landing';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [selectedCancerModule, setSelectedCancerModule] = useState('lung');
  const [currentDiagnosisResult, setCurrentDiagnosisResult] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    try {
      const targetUrl = pageId === 'demo' ? '/demo' : (pageId === 'landing' ? '/' : `/${pageId}`);
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ page: pageId }, '', targetUrl);
      }
    } catch {
      // Ignore in non-standard history environments
    }
  };

  const handleSelectModule = (moduleId) => {
    setSelectedCancerModule(moduleId);
    handleNavigate('new-diagnosis');
  };

  const handleDiagnosisComplete = (resultData) => {
    setCurrentDiagnosisResult(resultData);
    setActivePage('results');
  };

  const handleViewDiagnosisFromHistory = (resultData) => {
    setCurrentDiagnosisResult(resultData);
    setActivePage('results');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background Ambient Glow Light Orbs for Glass Refraction */}
      <div style={{
        position: 'fixed',
        top: '-120px',
        left: '5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(103, 201, 214, 0.28) 0%, rgba(103, 201, 214, 0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'fixed',
        top: '150px',
        right: '5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155, 138, 251, 0.25) 0%, rgba(155, 138, 251, 0) 70%)',
        filter: 'blur(55px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '25%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91, 141, 239, 0.18) 0%, rgba(91, 141, 239, 0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Top Navbar */}
      <Navbar activePage={activePage} setActivePage={handleNavigate} />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '3.5rem', position: 'relative', zIndex: 1 }}>
        <ErrorBoundary onReset={() => handleNavigate('dashboard')}>
          {activePage === 'landing' && (
            <LandingPage 
              onSelectModule={handleSelectModule} 
              onOpenDemo={() => handleNavigate('demo')} 
            />
          )}

          {activePage === 'demo' && (
            <DemoDashboard
              onSelectModule={handleSelectModule}
              onViewDiagnosis={handleViewDiagnosisFromHistory}
            />
          )}

          {activePage === 'dashboard' && (
            <Dashboard 
              onSelectModule={handleSelectModule} 
              onViewDiagnosis={handleViewDiagnosisFromHistory}
            />
          )}

          {activePage === 'new-diagnosis' && (
            <NewDiagnosis 
              initialCancerType={selectedCancerModule} 
              onDiagnosisComplete={handleDiagnosisComplete} 
            />
          )}

          {activePage === 'results' && (
            <ResultsPage 
              diagnosis={currentDiagnosisResult} 
              onNewAnalysis={() => setActivePage('new-diagnosis')}
              onBackToHistory={() => setActivePage('history')}
            />
          )}

          {activePage === 'history' && (
            <HistoryPage onViewDiagnosis={handleViewDiagnosisFromHistory} />
          )}
        </ErrorBoundary>
      </main>

      {/* Frosted Glass Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        padding: '1.75rem 2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        boxShadow: '0 -4px 20px rgba(36, 59, 83, 0.03)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>QuantumScan AI</span> • Clinical Diagnostics Glassmorphism Platform
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Lung CT • Brain MRI • Kidney CT • Breast Ultrasound • Liver CT
          </div>
        </div>
      </footer>
    </div>
  );
}
