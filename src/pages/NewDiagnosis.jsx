import React, { useState, useEffect } from 'react';
import { Activity, Brain, Heart, Stethoscope, Upload, AlertCircle, CheckCircle, Loader2, User, FileText, Cpu, ShieldCheck, Layers } from 'lucide-react';
import { submitDiagnosis } from '../services/api';

export default function NewDiagnosis({ 
  initialCancerType = 'lung', 
  initialScanUrl = null, 
  initialScanName = null, 
  isDemo = false,
  demoFileOrigin = null,
  demoNotice = null,
  onDemoModuleChange = null,
  onClearDemoNotice = null,
  onDiagnosisComplete 
}) {
  const [cancerType, setCancerType] = useState(initialCancerType);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState(initialCancerType === 'breast' ? 'Female' : 'Male');
  const [patientIdCode, setPatientIdCode] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pixelSpacingX, setPixelSpacingX] = useState('');
  const [pixelSpacingY, setPixelSpacingY] = useState('');

  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [localDemoNotice, setLocalDemoNotice] = useState(demoNotice);

  useEffect(() => {
    setLocalDemoNotice(demoNotice);
  }, [demoNotice]);

  useEffect(() => {
    if (initialCancerType) {
      setCancerType(initialCancerType);
      setErrorMsg(null);
      if (initialCancerType === 'breast') {
        setPatientGender('Female');
      }
    }
  }, [initialCancerType]);

  useEffect(() => {
    if (initialScanUrl) {
      fetch(initialScanUrl)
        .then(res => res.blob())
        .then(blob => {
          const isNii = initialScanName?.endsWith('.nii');
          const file = new File([blob], initialScanName || 'medical_scan.jpg', { type: isNii ? 'application/octet-stream' : 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(isNii ? null : initialScanUrl);
        })
        .catch(err => console.error('Preload scan error:', err));
    }
  }, [initialScanUrl, initialScanName]);

  const cancerModules = [
    { id: 'lung', title: 'Lung CT Scan Engine', icon: Activity, color: '#5B8DEF', format: '.png, .jpg, .jpeg, .dcm', engine: 'Deep CNN Architecture' },
    { id: 'brain', title: 'Brain MRI Diagnostic', icon: Brain, color: '#9B8AFB', format: '.jpg, .png, .jpeg', engine: 'Hybrid ResNet Pipeline' },
    { id: 'kidney', title: 'Kidney CT Engine', icon: Heart, color: '#70C9A8', format: '.png, .jpg, .nii, .dcm', engine: '3D Volumetric U-Net' },
    { id: 'breast', title: 'Breast Ultrasound Engine', icon: Stethoscope, color: '#EF8B8B', format: '.png, .jpg, .bmp', engine: 'Enhanced ResNet Classifier' },
    { id: 'liver', title: 'Liver CT Engine', icon: Activity, color: '#F4C96B', format: '.npy, .nii, .nii.gz, .png, .jpg, .jpeg, .dcm', engine: '2D U-Net Segmentor' }
  ];

  const currentModule = cancerModules.find(m => m.id === cancerType) || cancerModules[0];

  const handleModuleChange = (modId) => {
    if (isDemo && modId !== cancerType) {
      if (selectedFile || previewUrl || demoFileOrigin) {
        setSelectedFile(null);
        setPreviewUrl(null);
        const originDataset = demoFileOrigin?.datasetName || currentModule.title.split(' ')[0];
        const originModality = demoFileOrigin?.modality || '';
        const targetMod = cancerModules.find(m => m.id === modId) || { title: modId };
        const msg = `Dataset mismatch — this ${originDataset} ${originModality} file cannot be loaded into the ${targetMod.title} Demo workstation. Please select a file from the ${modId.toUpperCase()} dataset.`;
        setLocalDemoNotice(msg);
      }
      if (onDemoModuleChange) {
        onDemoModuleChange(modId);
      }
    }
    setCancerType(modId);
    setErrorMsg(null);
    if (modId === 'breast' && patientGender !== 'Female') {
      setPatientGender('Female');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg(null);
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Client-side quick check for color photos/selfies
        const img = new Image();
        img.src = objectUrl;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 64, 64);
            const imageData = ctx.getImageData(0, 0, 64, 64);
            const data = imageData.data;
            let colorDiffSum = 0;
            let pixelCount = 64 * 64;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              colorDiffSum += Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
            }
            const avgColorDiff = colorDiffSum / (pixelCount * 3);
            if (avgColorDiff > 8.0) {
              setErrorMsg(
                'Notice: The selected image appears to be a natural color photograph or selfie. ' +
                'Diagnostic AI models require authentic monochrome medical radiological scans (CT, MRI, or Ultrasound). ' +
                'Please select a genuine medical scan to proceed.'
              );
            }
          } catch (err) {
            // Ignore canvas security errors on local files
          }
        };
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a medical scan image to analyze.');
      return;
    }
    if (!patientName || !patientAge) {
      setErrorMsg('Please fill in patient name and age.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setStepIndex(1);

    const formData = new FormData();
    formData.append('cancer_type', cancerType);
    formData.append('patient_name', patientName);
    formData.append('patient_age', patientAge);
    formData.append('patient_gender', cancerType === 'breast' ? 'Female' : patientGender);
    if (patientIdCode) formData.append('patient_id_code', patientIdCode);
    if (cancerType === 'lung') {
      if (pixelSpacingX && pixelSpacingY) {
        formData.append('pixel_spacing_x', pixelSpacingX);
        formData.append('pixel_spacing_y', pixelSpacingY);
      } else if (pixelSpacingX || pixelSpacingY) {
        setErrorMsg('Both Pixel Spacing X and Y must be provided together for 2D physical calibration, or leave both empty for uncalibrated pixel mode.');
        return;
      }
    }
    formData.append('medical_scan', selectedFile);

    const t1 = setTimeout(() => setStepIndex(2), 600);
    const t2 = setTimeout(() => setStepIndex(3), 1400);

    try {
      const result = await submitDiagnosis(formData);
      setStepIndex(4);
      setTimeout(() => {
        onDiagnosisComplete(result);
      }, 600);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'An unexpected error occurred during prediction analysis.';
      setErrorMsg(detail);
      setLoading(false);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1180px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AI Diagnostic Workstation</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.4rem 0 0', fontWeight: 500 }}>
            High-throughput clinical scan evaluation and automated neural feature extraction pipeline
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.5rem 1.1rem',
          borderRadius: '30px',
          background: 'rgba(112, 201, 168, 0.18)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(112, 201, 168, 0.6)',
          color: '#236c53',
          fontSize: '0.825rem',
          fontWeight: 800,
          boxShadow: '0 2px 8px rgba(36, 59, 83, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
        }}>
          <ShieldCheck size={16} /> Workstation Active
        </div>
      </div>

      {/* Module Selection Tabs (Glass Tabs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.1rem', marginBottom: '2.5rem' }}>
        {cancerModules.map((mod) => {
          const IconC = mod.icon;
          const isSelected = cancerType === mod.id;
          return (
            <div
              key={mod.id}
              onClick={() => handleModuleChange(mod.id)}
              className="glass-panel"
              style={{
                padding: '1.2rem 1.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.95rem',
                backgroundColor: isSelected ? `${mod.color}15` : 'rgba(255, 255, 255, 0.72)',
                borderColor: isSelected ? mod.color : 'var(--border-color)',
                borderWidth: isSelected ? '2px' : '1px',
                boxShadow: isSelected ? `0 6px 20px ${mod.color}30, inset 0 1px 2px #fff` : 'var(--shadow-glass)',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
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
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? mod.color : 'var(--text-primary)' }}>
                  {mod.title}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontWeight: 500 }}>
                  {mod.engine}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isDemo && localDemoNotice && (
        <div style={{
          padding: '1.15rem 1.4rem',
          borderRadius: '14px',
          backgroundColor: 'rgba(239, 139, 139, 0.14)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(239, 139, 139, 0.5)',
          color: '#b53838',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.95rem',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(239, 139, 139, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} style={{ flexShrink: 0, color: '#b53838' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.925rem', marginBottom: '0.15rem' }}>Demo Dataset Isolation Notice</div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{localDemoNotice}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalDemoNotice(null);
              if (onClearDemoNotice) onClearDemoNotice();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#b53838',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '6px'
            }}
            title="Dismiss Notice"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          backgroundColor: 'rgba(239, 139, 139, 0.16)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(239, 139, 139, 0.6)',
          color: '#b53838',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.95rem',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(239, 139, 139, 0.15)'
        }}>
          <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.975rem', marginBottom: '0.25rem' }}>Scan Validation Notice</div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Production Form Layout */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.25rem' }}>
          
          {/* Left Panel: Patient Demographics */}
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
              Patient Demographics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.45rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.55rem', fontWeight: 700 }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.1rem',
                    fontSize: '0.925rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.55rem', fontWeight: 700 }}>
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 52"
                    style={{
                      width: '100%',
                      padding: '0.9rem 1.1rem',
                      fontSize: '0.925rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.55rem', fontWeight: 700 }}>
                    Gender {cancerType === 'breast' && <span style={{ color: '#EF8B8B', fontSize: '0.75rem' }}>(Female Only)</span>}
                  </label>
                  <select
                    value={cancerType === 'breast' ? 'Female' : patientGender}
                    disabled={cancerType === 'breast'}
                    onChange={(e) => {
                      setPatientGender(e.target.value);
                      setErrorMsg(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.9rem 1.1rem',
                      fontSize: '0.925rem',
                      cursor: cancerType === 'breast' ? 'not-allowed' : 'pointer',
                      opacity: cancerType === 'breast' ? 0.9 : 1,
                      backgroundColor: cancerType === 'breast' ? 'rgba(239, 139, 139, 0.08)' : undefined,
                      borderColor: cancerType === 'breast' ? 'rgba(239, 139, 139, 0.4)' : undefined
                    }}
                  >
                    {cancerType === 'breast' ? (
                      <option value="Female">Female (Exclusively for Breast Scan)</option>
                    ) : (
                      <>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                  {cancerType === 'breast' && (
                    <span style={{ fontSize: '0.725rem', color: '#EF8B8B', fontWeight: 700, marginTop: '0.35rem', display: 'block' }}>
                      • Breast ultrasound evaluation is restricted to Female patients only
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.55rem', fontWeight: 700 }}>
                  Medical Record Number (Optional ID)
                </label>
                <input
                  type="text"
                  value={patientIdCode}
                  onChange={(e) => setPatientIdCode(e.target.value)}
                  placeholder="e.g. MRN-90281-X"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.1rem',
                    fontSize: '0.925rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Medical Scan Dropzone */}
          <div className="glass-panel" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: `${currentModule.color}18`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${currentModule.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 1px #fff'
              }}>
                <FileText size={18} color={currentModule.color} />
              </div>
              {currentModule.title} Upload
            </h3>

            <div style={{
              flex: 1,
              border: `2px dashed ${selectedFile ? currentModule.color : 'rgba(220, 230, 240, 0.95)'}`,
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: selectedFile ? `${currentModule.color}0a` : 'rgba(244, 248, 252, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              minHeight: '220px',
              transition: 'all 0.25s ease',
              boxShadow: 'inset 0 1px 3px rgba(36, 59, 83, 0.02)'
            }}>
              <input
                type="file"
                accept={currentModule.id === 'liver' ? '.npy,.nii,.nii.gz,.png,.jpg,.jpeg,.dcm' : undefined}
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />

              {previewUrl ? (
                <div>
                  <img
                    src={previewUrl}
                    alt="Selected scan preview"
                    style={{ maxHeight: '160px', borderRadius: '10px', marginBottom: '0.95rem', objectFit: 'contain', border: '1px solid var(--border-color)', boxShadow: '0 4px 14px rgba(36, 59, 83, 0.08)' }}
                  />
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: currentModule.color }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.3rem', fontWeight: 500 }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to replace file
                  </div>
                </div>
              ) : selectedFile ? (
                <div>
                  <FileText size={44} color={currentModule.color} style={{ marginBottom: '0.85rem' }} />
                  <div style={{ fontSize: '0.975rem', fontWeight: 800, color: currentModule.color, marginBottom: '0.3rem' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB • NumPy Slice / Medical Scan Selected
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#5B8DEF', marginTop: '0.75rem', fontWeight: 800 }}>
                    Click or drag to replace file
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.1rem',
                    boxShadow: '0 4px 14px rgba(36, 59, 83, 0.05), inset 0 1px 1px #fff'
                  }}>
                    <Upload size={30} color={currentModule.color} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.975rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Drag & drop DICOM / Image / Array file here
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Supported formats: <strong style={{ color: 'var(--text-primary)' }}>{currentModule.format}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Optional 2D Physical Calibration for Lung Scans */}
            {cancerType === 'lung' && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1.1rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(91, 141, 239, 0.05)',
                border: '1px solid rgba(91, 141, 239, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Layers size={16} color="#5B8DEF" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Optional 2D Physical Calibration (mm/pixel)
                  </span>
                </div>
                <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                  For 2D CT image slices (PNG/JPG). If uploading authentic DICOM (.dcm), spacing is automatically parsed from metadata.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Pixel Spacing X (mm/px)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      placeholder="e.g. 0.70"
                      value={pixelSpacingX}
                      onChange={(e) => setPixelSpacingX(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem', width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Pixel Spacing Y (mm/px)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      placeholder="e.g. 0.70"
                      value={pixelSpacingY}
                      onChange={(e) => setPixelSpacingY(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem', width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        {loading ? (
          <div className="glass-panel" style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderColor: currentModule.color,
            boxShadow: `0 10px 30px ${currentModule.color}25, inset 0 1px 2px #fff`
          }}>
            <Loader2 size={38} color={currentModule.color} className="animate-spin" style={{ margin: '0 auto 1.25rem' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.95rem', color: 'var(--text-primary)' }}>Executing Neural AI Pipeline...</h4>
            
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: stepIndex >= 1 ? '#236c53' : 'var(--text-secondary)', fontWeight: 800 }}>• Uploading Image</span>
              <span style={{ color: stepIndex >= 2 ? '#236c53' : 'var(--text-secondary)', fontWeight: 800 }}>• Preprocessing Normalization</span>
              <span style={{ color: stepIndex >= 3 ? '#236c53' : 'var(--text-secondary)', fontWeight: 800 }}>• Feature Extraction</span>
              <span style={{ color: stepIndex >= 4 ? '#236c53' : 'var(--text-secondary)', fontWeight: 800 }}>• Generating ROI Report</span>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1.2rem',
              fontSize: '1.15rem',
              fontWeight: 900,
              backgroundColor: currentModule.color,
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: `0 8px 25px ${currentModule.color}45, inset 0 1px 1px rgba(255,255,255,0.6)`,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 12px 30px ${currentModule.color}60, inset 0 1px 1px rgba(255,255,255,0.8)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = `0 8px 25px ${currentModule.color}45, inset 0 1px 1px rgba(255,255,255,0.6)`;
            }}
          >
            Execute {currentModule.title} AI Pipeline
          </button>
        )}
      </form>
    </div>
  );
}
