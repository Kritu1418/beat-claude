import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Leaderboard.css'

export default function Leaderboard({ candidates, saveCandidates }) {
  const [expanded, setExpanded] = useState(null)
  const [overrides, setOverrides] = useState({})
  const nav = useNavigate()

  const sorted = [...candidates].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))

  const doOverride = (id, newRec) => {
    setOverrides(p => ({ ...p, [id]: newRec }))
    saveCandidates(candidates.map(c =>
      c.id === id ? { ...c, recommendation: newRec, overridden: true } : c
    ))
  }

  const getRec = c => overrides[c.id] || c.recommendation || 'pass'

  if (!candidates.length) return (
    <div className="page-container">
      <h1 className="page-title">Candidate <span>Leaderboard</span></h1>
      <div className="empty-state">
        <div className="empty-icon">--</div>
        <p>No candidates yet — have someone take the test first</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: '16px' }}
          onClick={() => nav('/test')}
        >
          Go to Test
        </button>
      </div>
    </div>
  )

  const counts = sorted.reduce((acc, c) => {
    const r = getRec(c)
    acc[r] = (acc[r] || 0) + 1
    return acc
  }, {})

  return (
    <div className="page-container">
      <div className="page-head">
        <h1 className="page-title">Candidate <span>Leaderboard</span></h1>
        <p className="page-sub">AI ranked candidates. Override any recommendation below.</p>
      </div>

      <div className="lb-stats">
        {[
          ['Total', sorted.length, 'var(--text)'],
          ['Advance', counts.advance || 0, 'var(--accent3)'],
          ['Maybe', counts.maybe || 0, 'var(--accent2)'],
          ['Pass', counts.pass || 0, 'var(--accent)']
        ].map(([l, v, c]) => (
          <div key={l} className="lb-stat">
            <div className="lb-stat-num" style={{ color: c }}>{v}</div>
            <div className="lb-stat-lbl">{l}</div>
          </div>
        ))}
        <button
          className="btn btn-danger"
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            if (window.confirm('Clear all candidate data?')) saveCandidates([])
          }}
        >
          Clear All
        </button>
      </div>

      <div className="lb-head">
        <div>Rank</div>
        <div>Candidate</div>
        <div>Score</div>
        <div>%</div>
        <div>Decision</div>
        <div>Override</div>
      </div>

      {sorted.map((c, i) => {
        const rank = i + 1
        const rec = getRec(c)
        const medal = rank === 1 ? '#1' : rank === 2 ? '#2' : rank === 3 ? '#3' : rank

        return (
          <div key={c.id}>
            <div
              className={`lb-row rank${rank <= 3 ? rank : ''}`}
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            >
              <div className="lb-rank">{medal}</div>
              <div>
                <div className="lb-name">
                  {c.name}
                  {c.overridden && <span className="override-tag"> overridden</span>}
                </div>
                <div className="lb-email">{c.email}</div>
              </div>
              <div className="lb-score">{c.totalScore}</div>
              <div className={`lb-pct ${c.percentage >= 70 ? 'pct-hi' : c.percentage >= 40 ? 'pct-mid' : 'pct-lo'}`}>
                {c.percentage}%
              </div>
              <div>
                <span className={`rec-badge rec-${rec}`}>
                  {rec === 'advance' ? 'Advance' : rec === 'maybe' ? 'Maybe' : 'Pass'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  className="ov-btn ov-a"
                  onClick={e => { e.stopPropagation(); doOverride(c.id, 'advance') }}
                >
                  A
                </button>
                <button
                  className="ov-btn ov-m"
                  onClick={e => { e.stopPropagation(); doOverride(c.id, 'maybe') }}
                >
                  M
                </button>
                <button
                  className="ov-btn ov-p"
                  onClick={e => { e.stopPropagation(); doOverride(c.id, 'pass') }}
                >
                  P
                </button>
              </div>
            </div>

            {expanded === c.id && (
              <div className="lb-expand">
                {c.scoring?.aiComment && (
                  <p className="expand-comment">
                    <strong>AI Assessment: </strong>{c.scoring.aiComment}
                  </p>
                )}
                {c.scoring?.recommendationReason && (
                  <p className="expand-reason">
                    <strong>Reason: </strong>{c.scoring.recommendationReason}
                  </p>
                )}
                <div className="expand-lists">
                  {c.scoring?.strengths?.length > 0 && (
                    <div>
                      <div className="expand-head green">Strengths</div>
                      {c.scoring.strengths.map((s, i) => (
                        <div key={i} className="expand-pt">+ {s}</div>
                      ))}
                    </div>
                  )}
                  {c.scoring?.weaknesses?.length > 0 && (
                    <div>
                      <div className="expand-head red">Weaknesses</div>
                      {c.scoring.weaknesses.map((w, i) => (
                        <div key={i} className="expand-pt">- {w}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="expand-time">
                  Submitted: {new Date(c.submittedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}