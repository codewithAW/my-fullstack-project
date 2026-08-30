import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { changePassword, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please try again.');
      return;
    }
    
    setIsLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password.');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="auth-split-layout">
      <div 
        className="auth-visual-panel" 
        style={{ backgroundImage: 'url(/frames/ezgif-frame-001.jpg)' }}
      >
        <div className="auth-visual-overlay"></div>
        <div className="auth-visual-content">
          <h1>SECURE YOUR<br/>ACCOUNT</h1>
          <p>Please set a permanent password to continue.</p>
          <div className="platform-status">
            <span className="status-dot"></span>
            OFFICER PORTAL • SECURE SETUP
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form">
          <div className="auth-brand" style={{color: '#fff'}}>CIVIC CONNECT</div>
          
          <div className="auth-header">
            <h2>REQUIRED ACTION</h2>
            <p>Welcome, {user?.name}. You must change your temporary password before accessing the system.</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="oldPassword">Current / Temporary Password</label>
              <div className="auth-input-wrapper">
                <input 
                  id="oldPassword"
                  type={showPassword ? "text" : "password"} 
                  className="auth-input"
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  required 
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="auth-input-wrapper">
                <input 
                  id="newPassword"
                  type={showPassword ? "text" : "password"} 
                  className="auth-input"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  placeholder="Create a strong password"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="auth-input-wrapper">
                <input 
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"} 
                  className="auth-input"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'UPDATING...' : (
                <>SECURE ACCOUNT <span className="btn-arrow">→</span></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Not ready? 
            <button onClick={handleLogout} className="auth-link" style={{background:'none',border:'none',cursor:'pointer',fontSize:'inherit'}}>SIGN OUT</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
