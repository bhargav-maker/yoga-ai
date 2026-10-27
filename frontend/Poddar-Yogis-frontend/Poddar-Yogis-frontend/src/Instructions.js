import React from 'react'
import { poseInstructions } from './utils/data'
import { poseImages } from './utils/pose_images'
import './Instructions.css'

export default function Instructions({ currentPose }) {

    // FIX: this data never changes at runtime, so it doesn't belong in useState.
    const instructions = poseInstructions

    return (
        <div className="instructions-container">
            <ul className="instructions-list">
                {(instructions[currentPose] || []).map((instruction, index) => {
                    return(
                        <li key={index} className="instruction">{instruction}</li>
                    )
                })}
            </ul>
            <img 
                className="pose-demo-img"
                src={poseImages[currentPose]}
                alt="Pose Demonstration"
            />
        </div>
    )
}
