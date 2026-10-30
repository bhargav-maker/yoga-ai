import React from 'react'
import { Link } from 'react-router-dom'

import './Home.css'

export default function Home() {

    return (
        <div className='home-container'>
            <div className='home-header'>
                <h1 className='home-heading'>Poddar Yogis</h1>
                <div style={{ display: 'flex', gap: '10px', marginRight: '30px' }}>
                    <Link to='/progress'>
                        <button 
                            className="btn btn-secondary" 
                            id="progress-btn"
                            style={{ padding: '5px 12px', fontSize: '18px' }}
                        >
                            📊 Analytics
                        </button>
                    </Link>
                    <Link to='/about'>
                        <button 
                            className="btn btn-secondary" 
                            id="about-btn"
                            style={{ padding: '5px 12px', fontSize: '18px' }}
                        >
                            About
                        </button>
                    </Link>
                </div>
            </div>

            <h1 className="description">A Yoga AI Trainer</h1>
            <div className="home-main">
                <div className="btn-section">
                    <Link to='/start'>
                        <button
                            className="btn start-btn"
                        >Let's Start</button>
                    </Link>
                    <Link to='/tutorials'>
                        <button
                            className="btn start-btn"
                        >Tutorials</button>
                    </Link>
                    <Link to='/progress'>
                        <button
                            className="btn start-btn"
                        >Progress & Reports</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
