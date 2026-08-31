import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { showError } from '../utils/alert';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [stats, setStats] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, officer }
  
  const [formData, setFormData] = useState({ 
    name: '', email: '', department: '', designation: '', employeeId: '', assignedArea: '', password: '' 
  });
  
  const [tempPassword, setTempPassword] = useState('');
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await api.get('/admin/officers');
      setOfficers(res.data.officers);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResetRequests = async () => {
    try {
      const res = await api.get('/admin/reset-requests');
      setResetRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'officers') fetchOfficers();
    if (activeTab === 'requests') fetchResetRequests();
  }, [activeTab]);

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...formData, email: formData.email.trim() };
      const res = await api.post('/admin/officers', payload);
      closeCreateModal();
      setOfficers([res.data.officer, ...officers]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating officer');
    }
  };

  const executeConfirmAction = async () => {
    try {
      if (confirmAction.type === 'deactivate') {
        await api.patch(`/admin/officers/${confirmAction.officer._id}`, { status: 'inactive' });
      } else if (confirmAction.type === 'activate') {
        await api.patch(`/admin/officers/${confirmAction.officer._id}`, { status: 'active' });
      } else if (confirmAction.type === 'delete') {
        await api.delete(`/admin/officers/${confirmAction.officer._id}`);
      } else if (confirmAction.type === 'reset') {
        const res = await api.post(`/admin/officers/${confirmAction.officer._id}/reset-access`);
        setTempPassword(res.data.temporaryPassword);
      }
      fetchOfficers();
      if (confirmAction.type !== 'reset') {
        setIsConfirmModalOpen(false);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleApproveReset = async (id) => {
    try {
      const res = await api.patch(`/admin/reset-requests/${id}/approve`);
      setTempPassword(res.data.resetToken);
      setIsConfirmModalOpen(true);
      setConfirmAction({ type: 'resetTokenShow' });
      fetchResetRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectReset = async (id) => {
    if(!window.confirm('Reject this request?')) return;
    try {
      await api.patch(`/admin/reset-requests/${id}/reject`);
      fetchResetRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setTempPassword('');
    setFormData({ name: '', email: '', employeeId: '', department: '', designation: '', assignedArea: '' });
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
    setTempPassword('');
  };

  return (
    <div className="admin-dashboard-container fade-in">
      {/* Background Ambience matches Home page */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="grid-overlay"></div>
      
      <div className="dashboard-content-z">
        {/* HEADER SECTION */}
        <div className="dashboard-header" style={{marginBottom: '40px', textAlign: 'center'}}>
          <div className="dashboard-eyebrow">Command Center</div>
          <h1 className="dashboard-title" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)'}}>ADMIN OPERATIONS</h1>
          <p className="dashboard-subtitle" style={{maxWidth: '600px', margin: '0 auto'}}>Monitor platform activity, manage officers and oversee civic operations.</p>
        </div>

        {/* CINEMATIC NAVIGATION TABS */}
        <div className="premium-tabs-container">
          <button className={`premium-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            SYSTEM OVERVIEW
          </button>
          <button className={`premium-tab ${activeTab === 'officers' ? 'active' : ''}`} onClick={() => setActiveTab('officers')}>
            OFFICER DIRECTORY
          </button>
          <button className={`premium-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            ACCESS REQUESTS
            {resetRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="premium-tab-badge">{resetRequests.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="fade-in mt-4">
            <div className="kpi-grid">
              <div className="kpi-step-card">
                <span className="kpi-step-number">{stats.totalCitizens || 0}</span>
                <span className="kpi-step-label">Total Citizens</span>
              </div>
              <div className="kpi-step-card">
                <span className="kpi-step-number">{stats.activeOfficers || 0}</span>
                <span className="kpi-step-label">Active Officers</span>
              </div>
              <div className="kpi-step-card">
                <span className="kpi-step-number">{stats.totalComplaints || 0}</span>
                <span className="kpi-step-label">Total Reports</span>
              </div>
              <div className="kpi-step-card kpi-critical">
                <span className="kpi-step-number">{stats.criticalComplaints || 0}</span>
                <span className="kpi-step-label">Critical Pending</span>
              </div>
            </div>
            
            {/* Embedded Analytics / Extra info card placeholder to give it depth */}
            <div className="glass-card mt-4 p-4 text-center" style={{padding: '60px 20px'}}>
              <h3 style={{letterSpacing: '0.1em', color: '#fff', marginBottom: '15px'}}>SYSTEM HEALTH</h3>
              <p style={{color: '#a0a0a0'}}>All civic operations are running smoothly. The database is actively syncing across regions.</p>
            </div>
          </div>
        )}

        {/* OFFICERS TAB */}
        {activeTab === 'officers' && (
          <div className="fade-in mt-4">
            <div className="flex-between mb-4 flex-wrap gap-3">
              <h2 style={{fontSize: '1.5rem', fontWeight: '700', letterSpacing: '0.05em', margin: 0}}>Officer Directory</h2>
              <button className="btn-primary" style={{padding: '12px 24px', letterSpacing: '0.1em', fontSize: '0.85rem'}} onClick={() => setIsCreateModalOpen(true)}>
                + PROVISION OFFICER
              </button>
            </div>

            <div className="admin-list-stack">
              {officers.length === 0 && (
                <div style={{textAlign: 'center', padding: '60px 20px', color: '#666', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px'}}>
                  No officers provisioned yet.
                </div>
              )}
              {officers.map(off => (
                <div className="admin-list-card" key={off._id}>
                  <div className="card-main-info">
                    <div className="card-title">{off.name}</div>
                    <div className="card-meta">
                      <span><strong>{off.department}</strong></span>
                      <span>•</span>
                      <span>{off.designation}</span>
                      <span>•</span>
                      <span>ID: {off.employeeId}</span>
                      <span>•</span>
                      <span>📍 {off.assignedArea || 'Global'}</span>
                    </div>
                  </div>
                  <div className="card-badges">
                    <span className={`badge badge-status ${off.status === 'active' ? 'resolved' : 'critical'}`}>{off.status.toUpperCase()}</span>
                  </div>
                  <div className="card-actions" style={{display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                    {off.status === 'active' ? (
                      <button className="btn-ghost text-warning" onClick={() => { setConfirmAction({type:'deactivate', officer: off}); setIsConfirmModalOpen(true); }}>Suspend</button>
                    ) : (
                      <button className="btn-ghost text-success" onClick={() => { setConfirmAction({type:'activate', officer: off}); setIsConfirmModalOpen(true); }}>Activate</button>
                    )}
                    <button className="btn-ghost" onClick={() => { setConfirmAction({type:'reset', officer: off}); setIsConfirmModalOpen(true); }}>Reset</button>
                    <button className="btn-ghost text-critical" onClick={() => { setConfirmAction({type:'delete', officer: off}); setIsConfirmModalOpen(true); }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="fade-in mt-4">
            <div className="mb-4">
              <h2 style={{fontSize: '1.5rem', fontWeight: '700', letterSpacing: '0.05em', margin: 0}}>Access Reset Requests</h2>
            </div>
            
            <div className="admin-list-stack">
              {resetRequests.length === 0 && (
                <div style={{textAlign: 'center', padding: '60px 20px', color: '#666', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px'}}>
                  No active reset requests.
                </div>
              )}
              {resetRequests.map(req => (
                <div className="admin-list-card" key={req._id}>
                  <div className="card-main-info">
                    <div className="card-title">{req.officer?.name || 'Unknown Officer'}</div>
                    <div className="card-meta">
                      <span>{req.officerEmail}</span>
                      <span>•</span>
                      <span>Requested: {new Date(req.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="card-badges">
                    <span className={`badge badge-status ${req.status === 'pending' ? 'pending' : req.status === 'approved' ? 'resolved' : 'critical'}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="card-actions" style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    {req.status === 'pending' && (
                      <>
                        <button className="btn-secondary text-success" style={{borderColor: 'rgba(52, 211, 153, 0.3)'}} onClick={() => handleApproveReset(req._id)}>Approve</button>
                        <button className="btn-ghost text-critical" onClick={() => handleRejectReset(req._id)}>Reject</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PREMIUM CREATE OFFICER MODAL */}
      {isCreateModalOpen && (
        <div className="modal-overlay cinematic-overlay">
          <div className="glass-card premium-modal flex-column fade-in">
            <div className="flex-between mb-4">
              <h2 style={{margin: 0, fontSize: '1.5rem', letterSpacing: '0.05em'}}>PROVISION OFFICER</h2>
              <button className="btn-ghost" style={{padding: '5px 10px', fontSize: '1.5rem'}} onClick={closeCreateModal}>✕</button>
            </div>
            <p style={{color: '#a0a0a0', marginBottom: '30px', fontSize: '0.9rem'}}>Create a secure account for a government official. You must set an initial password.</p>
            
            {error && <div className="auth-alert alert-error mb-3">{error}</div>}
            
            <form onSubmit={handleCreateOfficer}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Ahmed Khan" />
              </div>
              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="e.g. ahmed.khan@city.gov" />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required placeholder="e.g. Municipal Services" />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input className="form-input" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} required placeholder="e.g. Field Officer" />
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} required placeholder="e.g. OFF-1042" />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Area</label>
                  <input className="form-input" value={formData.assignedArea} onChange={e => setFormData({...formData, assignedArea: e.target.value})} placeholder="e.g. Quetta North (Optional)" />
                </div>
              </div>
              <div className="form-group" style={{marginBottom: '30px'}}>
                <label className="form-label">Initial Password</label>
                <input className="form-input" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="Enter secure password" />
              </div>
              
              <div className="flex-between" style={{gap: '20px'}}>
                <button type="button" className="btn-ghost" style={{flex: 1, padding: '16px'}} onClick={closeCreateModal}>CANCEL</button>
                <button type="submit" className="btn-primary" style={{flex: 2}}>PROVISION ACCOUNT</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREMIUM CONFIRM ACTION MODAL */}
      {isConfirmModalOpen && confirmAction && (
        <div className="modal-overlay cinematic-overlay">
          <div className="glass-card premium-modal flex-column fade-in" style={{maxWidth: '500px', textAlign: 'center'}}>
            {!tempPassword ? (
              <>
                <div className="mb-4">
                  {confirmAction.type === 'delete' || confirmAction.type === 'deactivate' ? (
                     <div style={{fontSize: '3rem', margin: '0 auto', color: '#ef4444'}}>⚠️</div>
                  ) : (
                     <div style={{fontSize: '3rem', margin: '0 auto', color: '#60a5fa'}}>🛡️</div>
                  )}
                </div>
                <h3 style={{fontSize: '1.5rem', margin: '0 0 15px 0', letterSpacing: '0.05em'}}>
                  {confirmAction.type === 'deactivate' ? 'Suspend Officer' : 
                   confirmAction.type === 'activate' ? 'Activate Officer' : 
                   confirmAction.type === 'delete' ? 'Delete Officer' : 'Reset Access'}
                </h3>
                
                <p style={{color: '#a0a0a0', lineHeight: 1.6, marginBottom: '30px'}}>
                  {confirmAction.type === 'deactivate' && `${confirmAction.officer?.name} will be suspended and unable to log in to the Officer Portal.`}
                  {confirmAction.type === 'activate' && `${confirmAction.officer?.name} will regain full access to the Officer Portal.`}
                  {confirmAction.type === 'delete' && <span style={{color: '#ef4444'}}>Are you sure you want to permanently delete {confirmAction.officer?.name}? This action cannot be undone and will completely wipe their account from the system.</span>}
                  {confirmAction.type === 'reset' && `Are you sure you want to invalidate the current password and generate a new temporary password for ${confirmAction.officer?.name}?`}
                </p>
                
                <div className="flex-between" style={{gap: '15px'}}>
                  <button className="btn-ghost" style={{flex: 1}} onClick={closeConfirmModal}>CANCEL</button>
                  <button className="btn-primary" style={{flex: 1, background: confirmAction.type === 'delete' ? '#ef4444' : undefined, color: confirmAction.type === 'delete' ? '#fff' : undefined, borderColor: confirmAction.type === 'delete' ? '#ef4444' : undefined}} onClick={executeConfirmAction}>
                    CONFIRM ACTION
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                   <div style={{fontSize: '3rem', margin: '0 auto', color: '#34d399'}}>✓</div>
                </div>
                <h3 style={{fontSize: '1.5rem', margin: '0 0 15px 0', letterSpacing: '0.05em'}}>
                  {confirmAction.type === 'resetTokenShow' ? 'Request Approved' : 'Access Reset Successful'}
                </h3>
                <p style={{color: '#a0a0a0', lineHeight: 1.6, marginBottom: '30px'}}>
                  {confirmAction.type === 'resetTokenShow' 
                    ? 'The request has been approved. Provide this short-lived reset token to the officer securely. It expires in 15 minutes.' 
                    : `Share this new temporary password securely with ${confirmAction.officer?.name}.`}
                </p>
                
                <div style={{background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '30px', marginBottom: '30px'}}>
                  <p style={{fontSize: '0.8rem', letterSpacing: '0.15em', color: '#666', marginBottom: '10px'}}>
                    {confirmAction.type === 'resetTokenShow' ? 'RESET TOKEN' : 'TEMPORARY PASSWORD'}
                  </p>
                  <h4 style={{fontSize: '2rem', letterSpacing: '0.2em', color: '#fff', margin: 0, fontFamily: 'monospace'}}>
                    {tempPassword}
                  </h4>
                </div>
                
                <button className="btn-primary w-100" onClick={closeConfirmModal} style={{padding: '16px'}}>DONE</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
