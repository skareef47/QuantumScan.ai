import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  ArrowLeft, 
  Cpu, 
  User, 
  Layers, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  ShieldAlert, 
  Loader2,
  Stethoscope,
  Info,
  Globe,
  Languages,
  RotateCcw,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { generateAIReport, BACKEND_URL } from '../services/api';

const REPORT_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
];

export default function ResultsPage({ diagnosis, onNewAnalysis, onBackToHistory }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [reportsByLanguage, setReportsByLanguage] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!diagnosis) return null;

  const currentReportEntry = reportsByLanguage[selectedLanguage] || null;
  const reportData = currentReportEntry?.report || null;
  const reportProvider = currentReportEntry?.provider || null;

  const predLower = (diagnosis.prediction || diagnosis.diagnosis || '').toLowerCase().trim();
  const isNormalOrNoTumor = [
    'normal', 'normal case', 'normal cases',
    'no tumor', 'no tumour', 'notumor', 'no_tumor',
    'no cancer detected', 'no cancer'
  ].includes(predLower);

  const isMalignant = ['malignant', 'glioma', 'meningioma', 'pituitary', 'cancer detected', 'cancer'].includes(predLower);
  const statusColor = isMalignant ? '#EF8B8B' : '#70C9A8';
  const statusTextColor = isMalignant ? '#b53838' : '#236c53';
  const statusBg = isMalignant ? 'rgba(239, 139, 139, 0.18)' : 'rgba(112, 201, 168, 0.18)';

  const downloadJSONReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(diagnosis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Diagnosis_Report_${diagnosis.diagnosis_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleGenerateReportForLanguage = async (langCode = selectedLanguage) => {
    // If already generated and cached, simply switch
    if (reportsByLanguage[langCode]) {
      setSelectedLanguage(langCode);
      return;
    }

    setSelectedLanguage(langCode);
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await generateAIReport({
        prediction: diagnosis.prediction,
        confidence: diagnosis.confidence,
        cancer_type: diagnosis.cancer_type,
        patient_name: diagnosis.patient_name,
        model_used: diagnosis.model_used,
        details: diagnosis.details,
        language: langCode
      });
      if (res && res.report) {
        setReportsByLanguage(prev => ({
          ...prev,
          [langCode]: {
            report: res.report,
            provider: res.provider
          }
        }));
      } else {
        setReportError('Unable to format report response.');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      const detail = err.response?.data?.detail || 'Failed to generate AI-assisted report. Please try again.';
      setReportError(detail);
    } finally {
      setReportLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!reportData) return;
    const textToCopy = reportData.raw_text || `${reportData.title}\n\nLanguage: ${reportData.language_label || selectedLanguage}\n\nAnalysis:\n${reportData.analysis}\n\nAI Model Result:\n${reportData.ai_model_result}\n\nConfidence:\n${reportData.confidence}\n\nInterpretation:\n${reportData.interpretation}\n\nSuggested Next Step:\n${reportData.suggested_next_step}\n\nDisclaimer:\n${reportData.disclaimer}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrintOrDownload = () => {
    if (!reportData) return;
    const text = reportData.raw_text || `${reportData.title}\n\nLanguage: ${reportData.language_label || selectedLanguage}\n\nAnalysis:\n${reportData.analysis}\n\nAI Model Result:\n${reportData.ai_model_result}\n\nModel Confidence:\n${reportData.confidence}\n\nInterpretation:\n${reportData.interpretation}\n\nSuggested Next Step:\n${reportData.suggested_next_step}\n\nDisclaimer:\n${reportData.disclaimer}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const langSuffix = selectedLanguage ? `_${selectedLanguage}` : '';
    link.href = url;
    link.download = `AI_Preliminary_Report_${diagnosis.diagnosis_id || 'scan'}${langSuffix}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const activeLangObj = REPORT_LANGUAGES.find(l => l.code === selectedLanguage) || REPORT_LANGUAGES[0];

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1020px', margin: '0 auto' }}>
      {/* Back Button Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn-secondary" onClick={onBackToHistory}>
          <ArrowLeft size={16} /> Back to History Log
        </button>

        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <button className="btn-secondary" onClick={downloadJSONReport}>
            <Download size={16} /> Export JSON
          </button>
          <button className="btn-primary" onClick={onNewAnalysis}>
            + New Analysis
          </button>
        </div>
      </div>

      {/* Main Result Glass Banner */}
      <div className="glass-panel" style={{
        padding: '2.75rem',
        marginBottom: '2.25rem',
        border: `2px solid ${statusColor}`,
        boxShadow: `0 12px 40px ${statusColor}30, inset 0 1px 2px #fff`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.5rem 1.15rem',
              borderRadius: '30px',
              backgroundColor: statusBg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${statusColor}`,
              color: statusTextColor,
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '1.35rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              boxShadow: 'inset 0 1px 1px #fff'
            }}>
              {isMalignant ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
              {diagnosis.cancer_type} Cancer Evaluation Result
            </div>

            <h1 style={{ fontSize: '2.9rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 0, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {diagnosis.prediction}
            </h1>
          </div>

          {/* Confidence Indicator Gauge */}
          {diagnosis.confidence != null && (
            <div className="glass-well" style={{
              padding: '1.6rem 2.4rem',
              borderRadius: '18px',
              textAlign: 'center',
              minWidth: '210px',
              boxShadow: '0 4px 15px rgba(36, 59, 83, 0.05), inset 0 1px 2px #fff'
            }}>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                MODEL CONFIDENCE
              </div>
              <div style={{ fontSize: '2.9rem', fontWeight: 900, color: statusTextColor, letterSpacing: '-0.02em' }}>
                {(diagnosis.confidence * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 600 }}>
                Softmax / Probability
              </div>
            </div>
          )}
        </div>

        {/* Multilingual AI-Assisted Preliminary Report Trigger & Language Selector */}
        <div style={{ marginTop: '2rem', paddingTop: '1.75rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={18} color="#9B8AFB" /> AI-Assisted Clinical Documentation
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Generate structured preliminary medical reports in English, Hindi, Telugu, Kannada, Malayalam, Tamil, or Bengali
              </div>
            </div>

            <button
              onClick={() => handleGenerateReportForLanguage(selectedLanguage)}
              disabled={reportLoading}
              style={{
                background: 'linear-gradient(135deg, #9B8AFB 0%, #5B8DEF 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                padding: '0.85rem 1.8rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                cursor: reportLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.95rem',
                boxShadow: '0 6px 20px rgba(155, 138, 251, 0.35), inset 0 1px 1px #fff',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                if (!reportLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 26px rgba(155, 138, 251, 0.5), inset 0 1px 1px #fff';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(155, 138, 251, 0.35), inset 0 1px 1px #fff';
              }}
            >
              {reportLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Generating in {activeLangObj.name}...
                </>
              ) : reportData ? (
                <>
                  <RotateCcw size={18} /> Regenerate ({activeLangObj.native})
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate Report in {activeLangObj.name}
                </>
              )}
            </button>
          </div>

          {/* Multilingual Selector Pill Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            flexWrap: 'wrap',
            padding: '0.75rem 1rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.4rem' }}>
              <Languages size={15} color="#5B8DEF" /> Report Language:
            </span>

            {REPORT_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              const isCached = !!reportsByLanguage[lang.code];

              return (
                <button
                  key={lang.code}
                  onClick={() => handleGenerateReportForLanguage(lang.code)}
                  disabled={reportLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: reportLoading ? 'not-allowed' : 'pointer',
                    border: isSelected ? '1px solid #5B8DEF' : '1px solid rgba(200, 215, 230, 0.6)',
                    background: isSelected 
                      ? 'linear-gradient(135deg, #9B8AFB 0%, #5B8DEF 100%)' 
                      : isCached 
                        ? 'rgba(240, 246, 255, 0.9)' 
                        : 'rgba(255, 255, 255, 0.8)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    boxShadow: isSelected 
                      ? '0 4px 12px rgba(91, 141, 239, 0.3)' 
                      : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  title={`Generate / View report in ${lang.name} (${lang.native})`}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>{lang.flag}</span>
                  <span>{lang.native}</span>
                  <span style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.65 }}>
                    ({lang.name})
                  </span>
                  {isCached && !isSelected && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#70C9A8',
                      display: 'inline-block',
                      marginLeft: '2px'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Alert if Report Generation fails */}
      {reportError && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          backgroundColor: 'rgba(239, 139, 139, 0.16)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(239, 139, 139, 0.6)',
          color: '#b53838',
          marginBottom: '2.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.95rem',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(239, 139, 139, 0.15)'
        }}>
          <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.975rem', marginBottom: '0.25rem' }}>Report Generation Notice</div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{reportError}</div>
          </div>
        </div>
      )}

      {/* Generated AI-Assisted Preliminary Report Card */}
      {reportData && (
        <div className="glass-panel" style={{
          padding: '2.5rem',
          marginBottom: '2.25rem',
          border: '2px solid rgba(155, 138, 251, 0.45)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 12px 35px rgba(155, 138, 251, 0.15), inset 0 1px 2px #fff'
        }}>
          {/* Report Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #9B8AFB 0%, #5B8DEF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(155, 138, 251, 0.3)'
              }}>
                <FileText size={22} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {reportData.title || "AI-ASSISTED PRELIMINARY REPORT"}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{
                    fontSize: '0.725rem',
                    backgroundColor: 'rgba(91, 141, 239, 0.14)',
                    color: '#4170d1',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <Globe size={12} /> {activeLangObj.flag} {reportData.language_label || `${activeLangObj.native} (${activeLangObj.name})`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#8672f5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    • {reportProvider || "Active Engine"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Copy & Download */}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                className="btn-secondary"
                onClick={handleCopyReport}
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', borderRadius: '10px' }}
              >
                {copied ? <Check size={16} color="#70C9A8" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Report"}
              </button>

              <button
                className="btn-secondary"
                onClick={handlePrintOrDownload}
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', borderRadius: '10px' }}
              >
                <Download size={16} /> Download Report
              </button>
            </div>
          </div>

          {/* Structured Report Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            
            {/* Section 1: Analysis */}
            <div className="glass-well" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#5B8DEF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Stethoscope size={15} /> Analysis / विश्लेषण
              </div>
              <div style={{ lineHeight: 1.6, fontWeight: 500 }}>
                {reportData.analysis}
              </div>
            </div>

            {/* Section 2 & 3: Model Result & Confidence in 2-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="glass-well" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Cpu size={15} /> AI Model Result
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isMalignant ? '#b53838' : '#236c53' }}>
                  {reportData.ai_model_result}
                </div>
              </div>

              <div className="glass-well" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Info size={15} /> Model Confidence
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {reportData.confidence}
                </div>
              </div>
            </div>

            {/* Section 4: Interpretation */}
            <div className="glass-well" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9B8AFB', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                Interpretation & Clinical Meaning / अर्थ एवं अभिप्राय
              </div>
              <div style={{ lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-line' }}>
                {reportData.interpretation}
              </div>
            </div>

            {/* Section 5: Suggested Next Step */}
            <div className="glass-well" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #5B8DEF' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#5B8DEF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                Suggested Next Step & Further Considerations / अग्रिम कदम
              </div>
              <div style={{ lineHeight: 1.6, fontWeight: 600, whiteSpace: 'pre-line' }}>
                {reportData.suggested_next_step}
              </div>
            </div>

            {/* Section 6: Medical Disclaimer */}
            <div style={{
              padding: '1.1rem 1.4rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 201, 107, 0.14)',
              border: '1px solid rgba(244, 201, 107, 0.45)',
              color: '#8c610b',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Clinical Research Disclaimer / अस्वीकरण</strong>
                {reportData.disclaimer}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Liver Specific Volumetric Tumour Measurement Card */}
      {diagnosis.cancer_type?.toLowerCase() === 'liver' && diagnosis.details?.tumor_measurement && (
        <div className="glass-panel" style={{
          padding: '2.5rem',
          marginBottom: '2.25rem',
          border: '2px solid rgba(244, 201, 107, 0.45)',
          boxShadow: '0 12px 35px rgba(244, 201, 107, 0.15), inset 0 1px 2px #fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F4C96B 0%, #E89A3C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(244, 201, 107, 0.35)'
              }}>
                <Layers size={22} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Volumetric Tumour Measurement & Lesion Extent
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Calculated from 3D CT predicted segmentation mask (Label: Hepatic Tumour)
                </div>
              </div>
            </div>

            {(() => {
              const isLiverDetected = !isNormalOrNoTumor && !!diagnosis.details.tumor_measurement.tumor_detected;
              return (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 1.1rem',
                  borderRadius: '20px',
                  backgroundColor: isLiverDetected ? 'rgba(239, 139, 139, 0.18)' : 'rgba(112, 201, 168, 0.18)',
                  border: `1px solid ${isLiverDetected ? '#EF8B8B' : '#70C9A8'}`,
                  color: isLiverDetected ? '#b53838' : '#236c53',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}>
                  {isLiverDetected ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                  {isLiverDetected ? "Tumour Detected: YES" : "NO DETECTION"}
                </div>
              );
            })()}
          </div>

          {/* Metric Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Tumour Volume
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: (!isNormalOrNoTumor && diagnosis.details.tumor_measurement.tumor_detected) ? '#b53838' : '#236c53' }}>
                {!isNormalOrNoTumor && diagnosis.details.tumor_measurement.tumor_detected ? (diagnosis.details.tumor_measurement.volume_cm3?.toFixed(4) || "0.0000") : "0.0000"} <span style={{ fontSize: '1rem', fontWeight: 700 }}>cm³</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {!isNormalOrNoTumor && diagnosis.details.tumor_measurement.tumor_detected ? (diagnosis.details.tumor_measurement.tumor_voxels?.toLocaleString() || 0) : 0} voxels
              </div>
            </div>

            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Maximum Extent / Diameter
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#5B8DEF' }}>
                {!isNormalOrNoTumor && diagnosis.details.tumor_measurement.tumor_detected ? (diagnosis.details.tumor_measurement.maximum_extent_mm?.toFixed(2) || diagnosis.details.tumor_measurement.diameter_mm?.toFixed(2) || "0.00") : "0.00"} <span style={{ fontSize: '1rem', fontWeight: 700 }}>mm</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Physical bounding extent
              </div>
            </div>

            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Connected Components
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {!isNormalOrNoTumor && diagnosis.details.tumor_measurement.tumor_detected ? (diagnosis.details.tumor_measurement.components || 0) : 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Largest: {!isNormalOrNoTumor && diagnosis.details.tumor_measurement.tumor_detected ? (diagnosis.details.tumor_measurement.largest_component_voxels?.toLocaleString() || 0) : 0} voxels
              </div>
            </div>
          </div>

          {/* Detailed Dimensions Breakdown */}
          <div className="glass-well" style={{ padding: '1.4rem 1.6rem' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.9rem' }}>
              3D Spatial Bounding Dimensions (X × Y × Z)
            </div>
            {isNormalOrNoTumor || !diagnosis.details.tumor_measurement.tumor_detected ? (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(112, 201, 168, 0.12)',
                border: '1px solid rgba(112, 201, 168, 0.35)',
                color: '#236c53',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem'
              }}>
                <CheckCircle size={16} color="#70C9A8" />
                NO DIAGNOSTIC LOCATION DETECTED
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>X Dimension:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{diagnosis.details.tumor_measurement.x_dimension_mm?.toFixed(2) || "0.00"} mm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Y Dimension:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{diagnosis.details.tumor_measurement.y_dimension_mm?.toFixed(2) || "0.00"} mm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Z Dimension:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{diagnosis.details.tumor_measurement.z_dimension_mm?.toFixed(2) || "0.00"} mm</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lung Specific Volumetric Nodule Measurement Card */}
      {diagnosis.cancer_type?.toLowerCase() === 'lung' && diagnosis.details?.nodule_measurement && (
        <div className="glass-panel" style={{
          padding: '2.5rem',
          marginBottom: '2.25rem',
          border: '2px solid rgba(91, 141, 239, 0.45)',
          boxShadow: '0 12px 35px rgba(91, 141, 239, 0.15), inset 0 1px 2px #fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #5B8DEF 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(91, 141, 239, 0.35)'
              }}>
                <Layers size={22} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Volumetric Pulmonary Nodule Measurement & Spatial Extent
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Calculated from 3D CT DynUNet segmentation mask (Label: Pulmonary Nodule) with authentic voxel calibration
                </div>
              </div>
            </div>

            {(() => {
              const isNoduleDetected = !isNormalOrNoTumor && !!diagnosis.details.nodule_measurement.nodule_detected;
              return (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 1.1rem',
                  borderRadius: '20px',
                  backgroundColor: isNoduleDetected ? 'rgba(239, 139, 139, 0.18)' : 'rgba(112, 201, 168, 0.18)',
                  border: `1px solid ${isNoduleDetected ? '#EF8B8B' : '#70C9A8'}`,
                  color: isNoduleDetected ? '#b53838' : '#236c53',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}>
                  {isNoduleDetected ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                  {isNoduleDetected ? "Nodule Detected: YES" : "NO DETECTION"}
                </div>
              );
            })()}
          </div>

          {/* Metric Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Nodule Volume
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: (!isNormalOrNoTumor && diagnosis.details.nodule_measurement.nodule_detected) ? '#b53838' : '#236c53' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement.nodule_detected ? (diagnosis.details.nodule_measurement.volume_cm3?.toFixed(4) || "0.0000") : "0.0000"} <span style={{ fontSize: '1rem', fontWeight: 700 }}>cm³</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement.nodule_detected ? ((diagnosis.details.nodule_measurement.voxel_count || diagnosis.details.nodule_measurement.tumor_voxels || 0)?.toLocaleString()) : 0} voxels
              </div>
            </div>

            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Maximum Extent / Diameter
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#5B8DEF' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement.nodule_detected ? (diagnosis.details.nodule_measurement.maximum_diameter_mm ?? diagnosis.details.nodule_measurement.maximum_extent_mm ?? diagnosis.details.nodule_measurement.diameter_mm ?? 0).toFixed(2) : "0.00"} <span style={{ fontSize: '1rem', fontWeight: 700 }}>mm</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                ({(!isNormalOrNoTumor && diagnosis.details.nodule_measurement.nodule_detected ? (diagnosis.details.nodule_measurement.maximum_diameter_cm ?? ((diagnosis.details.nodule_measurement.diameter_mm ?? 0) / 10.0)) : 0).toFixed(2)} cm)
              </div>
            </div>

            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Connected Components
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement.nodule_detected ? (diagnosis.details.nodule_measurement.components || 0) : 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Largest: {!isNormalOrNoTumor && diagnosis.details.nodule_measurement.nodule_detected ? (diagnosis.details.nodule_measurement.largest_component_voxels?.toLocaleString() || 0) : 0} voxels
              </div>
            </div>
          </div>

          {/* Detailed Dimensions Breakdown */}
          <div className="glass-well" style={{ padding: '1.4rem 1.6rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.9rem' }}>
              3D Spatial Dimensions & Geometric Axes
            </div>
            {isNormalOrNoTumor || !diagnosis.details.nodule_measurement.nodule_detected ? (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(112, 201, 168, 0.12)',
                border: '1px solid rgba(112, 201, 168, 0.35)',
                color: '#236c53',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem'
              }}>
                <CheckCircle size={16} color="#70C9A8" />
                NO DIAGNOSTIC LOCATION DETECTED
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Long Axis:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(diagnosis.details.nodule_measurement.long_axis_mm ?? diagnosis.details.nodule_measurement.maximum_extent_mm ?? 0).toFixed(2)} mm
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Short Axis:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(diagnosis.details.nodule_measurement.short_axis_mm ?? 0).toFixed(2)} mm
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>X Dimension:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(diagnosis.details.nodule_measurement.dimensions_mm?.x ?? diagnosis.details.nodule_measurement.x_dimension_mm ?? 0).toFixed(2)} mm
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Y Dimension:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(diagnosis.details.nodule_measurement.dimensions_mm?.y ?? diagnosis.details.nodule_measurement.y_dimension_mm ?? 0).toFixed(2)} mm
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Z Dimension:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(diagnosis.details.nodule_measurement.dimensions_mm?.z ?? diagnosis.details.nodule_measurement.z_dimension_mm ?? 0).toFixed(2)} mm
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Size-Based Lung T-Category Section */}
          {!isNormalOrNoTumor && diagnosis.details.nodule_measurement.nodule_detected && diagnosis.details.nodule_measurement.t_category && (
            <div className="glass-well" style={{
              padding: '1.4rem 1.6rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(91, 141, 239, 0.05)',
              border: '1px solid rgba(91, 141, 239, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Size-Based Primary Tumor T-Category:
                  </span>
                  <span style={{
                    padding: '0.25rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: diagnosis.details.nodule_measurement.t_category.available ? '#5B8DEF' : 'rgba(100, 116, 139, 0.2)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '1rem',
                    letterSpacing: '0.02em'
                  }}>
                    {diagnosis.details.nodule_measurement.t_category.category}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {diagnosis.details.nodule_measurement.t_category.staging_edition || "AJCC 8th Edition (NSCLC)"}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.6rem' }}>
                {diagnosis.details.nodule_measurement.t_category.description}
              </div>

              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid var(--border-color)',
                fontSize: '0.785rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Clinical Staging Disclaimer:</strong> Size-based T-category support only.
                Tumor size alone does not determine complete TNM stage or clinical stage (Stage I–IV). Regional lymph nodes (N) and distant metastasis (M)
                must be assessed by a qualified oncologist.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lung Specific 2D Nodule Localization & Measurement Card (for JPG/PNG/DCM) */}
      {diagnosis.cancer_type?.toLowerCase() === 'lung' && diagnosis.details?.nodule_measurement_2d && (
        <div className="glass-panel" style={{
          padding: '2.5rem',
          marginBottom: '2.25rem',
          border: '2px solid rgba(91, 141, 239, 0.45)',
          boxShadow: '0 12px 35px rgba(91, 141, 239, 0.15), inset 0 1px 2px #fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}>
                <Layers size={22} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  2D Pulmonary Nodule Localization & Measurement
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Convex Hull Feret caliper & anatomical gating on CT slices (LIDC-IDRI trained U-Net)
                </div>
              </div>
            </div>

            {(() => {
              const isNodule2DDetected = !isNormalOrNoTumor && !!diagnosis.details.nodule_measurement_2d.nodule_detected;
              return (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 1.1rem',
                  borderRadius: '20px',
                  backgroundColor: isNodule2DDetected ? 'rgba(239, 139, 139, 0.18)' : 'rgba(112, 201, 168, 0.18)',
                  border: `1px solid ${isNodule2DDetected ? '#EF8B8B' : '#70C9A8'}`,
                  color: isNodule2DDetected ? '#b53838' : '#236c53',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}>
                  {isNodule2DDetected ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                  {isNodule2DDetected ? "Nodule Detected: YES" : "NO DETECTION"}
                </div>
              );
            })()}
          </div>

          {/* Metric Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Nodule Area
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: (!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected) ? '#b53838' : '#236c53' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected
                  ? (diagnosis.details.nodule_measurement_2d.calibration_available
                      ? `${diagnosis.details.nodule_measurement_2d.area_mm2?.toFixed(2)} mm²`
                      : `${diagnosis.details.nodule_measurement_2d.area_pixels?.toLocaleString()} px`)
                  : (diagnosis.details.nodule_measurement_2d.calibration_available ? "0.00 mm²" : "0 px")}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected
                  ? (diagnosis.details.nodule_measurement_2d.calibration_available
                      ? `${diagnosis.details.nodule_measurement_2d.area_pixels} px (${diagnosis.details.nodule_measurement_2d.area_cm2?.toFixed(4)} cm²)`
                      : "2D cross-sectional pixel area")
                  : (diagnosis.details.nodule_measurement_2d.calibration_available ? "0 px (0.0000 cm²)" : "2D cross-sectional pixel area")}
              </div>
            </div>

            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Maximum Feret Diameter
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#5B8DEF' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected
                  ? (diagnosis.details.nodule_measurement_2d.calibration_available
                      ? `${diagnosis.details.nodule_measurement_2d.maximum_diameter_mm?.toFixed(2)} mm`
                      : `${(diagnosis.details.nodule_measurement_2d.maximum_diameter_pixels ?? Math.max(diagnosis.details.nodule_measurement_2d.width_pixels, diagnosis.details.nodule_measurement_2d.height_pixels)).toFixed(1)} px`)
                  : (diagnosis.details.nodule_measurement_2d.calibration_available ? "0.00 mm" : "0.0 px")}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected
                  ? (diagnosis.details.nodule_measurement_2d.calibration_available
                      ? `(${diagnosis.details.nodule_measurement_2d.maximum_diameter_cm?.toFixed(2)} cm)`
                      : "Peak Euclidean caliper span")
                  : (diagnosis.details.nodule_measurement_2d.calibration_available ? "(0.00 cm)" : "Peak Euclidean caliper span")}
              </div>
            </div>

            <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Nodule Confidence
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected
                  ? `${(diagnosis.details.nodule_measurement_2d.probability * 100).toFixed(1)}%`
                  : "0.0%"}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Components: {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected ? (diagnosis.details.nodule_measurement_2d.components || 0) : 0}
              </div>
            </div>
          </div>

          {/* Detailed Dimensions Breakdown */}
          <div className="glass-well" style={{ padding: '1.4rem 1.6rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.9rem' }}>
              2D Geometric Axes & Bounding Coordinates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Long Axis:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                  {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected
                    ? (diagnosis.details.nodule_measurement_2d.calibration_available
                        ? `${diagnosis.details.nodule_measurement_2d.long_axis_mm?.toFixed(2)} mm (${diagnosis.details.nodule_measurement_2d.long_axis_pixels?.toFixed(1)} px)`
                        : `${diagnosis.details.nodule_measurement_2d.long_axis_pixels?.toFixed(1) || diagnosis.details.nodule_measurement_2d.width_pixels} px`)
                    : (diagnosis.details.nodule_measurement_2d.calibration_available ? "0.00 mm (0.0 px)" : "0.0 px")}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Short Axis (Orthogonal):</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                  {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected
                    ? (diagnosis.details.nodule_measurement_2d.calibration_available
                        ? `${diagnosis.details.nodule_measurement_2d.short_axis_mm?.toFixed(2)} mm (${diagnosis.details.nodule_measurement_2d.short_axis_pixels?.toFixed(1)} px)`
                        : `${diagnosis.details.nodule_measurement_2d.short_axis_pixels?.toFixed(1) || diagnosis.details.nodule_measurement_2d.height_pixels} px`)
                    : (diagnosis.details.nodule_measurement_2d.calibration_available ? "0.00 mm (0.0 px)" : "0.0 px")}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Bounding Box:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected
                    ? `[${diagnosis.details.nodule_measurement_2d.bounding_box?.x_min}, ${diagnosis.details.nodule_measurement_2d.bounding_box?.y_min}] → [${diagnosis.details.nodule_measurement_2d.bounding_box?.x_max}, ${diagnosis.details.nodule_measurement_2d.bounding_box?.y_max}]`
                    : "NO DIAGNOSTIC LOCATION DETECTED"}
                </span>
              </div>
            </div>
          </div>

          {/* Size-Based Lung T-Category Section (when calibrated) */}
          {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.nodule_detected && diagnosis.details.nodule_measurement_2d.calibration_available && diagnosis.details.nodule_measurement_2d.t_category && (
            <div className="glass-well" style={{
              padding: '1.4rem 1.6rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Size-Based Primary Tumor T-Category:
                  </span>
                  <span style={{
                    padding: '0.25rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: diagnosis.details.nodule_measurement_2d.t_category.available ? '#10B981' : 'rgba(100, 116, 139, 0.2)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '1rem',
                    letterSpacing: '0.02em'
                  }}>
                    {diagnosis.details.nodule_measurement_2d.t_category.category}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {diagnosis.details.nodule_measurement_2d.t_category.staging_edition || "AJCC 8th Edition (NSCLC)"}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.6rem' }}>
                {diagnosis.details.nodule_measurement_2d.t_category.description}
              </div>

              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid var(--border-color)',
                fontSize: '0.785rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Clinical Staging Disclaimer:</strong> Size-based T-category support only.
                Final TNM/stage requires additional clinical information (nodal status N, metastasis M, and histopathological evaluation).
              </div>
            </div>
          )}

          {/* Candidate Components Anatomical Telemetry Table */}
          {!isNormalOrNoTumor && diagnosis.details.nodule_measurement_2d.candidate_components_analysis && diagnosis.details.nodule_measurement_2d.candidate_components_analysis.length > 0 && (
            <div className="glass-well" style={{ padding: '1.4rem 1.6rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Candidate Components Anatomical Telemetry</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {diagnosis.details.nodule_measurement_2d.anatomical_summary?.accepted_pulmonary_candidates || 0} Accepted / {diagnosis.details.nodule_measurement_2d.anatomical_summary?.total_candidates_found || diagnosis.details.nodule_measurement_2d.candidate_components_analysis.length} Found
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.5rem 0.6rem' }}>ID</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Status</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Diagnostic Assessment</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Area</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Centroid</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>In Lung</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Dist to Boundary</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Peak Prob</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnosis.details.nodule_measurement_2d.candidate_components_analysis.map((comp) => {
                      const isAccepted = comp.status === 'accepted';
                      return (
                        <tr key={comp.component_id} style={{ borderBottom: '1px solid rgba(200, 215, 230, 0.3)' }}>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 800 }}>#{comp.component_id}</td>
                          <td style={{ padding: '0.55rem 0.6rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '12px',
                              fontSize: '0.725rem',
                              fontWeight: 800,
                              backgroundColor: isAccepted ? 'rgba(112, 201, 168, 0.2)' : 'rgba(239, 139, 139, 0.2)',
                              color: isAccepted ? '#236c53' : '#b53838',
                              textTransform: 'uppercase'
                            }}>
                              {comp.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 600, color: isAccepted ? 'var(--text-primary)' : '#b53838' }}>
                            {comp.diagnostic_reason}
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', fontFamily: 'var(--font-mono)' }}>{comp.area_pixels} px</td>
                          <td style={{ padding: '0.55rem 0.6rem', fontFamily: 'var(--font-mono)' }}>({comp.centroid?.x}, {comp.centroid?.y})</td>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 700 }}>{comp.percentage_inside_lung_region}%</td>
                          <td style={{ padding: '0.55rem 0.6rem' }}>{comp.distance_to_lung_boundary_px} px</td>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 700 }}>{(comp.peak_probability * 100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isNormalOrNoTumor && (
            <div className="glass-well" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#236c53', fontWeight: 700, fontSize: '0.875rem' }}>
              <CheckCircle size={16} color="#70C9A8" />
              NO DIAGNOSTIC LOCATION DETECTED — Scan evaluated as clear anatomy.
            </div>
          )}

          {!diagnosis.details.nodule_measurement_2d.calibration_available && (
            <div style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(91, 141, 239, 0.08)',
              border: '1px solid rgba(91, 141, 239, 0.25)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <Info size={16} color="#5B8DEF" />
              <span>Physical scale unavailable — measurements shown in pixels. Size-based T-category requires calibrated physical dimensions.</span>
            </div>
          )}
        </div>
      )}

      {/* Breast Specific U-Net Lesion Segmentation & Spatial Measurement Card */}
      {diagnosis.cancer_type?.toLowerCase() === 'breast' && (diagnosis.segmentation || diagnosis.details?.segmentation) && (() => {
        const seg = diagnosis.segmentation || diagnosis.details?.segmentation;
        const isDetected = !isNormalOrNoTumor && !!seg.detected;
        return (
          <div className="glass-panel" style={{
            padding: '2.5rem',
            marginBottom: '2.25rem',
            border: '2px solid rgba(236, 72, 153, 0.45)',
            boxShadow: '0 12px 35px rgba(236, 72, 153, 0.15), inset 0 1px 2px #fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)'
                }}>
                  <Layers size={22} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    Breast Lesion Segmentation & Spatial Measurement
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Calculated from BUSI U-Net segmentation mask (256×256 model resolution)
                  </div>
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1.1rem',
                borderRadius: '20px',
                backgroundColor: isDetected ? 'rgba(239, 139, 139, 0.18)' : 'rgba(112, 201, 168, 0.18)',
                border: `1px solid ${isDetected ? '#EF8B8B' : '#70C9A8'}`,
                color: isDetected ? '#b53838' : '#236c53',
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'uppercase'
              }}>
                {isDetected ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                {isDetected ? "Lesion Detected: YES" : "NO DETECTION"}
              </div>
            </div>

            {/* Metric Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Lesion Area
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: isDetected ? '#b53838' : '#236c53' }}>
                  {isDetected
                    ? (seg.calibration_available && seg.area_mm2 != null
                        ? `${seg.area_mm2?.toFixed(2)} mm²`
                        : `${(seg.area_pixels || 0).toLocaleString()} px`)
                    : (seg.calibration_available && seg.area_mm2 != null ? "0.00 mm²" : "0 px")}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {isDetected
                    ? (seg.calibration_available && seg.area_mm2 != null
                        ? `${(seg.area_pixels || 0).toLocaleString()} px (Physical area)`
                        : "Model-space cross-sectional pixels")
                    : (seg.calibration_available ? "0 px (Physical area)" : "Model-space cross-sectional pixels")}
                </div>
              </div>

              <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Maximum Diameter
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#5B8DEF' }}>
                  {isDetected
                    ? (seg.calibration_available && seg.maximum_diameter_mm != null
                        ? `${seg.maximum_diameter_mm?.toFixed(2)} mm`
                        : `${(seg.maximum_diameter_pixels ?? 0).toFixed(1)} px`)
                    : (seg.calibration_available && seg.maximum_diameter_mm != null ? "0.00 mm" : "0.0 px")}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {isDetected
                    ? (seg.calibration_available && seg.maximum_diameter_mm != null
                        ? `(${((seg.maximum_diameter_mm || 0) / 10.0).toFixed(2)} cm)`
                        : "Convex hull Euclidean caliper span")
                    : (seg.calibration_available ? "(0.00 cm)" : "Convex hull Euclidean caliper span")}
                </div>
              </div>

              <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Spatial Dimensions (W × H)
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {isDetected
                    ? (seg.calibration_available && seg.width_mm != null && seg.height_mm != null
                        ? `${seg.width_mm?.toFixed(1)} × ${seg.height_mm?.toFixed(1)} mm`
                        : `${(seg.width_pixels ?? 0).toFixed(1)} × ${(seg.height_pixels ?? 0).toFixed(1)} px`)
                    : (seg.calibration_available && seg.width_mm != null ? "0.0 × 0.0 mm" : "0.0 × 0.0 px")}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {isDetected ? "Lesion bounding box span" : "NO DIAGNOSTIC LOCATION DETECTED"}
                </div>
              </div>
            </div>

            {/* Detailed Dimensions Breakdown */}
            <div className="glass-well" style={{ padding: '1.4rem 1.6rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.9rem' }}>
                Spatial Geometry & Metric Telemetry
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Area:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isDetected
                      ? (seg.calibration_available && seg.area_mm2 != null
                          ? `${seg.area_mm2?.toFixed(2)} mm² (${seg.area_pixels} px)`
                          : `${(seg.area_pixels || 0).toLocaleString()} px`)
                      : (seg.calibration_available && seg.area_mm2 != null ? "0.00 mm² (0 px)" : "0 px")}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Width:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isDetected
                      ? (seg.calibration_available && seg.width_mm != null
                          ? `${seg.width_mm?.toFixed(2)} mm (${seg.width_pixels?.toFixed(1)} px)`
                          : `${(seg.width_pixels ?? 0).toFixed(1)} px`)
                      : (seg.calibration_available && seg.width_mm != null ? "0.00 mm (0.0 px)" : "0.0 px")}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Height:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isDetected
                      ? (seg.calibration_available && seg.height_mm != null
                          ? `${seg.height_mm?.toFixed(2)} mm (${seg.height_pixels?.toFixed(1)} px)`
                          : `${(seg.height_pixels ?? 0).toFixed(1)} px`)
                      : (seg.calibration_available && seg.height_mm != null ? "0.00 mm (0.0 px)" : "0.0 px")}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Max Diameter:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isDetected
                      ? (seg.calibration_available && seg.maximum_diameter_mm != null
                          ? `${seg.maximum_diameter_mm?.toFixed(2)} mm (${seg.maximum_diameter_pixels?.toFixed(1)} px)`
                          : `${(seg.maximum_diameter_pixels ?? 0).toFixed(1)} px`)
                      : (seg.calibration_available && seg.maximum_diameter_mm != null ? "0.00 mm (0.0 px)" : "0.0 px")}
                  </span>
                </div>
              </div>
            </div>

            {/* Calibration Notice Banner or No Diagnostic Location Banner */}
            {isNormalOrNoTumor ? (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(112, 201, 168, 0.12)',
                border: '1px solid rgba(112, 201, 168, 0.35)',
                fontSize: '0.85rem',
                color: '#236c53',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: 700
              }}>
                <CheckCircle size={16} color="#70C9A8" />
                <span>NO DIAGNOSTIC LOCATION DETECTED — Primary classification evaluated ultrasound scan as Normal.</span>
              </div>
            ) : seg.calibration_available ? (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.85rem',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <CheckCircle size={16} color="#10B981" />
                <span>Physical spatial calibration verified. Physical measurements (mm &amp; mm²) computed using authentic pixel spacing.</span>
              </div>
            ) : (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <Info size={16} color="#EC4899" />
                <span>Physical scale unavailable — measurements reported in 256×256 model-space pixels. Physical dimensions (mm / mm²) require ultrasound spatial calibration.</span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Brain Specific YOLO11n + SAM 2.1 Tumor Spatial Analysis Card */}
      {diagnosis.cancer_type?.toLowerCase() === 'brain' && (diagnosis.tumor_analysis || diagnosis.details?.tumor_analysis) && (() => {
        const analysis = diagnosis.tumor_analysis || diagnosis.details?.tumor_analysis;
        const isDetected = !isNormalOrNoTumor && !!analysis.detected;
        const det = analysis.detection || {};
        const seg = analysis.segmentation || {};
        const meas = analysis.measurements || {};
        const anatLoc = analysis.anatomical_location || {};
        const isCalibrated = !!analysis.calibration_available;

        return (
          <div className="glass-panel" style={{
            padding: '2.5rem',
            marginBottom: '2.25rem',
            border: '2px solid rgba(155, 138, 251, 0.45)',
            boxShadow: '0 12px 35px rgba(155, 138, 251, 0.15), inset 0 1px 2px #fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #9B8AFB 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(155, 138, 251, 0.35)'
                }}>
                  <Layers size={22} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    Tumor Spatial Analysis &amp; Anatomical Localization
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {det.model || 'YOLO11n + SAM 2.1'} localization &amp; boundary caliper measurement
                  </div>
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1.1rem',
                borderRadius: '20px',
                backgroundColor: isDetected ? 'rgba(239, 139, 139, 0.18)' : 'rgba(112, 201, 168, 0.18)',
                border: `1px solid ${isDetected ? '#EF8B8B' : '#70C9A8'}`,
                color: isDetected ? '#b53838' : '#236c53',
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'uppercase'
              }}>
                {isDetected ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                {isDetected ? "Tumor Detected: YES" : "NO DETECTION"}
              </div>
            </div>

            {/* Identified Anatomical Brain Location Highlight Banner */}
            {isDetected && (
              <div style={{
                padding: '1.25rem 1.6rem',
                borderRadius: '14px',
                backgroundColor: 'rgba(155, 138, 251, 0.12)',
                border: '1.5px solid rgba(155, 138, 251, 0.35)',
                marginBottom: '1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 4px 16px rgba(155, 138, 251, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(155, 138, 251, 0.22)',
                    border: '1px solid rgba(155, 138, 251, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Stethoscope size={22} color="#7C3AED" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Identified Anatomical Location in Brain
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem', letterSpacing: '-0.01em' }}>
                      {anatLoc.region || (predLower.includes('pituitary') ? 'Sellar / Suprasellar Region (Pituitary Fossa)' : 'Cerebral Hemisphere Region')}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{anatLoc.hemisphere || 'Brain Hemisphere'}</span>
                      {anatLoc.depth ? ` • ${anatLoc.depth}` : ''}
                      {meas.centroid ? ` • Centroid: (${meas.centroid.x}, ${meas.centroid.y}) px` : ''}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(155, 138, 251, 0.3)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#6D28D9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                  {det.model || 'Spatial Localization'}
                </div>
              </div>
            )}

            {/* Metric Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Tumor Area
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: isDetected ? '#b53838' : '#236c53' }}>
                  {isDetected
                    ? (isCalibrated && meas.area_mm2 != null
                        ? `${meas.area_mm2?.toFixed(2)} mm²`
                        : `${(meas.area_px2 || 0).toLocaleString()} px²`)
                    : (isCalibrated && meas.area_mm2 != null ? "0.00 mm²" : "0 px²")}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {isDetected
                    ? (isCalibrated && meas.area_mm2 != null
                        ? `${(meas.area_px2 || 0).toLocaleString()} px² (Calibrated area)`
                        : "Segmented foreground lesion pixels")
                    : (isCalibrated ? "0 px² (Calibrated area)" : "Foreground lesion pixels")}
                </div>
              </div>

              <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Maximum Diameter
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#5B8DEF' }}>
                  {isDetected
                    ? (isCalibrated && meas.maximum_diameter_mm != null
                        ? `${meas.maximum_diameter_mm?.toFixed(2)} mm`
                        : `${(meas.maximum_diameter_px ?? 0).toFixed(1)} px`)
                    : (isCalibrated && meas.maximum_diameter_mm != null ? "0.00 mm" : "0.0 px")}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {isDetected
                    ? (isCalibrated && meas.maximum_diameter_mm != null
                        ? `(${((meas.maximum_diameter_mm || 0) / 10.0).toFixed(2)} cm)`
                        : "Convex hull Feret caliper span")
                    : (isCalibrated ? "(0.00 cm)" : "Convex hull Feret caliper span")}
                </div>
              </div>

              <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Tumor Dimensions (W × H)
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {isDetected
                    ? (isCalibrated && meas.width_mm != null && meas.height_mm != null
                        ? `${meas.width_mm?.toFixed(1)} × ${meas.height_mm?.toFixed(1)} mm`
                        : `${(meas.width_px ?? 0).toFixed(0)} × ${(meas.height_px ?? 0).toFixed(0)} px`)
                    : (isCalibrated && meas.width_mm != null ? "0.0 × 0.0 mm" : "0 × 0 px")}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {isDetected ? "Lesion boundary bounding span" : "NO DIAGNOSTIC LOCATION DETECTED"}
                </div>
              </div>

              <div className="glass-well" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Detection Confidence
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#9B8AFB' }}>
                  {isDetected && det.confidence ? `${(det.confidence * 100).toFixed(1)}%` : '0.0%'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {isDetected ? `${det.model || 'Spatial Localization'} ${det.class_name ? `(${det.class_name})` : ''}` : 'No positive tumor detection'}
                </div>
              </div>
            </div>

            {/* Detailed Dimensions & Telemetry Breakdown */}
            <div className="glass-well" style={{ padding: '1.4rem 1.6rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.9rem' }}>
                Spatial Geometry &amp; Model Telemetry
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Bounding Box:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {isDetected && det.bbox
                      ? `[${det.bbox.x1}, ${det.bbox.y1}] → [${det.bbox.x2}, ${det.bbox.y2}]`
                      : "NO DIAGNOSTIC LOCATION DETECTED"}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Tumor Width:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isDetected
                      ? (isCalibrated && meas.width_mm != null
                          ? `${meas.width_mm?.toFixed(1)} mm (${meas.width_px} px)`
                          : `${meas.width_px || 0} px`)
                      : (isCalibrated && meas.width_mm != null ? "0.0 mm (0 px)" : "0 px")}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Tumor Height:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isDetected
                      ? (isCalibrated && meas.height_mm != null
                          ? `${meas.height_mm?.toFixed(1)} mm (${meas.height_px} px)`
                          : `${meas.height_px || 0} px`)
                      : (isCalibrated && meas.height_mm != null ? "0.0 mm (0 px)" : "0 px")}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Centroid:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {isDetected && meas.centroid ? `(${meas.centroid.x}, ${meas.centroid.y})` : "None"}
                  </span>
                </div>
              </div>
            </div>

            {/* Calibration Notice Banner or No Diagnostic Location Banner */}
            {isNormalOrNoTumor ? (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(112, 201, 168, 0.12)',
                border: '1px solid rgba(112, 201, 168, 0.35)',
                fontSize: '0.85rem',
                color: '#236c53',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: 700
              }}>
                <CheckCircle size={16} color="#70C9A8" />
                <span>NO DIAGNOSTIC LOCATION DETECTED — Primary classification evaluated brain MRI scan as No Tumor.</span>
              </div>
            ) : isCalibrated ? (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.85rem',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <CheckCircle size={16} color="#10B981" />
                <span>Physical spatial calibration verified. Physical dimensions (mm &amp; mm²) computed using authentic MRI pixel spacing.</span>
              </div>
            ) : (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(155, 138, 251, 0.08)',
                border: '1px solid rgba(155, 138, 251, 0.25)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <Info size={16} color="#9B8AFB" />
                <span>Physical scale unavailable — measurements reported in image-space pixels. Physical dimensions (mm / mm²) require calibrated MRI pixel spacing.</span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Grid: Patient Info & Detailed Class Probabilities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.25rem' }}>
        {/* Patient Details */}
        <div className="glass-panel" style={{ padding: '2.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(91, 141, 239, 0.14)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(91, 141, 239, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 1px #fff'
            }}>
              <User size={18} color="#5B8DEF" />
            </div>
            Patient Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Patient Name:</span>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{diagnosis.patient_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Age & Gender:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{diagnosis.patient_age} yrs, {diagnosis.patient_gender}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Record ID:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#5B8DEF', fontWeight: 800 }}>{diagnosis.diagnosis_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Scan Date:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{new Date(diagnosis.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Model Probabilities / Technical Breakdown */}
        <div className="glass-panel" style={{ padding: '2.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(155, 138, 251, 0.14)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(155, 138, 251, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 1px #fff'
            }}>
              <Cpu size={18} color="#9B8AFB" />
            </div>
            Model Output Probabilities
          </h3>

          {diagnosis.details?.class_probabilities ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {Object.entries(diagnosis.details.class_probabilities).map(([cls, prob]) => {
                const probPercent = (prob * 100).toFixed(1);
                const isSelected = cls.toLowerCase() === diagnosis.prediction.toLowerCase();
                return (
                  <div key={cls}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {cls}
                      </span>
                      <span style={{ fontWeight: 800, color: isSelected ? statusTextColor : 'var(--text-primary)' }}>
                        {probPercent}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '10px', borderRadius: '6px', backgroundColor: 'rgba(220, 230, 240, 0.65)', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(36, 59, 83, 0.06)' }}>
                      <div style={{
                        width: `${probPercent}%`,
                        height: '100%',
                        backgroundColor: isSelected ? statusColor : '#5B8DEF',
                        borderRadius: '6px',
                        transition: 'width 0.5s ease',
                        boxShadow: `0 0 8px ${isSelected ? statusColor : '#5B8DEF'}80`
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              <div>Model: <strong style={{ color: 'var(--text-primary)' }}>{diagnosis.model_used}</strong></div>
              <div style={{ marginTop: '0.5rem' }}>Status: Evaluation verified without secondary probability array.</div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Diagnostic Segmentation & Scan Visualization Overlay */}
      {(diagnosis.visualization_url || isNormalOrNoTumor || (!isNormalOrNoTumor && diagnosis.cancer_type?.toLowerCase() === 'brain')) && (
        <DiagnosticVisualizationOverlayCard diagnosis={diagnosis} isNormalOrNoTumor={isNormalOrNoTumor} />
      )}
    </div>
  );
}

function DiagnosticVisualizationOverlayCard({ diagnosis, isNormalOrNoTumor }) {
  const cancer = diagnosis.cancer_type?.toLowerCase();

  const getInitialUrl = (url) => {
    if (!url) {
      if (diagnosis.uploaded_file) {
        return `${BACKEND_URL}/static/uploads/${diagnosis.uploaded_file}`;
      }
      return '';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${clean}`;
  };

  const [imgUrl, setImgUrl] = useState(() => getInitialUrl(diagnosis.visualization_url));
  const [hasError, setHasError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setImgUrl(getInitialUrl(diagnosis.visualization_url));
    setHasError(false);
    setTriedFallback(false);
    setIsLoading(true);
  }, [diagnosis.visualization_url, diagnosis.uploaded_file]);

  const handleImageError = () => {
    if (!triedFallback) {
      setTriedFallback(true);
      if (imgUrl.includes('/uploads/visualizations/')) {
        setImgUrl(imgUrl.replace('/uploads/visualizations/', '/static/visualizations/'));
      } else if (imgUrl.includes('/static/visualizations/')) {
        setImgUrl(imgUrl.replace('/static/visualizations/', '/uploads/visualizations/'));
      } else if (diagnosis.uploaded_file && !imgUrl.includes(diagnosis.uploaded_file)) {
        setImgUrl(`${BACKEND_URL}/static/uploads/${diagnosis.uploaded_file}`);
      } else {
        setHasError(true);
        setIsLoading(false);
      }
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setTriedFallback(false);
    setIsLoading(true);
    const baseUrl = getInitialUrl(diagnosis.visualization_url);
    setImgUrl(baseUrl + (baseUrl.includes('?') ? '&' : '?') + 't=' + Date.now());
  };

  let title = "Volumetric Segmentation & Clinical Visualization Overlay";
  let subtitle = "AI-generated segmentation overlay highlighting suspected anatomical regions of interest.";
  let accentColor = "#70C9A8";
  let badgeText = "Clinical Segmentation Overlay";

  if (cancer === 'breast') {
    title = "Breast Lesion U-Net Segmentation & Diagnostic Visualization Overlay";
    subtitle = "Calculated using 256×256 BUSI U-Net: Green boundary contour denotes lesion periphery with red area overlay.";
    accentColor = "#EC4899";
    badgeText = "BUSI U-Net • 256×256 Ultrasound Matrix";
  } else if (cancer === 'brain') {
    title = "Brain Tumor Spatial Localization & Segmentation Overlay";
    const brainLoc = diagnosis.tumor_analysis?.anatomical_location?.region || diagnosis.details?.tumor_analysis?.anatomical_location?.region;
    subtitle = brainLoc
      ? `Located in ${brainLoc}. Dual-layer spatial telemetry: Boundary localization box with green contour & zero-shot segmentation mask.`
      : "Dual-layer spatial telemetry: Amber/cyan boundary box with green contour & zero-shot segmentation mask.";
    accentColor = "#9B8AFB";
    const detModel = diagnosis.tumor_analysis?.detection?.model || diagnosis.details?.tumor_analysis?.detection?.model || "YOLO11n + SAM 2.1";
    badgeText = `${detModel} • Brain Localization`;
  } else if (cancer === 'lung') {
    title = "Pulmonary Nodule Volumetric & Cross-Sectional Segmentation Overlay";
    subtitle = "Pulmonary nodule detection overlay localized on axial CT cross-section.";
    accentColor = "#5B8DEF";
    badgeText = "DynUNet / 2D U-Net Pulmonary Overlay";
  } else if (cancer === 'kidney') {
    title = "Kidney & Renal Lesion Volumetric Segmentation Overlay";
    subtitle = "3D DynUNet / U-Net volumetric kidney and tumor segmentation overlay.";
    accentColor = "#F59E0B";
    badgeText = "KiTS19 3D DynUNet Volume";
  } else if (cancer === 'liver') {
    title = "Liver & Hepatic Tumor Volumetric Segmentation Overlay";
    subtitle = "Resampled axial CT slice with deep learning hepatic lesion segmentation boundary.";
    accentColor = "#10B981";
    badgeText = "LiTS U-Net Hepatic Volume";
  }

  if (isNormalOrNoTumor) {
    return (
      <div className="glass-panel" style={{ padding: '2.25rem', marginBottom: '2.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.4rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: `${accentColor}25`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${accentColor}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 1px #fff'
              }}>
                <Layers size={19} color={accentColor} />
              </div>
              {title}
            </h3>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: '720px', lineHeight: 1.5 }}>
              Diagnostic localization telemetry is negative for structural lesions or tumours.
            </div>
          </div>
        </div>

        <div style={{
          position: 'relative',
          textAlign: 'center',
          backgroundColor: '#0B0F19',
          borderRadius: '16px',
          padding: '2.75rem 1.75rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(112, 201, 168, 0.15)',
            border: '1px solid rgba(112, 201, 168, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={26} color="#70C9A8" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 0.4rem 0', color: '#fff', letterSpacing: '-0.01em' }}>
              NO DIAGNOSTIC LOCATION DETECTED
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0, maxWidth: '520px', lineHeight: 1.5 }}>
              Primary diagnostic classification evaluated the scan as Normal / No Tumour. No positive lesion, nodule, or tumour location was detected to overlay.
            </p>
          </div>
          <div style={{
            marginTop: '0.35rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '16px',
            backgroundColor: 'rgba(112, 201, 168, 0.12)',
            border: '1px solid rgba(112, 201, 168, 0.25)',
            fontSize: '0.775rem',
            color: '#70C9A8',
            fontWeight: 700
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#70C9A8' }} />
            NO DETECTION • CLEAR SCAN
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '2.25rem', marginBottom: '2.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.4rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: `${accentColor}25`,
              backdropFilter: 'blur(8px)',
              border: `1px solid ${accentColor}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 1px #fff'
            }}>
              <Layers size={19} color={accentColor} />
            </div>
            {title}
          </h3>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: '720px', lineHeight: 1.5 }}>
            {subtitle}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => window.open(imgUrl, '_blank')}
            className="btn-secondary"
            title="Open high-resolution overlay in new tab"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={14} />
            Open Full Image
          </button>
        </div>
      </div>

      <div style={{
        position: 'relative',
        textAlign: 'center',
        backgroundColor: '#0B0F19',
        borderRadius: '16px',
        padding: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isLoading && !hasError && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={28} className="animate-spin" color={accentColor} />
            <span style={{ fontSize: '0.85rem' }}>Loading clinical overlay...</span>
          </div>
        )}

        {hasError ? (
          <div style={{ padding: '2rem 1.5rem', maxWidth: '520px', textAlign: 'center', color: '#f3f4f6' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 139, 139, 0.15)',
              border: '1px solid rgba(239, 139, 139, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={24} color="#EF8B8B" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff' }}>
              Visualization Image Unavailable
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#9CA3AF', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              The segmentation visualization could not be loaded from <code style={{ color: '#E5E7EB', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{imgUrl}</code>. Ensure the backend API server is running and accessible.
            </p>
            <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={handleRetry}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.825rem' }}
              >
                <RefreshCw size={14} />
                Retry Loading
              </button>
              <button
                onClick={() => window.open(imgUrl, '_blank')}
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.825rem' }}
              >
                <ExternalLink size={14} />
                Direct Link
              </button>
            </div>
          </div>
        ) : (
          <>
            <img
              src={imgUrl}
              alt={`${title}`}
              onError={handleImageError}
              onLoad={() => setIsLoading(false)}
              style={{
                maxWidth: '100%',
                maxHeight: '480px',
                borderRadius: '10px',
                objectFit: 'contain',
                display: isLoading ? 'none' : 'block',
                boxShadow: '0 6px 24px rgba(0,0,0,0.45)'
              }}
            />
            {!isLoading && (
              <div style={{
                marginTop: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '0.75rem',
                color: '#9CA3AF',
                fontWeight: 600
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: accentColor }} />
                {badgeText}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
