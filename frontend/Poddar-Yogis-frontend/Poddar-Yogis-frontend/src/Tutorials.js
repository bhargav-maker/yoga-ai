import React from 'react'
import { Link } from 'react-router-dom'
import './Tutorials.css'
import { poseInstructions, fixCamera } from './utils/data'
import { poseImages } from './utils/pose_images'

export default function Tutorials() {
    const poses = [
        { name: 'Tree', sanskrit: 'Vrikshasana', tier: 'Beginner', focus: 'Balance, Pelvic Alignment & Focus' },
        { name: 'Chair', sanskrit: 'Utkatasana', tier: 'Beginner', focus: 'Quadriceps, Core & Spinal Stability' },
        { name: 'Warrior', sanskrit: 'Virabhadrasana', tier: 'Intermediate', focus: 'Hip Extension, Lunges & Stamina' },
        { name: 'Dog', sanskrit: 'Adho Mukha Svanasana', tier: 'Intermediate', focus: 'Hamstrings, Calves & Shoulder Opening' },
        { name: 'Cobra', sanskrit: 'Bhujangasana', tier: 'Intermediate', focus: 'Lumbar Extension & Chest Elevation' },
        { name: 'Triangle', sanskrit: 'Trikonasana', tier: 'Advanced', focus: 'Lateral Hip Leveling & Hamstring Length' },
        { name: 'Shoulderstand', sanskrit: 'Sarvangasana', tier: 'Advanced', focus: 'Inverted Circulation & Vertical Core Hold' },
    ];

    return (
        <div className="tutorials-container">
            {/* Header */}
            <header className="tutorials-header">
                <Link to="/" className="tutorials-back-link">← Back to Home</Link>
                <h1 className="tutorials-main-title">Asana Masterclass & Visual Tutorials</h1>
                <p className="tutorials-sub-desc">
                    Comprehensive step-by-step biomechanical guidelines, target form references, and camera optimization tips.
                </p>
            </header>

            {/* Asanas Grid */}
            <div className="tutorials-grid">
                {poses.map((pose) => {
                    const instructions = poseInstructions[pose.name] || [];
                    const img = poseImages[pose.name];

                    return (
                        <div key={pose.name} className="tutorial-pose-card">
                            <div className="pose-card-media">
                                <img src={img} alt={`${pose.name} Pose`} className="tutorial-img" />
                                <span className={`pose-tier-tag tier-${pose.tier.toLowerCase()}`}>{pose.tier}</span>
                            </div>
                            <div className="pose-card-body">
                                <div className="pose-title-wrap">
                                    <h2>{pose.name} Pose</h2>
                                    <span className="sanskrit-name">({pose.sanskrit})</span>
                                </div>
                                <span className="pose-focus">🎯 Focus: {pose.focus}</span>

                                <div className="instructions-list-wrap">
                                    <h4>How to Perform:</h4>
                                    <ol className="pose-steps-list">
                                        {instructions.slice(0, 3).map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ol>
                                </div>

                                <Link to="/start" className="btn-practice-pose">
                                    Practice {pose.name} in Studio →
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Camera Setup Guide */}
            <section className="camera-help-card">
                <h3>📹 Camera Setup & Troubleshooting</h3>
                <div className="camera-tips-grid">
                    {fixCamera.map((tip, i) => (
                        <div key={i} className="camera-tip-item">
                            <span className="tip-num">0{i + 1}</span>
                            <p>{tip}</p>
                        </div>
                    ))}
                    <div className="camera-tip-item">
                        <span className="tip-num">04</span>
                        <p>Position camera 6–8 feet away so your full body from head to feet is inside the frame.</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
