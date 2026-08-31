import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComplaintContext } from '../context/ComplaintContext';
import { AuthContext } from '../context/AuthContext';

const PublicFeed = () => {
  const navigate = useNavigate();
  const { complaints, loading, upvoteComplaint } = useContext(ComplaintContext);
  const { user } = useContext(AuthContext);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');

  const handleUpvote = (c) => {
    if (!user) {
      navigate('/login', { state: { from: '/complaints' } });
      return;
    }
    upvoteComplaint(c._id);
  };

  const filteredComplaints = (complaints || []).filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && c.category !== category) return false;
    if (area && !c.area.toLowerCase().includes(area.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="shell-content fade-in">
      <div className="dashboard-header fade-in">
        <div className="dashboard-eyebrow">Community Feed</div>
        <h1 className="dashboard-title">PUBLIC COMPLAINTS</h1>
        <p className="dashboard-subtitle" style={{marginBottom: '30px'}}>See what your neighbors are reporting and upvote critical issues.</p>
      </div>

      <div className="filters-container glass-card mb-4" style={{display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '15px'}}>
        <input 
          type="text" 
          placeholder="Search issues..." 
          className="form-input" 
          style={{flex: 1, minWidth: '200px', marginBottom: 0}}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-select" style={{flex: 1, minWidth: '150px', marginBottom: 0}} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Road">Road</option>
          <option value="Garbage">Garbage</option>
          <option value="Water">Water</option>
          <option value="Electricity">Electricity</option>
          <option value="Other">Other</option>
        </select>
        <input 
          type="text" 
          placeholder="Filter by area..." 
          className="form-input" 
          style={{flex: 1, minWidth: '150px', marginBottom: 0}}
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>

      {loading ? <p>Loading complaints...</p> : (
        <div className="kpi-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'}}>
          {filteredComplaints.length === 0 && <p style={{color:'#a1a1aa', padding: '20px'}}>No complaints found.</p>}
          {filteredComplaints.map(c => (
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
              <div className="flex-between mt-4" style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px'}}>
                <button 
                  className={`btn-upvote ${user && c.upvotedBy?.includes(user?._id) ? 'active' : ''}`} 
                  onClick={() => handleUpvote(c)}
                  title="Upvote this issue"
                >
                  {user && c.upvotedBy?.includes(user?._id) ? `↑ ${c.upvotes} Upvoted` : `↑ ${c.upvotes} Upvote`}
                </button>
                <span style={{color: '#a1a1aa', fontSize: '0.8rem'}}>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicFeed;
