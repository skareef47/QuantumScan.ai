import React, { useEffect, useState } from 'react';
import { Activity, Brain, Heart, Stethoscope, Users, FileText, ArrowUpRight, Clock, Search, ShieldCheck } from 'lucide-react';
import { getDiagnosisHistory, getPatients, getHealthStatus } from '../services/api';

export default function Dashboard({ onSelectModule, onViewDiagnosis }) {
  const [history, setHistory] = useState([]);
  const [patients, setPatients] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [histData, patData, healthData] = await Promise.all([
          getDiagnosisHistory(),
          getPatients(),
          getHealthStatus().catch(() => null)
        ]);
        setHistory(histData || []);
        setPatients(patData || []);
        setHealth(healthData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalDiagnoses = history.length;
  const totalPatients = patients.length;
  const activeModelsCount = health?.models
    ? Object.values(health.models).filter(Boolean).length
    : 9;

  const countByCancer = {
    lung: history.filter(h => h.cancer_type === 'lung').length,
    brain: history.filter(h => h.cancer_type === 'brain').length,
    kidney: history.filter(h => h.cancer_type === 'kidney').length,
    breast: history.filter(h => h.cancer_type === 'breast').length,
    liver: history.filter(h => h.cancer_type === 'liver').length,
  };

  const getModuleColor = (type) => {
    switch (type) {
      case 'lung': return '#5B8DEF';
      case 'brain': return '#9B8AFB';
      case 'kidney': return '#70C9A8';
      case 'breast': return '#EF8B8B';
      case 'liver': return '#F4C96B';
      default: return '#5B8DEF';
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Clinical Analytics Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem', fontWeight: 500 }}>Real-time summary of AI cancer evaluations and telemetry</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => onSelectModule('lung')}
          style={{ padding: '0.85rem 1.8rem', borderRadius: '12px' }}
        >
          + New Diagnosis Scan
        </button>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.35rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.95rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL EVALUATIONS</span>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(91, 141, 239, 0.14)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(91, 141, 239, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 1px #fff'
            }}>
              <FileText size={20} color="#5B8DEF" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{totalDiagnoses}</div>
          <div style={{ fontSize: '0.825rem', color: '#236c53', marginTop: '0.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#70C9A8', boxShadow: '0 0 6px #70C9A8' }} /> All {activeModelsCount || 9} AI models active
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.95rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>REGISTERED PATIENTS</span>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(155, 138, 251, 0.14)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(155, 138, 251, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 1px #fff'
            }}>
              <Users size={20} color="#9B8AFB" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{totalPatients}</div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontWeight: 600 }}>
            Unique patient records
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.95rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>LUNG CT EVALS</span>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(91, 141, 239, 0.14)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(91, 141, 239, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 1px #fff'
            }}>
              <Activity size={20} color="#5B8DEF" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{countByCancer.lung}</div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontWeight: 600 }}>
            Deep CNN Architecture
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.95rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>LIVER CT EVALS</span>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 201, 107, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(244, 201, 107, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 1px #fff'
            }}>
              <Activity size={20} color="#F4C96B" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{countByCancer.liver}</div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontWeight: 600 }}>
            U-Net Volumetric Engine
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Launch Cancer Diagnostic Module</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {[
          { id: 'lung', name: 'Lung CT Scan', icon: Activity, color: '#5B8DEF', desc: 'Pulmonary nodule detection' },
          { id: 'brain', name: 'Brain MRI Scan', icon: Brain, color: '#9B8AFB', desc: 'Multi-class tumor profiling' },
          { id: 'kidney', name: 'Kidney CT Scan', icon: Heart, color: '#70C9A8', desc: '3D U-Net ROI segmentation' },
          { id: 'breast', name: 'Breast Ultrasound', icon: Stethoscope, color: '#EF8B8B', desc: 'Ultrasound lesion profiling' },
          { id: 'liver', name: 'Liver CT Scan', icon: Activity, color: '#F4C96B', desc: 'U-Net hepatic lesion profiling' }
        ].map((mod) => {
          const IconC = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className="glass-panel"
              style={{
                padding: '1.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1.1rem',
                borderLeft: `5px solid ${mod.color}`
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: `${mod.color}18`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${mod.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)'
              }}>
                <IconC size={22} color={mod.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.975rem', color: 'var(--text-primary)' }}>{mod.name}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 500 }}>{mod.desc}</div>
              </div>
              <ArrowUpRight size={18} color="var(--text-secondary)" />
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.35rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Recent Diagnostic Analysis Log</h2>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            No diagnostic scans registered yet. Select a module above to perform the first AI scan analysis!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(220, 230, 240, 0.9)', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>DATE / TIME</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>PATIENT</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>MODULE</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>PREDICTION</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>CONFIDENCE</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>AI MODEL</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((row) => (
                  <tr
                    key={row.diagnosis_id}
                    style={{ borderBottom: '1px solid rgba(220, 230, 240, 0.65)', transition: 'all 0.18s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(91, 141, 239, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1.1rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {row.patient_name} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>({row.patient_age}y, {row.patient_gender})</span>
                    </td>
                    <td style={{ padding: '1.1rem 1rem' }}>
                      <span style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: `${getModuleColor(row.cancer_type)}18`,
                        color: getModuleColor(row.cancer_type),
                        border: `1px solid ${getModuleColor(row.cancer_type)}40`,
                        backdropFilter: 'blur(8px)',
                        textTransform: 'uppercase',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)'
                      }}>
                        {row.cancer_type}
                      </span>
                    </td>
                    <td style={{ padding: '1.1rem 1rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                      {row.prediction}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {row.confidence != null ? `${(row.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {row.model_used}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => onViewDiagnosis(row)}
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', borderRadius: '10px' }}
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
