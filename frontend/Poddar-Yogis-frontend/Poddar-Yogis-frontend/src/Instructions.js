import React from 'react';
import { poseInstructions } from './utils/data';
import { poseImages } from './utils/pose_images';
import './Instructions.css';

const POSE_TIERS = {
    Tree: { tier: 'Beginner', focus: 'Balance, Pelvic Alignment & Focus', badgeClass: 'tier-badge-beginner' },
    Chair: { tier: 'Beginner', focus: 'Quadriceps, Core & Spinal Stability', badgeClass: 'tier-badge-beginner' },
    Cobra: { tier: 'Intermediate', focus: 'Lumbar Extension & Thoracic Elevation', badgeClass: 'tier-badge-intermediate' },
    Warrior: { tier: 'Intermediate', focus: 'Hip Extension, Lunges & Arm Stability', badgeClass: 'tier-badge-intermediate' },
    Dog: { tier: 'Intermediate', focus: 'Hamstrings, Calves & Shoulder Opening', badgeClass: 'tier-badge-intermediate' },
    Triangle: { tier: 'Advanced', focus: 'Lateral Hip Leveling & Hamstring Stretch', badgeClass: 'tier-badge-expert' },
    Traingle: { tier: 'Advanced', focus: 'Lateral Hip Leveling & Hamstring Stretch', badgeClass: 'tier-badge-expert' },
    Shoulderstand: { tier: 'Advanced', focus: 'Inverted Circulation & Vertical Core Hold', badgeClass: 'tier-badge-expert' },
};

export default function Instructions({ currentPose }) {
    const instructions = poseInstructions[currentPose] || [];
    const meta = POSE_TIERS[currentPose] || { tier: 'All Levels', focus: 'Full-Body Posture', badgeClass: 'tier-badge-beginner' };

    return (
        <div className="instructions-container">
            {/* Left Instructions Card */}
            <div className="instructions-card">
                <div className="instructions-card-header">
                    <span className="inst-label">Biomechanical Guide</span>
                    <h3 className="inst-title">How to Perform {currentPose} Pose</h3>
                    <p className="inst-focus">🎯 <strong>Focus:</strong> {meta.focus}</p>
                </div>
                <ol className="instructions-list">
                    {instructions.map((instruction, index) => (
                        <li key={index} className="instruction-step">
                            <span className="step-number">{index + 1}</span>
                            <span className="step-text">{instruction}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Right Reference Demo Card with Badge */}
            <div className="demo-image-card">
                <div className="demo-media-wrapper">
                    <img 
                        className="pose-demo-img"
                        src={poseImages[currentPose]}
                        alt={`${currentPose} Pose Reference`}
                    />
                    <span className={`demo-tier-badge ${meta.badgeClass}`}>
                        {meta.tier} Tier
                    </span>
                </div>
                <div className="demo-caption">
                    <span className="demo-pose-name">{currentPose} Pose</span>
                    <span className="demo-pose-sub">Target Alignment Reference</span>
                </div>
            </div>
        </div>
    );
}

