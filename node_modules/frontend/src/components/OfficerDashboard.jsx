import React, { useContext, useEffect, useState } from 'react';
import { ComplaintContext } from '../context/ComplaintContext';
import { showError } from '../utils/alert';
import api from '../services/api';
import './OfficerDashboard.css';

const OfficerDashboard = () => {
  const { complaints, updateStatus, loading } = useContext(ComplaintContext);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newRemark, setNewRemark] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [area, setArea] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const filteredComplaints = (complaints || []).filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && c.category !== category) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (area && !c.area.toLowerCase().includes(area.toLowerCase())) return false;
    if (priorityFilter && c.priority !== priorityFilter) return false;
    return true;
  });

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const res = await api.get('/ai/officer-summary');
        setAiData(res.data.data);
      } catch (err) {
        console.error(err);
      }
      setAiLoading(false);
    };
    fetchAI();
  }, []);

  const openModal = (c) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setNewRemark(c.officerRemark || '');
  };

  const handleSaveModal = async () => {
    if (selectedComplaint) {
      await updateStatus(selectedComplaint._id, newStatus, newRemark);
      setSelectedComplaint(null);
    }
  };

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (statusFilter) params.append('status', statusFilter);
      if (area) params.append('area', area);
      if (search) params.append('search', search);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const res = await api.get(`/complaints/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      showError('Export failed');
    }
  };

  return (
    <div className="officer-dashboard-container fade-in">
      <div className="dashboard-content-z">
        
        {/* HEADER SECTION */}
        <div className="dashboard-header" style={{marginBottom: '40px', textAlign: 'center'}}>
          <div className="dashboard-eyebrow">Operations Center</div>
          <h1 className="dashboard-title" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)'}}>CIVIC OPERATIONS</h1>
          <p className="dashboard-subtitle" style={{maxWidth: '600px', margin: '0 auto'}}>Monitor, prioritize and resolve reported civic issues.</p>
        </div>

        {/* PREMIUM STATS / KPIs */}
        {!aiLoading && aiData && (
          <div className="kpi-grid" style={{marginBottom: '40px'}}>
            <div className="kpi-step-card">
              <span className="kpi-step-number">{aiData?.stats?.totalComplaints || 0}</span>
              <span className="kpi-step-label">Total Reports</span>
            </div>
            <div className="kpi-step-card">
              <span className="kpi-step-number">{aiData?.stats?.pending || 0}</span>
              <span className="kpi-step-label">Pending</span>
            </div>
            <div className="kpi-step-card kpi-critical">
              <span className="kpi-step-number">{aiData?.stats?.criticalComplaints || 0}</span>
              <span className="kpi-step-label">Critical</span>
            </div>
            <div className="kpi-step-card kpi-success">
              <span className="kpi-step-number" style={{fontSize: '2.5rem', marginBottom: '22px'}}>
                {aiData?.stats?.averageSatisfaction ? `★ ${aiData.stats.averageSatisfaction}` : 'N/A'}
              </span>
              <span className="kpi-step-label">Citizen Satisfaction</span>
            </div>
          </div>
        )}

        {/* AI BRIEFING PANEL */}
        <div className="glass-card ai-briefing-panel mb-4 fade-in">
          <div className="flex-between mb-4">
            <h2 style={{fontSize: '1.2rem', margin: 0, letterSpacing: '0.1em'}}><span style={{color: '#60a5fa'}}>✨</span> AI DAILY BRIEFING</h2>
          </div>
          {aiLoading ? <p style={{color: '#a0a0a0'}}>Analyzing operational data...</p> : (
            <p className="ai-summary-text">{aiData?.aiSummary}</p>
          )}
        </div>

        {/* PRIORITY QUEUE SECTION */}
        <div className="fade-in" style={{marginTop: '60px'}}>
          <div className="dashboard-header flex-between" style={{marginBottom: '30px'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '700', letterSpacing: '0.05em'}}>Priority Queue</h2>
            <button className="btn-secondary" onClick={exportCSV}>
              <span>⬇</span> Export CSV
            </button>
          </div>

          {/* PREMIUM FILTERS BAR */}
          <div className="premium-filters-bar">
            <input type="text" placeholder="Search issues..." className="form-input" style={{flex: '1 1 200px', marginBottom: 0}} value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{flex: '1 1 150px', marginBottom: 0}} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Road">Road</option>
              <option value="Garbage">Garbage</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Other">Other</option>
            </select>
            <select className="form-select" style={{flex: '1 1 150px', marginBottom: 0}} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select className="form-select" style={{flex: '1 1 150px', marginBottom: 0}} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <input type="text" placeholder="Area..." className="form-input" style={{flex: '1 1 150px', marginBottom: 0}} value={area} onChange={e => setArea(e.target.value)} />
          </div>
          
          {/* COMPLAINT LIST STACK (Replaces Data Table) */}
          {loading ? <p style={{color: '#a0a0a0', textAlign: 'center', padding: '40px'}}>Loading priority queue...</p> : (
            <div className="complaint-list-stack">
              {filteredComplaints.length === 0 && (
                <div style={{textAlign: 'center', padding: '60px 20px', color: '#666', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px'}}>
                  No complaints match the filters.
                </div>
              )}
              {filteredComplaints.map(c => (
                <div className="complaint-list-card" key={c._id}>
                  <div className="card-main-info">
                    <div className="card-title">{c.title}</div>
                    <div className="card-meta">
                      <span><strong>{c.category}</strong></span>
                      <span>•</span>
                      <span>📍 {c.area}</span>
                      <span>•</span>
                      <span>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>👍 {c.upvotes}</span>
                    </div>
                  </div>
                  <div className="card-badges">
                    <span className={`badge badge-priority ${c.priority?.toLowerCase() || 'normal'}`}>{c.priority || 'Normal'}</span>
                    <span className={`badge badge-status ${c.status?.replace(' ', '')?.toLowerCase() || 'pending'}`}>{c.status || 'Pending'}</span>
                  </div>
                  <div className="card-actions">
                    <button className="btn-secondary" style={{fontSize: '0.8rem', padding: '8px 16px', letterSpacing: '0.1em'}} onClick={() => openModal(c)}>
                      REVIEW <span className="arrow">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PREMIUM COMPLAINT DETAILS MODAL */}
        {selectedComplaint && (
          <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', zIndex: 9999, display: 'flex', 
            alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="glass-card premium-modal flex-column fade-in" style={{
              maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
              padding: '40px'
            }}>
              <div className="flex-between mb-4">
                <h2 style={{margin: 0, fontSize: '1.8rem', letterSpacing: '0.02em'}}>{selectedComplaint.title}</h2>
                <button className="btn-ghost" style={{padding: '5px 10px', fontSize: '1.5rem'}} onClick={() => setSelectedComplaint(null)}>✕</button>
              </div>
              
              <div style={{display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap'}}>
                <span className={`badge badge-priority ${selectedComplaint.priority?.toLowerCase() || 'normal'}`}>{selectedComplaint.priority}</span>
                <span className="badge" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}>{selectedComplaint.category}</span>
                <span className="badge" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}>📍 {selectedComplaint.area}</span>
              </div>
              
              <p style={{color: '#a0a0a0', lineHeight: 1.8, marginBottom: '30px', fontSize: '1.05rem'}}>{selectedComplaint.description}</p>
              
              {selectedComplaint.imageUrl ? (
                <div style={{marginBottom: '30px', borderRadius: '12px', overflow: 'hidden'}}>
                  <span style={{fontSize: '0.75rem', fontWeight: '700', color: '#666', letterSpacing: '0.15em', display: 'block', marginBottom: '12px'}}>PHOTO EVIDENCE</span>
                  <img src={selectedComplaint.imageUrl} alt="Evidence" style={{width: '100%', maxHeight: '400px', objectFit: 'cover', background: '#000', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)'}} />
                </div>
              ) : (
                <div style={{marginBottom: '30px', padding: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center'}}>
                   <span style={{color: '#555', fontSize: '0.9rem', letterSpacing: '0.1em'}}>NO PHOTO PROVIDED</span>
                </div>
              )}

              <div style={{borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px'}}>
                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>
                <div className="form-group" style={{marginBottom: '30px'}}>
                  <label className="form-label">Officer Remark</label>
                  <input className="form-input" type="text" value={newRemark} onChange={e => setNewRemark(e.target.value)} placeholder="Action taken or response..." />
                </div>
                <div className="flex-between" style={{gap: '20px'}}>
                  <button className="btn-ghost" style={{flex: 1, padding: '16px'}} onClick={() => setSelectedComplaint(null)}>CANCEL</button>
                  <button className="btn-primary" style={{flex: 2}} onClick={handleSaveModal}>SAVE UPDATE</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
