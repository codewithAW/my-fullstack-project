import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="public-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          CIVIC<span className="brand-highlight">PORTAL</span>
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <button className="nav-link" onClick={() => scrollToSection('home')}>Home</button>
          <button className="nav-link" onClick={() => scrollToSection('issues')}>Categories</button>
          <Link to="/complaints" className="nav-link" onClick={() => setMenuOpen(false)}>Explore Issues</Link>
          <button className="nav-link" onClick={() => scrollToSection('how-it-works')}>How It Works</button>
          <button className="nav-link" onClick={() => scrollToSection('impact')}>About</button>
          
          <div className="navbar-actions">
            {user ? (
              <Link to="/dashboard" className="btn-login" onClick={() => setMenuOpen(false)}>DASHBOARD</Link>
            ) : (
              <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>LOGIN</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
