import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ComplaintContext } from '../context/ComplaintContext';

const ReportIssue = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportComplaint } = useContext(ComplaintContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(location.state?.category || 'Road');
  const [area, setArea] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image must be smaller than 10 MB.');
        return;
      }
      if (!file.type.match('image/(jpeg|png|webp)')) {
        setErrorMsg('Please upload a valid image file (JPG, PNG, WEBP).');
        return;
      }
      setErrorMsg('');
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e, confirmDuplicate = false) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await reportComplaint({ title, description, category, area, confirmDuplicate, photo });
      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicateWarning(err.response.data.existingComplaint);
      } else {
        setErrorMsg(err.response?.data?.message || 'Unable to submit the report. Please try again.');
      }
    }
  };

  if (success) {
    return (
      <div className="glass-card flex-column fade-in" style={{maxWidth: '600px', margin: '40px auto', width: '100%', textAlign: 'center', padding: '60px 40px', borderTop: '4px solid #34d399'}}>
        <div style={{fontSize: '4rem', marginBottom: '20px'}}>✅</div>
        <h2 style={{margin: '0 0 10px 0', fontSize: '2rem', letterSpacing: '0.05em'}}>REPORT SUBMITTED</h2>
        <p style={{color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '40px'}}>Your issue has been successfully reported and is now visible to the community and city officers.</p>
        
        <div className="flex-column" style={{gap: '15px'}}>
          <button className="btn-primary" onClick={() => navigate('/dashboard', { state: { tab: 'my' } })} style={{width: '100%'}}>VIEW MY REPORT →</button>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{width: '100%'}}>RETURN TO DASHBOARD</button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card fade-in" style={{maxWidth: '600px', margin: '20px auto', width: '100%'}}>
      <div className="dashboard-header mb-4">
        <h2>REPORT AN ISSUE</h2>
        <p className="dashboard-subtitle">Help us identify and resolve problems in your community.</p>
      </div>
      
      {errorMsg && (
        <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#ef4444'}}>
          {errorMsg}
        </div>
      )}

      {duplicateWarning && (
        <div className="glass-card flex-column mb-4 fade-in" style={{background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)'}}>
          <h3 style={{color: 'var(--accent-danger)', margin: 0}}>Similar Issue Found Nearby</h3>
          <p><strong>{duplicateWarning.title}</strong> ({duplicateWarning.status})</p>
          <div className="flex-between">
            <button className="btn-primary" onClick={() => navigate('/dashboard', { state: { tab: 'feed' } })}>VIEW EXISTING</button>
            <button className="btn-ghost" onClick={(e) => handleSubmit(e, true)}>SUBMIT ANYWAY</button>
          </div>
        </div>
      )}

      {!duplicateWarning && (
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option>Road</option>
              <option>Garbage</option>
              <option>Water</option>
              <option>Electricity</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <input className="form-input" type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Brief title of the issue" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Provide details about the issue..."></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" type="text" value={area} onChange={e => setArea(e.target.value)} required placeholder="e.g. Downtown" />
          </div>
          
          <div className="form-group">
            <label className="form-label" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>PHOTO EVIDENCE</span>
              <span style={{color: '#a1a1aa', fontWeight: 'normal', fontSize: '0.85rem', textTransform: 'none'}}>Optional</span>
            </label>
            
            {!photoPreview ? (
              <div className="upload-area" onClick={() => document.getElementById('photo-upload').click()} style={{
                border: '1px dashed var(--border-glass-hover)',
                borderRadius: 'var(--radius-sm)',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-surface)',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-glass-hover)'; }}>
                <span style={{fontSize: '2rem', display: 'block', marginBottom: '10px', color: 'var(--text-muted)'}}>+</span>
                <p style={{margin: '0 0 5px 0', fontWeight: '600', letterSpacing: '0.05em'}}>UPLOAD PHOTO</p>
                <p style={{margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)'}}>JPG, PNG or WEBP<br/>Optional</p>
                <input type="file" id="photo-upload" style={{display: 'none'}} accept="image/jpeg, image/png, image/webp" onChange={handlePhotoChange} />
              </div>
            ) : (
              <div className="upload-preview" style={{
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img src={photoPreview} alt="Preview" style={{width: '100%', height: '200px', objectFit: 'cover', display: 'block'}} />
                <div style={{padding: '10px 15px', background: 'rgba(10,10,10,0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{photo.name}</span>
                  <button type="button" onClick={handleRemovePhoto} style={{background: 'none', border: 'none', color: 'var(--accent-danger)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: '5px'}}>REMOVE</button>
                </div>
              </div>
            )}
          </div>
          <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
            <button type="button" className="btn-ghost" style={{flex: 1, padding: '16px', fontSize: '1rem'}} onClick={() => navigate('/dashboard')}>CANCEL</button>
            <button type="submit" className="btn-primary" style={{flex: 2, padding: '16px', fontSize: '1rem'}}>SUBMIT REPORT →</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReportIssue;
