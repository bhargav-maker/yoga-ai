import React from 'react'
import { HashRouter as Router, Route, Routes} from 'react-router-dom'

import Home from './Home'
import Yoga from './Yoga'
import About from './About'
import Tutorials from './Tutorials'

import './App.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/start' element={<Yoga />} />
        <Route path='/about' element={<About />} />
        <Route path='/tutorials' element={<Tutorials />} />
      </Routes>
    </Router>
  )
}
