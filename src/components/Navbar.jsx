import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Cpu, Database, RefreshCw } from 'lucide-react';
import { getHealthStatus } from '../services/api';

export default function Navbar({ activePage, setActivePage }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await getHealthStatus();
      setHealth(data);
    } catch (err) {
      console.error('Health check failed', err);
      setHealth({ status: 'offline', models: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeModelsCount = health?.models
    ? Object.values(health.models).filter(Boolean).length
    : 0;
  const totalModelsCount = health?.models && Object.keys(health.models).length > 0
    ? Object.keys(health.models).length
    : 9;

  return (
    <header className="glass-header" style={{
      height: '74px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2.25rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand */}
      <div 
        onClick={() => setActivePage('landing')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
      >
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #5B8DEF 0%, #9B8AFB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(91, 141, 239, 0.4), inset 0 1px 1px rgba(255,255,255,0.6)'
        }}>
          <Activity size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.28rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
            Quantum<span className="text-gradient">Scan</span> AI
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
            Unified Clinical Diagnostics Suite
          </p>
        </div>
      </div>

      {/* Navigation Quick Links Glass Capsule */}
      <nav style={{
        display: 'flex',
        gap: '0.4rem',
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '0.4rem',
        borderRadius: '14px',
        border: '1px solid rgba(220, 230, 240, 0.9)',
        boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(36, 59, 83, 0.04)'
      }}>
        {[
          { id: 'landing', label: 'Home' },
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'demo', label: 'Demo' },
          { id: 'new-diagnosis', label: 'New Scan' },
          { id: 'history', label: 'History Log' },
        ].map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(244, 248, 252, 0.95))' 
                  : 'transparent',
                color: isActive ? '#5B8DEF' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(91, 141, 239, 0.35)' : '1px solid transparent',
                boxShadow: isActive ? '0 4px 14px rgba(91, 141, 239, 0.16), inset 0 1px 1px #fff' : 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.22s ease'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* System Health Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.48rem 1rem',
          borderRadius: '30px',
          background: health?.status === 'healthy' ? 'rgba(112, 201, 168, 0.18)' : 'rgba(239, 139, 139, 0.18)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid ${health?.status === 'healthy' ? 'rgba(112, 201, 168, 0.6)' : 'rgba(239, 139, 139, 0.6)'}`,
          fontSize: '0.8rem',
          fontWeight: 800,
          color: health?.status === 'healthy' ? '#236c53' : '#b53838',
          boxShadow: '0 2px 8px rgba(36, 59, 83, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: health?.status === 'healthy' ? '#70C9A8' : '#EF8B8B',
            boxShadow: health?.status === 'healthy' ? '0 0 10px rgba(112, 201, 168, 0.9)' : '0 0 10px rgba(239, 139, 139, 0.9)'
          }} />
          <Cpu size={14} />
          {activeModelsCount}/{totalModelsCount || 9} AI Models Ready
        </div>

        <button 
          onClick={fetchHealth}
          title="Refresh model status"
          className="btn-secondary"
          style={{
            padding: '0.5rem',
            borderRadius: '10px'
          }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
