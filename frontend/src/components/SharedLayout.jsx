import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../pages/Shared.css';

const SharedLayout = ({ children, title = "CIVIC CONNECT" }) => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <nav className="shell-nav">
        <Link to="/" className="nav-brand">
          CIVIC <span>CONNECT</span>
        </Link>
        
        <button className="nav-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-actions ${menuOpen ? 'open' : ''}`}>
          <Link to="/complaints" className="btn-ghost" style={{textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem'}}>
            EXPLORE ISSUES
          </Link>
          {user && (
            <>
            <div className="nav-profile-container">
              <div className="nav-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="nav-profile-dropdown">
                <div className="nav-profile-info" style={{marginBottom: '10px'}}>
                  <span className="nav-name">{user.name}</span>
                  <span className="nav-role">{user.role}</span>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', width: '100%'}}>
                  <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{width: '100%', padding: '8px', fontSize: '0.8rem'}}>
                    MY DASHBOARD
                  </button>
                  <button onClick={handleLogout} className="btn-secondary" style={{width: '100%', padding: '8px', fontSize: '0.8rem'}}>
                    SIGN OUT
                  </button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </nav>

      <main className="shell-main">
        {children}
      </main>
    </div>
  );
};

export default SharedLayout;
