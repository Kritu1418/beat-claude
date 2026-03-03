import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header.jsx'
import JDParser from './pages/JDParser.jsx'
import Assessment from './pages/Assessment.jsx'
import TakeTest from './pages/TakeTest.jsx'
import Leaderboard from './pages/Leaderboard.jsx'

export default function App() {
  const [parsedJD, setParsedJD] = useState(null)
  const [questions, setQuestions] = useState([])
  const [candidates, setCandidates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bc_candidates') || '[]')
    } catch {
      return []
    }
  })

  const saveCandidates = (c) => {
    setCandidates(c)
    localStorage.setItem('bc_candidates', JSON.stringify(c))
  }

  const shared = {
    parsedJD,
    setParsedJD,
    questions,
    setQuestions,
    candidates,
    saveCandidates
  }

  return (
    <div className="page-wrap">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/jd" replace />} />
        <Route path="/jd" element={<JDParser {...shared} />} />
        <Route path="/assessment" element={<Assessment {...shared} />} />
        <Route path="/test" element={<TakeTest {...shared} />} />
        <Route path="/leaderboard" element={<Leaderboard {...shared} />} />
      </Routes>
    </div>
  )
}