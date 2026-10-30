import React from 'react'
import { Link } from 'react-router-dom'
import { poseImages } from './utils/pose_images'
import './Home.css'

export default function Home() {
    return (
        <div className='home-container'>
            {/* Top Navigation Header */}
            <header className='home-header'>
                <div className="home-logo-wrap">
                    <span className="home-logo-icon">🧘</span>
                    <h1 className='home-heading'>Yoga AI</h1>
                    <span className="home-badge">Poddar Yogis</span>
                </div>
                <nav className="home-nav-actions">
                    <Link to='/progress' className="nav-btn-link">
                        <button className="nav-btn">📊 Analytics & History</button>
                    </Link>
                    <Link to='/tutorials' className="nav-btn-link">
                        <button className="nav-btn">📖 Tutorials</button>
                    </Link>
                    <Link to='/about' className="nav-btn-link">
                        <button className="nav-btn">ℹ️ About</button>
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-badge">AI-POWERED BIOMECHANICAL WELLNESS TECH</div>
                <h1 className="hero-title">
                    Master Your Form with <span className="gradient-text">Real-Time AI</span>
                </h1>
                <p className="hero-desc">
                    Instant 30–60 FPS camera posture tracking, clinical angle evaluation, 
                    injury prevention safeguards, and breathing synchronization running 100% offline in your browser.
                </p>

                <div className="hero-cta-group">
                    <Link to='/start'>
                        <button className="btn-hero-primary">Start Yoga Practice 🚀</button>
                    </Link>
                    <Link to='/tutorials'>
                        <button className="btn-hero-secondary">Explore Asana Library 📖</button>
                    </Link>
                </div>
            </section>

            {/* Asana Difficulty Tiers & Pose Showcase Section */}
            <section className="poses-showcase-section">
                <div className="section-header">
                    <h2>Supported Asanas by Difficulty Tier</h2>
                    <p>Each classical asana is calibrated with verified biomechanical targets, difficulty badges, and form guidelines.</p>
                </div>

                <div className="poses-showcase-grid">
                    {[
                        { name: 'Tree', sanskrit: 'Vrikshasana', tier: 'Beginner', focus: 'Balance & Pelvic Square', badgeClass: 'tier-badge-beginner' },
                        { name: 'Chair', sanskrit: 'Utkatasana', tier: 'Beginner', focus: 'Quads & Spinal Alignment', badgeClass: 'tier-badge-beginner' },
                        { name: 'Cobra', sanskrit: 'Bhujangasana', tier: 'Intermediate', focus: 'Thoracic Extension', badgeClass: 'tier-badge-intermediate' },
                        { name: 'Warrior', sanskrit: 'Virabhadrasana', tier: 'Intermediate', focus: 'Deep Lunge & Core Hold', badgeClass: 'tier-badge-intermediate' },
                        { name: 'Dog', sanskrit: 'Adho Mukha', tier: 'Intermediate', focus: 'Shoulder & Hamstring Opening', badgeClass: 'tier-badge-intermediate' },
                        { name: 'Triangle', sanskrit: 'Trikonasana', tier: 'Advanced', focus: 'Lateral Hip Leveling', badgeClass: 'tier-badge-expert' },
                        { name: 'Shoulderstand', sanskrit: 'Sarvangasana', tier: 'Advanced', focus: 'Inverted Balance & Core', badgeClass: 'tier-badge-expert' }
                    ].map((asana) => (
                        <div key={asana.name} className="pose-showcase-card">
                            <div className="pose-showcase-media">
                                <img 
                                    src={poseImages[asana.name]} 
                                    alt={`${asana.name} Pose`} 
                                    className="pose-showcase-img"
                                />
                                <span className={`pose-tier-badge ${asana.badgeClass}`}>
                                    {asana.tier}
                                </span>
                            </div>
                            <div className="pose-showcase-info">
                                <div className="pose-title-row">
                                    <h3>{asana.name} Pose</h3>
                                    <span className="pose-sanskrit">({asana.sanskrit})</span>
                                </div>
                                <p className="pose-focus-text">🎯 {asana.focus}</p>
                                <Link to="/start" className="btn-practice-mini">
                                    Practice Now →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Highlights Grid */}
            <section className="tech-highlights-section">
                <div className="highlight-pill">
                    <span className="pill-icon">⚡</span>
                    <div>
                        <strong>100% Offline AI</strong>
                        <span>Zero cloud latency, runs privately on local WebGL</span>
                    </div>
                </div>
                <div className="highlight-pill">
                    <span className="pill-icon">🛡️</span>
                    <div>
                        <strong>Joint Safety Limits</strong>
                        <span>Prevents knee & elbow hyperextension injury</span>
                    </div>
                </div>
                <div className="highlight-pill">
                    <span className="pill-icon">🌬️</span>
                    <div>
                        <strong>Pranayama Breathing</strong>
                        <span>Synchronized Inhale/Hold/Exhale rhythm</span>
                    </div>
                </div>
            </section>
        </div>
    )
}
