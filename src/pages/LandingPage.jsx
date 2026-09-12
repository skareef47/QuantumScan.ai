import React from 'react';
import { Activity, Brain, Heart, Stethoscope, ArrowRight, Sparkles, Play } from 'lucide-react';

export default function LandingPage({ onSelectModule, onOpenDemo }) {
  const modules = [
    {
      id: 'lung',
      title: 'Lung CT Engine',
      subtitle: 'Pulmonary Nodule Detection',
      icon: Activity,
      color: '#5B8DEF',
      tint: 'rgba(91, 141, 239, 0.14)',
      borderTint: 'rgba(91, 141, 239, 0.45)',
      model: 'Deep CNN Architecture',
      classes: ['Benign', 'Malignant', 'Normal'],
      input: 'CT Chest Scan',
      desc: 'High-precision convolutional pipeline for identifying pulmonary nodules and density anomalies.'
    },
    {
      id: 'brain',
      title: 'Brain MRI Engine',
      subtitle: 'Multi-Class Tumor Profiling',
      icon: Brain,
      color: '#9B8AFB',
      tint: 'rgba(155, 138, 251, 0.14)',
      borderTint: 'rgba(155, 138, 251, 0.45)',
      model: 'Hybrid ResNet Engine',
      classes: ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary'],
      input: 'Brain MRI Scan',
      desc: 'Advanced neural classification pipeline extracting biometric feature vectors for multi-class brain tumor analysis.'
    },
    {
      id: 'kidney',
      title: 'Kidney CT Engine',
      subtitle: '3D Volumetric Segmentation',
      icon: Heart,
      color: '#70C9A8',
      tint: 'rgba(112, 201, 168, 0.16)',
      borderTint: 'rgba(112, 201, 168, 0.5)',
      model: '3D Volumetric U-Net',
      classes: ['Non-Malignant', 'Malignant'],
      input: 'Abdominal CT Scan',
      desc: '3D U-Net volumetric region-of-interest segmentation and feature classifier for renal tissue evaluation.'
    },
    {
      id: 'breast',
      title: 'Breast Sonogram Engine',
      subtitle: 'Ultrasound Lesion Profiling',
      icon: Stethoscope,
      color: '#EF8B8B',
      tint: 'rgba(239, 139, 139, 0.16)',
      borderTint: 'rgba(239, 139, 139, 0.5)',
      model: 'EfficientNet-B0 3-Class Classifier',
      classes: ['Benign', 'Malignant', 'Normal'],
      input: 'Breast Ultrasound Scan',
      desc: 'Contrast-enhanced feature extraction and neural network classifier for ultrasound tissue profiling.'
    },
    {
      id: 'liver',
      title: 'Liver CT Engine',
      subtitle: 'Hepatic Tumor & Lesion Profiling',
      icon: Activity,
      color: '#F4C96B',
      tint: 'rgba(244, 201, 107, 0.2)',
      borderTint: 'rgba(244, 201, 107, 0.55)',
      model: '2D U-Net Volumetric Segmentor',
      classes: ['Background', 'Liver', 'Tumor'],
      input: 'Abdominal CT / Image Scan',
      desc: 'High-resolution UNet segmentation for liver parenchyma boundaries and hepatic tumor detection.'
    }
  ];

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1320px', margin: '0 auto' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.75rem', padding: '2rem 1rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '30px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(91, 141, 239, 0.35)',
          color: '#5B8DEF',
          fontSize: '0.85rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          marginBottom: '1.75rem',
          textTransform: 'uppercase',
          boxShadow: '0 4px 15px rgba(91, 141, 239, 0.12), inset 0 1px 1px #fff'
        }}>
          <Sparkles size={16} /> Production Clinical AI Diagnostics
        </div>
        
        <h1 style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.035em', marginBottom: '1.35rem', color: 'var(--text-primary)' }}>
          Next-Generation Diagnostic <br />
          <span className="text-gradient">Medical Intelligence Suite</span>
        </h1>
        
        <p style={{ fontSize: '1.18rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto 2.75rem', lineHeight: 1.6, fontWeight: 500 }}>
          Integrated multi-modal diagnostic suite powering rapid, deep-learning cancer evaluations across Lung, Brain, Kidney, Breast, and Liver medical imaging modalities.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={() => onSelectModule('lung')}
            style={{ fontSize: '1.05rem', padding: '0.95rem 2.4rem', borderRadius: '14px' }}
          >
            Launch Diagnostic Workstation <ArrowRight size={18} />
          </button>
          <button 
            id="demo-dashboard-btn"
            onClick={onOpenDemo}
            style={{
              fontSize: '1.05rem',
              padding: '0.95rem 2.2rem',
              borderRadius: '14px',
              border: '1px solid rgba(91, 141, 239, 0.45)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 246, 255, 0.9))',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#5B8DEF',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 16px rgba(91, 141, 239, 0.16), inset 0 1px 1px #fff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5B8DEF';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(91, 141, 239, 0.35), inset 0 1px 1px rgba(255,255,255,0.4)';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) icon.style.fill = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 246, 255, 0.9))';
              e.currentTarget.style.color = '#5B8DEF';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(91, 141, 239, 0.16), inset 0 1px 1px #fff';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) icon.style.fill = '#5B8DEF';
            }}
          >
            <Play size={18} fill="#5B8DEF" style={{ transition: 'all 0.2s' }} /> Demo
          </button>
        </div>
      </div>

      {/* Production Diagnostic Modules Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Clinical AI Diagnostic Engines</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.4rem 0 0', fontWeight: 500 }}>
              Select an engine to initiate high-throughput medical scan processing
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.85rem' }}>
          {modules.map((m) => {
            const IconComp = m.icon;
            return (
              <div 
                key={m.id} 
                className="glass-panel"
                style={{
                  padding: '2.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  borderTop: `4px solid ${m.color}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.35rem' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      backgroundColor: m.tint,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: `1px solid ${m.borderTint}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 14px ${m.color}25, inset 0 1px 1px rgba(255,255,255,0.8)`
                    }}>
                      <IconComp size={28} color={m.color} />
                    </div>

                    <span style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: m.tint,
                      color: m.color,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      border: `1px solid ${m.borderTint}`,
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)'
                    }}>
                      ONLINE
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                    {m.title}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: m.color, fontWeight: 700, marginBottom: '0.95rem' }}>
                    {m.subtitle}
                  </div>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '1.6rem', minHeight: '54px', lineHeight: 1.55 }}>
                    {m.desc}
                  </p>

                  {/* Specifications Card (Glass Inset Well) */}
                  <div className="glass-well" style={{
                    padding: '1.15rem 1.35rem',
                    marginBottom: '1.85rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '0.5rem', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Input Scan:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.input}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '0.5rem', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Output Classes:</span>
                      <span style={{ color: m.color, fontWeight: 800 }}>{m.classes.join(' • ')}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onSelectModule(m.id)}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.35rem',
                    borderRadius: '12px',
                    border: `1px solid ${m.borderTint}`,
                    background: `linear-gradient(135deg, ${m.tint}, rgba(255, 255, 255, 0.8))`,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 4px 14px ${m.color}18, inset 0 1px 1px #fff`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = m.color;
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 22px ${m.color}45, inset 0 1px 1px rgba(255,255,255,0.4)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${m.tint}, rgba(255, 255, 255, 0.8))`;
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = `0 4px 14px ${m.color}18, inset 0 1px 1px #fff`;
                  }}
                >
                  Open {m.title.split(' ')[0]} Workstation <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
