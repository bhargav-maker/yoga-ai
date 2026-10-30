import React from 'react'
import { Link } from 'react-router-dom'
import './Tutorials.css'
import { poseInstructions, fixCamera } from './utils/data'
import { poseImages } from './utils/pose_images'

export default function Tutorials() {
    const poses = [
        { name: 'Tree', sanskrit: 'Vrikshasana', tier: 'Beginner', focus: 'Balance, Pelvic Alignment & Focus', time: '20–30s' },
        { name: 'Chair', sanskrit: 'Utkatasana', tier: 'Beginner', focus: 'Quadriceps, Core & Spinal Stability', time: '15–25s' },
        { name: 'Warrior', sanskrit: 'Virabhadrasana', tier: 'Intermediate', focus: 'Hip Extension, Lunges & Stamina', time: '25–40s' },
        { name: 'Dog', sanskrit: 'Adho Mukha Svanasana', tier: 'Intermediate', focus: 'Hamstrings, Calves & Shoulder Opening', time: '30–45s' },
        { name: 'Cobra', sanskrit: 'Bhujangasana', tier: 'Intermediate', focus: 'Lumbar Extension & Chest Elevation', time: '20–30s' },
        { name: 'Triangle', sanskrit: 'Trikonasana', tier: 'Advanced', focus: 'Lateral Hip Leveling & Hamstring Length', time: '25–35s' },
        { name: 'Shoulderstand', sanskrit: 'Sarvangasana', tier: 'Advanced', focus: 'Inverted Circulation & Vertical Core Hold', time: '30–60s' },
    ];

    return (
        <div className="tutorials-container">
            {/* Header */}
            <header className="tutorials-header">
                <Link to="/" className="tutorials-back-link">
                    <span>←</span> Back to Studio Home
                </Link>
                <div className="tutorials-title-badge">MASTERCLASS CURRICULUM</div>
                <h1 className="tutorials-main-title">Asana Masterclass & Visual Tutorials</h1>
                <p className="tutorials-sub-desc">
                    Comprehensive step-by-step biomechanical guidelines, target form references, and camera optimization tips.
                </p>
            </header>

            {/* Asanas 3D Grid */}
            <div className="tutorials-grid-3d">
                {poses.map((pose) => {
                    const instructions = poseInstructions[pose.name] || [];
                    const img = poseImages[pose.name];

                    return (
                        <div key={pose.name} className="tutorial-pose-card-3d">
                            <div className="pose-card-media-3d">
                                <img src={img} alt={`${pose.name} Pose`} className="tutorial-img" />
                                <span className={`pose-tier-tag tier-${pose.tier.toLowerCase()}`}>{pose.tier}</span>
                                <span className="pose-time-badge">⏱️ {pose.time}</span>
                            </div>
                            <div className="pose-card-body-3d">
                                <div className="pose-title-wrap">
                                    <h2>{pose.name} Pose</h2>
                                    <span className="sanskrit-name">({pose.sanskrit})</span>
                                </div>
                                <span className="pose-focus">🎯 Focus: {pose.focus}</span>

                                <div className="instructions-list-wrap-3d">
                                    <h4>Biomechanical Protocol:</h4>
                                    <div className="steps-container-3d">
                                        {instructions.slice(0, 3).map((step, idx) => (
                                            <div key={idx} className="step-row-3d">
                                                <span className="step-num-pill">0{idx + 1}</span>
                                                <p className="step-desc-text">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Link to="/start" className="btn-practice-pose-3d">
                                    <span>Practice {pose.name} in Studio</span>
                                    <span className="btn-arrow">→</span>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Camera Setup Guide */}
            <section className="camera-help-card-3d">
                <div className="camera-header-row">
                    <span className="camera-icon-badge">📹</span>
                    <div>
                        <h3>Camera Setup & Studio Calibration Guide</h3>
                        <p>Follow these setup rules for seamless 60 FPS skeletal keypoint detection.</p>
                    </div>
                </div>
                <div className="camera-tips-grid-3d">
                    {fixCamera.map((tip, i) => (
                        <div key={i} className="camera-tip-item-3d">
                            <span className="tip-num-3d">0{i + 1}</span>
                            <p>{tip}</p>
                        </div>
                    ))}
                    <div className="camera-tip-item-3d">
                        <span className="tip-num-3d">04</span>
                        <p>Keep your full body from head to feet visible inside the green guidelines.</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
