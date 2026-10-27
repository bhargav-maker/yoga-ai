import React from 'react'
import './Tutorials.css'
import { tutorials, fixCamera } from './utils/data'

export default function Tutorials() {
    return (
        <div className="tutorials-container">
            <h1 className="tutorials-heading">Basic Tutorials</h1>
            <div className="tutorials-content-container">
                {tutorials.map((tutorial, index) => (
                    <p key={index} className="tutorials-content">{tutorial}</p>
                ))}
            </div>
            <h1 className="tutorials-heading">Camera Not Working?</h1>
            <div className="tutorials-content-container">
                {fixCamera.map((points, index) => (
                    <p key={index} className="tutorials-content">{points}</p>
                ))}
            </div>
        </div>
    )
}
