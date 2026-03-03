import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../components/Loader.jsx'
import './TakeTest.css'

export default function TakeTest({ questions, parsedJD, candidates, saveCandidates }) {
  const [phase, setPhase] = useState('register')
  const [info, setInfo] = useState({ name: '', email: '', phone: '' })
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const timerRef = useRef(null)
  const nav = useNavigate()

  const TOTAL_TIME = questions.length * 90

  useEffect(() => {
    if (phase === 'test') {
      setTimeLeft(TOTAL_TIME)
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            handleSubmit()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  if (!questions.length) return (
    <div className="page-container">
      <h1 className="page-title">Take <span>Test</span></h1>
      <div className="empty-state">
        <div className="empty-icon">--</div>
        <p>Generate an assessment first</p>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => nav('/jd')}>
          Back to JD Parser
        </button>
      </div>
    </div>
  )

  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleSubmit = async () => {
    clearInterval(timerRef.current)
    setPhase('scoring')
    setError('')
    try {
      const { data } = await axios.post('/api/score-answers', {
        questions,
        answers,
        parsedJD,
        candidateInfo: info
      })
      if (!data.success) throw new Error(data.error)
      const candidate = {
        id: Date.now(),
        name: info.name,
        email: info.email,
        phone: info.phone,
        role: parsedJD?.title || 'Unknown',
        submittedAt: new Date().toISOString(),
        scoring: data.data,
        totalScore: data.data.totalScore,
        maxScore: data.data.maxScore,
        percentage: data.data.percentage,
        recommendation: data.data.recommendation,
      }
      saveCandidates([...candidates, candidate])
      setResult(candidate)
      setPhase('done')
    } catch (e) {
      setError(e.response?.data?.error || e.message)
      setPhase('test')
    }
  }

  if (phase === 'scoring') return (
    <div className="page-container">
      <Loader
        text="AI scoring your responses..."
        sub={`Evaluating ${questions.length} answers with detailed reasoning`}
      />
    </div>
  )

  if (phase === 'done' && result) {
    const r = result.scoring
    const recColor =
      r.recommendation === 'advance' ? 'var(--accent3)' :
      r.recommendation === 'maybe' ? 'var(--accent2)' :
      'var(--accent)'

    return (
      <div className="page-container">
        <h1 className="page-title">Test <span>Complete</span></h1>
        <div className="result-card" style={{ borderColor: recColor }}>
          <div className="result-score-big">
            {r.percentage}<span>%</span>
          </div>
          <div className="result-marks">{r.totalScore} / {r.maxScore} marks</div>
          <div className="result-name">{result.name}</div>
          <div className={`result-badge rec-${r.recommendation}`}>
            {r.recommendation === 'advance'
              ? 'ADVANCE TO NEXT ROUND'
              : r.recommendation === 'maybe'
              ? 'UNDER CONSIDERATION'
              : 'NOT SELECTED'}
          </div>
          <p className="result-comment">{r.aiComment}</p>
        </div>

        <div className="result-grid">
          <div className="card">
            <div className="card-title green">Strengths</div>
            {(r.strengths || []).map((s, i) => (
              <div key={i} className="result-point">+ {s}</div>
            ))}
          </div>
          <div className="card">
            <div className="card-title red">Areas to Improve</div>
            {(r.weaknesses || []).map((w, i) => (
              <div key={i} className="result-point">- {w}</div>
            ))}
          </div>
        </div>

        <div className="result-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setPhase('register')
              setInfo({ name: '', email: '', phone: '' })
              setAnswers({})
            }}
          >
            Test Another Candidate
          </button>
          <button className="btn btn-success" onClick={() => nav('/leaderboard')}>
            View Leaderboard
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'register') return (
    <div className="page-container">
      <h1 className="page-title">Candidate <span>Registration</span></h1>
      <div className="instr-box">
        <strong>Instructions: </strong>
        {questions.length} questions — {Math.round(TOTAL_TIME / 60)} minutes — AI scored.
        Timer starts on Start Test and cannot be paused. All answers are auto-saved.
      </div>

      {error && <div className="alert alert-err">{error}</div>}

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Your Details</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-lbl">Full Name *</label>
            <input
              className="form-inp"
              value={info.name}
              onChange={e => setInfo({ ...info, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
            />
          </div>
          <div className="form-group">
            <label className="form-lbl">Email *</label>
            <input
              className="form-inp"
              type="email"
              value={info.email}
              onChange={e => setInfo({ ...info, email: e.target.value })}
              placeholder="priya@gmail.com"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-lbl">Phone</label>
            <input
              className="form-inp"
              value={info.phone}
              onChange={e => setInfo({ ...info, phone: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>
          <div className="form-group">
            <label className="form-lbl">Applying For</label>
            <input
              className="form-inp"
              value={parsedJD?.title || 'Unknown Role'}
              readOnly
              style={{ color: 'var(--muted)' }}
            />
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: '8px' }}
          onClick={() => {
            if (!info.name || !info.email) {
              setError('Name and email are required')
              return
            }
            setError('')
            setPhase('test')
          }}
        >
          Start Test
        </button>
      </div>
    </div>
  )

  const q = questions[currentQ]
  const timePct = Math.round((timeLeft / TOTAL_TIME) * 100)
  const answered = Object.keys(answers).length

  return (
    <div className="page-container">
      {error && <div className="alert alert-err">{error}</div>}

      <div className="timer-bar">
        <div className={`timer-val ${timeLeft < 120 ? 'urgent' : ''}`}>
          {fmt(timeLeft)}
        </div>
        <div className="timer-track">
          <div className="timer-fill" style={{ width: `${timePct}%` }} />
        </div>
        <div className="timer-info">{answered}/{questions.length} answered</div>
      </div>

      <div className="qnav">
        {questions.map((qq, i) => (
          <button
            key={i}
            className={`qnav-btn ${i === currentQ ? 'cur' : ''} ${answers[qq.id] ? 'done' : ''}`}
            onClick={() => setCurrentQ(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="test-card">
        <div className="q-hdr">
          <div className="q-num">{currentQ + 1}</div>
          <span className={`q-badge qt-${q.type}`}>{q.type.toUpperCase()}</span>
          <span className="q-marks">{q.marks} marks</span>
        </div>
        <div className="test-qtext">{q.text}</div>

        {q.type === 'mcq' && q.options && (
          <div className="mcq-opts">
            {q.options.map((opt, oi) => {
              const letter = opt.charAt(0)
              return (
                <div
                  key={oi}
                  className={`mcq-opt ${answers[q.id] === letter ? 'sel' : ''}`}
                  onClick={() => setAnswers({ ...answers, [q.id]: letter })}
                >
                  <div className="mcq-radio" />
                  {opt}
                </div>
              )
            })}
          </div>
        )}

        {q.type !== 'mcq' && (
          <textarea
            className="ans-area"
            rows={q.type === 'scenario' || q.type === 'task' ? 8 : 4}
            placeholder={
              q.type === 'short'
                ? 'Type your answer...'
                : 'Write your detailed response...'
            }
            value={answers[q.id] || ''}
            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
        )}
      </div>

      <div className="test-nav">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
          >
            Prev
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
            disabled={currentQ === questions.length - 1}
          >
            Next
          </button>
        </div>
        <button className="btn btn-success" onClick={handleSubmit}>
          {currentQ === questions.length - 1 ? 'Submit Test' : 'Submit Early'}
        </button>
      </div>
    </div>
  )
}