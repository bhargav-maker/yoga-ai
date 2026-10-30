import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { poseImages } from './utils/pose_images'
import './Home.css'

export default function Home() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 40) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const asanas = [
        { name: 'Tree', sanskrit: 'Vrikshasana', tier: 'Beginner', focus: 'Balance & Pelvic Square', badgeClass: 'tier-badge-beginner', duration: '20–30s hold' },
        { name: 'Chair', sanskrit: 'Utkatasana', tier: 'Beginner', focus: 'Quads & Spinal Alignment', badgeClass: 'tier-badge-beginner', duration: '15–25s hold' },
        { name: 'Cobra', sanskrit: 'Bhujangasana', tier: 'Intermediate', focus: 'Thoracic Extension', badgeClass: 'tier-badge-intermediate', duration: '20–30s hold' },
        { name: 'Warrior', sanskrit: 'Virabhadrasana', tier: 'Intermediate', focus: 'Deep Lunge & Core Hold', badgeClass: 'tier-badge-intermediate', duration: '25–40s hold' },
        { name: 'Dog', sanskrit: 'Adho Mukha', tier: 'Intermediate', focus: 'Shoulder & Hamstring Opening', badgeClass: 'tier-badge-intermediate', duration: '30–45s hold' },
        { name: 'Triangle', sanskrit: 'Trikonasana', tier: 'Advanced', focus: 'Lateral Hip Leveling', badgeClass: 'tier-badge-expert', duration: '25–35s hold' },
        { name: 'Shoulderstand', sanskrit: 'Sarvangasana', tier: 'Advanced', focus: 'Inverted Balance & Core', badgeClass: 'tier-badge-expert', duration: '30–60s hold' }
    ];

    return (
        <div className='home-container'>
            {/* Ambient 3D Glow Orbs */}
            <div className="ambient-orb orb-primary" aria-hidden="true" />
            <div className="ambient-orb orb-cyan" aria-hidden="true" />
            <div className="ambient-orb orb-orange" aria-hidden="true" />

            {/* Scroll-Elevated Glass Navigation Header */}
            <header className={`home-header ${scrolled ? 'header-scrolled' : ''}`}>
                <div className="home-logo-wrap">
                    <span className="home-logo-icon">🧘</span>
                    <div>
                        <h1 className='home-heading'>Yoga AI</h1>
                        <span className="home-sub-title">Studio Edition</span>
                    </div>
                    <span className="home-badge">Poddar Yogis</span>
                </div>
                <nav className="home-nav-actions">
                    <Link to='/progress' className="nav-btn-link">
                        <button className="nav-btn">
                            <span className="btn-icon">📊</span> Analytics
                        </button>
                    </Link>
                    <Link to='/tutorials' className="nav-btn-link">
                        <button className="nav-btn">
                            <span className="btn-icon">📖</span> Tutorials
                        </button>
                    </Link>
                    <Link to='/about' className="nav-btn-link">
                        <button className="nav-btn">
                            <span className="btn-icon">ℹ️</span> About
                        </button>
                    </Link>
                    <Link to='/start' className="nav-btn-link">
                        <button className="nav-btn nav-btn-cta">
                            <span>Launch Studio</span> →
                        </button>
                    </Link>
                </nav>
            </header>

            {/* 3D Hero Stage */}
            <section className="hero-section">
                <div className="hero-3d-badge">
                    <span className="badge-pulse"></span>
                    <span>AI-POWERED BIOMECHANICAL WELLNESS TECH</span>
                </div>
                
                <h1 className="hero-title">
                    Master Your Form with <br />
                    <span className="gradient-text-3d">Real-Time Spatial AI</span>
                </h1>
                
                <p className="hero-desc">
                    Instant 30–60 FPS camera posture tracking, clinical joint validation, 
                    injury prevention safeguards, and breathing synchronization running 100% offline in your browser.
                </p>

                <div className="hero-cta-group">
                    <Link to='/start'>
                        <button className="btn-hero-primary-3d">
                            <span className="btn-shine"></span>
                            <span>Start Yoga Practice 🚀</span>
                        </button>
                    </Link>
                    <Link to='/tutorials'>
                        <button className="btn-hero-secondary-3d">
                            <span>Explore Asana Library 📖</span>
                        </button>
                    </Link>
                </div>

                {/* 3D Quick Metrics Bar */}
                <div className="hero-metrics-bar">
                    <div className="hero-metric-item">
                        <span className="metric-val">60 FPS</span>
                        <span className="metric-tag">TensorFlow WebGL</span>
                    </div>
                    <div className="hero-metric-divider"></div>
                    <div className="hero-metric-item">
                        <span className="metric-val">0.0 ms</span>
                        <span className="metric-tag">Zero Cloud Latency</span>
                    </div>
                    <div className="hero-metric-divider"></div>
                    <div className="hero-metric-item">
                        <span className="metric-val">100%</span>
                        <span className="metric-tag">Client-Side Privacy</span>
                    </div>
                    <div className="hero-metric-divider"></div>
                    <div className="hero-metric-item">
                        <span className="metric-val">17 Keypoints</span>
                        <span className="metric-tag">MoveNet Lightning</span>
                    </div>
                </div>
            </section>

            {/* 3D Asana Showcase Section */}
            <section className="poses-showcase-section">
                <div className="section-header">
                    <span className="section-pretitle">PRECISION CALIBRATED ASANAS</span>
                    <h2>Classical Asana Library by Difficulty</h2>
                    <p>Every posture features biometric target angles, balance tracking, and auditory coach corrections.</p>
                </div>

                <div className="poses-showcase-grid-3d">
                    {asanas.map((asana) => (
                        <div key={asana.name} className="pose-showcase-card-3d">
                            <div className="card-ambient-glow" />
                            <div className="pose-showcase-media">
                                <img 
                                    src={poseImages[asana.name]} 
                                    alt={`${asana.name} Pose`} 
                                    className="pose-showcase-img"
                                    loading="lazy"
                                />
                                <span className={`pose-tier-badge ${asana.badgeClass}`}>
                                    {asana.tier}
                                </span>
                                <span className="pose-duration-chip">⏱️ {asana.duration}</span>
                            </div>
                            <div className="pose-showcase-info">
                                <div className="pose-title-row">
                                    <h3>{asana.name} Pose</h3>
                                    <span className="pose-sanskrit">({asana.sanskrit})</span>
                                </div>
                                <p className="pose-focus-text">🎯 {asana.focus}</p>
                                <div className="card-footer-action">
                                    <Link to="/start" className="btn-practice-3d">
                                        Practice Asana <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3D Architectural Architecture Highlights */}
            <section className="tech-highlights-section-3d">
                <div className="highlight-card-3d">
                    <div className="pill-icon-wrap">⚡</div>
                    <div className="highlight-content">
                        <strong>100% Offline AI Studio</strong>
                        <p>No video or telemetry is sent to any server. Complete domestic privacy with pure on-device GPU inference.</p>
                    </div>
                </div>
                <div className="highlight-card-3d">
                    <div className="pill-icon-wrap">🛡️</div>
                    <div className="highlight-content">
                        <strong>Joint Safety Limits</strong>
                        <p>Active prevention algorithms detect knee & elbow hyperextension before strain occurs, protecting joints in real time.</p>
                    </div>
                </div>
                <div className="highlight-card-3d">
                    <div className="pill-icon-wrap">🌬️</div>
                    <div className="highlight-content">
                        <strong>Pranayama Breathing</strong>
                        <p>Synchronized 4-4-4 Inhale/Hold/Exhale rhythm rings expand and contract smoothly over your chest.</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
