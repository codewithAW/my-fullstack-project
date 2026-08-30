import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { verifyEmail, resendVerification } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto advance
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim().slice(0, 6);
    if (/[^0-9]/.test(pastedData)) return;
    
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newCode[i] = pastedData[i];
    }
    setCode(newCode);
    
    // Focus next empty or last input
    const nextIndex = Math.min(5, pastedData.length);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await verifyEmail(email, fullCode);
      setSuccessMsg('Email verified successfully! Taking you to the dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    
    setResendLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      await resendVerification(email);
      setSuccessMsg('A new verification code has been sent to your email.');
      setResendCooldown(30); // 30 second cooldown
      setCode(['', '', '', '', '', '']); // Clear current code
      inputRefs.current[0].focus();
    } catch (err) {
      if (err.response?.status === 429) {
         setResendCooldown(30);
         setError(err.response?.data?.message);
      } else {
         setError(err.response?.data?.message || err.message || 'Failed to resend code.');
      }
    }
    setResendLoading(false);
  };

  return (
    <div className="verify-page-container fade-in">
      {/* HOMEPAGE CINEMATIC BACKGROUND VISUAL */}
      <div className="verify-cinematic-bg">
        <img 
          src="/frames/ezgif-frame-001.jpg" 
          alt="Cinematic Civic Connect Background" 
          className="verify-bg-image"
        />
        <div className="verify-bg-overlay"></div>
      </div>

      <div className="verify-content-z">
        <div className="verify-glass-panel">
          <div className="auth-header text-center">
            <Link to="/" className="auth-logo" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>CivicOps</Link>
            <h2 className="auth-title mt-4" style={{letterSpacing: '0.1em', fontSize: '1.5rem'}}>VERIFY YOUR EMAIL</h2>
            <p className="auth-subtitle mb-2" style={{color: '#d1d5db'}}>We've sent a 6-digit verification code to:</p>
            <p style={{color: '#fff', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block'}}>{email}</p>
          </div>

          {error && <div className="auth-alert alert-error mt-3">{error}</div>}
          {successMsg && <div className="auth-alert alert-success mt-3">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form mt-4">
            <div className="form-group text-center">
               <label className="form-label" style={{marginBottom: '20px', letterSpacing: '0.15em', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase'}}>ENTER VERIFICATION CODE</label>
               <div className="otp-container">
                 {code.map((digit, index) => (
                   <input
                     key={index}
                     type="text"
                     maxLength="1"
                     value={digit}
                     onChange={(e) => handleChange(e, index)}
                     onKeyDown={(e) => handleKeyDown(e, index)}
                     onPaste={handlePaste}
                     ref={(el) => (inputRefs.current[index] = el)}
                     className="otp-input form-input"
                     autoFocus={index === 0}
                   />
                 ))}
               </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-100" 
              style={{marginTop: '30px', padding: '16px', letterSpacing: '0.15em', fontSize: '0.9rem'}}
              disabled={loading || code.join('').length !== 6}
            >
              {loading ? <span className="spinner"></span> : 'VERIFY & CONTINUE →'}
            </button>
          </form>

          <div className="auth-footer text-center" style={{marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px'}}>
            <p className="auth-link-text mb-2" style={{color: '#9ca3af'}}>Didn't receive the code?</p>
            
            {resendCooldown > 0 ? (
              <p style={{color: '#6b7280', fontSize: '0.9rem', fontWeight: '500'}}>Resend code in {resendCooldown}s</p>
            ) : (
              <button 
                type="button" 
                onClick={handleResend} 
                className="btn-ghost" 
                style={{padding: '8px 16px', fontSize: '0.85rem', letterSpacing: '0.1em'}}
                disabled={resendLoading}
              >
                {resendLoading ? 'SENDING...' : 'RESEND CODE'}
              </button>
            )}
            
            <div style={{marginTop: '25px'}}>
              <Link to="/signup" className="auth-link" style={{fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'all 0.2s'}}>Change email address</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
