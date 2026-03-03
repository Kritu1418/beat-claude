import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Header.css'

const tabs = [
  { to: '/jd', label: '01', sub: 'JD Parser' },
  { to: '/assessment', label: '02', sub: 'Assessment' },
  { to: '/test', label: '03', sub: 'Take Test' },
  { to: '/leaderboard', label: '04', sub: 'Leaderboard' },
]

export default function Header() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.body.classList.toggle('light', !dark)
  }, [dark])

  return (
    <header className="hdr">
      <div className="hdr-logo">
        <div className="hdr-dot" />
        <span className="hdr-beat">Beat</span>
        <span className="hdr-claude">Claude</span>
        <span className="hdr-tag">// AI Hiring</span>
      </div>
      <nav className="hdr-nav">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => `hdr-tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-num">{t.label}</span>
            <span className="tab-label">{t.sub}</span>
          </NavLink>
        ))}
        <button className="theme-btn" onClick={() => setDark(!dark)}>
          {dark ? '☀ Light' : '⬛ Dark'}
        </button>
      </nav>
    </header>
  )
}