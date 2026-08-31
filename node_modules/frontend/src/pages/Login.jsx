import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import './Auth.css';

const Login = () => {
  const [view, setView] = useState('citizen'); // 'citizen', 'officer', 'forgot', 'reset'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const emailValue = email.trim();
      const res = await login(emailValue, password);
      
      if (res.requiresVerification) {
        navigate('/verify-email', { state: { email: emailValue } });
      } else {
        setTimeout(() => {
          if (res.user.role === 'admin') navigate('/admin');
          else if (res.user.role === 'officer' && res.user.mustChangePassword) navigate('/change-password');
          else {
            const destination = location.state?.from || '/dashboard';
            navigate(destination, { state: location.state });
          }
        }, 300);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to sign in. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    setNeedsRegistration(false);
    try {
      await googleLogin(credentialResponse.credential, 'login');
      setTimeout(() => {
        const destination = location.state?.from || '/dashboard';
        navigate(destination, { state: location.state });
      }, 300);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("We couldn't find a registered account associated with this Google account. Please register first.");
        setNeedsRegistration(true);
      } else {
        setError(err.response?.data?.message || 'Google authentication failed.');
      }
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/officer/request-reset', { email: email.trim() });
      setSuccessMsg('Your password reset request has been sent for administrator approval.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset.');
    }
    setIsLoading(false);
  };

  const handleCheckReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.get(`/auth/officer/reset-status/${email}`);
      if (res.data.status === 'approved') {
        setView('reset');
      } else if (res.data.status === 'pending') {
        setError('Your reset request is still awaiting administrator approval.');
      } else if (res.data.status === 'expired') {
        setError('Your password reset authorization has expired. Please submit a new request.');
      } else {
        setError(`Your request is marked as: ${res.data.status}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No reset request found for this email.');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!resetToken) {
      setError('Please enter the reset token provided by your admin.');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/officer/reset-password', { email: email.trim(), resetToken, newPassword: password });
      setSuccessMsg('Your password has been successfully changed.');
      setView('officer');
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setIsLoading(false);
  };

  const switchView = (newView) => {
    setView(newView);
    setError('');
    setSuccessMsg('');
    setNeedsRegistration(false);
    setPassword('');
    setConfirmPassword('');
    setResetToken('');
  };

  return (
    <div className="auth-split-layout">
      {/* Left Cinematic Panel */}
      <div 
        className="auth-visual-panel" 
        style={{ backgroundImage: 'url(/frames/ezgif-frame-040.jpg)' }}
      >
        <div className="auth-visual-overlay"></div>
        <div className="auth-visual-content">
          <h1>{view === 'citizen' ? 'YOUR CITY.\nYOUR VOICE.' : 'SECURE\nACCESS'}</h1>
          <p>{view === 'citizen' ? 'One report can start a chain of action.' : 'Official government portal.'}</p>
          <div className="platform-status">
            <span className="status-dot"></span>
            Civic Issue Platform • Live
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
            {view === 'citizen' && <h2>WELCOME BACK</h2>}
            {view === 'officer' && <h2>OFFICER ACCESS</h2>}
            {view === 'forgot' && <h2>FORGOT OFFICER PASSWORD</h2>}
            {view === 'reset' && <h2>RESET YOUR PASSWORD</h2>}
            
            {view === 'forgot' ? (
              <p>Enter your registered officer email to request a password reset or check status.</p>
            ) : view === 'reset' ? (
              <p>Your password reset request has been approved. Enter your admin token.</p>
            ) : (
              <p>Sign in to continue accessing the system.</p>
            )}
          </div>

          {error && (
            <div className="auth-error">
              <div><span>⚠</span> {error}</div>
              {needsRegistration && (
                <div style={{marginTop: 'clamp(5px, 1vh, 15px)'}}>
                  <Link to="/signup" state={location.state} className="auth-submit-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>
                    REGISTER <span className="btn-arrow">→</span>
                  </Link>
                </div>
              )}
            </div>
          )}
          {successMsg && (
            <div className="auth-error" style={{backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
              <span>✓</span> {successMsg}
            </div>
          )}

          {/* CITIZEN & OFFICER LOGIN FORM */}
          {(view === 'citizen' || view === 'officer') && (
            <>
              <form onSubmit={handleStandardLogin}>
                <div className="auth-form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="auth-input-wrapper">
                    <input 
                      id="email" type="email" className="auth-input"
                      value={email} onChange={(e) => setEmail(e.target.value)} 
                      required placeholder="Enter your email" autoComplete="email"
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label htmlFor="password">Password</label>
                  <div className="auth-input-wrapper">
                    <input 
                      id="password" type={showPassword ? "text" : "password"} className="auth-input"
                      value={password} onChange={(e) => setPassword(e.target.value)} 
                      required placeholder="Enter your password" autoComplete="current-password"
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? 'SIGNING IN...' : (
                    <>SIGN IN <span className="btn-arrow">→</span></>
                  )}
                </button>
              </form>

              {view === 'citizen' && (
                <>
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
                    Don't have an account? 
                    <Link to="/signup" state={location.state} className="auth-link">CREATE ACCOUNT</Link>
                  </div>
                </>
              )}

              {view === 'officer' && (
                <div className="auth-footer" style={{marginTop: '20px'}}>
                  <button type="button" className="auth-link" style={{background:'none',border:'none',cursor:'pointer',fontSize:'inherit'}} onClick={() => switchView('forgot')}>
                    Forgot Password?
                  </button>
                </div>
              )}
            </>
          )}

          {/* FORGOT PASSWORD FORM */}
          {view === 'forgot' && (
            <div className="auth-forgot-flow">
              <form onSubmit={handleRequestReset}>
                <div className="auth-form-group">
                  <label htmlFor="reset-email">Officer Email</label>
                  <div className="auth-input-wrapper">
                    <input 
                      id="reset-email" type="email" className="auth-input"
                      value={email} onChange={(e) => setEmail(e.target.value)} 
                      required placeholder="Enter your official email"
                    />
                  </div>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button type="submit" className="auth-submit-btn" disabled={isLoading} style={{flex: 1}}>
                    {isLoading ? 'WORKING...' : 'REQUEST RESET'}
                  </button>
                  <button type="button" className="auth-submit-btn" onClick={handleCheckReset} disabled={isLoading} style={{flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff'}}>
                    CHECK STATUS
                  </button>
                </div>
              </form>
              <div className="auth-footer">
                <button type="button" className="auth-link" style={{background:'none',border:'none',cursor:'pointer',fontSize:'inherit'}} onClick={() => switchView('officer')}>
                  ← Back to Officer Login
                </button>
              </div>
            </div>
          )}

          {/* RESET PASSWORD FORM */}
          {view === 'reset' && (
            <div className="auth-reset-flow">
              <form onSubmit={handleResetPassword}>
                <div className="auth-form-group">
                  <label htmlFor="reset-token">Reset Token (from Admin)</label>
                  <div className="auth-input-wrapper">
                    <input 
                      id="reset-token" type="text" className="auth-input"
                      value={resetToken} onChange={(e) => setResetToken(e.target.value)} 
                      required placeholder="e.g. A8X91K"
                    />
                  </div>
                </div>
                <div className="auth-form-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="auth-input-wrapper">
                    <input 
                      id="new-password" type="password" className="auth-input"
                      value={password} onChange={(e) => setPassword(e.target.value)} 
                      required placeholder="Enter new password" minLength="6"
                    />
                  </div>
                </div>
                <div className="auth-form-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <div className="auth-input-wrapper">
                    <input 
                      id="confirm-password" type="password" className="auth-input"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                      required placeholder="Confirm new password" minLength="6"
                    />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? 'UPDATING...' : (
                    <>RESET PASSWORD <span className="btn-arrow">→</span></>
                  )}
                </button>
              </form>
              <div className="auth-footer">
                <button type="button" className="auth-link" style={{background:'none',border:'none',cursor:'pointer',fontSize:'inherit'}} onClick={() => switchView('officer')}>
                  Cancel Reset
                </button>
              </div>
            </div>
          )}

          {/* Toggle View Links */}
          <div className="auth-officer-hint">
            {view === 'citizen' ? (
              <button type="button" className="auth-link" style={{background:'none',border:'none',cursor:'pointer',color:'#a1a1aa'}} onClick={() => switchView('officer')}>
                Authorized personnel? Access Officer Portal
              </button>
            ) : (
              <button type="button" className="auth-link" style={{background:'none',border:'none',cursor:'pointer',color:'#a1a1aa'}} onClick={() => switchView('citizen')}>
                Not an officer? Return to Citizen Portal
              </button>
            )}
            <br/><br/>
            © 2026 Civic Connect Platform. <a href="#" style={{color: '#52525b'}}>Privacy</a> • <a href="#" style={{color: '#52525b'}}>Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
