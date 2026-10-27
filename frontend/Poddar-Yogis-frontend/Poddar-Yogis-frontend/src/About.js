import React from 'react'
import './About.css'

export default function About() {
    return (
        <div className="about-container">
            <h1 className="about-heading">About</h1>
            <div className="about-main">
                <p className="about-content">
                    This is a real-time AI-based Yoga Trainer application created for Poddar Yogis to track posture accuracy and form. 
                    It leverages TensorFlow models and MoveNet to analyze key body coordinates and provide instant visual feedback.
                </p>
                <div className="developer-info">
                    <h4>Poddar Yogis</h4>
                    <p className="about-content">Welcome to the official portal for Poddar Yogis.</p>
                </div>
            </div>
        </div>
    )
}
