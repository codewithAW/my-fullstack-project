import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await signup(name, email, password);
      setSuccess('Account created successfully.');
      setTimeout(() => {
        const destination = location.state?.from || '/dashboard';
        navigate(destination, { state: location.state });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create account.');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    setNeedsLogin(false);
    try {
      await googleLogin(credentialResponse.credential, 'signup');
      setTimeout(() => {
        const destination = location.state?.from || '/dashboard';
        navigate(destination, { state: location.state });
      }, 300);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('An account already exists with this Google account. Please sign in.');
        setNeedsLogin(true);
      } else {
        setError(err.response?.data?.message || 'Google authentication failed.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Cinematic Panel */}
      <div 
        className="auth-visual-panel" 
        style={{ backgroundImage: 'url(/frames/ezgif-frame-100.jpg)' }}
      >
        <div className="auth-visual-overlay"></div>
        <div className="auth-visual-content">
          <h1>JOIN YOUR<br/>COMMUNITY</h1>
          <p>Report problems. Follow progress. Help build a better city.</p>
          <div className="platform-status">
            <span className="status-dot"></span>
            CITIZEN PORTAL • SECURE
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(15px, 3vh, 30px)' }}>
            <Link to="/" className="auth-brand" style={{textDecoration: 'none', color: '#fff', margin: 0}}>CIVIC CONNECT</Link>
            <Link to="/" style={{color: '#a1a1aa', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s', fontWeight: 600}}>
              ← RETURN HOME
            </Link>
          </div>
          
          <div className="auth-header">
            <h2>CREATE ACCOUNT</h2>
            <p>Join thousands of citizens improving their neighborhoods.</p>
          </div>

          {error && (
            <div className="auth-error">
              <div><span>⚠</span> {error}</div>
              {needsLogin && (
                <div style={{marginTop: 'clamp(5px, 1vh, 15px)'}}>
                  <Link to="/login" className="auth-submit-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>
                    SIGN IN <span className="btn-arrow">→</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="auth-error" style={{backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
              <span>✓</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="name">Full Name</label>
              <div className="auth-input-wrapper">
                <input 
                  id="name"
                  type="text" 
                  className="auth-input"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <input 
                  id="email"
                  type="email" 
                  className="auth-input"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  className="auth-input"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrapper">
                <input 
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"} 
                  className="auth-input"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'CREATING ACCOUNT...' : (
                <>CREATE ACCOUNT <span className="btn-arrow">→</span></>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          <div className="google-auth-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google authentication failed.')}
              theme="filled_black"
              size="large"
              width="100%"
              text="continue_with"
              shape="pill"
            />
          </div>

          <div className="auth-footer">
            Already have an account? 
            <Link to="/login" className="auth-link">SIGN IN</Link>
          </div>

          <div className="auth-officer-hint">
            © 2026 Civic Connect Platform. <a href="#" style={{color: '#52525b'}}>Privacy</a> • <a href="#" style={{color: '#52525b'}}>Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
