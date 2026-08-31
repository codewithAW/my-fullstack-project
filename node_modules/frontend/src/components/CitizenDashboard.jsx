import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ComplaintContext } from '../context/ComplaintContext';
import { AuthContext } from '../context/AuthContext';
import { showSuccess, showError } from '../utils/alert';

const CitizenDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { complaints, myComplaints, upvoteComplaint, addFeedback, loading } = useContext(ComplaintContext);
  const { user } = useContext(AuthContext);

  const handleFeedback = async (id, e) => {
    e.preventDefault();
    const rating = e.target.rating.value;
    const comment = e.target.comment.value;
    try {
      await addFeedback(id, rating, comment);
      showSuccess('Feedback submitted!');
    } catch (err) {
      showError('Error submitting feedback');
    }
  }

  const resolvedCount = (myComplaints || []).filter(c => c.status === 'Resolved').length;
  const upvotedCount = (complaints || []).filter(c => c.upvotedBy?.includes(user?._id)).length;

  return (
    <>
      <div className="dashboard-header fade-in">
        <div className="dashboard-eyebrow">Citizen Portal</div>
        <h1 className="dashboard-title">GOOD MORNING, {user?.name.toUpperCase()}</h1>
        <p className="dashboard-subtitle" style={{marginBottom: '30px'}}>YOUR COMMUNITY, YOUR VOICE. Track the issues you've reported and see what your community is helping solve.</p>
        
        <div className="dashboard-stats mb-4">
          <div className="glass-card flex-column" style={{justifyContent: 'space-between'}}>
            <span className="kpi-label">Issues Reported</span>
            <span className="kpi-value">{myComplaints.length}</span>
          </div>
          <div className="glass-card flex-column" style={{justifyContent: 'space-between'}}>
            <span className="kpi-label">Resolved</span>
            <span className="kpi-value">{resolvedCount}</span>
          </div>
          <div className="glass-card flex-column" style={{justifyContent: 'space-between'}}>
            <span className="kpi-label">Your Upvotes</span>
            <span className="kpi-value">{upvotedCount}</span>
          </div>
        </div>
      </div>

      <div className="tabs-container fade-in">
        <button className="tab-btn active">My Complaints</button>
        <button className="tab-btn" onClick={() => navigate('/complaints')}>Browse Community Feed</button>
        <button className="btn-primary" style={{marginLeft: 'auto', padding: '8px 16px', fontSize: '0.85rem'}} onClick={() => navigate('/report')}>+ Report Issue</button>
      </div>

      <div className="shell-content fade-in">
        {loading ? <p>Loading...</p> : (
          <>
            <div className="kpi-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'}}>
                {(!myComplaints || myComplaints.length === 0) && <p style={{color:'#a1a1aa', padding: '20px'}}>You haven't reported any issues yet.</p>}
                {(myComplaints || []).map(c => (
                  <div key={c._id} className="glass-card flex-column">
                    <div className="flex-between">
                      <span className={`badge badge-status ${c.status?.replace(' ', '')?.toLowerCase() || 'pending'}`}>{c.status || 'Pending'}</span>
                      <span className={`badge badge-priority ${c.priority?.toLowerCase() || 'normal'}`}>{c.priority || 'Normal'}</span>
                    </div>
                    <h3 style={{margin: '10px 0 0 0', fontSize: '1.2rem'}}>{c.title}</h3>
                    <p style={{color: '#a1a1aa', fontSize: '0.85rem', margin: 0}}>{c.category} • {c.area}</p>
                    <p style={{color: '#d4d4d8', fontSize: '0.95rem', lineHeight: 1.5, flex: 1}}>{c.description}</p>
                    {c.imageUrl && (
                      <div style={{margin: '15px 0 0 0', borderRadius: '8px', overflow: 'hidden'}}>
                        <span style={{fontSize: '0.7rem', fontWeight: '700', color: '#a0a0a0', letterSpacing: '0.1em', display: 'block', marginBottom: '8px'}}>PHOTO EVIDENCE</span>
                        <img src={c.imageUrl} alt="Evidence" style={{width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '4px'}} />
                      </div>
                    )}
                    {c.officerRemark && (
                      <div className="glass-card" style={{background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)', padding: '15px'}}>
                        <strong style={{color: '#60a5fa', fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>OFFICER REMARK</strong> 
                        <span style={{fontSize: '0.9rem'}}>{c.officerRemark}</span>
                      </div>
                    )}
                    {c.feedbackPending && (
                      <form className="glass-card flex-column mt-4" style={{borderColor: 'rgba(16, 185, 129, 0.3)'}} onSubmit={(e) => handleFeedback(c._id, e)}>
                        <h4 style={{margin: 0, color: '#34d399'}}>Provide Feedback on Resolution</h4>
                        <select className="form-select" name="rating" required>
                          <option value="">Rating (1-5)</option>
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Average</option>
                          <option value="2">2 - Poor</option>
                          <option value="1">1 - Terrible</option>
                        </select>
                        <input className="form-input" type="text" name="comment" placeholder="Optional comment" />
                        <button type="submit" className="btn-secondary">Submit Feedback</button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
          </>
        )}
      </div>
    </>
  );
};

export default CitizenDashboard;
