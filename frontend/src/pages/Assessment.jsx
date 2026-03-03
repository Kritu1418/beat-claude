import { useNavigate } from 'react-router-dom'
import './Assessment.css'

const TYPE_COLORS = {
  mcq: { cls: 'qt-mcq', label: 'MCQ' },
  short: { cls: 'qt-short', label: 'SHORT' },
  scenario: { cls: 'qt-scenario', label: 'SCENARIO' },
  task: { cls: 'qt-task', label: 'TASK' },
}

export default function Assessment({ questions, parsedJD }) {
  const nav = useNavigate()

  if (!questions.length) return (
    <div className="page-container">
      <h1 className="page-title">Assessment <span>Generator</span></h1>
      <div className="empty-state">
        <div className="empty-icon">--</div>
        <p>No assessment yet — go parse a JD first</p>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => nav('/jd')}>
          Back to JD Parser
        </button>
      </div>
    </div>
  )

  const total = questions.reduce((s, q) => s + (q.marks || 0), 0)
  const byType = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="page-container">
      <div className="page-head">
        <h1 className="page-title">Assessment <span>Ready</span></h1>
        <p className="page-sub">
          {parsedJD?.title} at {parsedJD?.company} — {questions.length} questions — {total} marks
        </p>
      </div>

      <div className="stats-row">
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className={`stat-box stat-${type}`}>
            <div className="stat-num">{count}</div>
            <div className="stat-lbl">{type.toUpperCase()}</div>
          </div>
        ))}
        <div className="stat-box stat-total">
          <div className="stat-num">{total}</div>
          <div className="stat-lbl">TOTAL MARKS</div>
        </div>
        <button
          className="btn btn-success"
          style={{ marginLeft: 'auto' }}
          onClick={() => nav('/test')}
        >
          Start Tests
        </button>
      </div>

      <div className="q-list">
        {questions.map((q, i) => {
          const tc = TYPE_COLORS[q.type] || TYPE_COLORS.short
          return (
            <div key={i} className="q-card">
              <div className="q-hdr">
                <div className="q-num">{i + 1}</div>
                <span className={`q-badge ${tc.cls}`}>{tc.label}</span>
                <span className="q-diff">{q.difficulty || 'medium'}</span>
                <span className="q-marks">{q.marks} pts</span>
              </div>
              <div className="q-text">{q.text}</div>
              {q.type === 'mcq' && q.options && (
                <div className="q-opts">
                  {q.options.map((o, oi) => (
                    <div key={oi} className="q-opt">{o}</div>
                  ))}
                </div>
              )}
              {q.idealAnswer && (
                <div className="q-ideal">
                  <strong>Model Answer: </strong>{q.idealAnswer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}