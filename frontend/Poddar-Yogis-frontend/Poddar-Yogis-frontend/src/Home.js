import React from 'react'
import { Link } from 'react-router-dom'
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

            {/* Asana Difficulty Tiers Section */}
            <section className="poses-showcase-section">
                <div className="section-header">
                    <h2>Supported Asanas by Difficulty Tier</h2>
                    <p>Structured progression from foundational grounding to advanced spinal elevation.</p>
                </div>

                <div className="tier-cards-grid">
                    {/* Beginner Tier */}
                    <div className="tier-card tier-beginner">
                        <div className="tier-badge">Beginner Foundational</div>
                        <h3>Tree & Chair Pose</h3>
                        <p className="tier-desc">Develop ankle stability, quadriceps strength, and fundamental body awareness.</p>
                        <ul className="tier-list">
                            <li><strong>Tree Pose (Vrikshasana)</strong> — Balance & pelvic squaring</li>
                            <li><strong>Chair Pose (Utkatasana)</strong> — Core activation & knee alignment</li>
                        </ul>
                        <div className="tier-footer">
                            <Link to="/start" className="tier-link">Practice Beginners →</Link>
                        </div>
                    </div>

                    {/* Intermediate Tier */}
                    <div className="tier-card tier-intermediate">
                        <div className="tier-badge">Intermediate Dynamic</div>
                        <h3>Cobra, Warrior & Dog</h3>
                        <p className="tier-desc">Build kinetic chain strength, shoulder endurance, and spinal extension flexibility.</p>
                        <ul className="tier-list">
                            <li><strong>Warrior Pose (Virabhadrasana)</strong> — Hip opening & deep lunge</li>
                            <li><strong>Downward Dog (Adho Mukha)</strong> — Posterior chain stretch</li>
                            <li><strong>Cobra Pose (Bhujangasana)</strong> — Gentle lumbar & chest expansion</li>
                        </ul>
                        <div className="tier-footer">
                            <Link to="/start" className="tier-link">Practice Intermediates →</Link>
                        </div>
                    </div>

                    {/* Expert Tier */}
                    <div className="tier-card tier-expert">
                        <div className="tier-badge">Advanced Inversion</div>
                        <h3>Triangle & Shoulderstand</h3>
                        <p className="tier-desc">Refine lateral pelvic leveling, hamstring length, and inverted balance control.</p>
                        <ul className="tier-list">
                            <li><strong>Triangle Pose (Trikonasana)</strong> — Lateral slope symmetry</li>
                            <li><strong>Shoulderstand (Sarvangasana)</strong> — Vertical hip elevation & circulation</li>
                        </ul>
                        <div className="tier-footer">
                            <Link to="/start" className="tier-link">Practice Advanced →</Link>
                        </div>
                    </div>
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
