import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CinematicScroll from '../components/CinematicScroll';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleReportClick = (category = 'Road') => {
    if (user) {
      navigate('/report', { state: { category } });
    } else {
      navigate('/login', { state: { from: '/report', category } });
    }
  };

  const categories = [
    {
      name: 'Water',
      image: '/frames/ezgif-frame-100.jpg',
      desc: 'Report water supply, pipeline leakage, or contamination.'
    },
    {
      name: 'Road',
      image: '/frames/ezgif-frame-050.jpg',
      desc: 'Report damaged roads, potholes, or street infrastructure.'
    },
    {
      name: 'Garbage',
      image: '/frames/ezgif-frame-200.jpg',
      desc: 'Report waste accumulation and garbage collection issues.'
    },
    {
      name: 'Electricity',
      image: '/frames/ezgif-frame-150.jpg',
      desc: 'Report power outages or damaged electrical infrastructure.'
    },
    {
      name: 'Other',
      image: '/frames/ezgif-frame-280.jpg',
      desc: 'Report general civic infrastructure issues.'
    }
  ];

  return (
    <div className="landing-page">
      <Navbar />
      
      <section id="home">
        <CinematicScroll />
      </section>

      <section id="issues" className="issues-section">
        <div className="section-container">
          <h2 className="section-title">WHAT NEEDS FIXING?</h2>
          <p className="section-subtitle">
            See something that needs attention? Report it and help your community get it resolved.
          </p>
          <div className="issues-grid">
            {categories.map(cat => (
              <div key={cat.name} className="issue-card" onClick={() => handleReportClick(cat.name)}>
                <div className="issue-img-wrapper">
                  <img 
                    src={cat.image} 
                    alt={`${cat.name} infrastructure issue`} 
                    className="issue-img" 
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="issue-fallback" style={{ display: 'none' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z"/><path d="M12 16v-4"/><path d="M12 20h.01"/></svg>
                    <span>{cat.name}</span>
                  </div>
                  <div className="issue-gradient-overlay"></div>
                </div>
                <div className="issue-content">
                  <span className="issue-label">CATEGORY</span>
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                  <button className="btn-report">REPORT ISSUE <span className="arrow">→</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">HOW IT WORKS</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>REPORT</h3>
              <p>Tell us what is wrong with accurate locations.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>PRIORITIZE</h3>
              <p>Community engagement helps surface important issues.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>ACT</h3>
              <p>Officers review and address the critical issues.</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <h3>VERIFY</h3>
              <p>Citizens see the resolution and provide feedback.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="impact" className="impact-section">
        <div className="section-container">
          <h2 className="section-title">COMMUNITY IMPACT</h2>
          <div className="impact-content">
            <h3>Your Voice Matters</h3>
            <p>
              When you report an issue, it directly informs city planning and rapid response units. 
              Our platform connects neighborhoods with the people who fix them, ensuring that the 
              most critical infrastructure problems are addressed first.
            </p>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <h2>YOUR CITY. YOUR VOICE.</h2>
        <p>See a problem? Report it. Follow its progress. Help make your community better.</p>
        <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap'}}>
          <button className="btn-primary" style={{padding: '16px 32px', fontSize: '1.1rem'}} onClick={() => handleReportClick('Road')}>REPORT AN ISSUE →</button>
          <button className="btn-secondary" style={{padding: '16px 32px', fontSize: '1.1rem'}} onClick={() => navigate('/complaints')}>EXPLORE ISSUES</button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
