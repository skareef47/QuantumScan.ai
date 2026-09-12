import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, Eye, Calendar, User, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { getDiagnosisHistory, deleteDiagnosis } from '../services/api';

export default function HistoryPage({ onViewDiagnosis }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCancer, setFilterCancer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCancer) params.cancer_type = filterCancer;
      if (searchTerm) params.search = searchTerm;
      const data = await getDiagnosisHistory(params);
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDiagnosis(recordToDelete.diagnosis_id);
      setRecordToDelete(null);
      await fetchHistory();
    } catch (err) {
      console.error('Failed to delete history record:', err);
      setDeleteError(err.response?.data?.detail || 'Failed to delete record. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterCancer, searchTerm]);

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
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Diagnostic History Log</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem', fontWeight: 500 }}>Comprehensive database of verified patient cancer evaluations</p>
        </div>

        <button className="btn-secondary" onClick={fetchHistory} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh History
        </button>
      </div>

      {/* Filter and Search Bar (Glass Toolbar) */}
      <div className="glass-panel" style={{ padding: '1.35rem 1.6rem', marginBottom: '2rem', display: 'flex', gap: '1.1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by patient name, record ID, or prediction result..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.85rem 1.1rem 0.85rem 3rem',
              fontSize: '0.925rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Filter size={18} color="var(--text-secondary)" />
          <select
            value={filterCancer}
            onChange={(e) => setFilterCancer(e.target.value)}
            style={{
              padding: '0.85rem 1.35rem',
              fontSize: '0.925rem',
              cursor: 'pointer',
              minWidth: '210px'
            }}
          >
            <option value="">All Cancer Modules</option>
            <option value="lung">Lung CT Scan</option>
            <option value="brain">Brain MRI Scan</option>
            <option value="kidney">Kidney CT Scan</option>
            <option value="breast">Breast Ultrasound</option>
            <option value="liver">Liver CT Scan</option>
          </select>
        </div>
      </div>

      {/* History Table (Glass Container) */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            No records matched your search filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(220, 230, 240, 0.9)', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>DATE / TIME</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>PATIENT NAME</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>AGE / GENDER</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>CANCER MODULE</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>PREDICTION RESULT</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>CONFIDENCE</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800 }}>AI MODEL</th>
                  <th style={{ padding: '0.95rem 1rem', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
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
                      {row.patient_name}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', color: 'var(--text-secondary)' }}>
                      {row.patient_age} yrs, {row.patient_gender}
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
                    <td style={{ padding: '1.1rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => onViewDiagnosis(row)}
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', borderRadius: '10px' }}
                          title="View detailed diagnosis report"
                        >
                          <Eye size={14} /> Details
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setDeleteError(null);
                            setRecordToDelete(row);
                          }}
                          style={{
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.825rem',
                            borderRadius: '10px',
                            color: '#dc2626',
                            borderColor: 'rgba(239, 139, 139, 0.45)',
                            backgroundColor: 'rgba(239, 139, 139, 0.08)'
                          }}
                          title="Delete this history record"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            backgroundColor: '#FFFFFF',
            maxWidth: '480px',
            width: '100%',
            padding: '2.25rem',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), inset 0 1px 2px #fff',
            border: '1.5px solid rgba(239, 139, 139, 0.45)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 139, 139, 0.15)',
                border: '1px solid rgba(239, 139, 139, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626'
              }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Delete History Record
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Permanent record deletion
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Are you sure you want to delete this history record?
            </p>

            <div className="glass-well" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Patient:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{recordToDelete.patient_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Module:</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 700, color: getModuleColor(recordToDelete.cancer_type) }}>
                  {recordToDelete.cancer_type}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Prediction:</span>
                <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{recordToDelete.prediction}</strong>
              </div>
            </div>

            {deleteError && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 139, 139, 0.15)',
                color: '#dc2626',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={16} /> {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setRecordToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                style={{ padding: '0.65rem 1.35rem', borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{
                  padding: '0.65rem 1.45rem',
                  borderRadius: '10px',
                  backgroundColor: '#dc2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)'
                }}
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

