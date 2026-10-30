import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
    return (
        <div className="about-container">
            <header className="about-nav-header">
                <Link to="/" className="about-back-link">← Back to Home</Link>
                <div className="about-logo-badge">🧘 Yoga AI • Poddar Yogis</div>
            </header>

            <main className="about-main-wrapper">
                <div className="about-hero-card">
                    <span className="about-tag">About The Project</span>
                    <h1 className="about-heading">Intelligent Biomechanical Wellness</h1>
                    <p className="about-intro">
                        <strong>Yoga AI: Poddar Yogis</strong> is a next-generation computer vision training studio engineered 
                        to provide clinical-grade posture validation, real-time spoken coaching, and injury prevention in your browser.
                    </p>
                </div>

                <div className="about-grid">
                    <div className="about-card">
                        <div className="about-card-icon">⚡</div>
                        <h3>100% Client-Side Privacy</h3>
                        <p>
                            All pose detection and neural classification runs locally using TensorFlow.js and WebGL. 
                            Your webcam feed never streams to external cloud servers, guaranteeing absolute domestic privacy.
                        </p>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon">📐</div>
                        <h3>Biomechanical Geometry</h3>
                        <p>
                            Analyzes joint-to-joint vector angles, center-of-gravity sway, slope symmetry, and hyperextension limits 
                            to train neuromuscular muscle memory safely.
                        </p>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon">🎙️</div>
                        <h3>Hands-Free Voice Coach</h3>
                        <p>
                            Real-time speech synthesis delivers audible corrections without requiring you to glance at your 
                            screen while holding challenging balance and inversion asanas.
                        </p>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon">📊</div>
                        <h3>Quantifiable Analytics</h3>
                        <p>
                            Auto-closing diagnostic scorecards, interactive pose accuracy bar graphs, and performance trend line charts 
                            track your daily holding endurance.
                        </p>
                    </div>
                </div>

                <div className="about-footer-card">
                    <div className="team-info">
                        <h3>Developed by Poddar Yogis</h3>
                        <p>Presented for District Level Science & Tech Exhibition 2026</p>
                    </div>
                    <div className="about-links">
                        <a href="https://github.com/bhargav-maker/yoga-ai" target="_blank" rel="noopener noreferrer" className="about-btn-github">
                            💻 GitHub Repository
                        </a>
                        <Link to="/start" className="about-btn-start">
                            🚀 Start AI Practice
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

