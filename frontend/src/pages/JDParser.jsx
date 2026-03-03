import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../components/Loader.jsx'
import './JDParser.css'

const SAMPLE_JDS = {
  marketing: {
    label: 'Performance Marketing Manager',
    source: 'GrowthX Digital — Naukri',
    jd: `Job Title: Senior Performance Marketing Manager
Company: GrowthX Digital
Location: Remote (India)
Experience: 4-6 years

About the Role:
We are looking for a data-driven Senior Performance Marketing Manager to own and scale our paid acquisition channels. You will manage a 2Cr+ monthly budget across Google Ads, Meta, and programmatic channels.

Key Responsibilities:
- Manage and optimize paid campaigns across Google Ads, Meta Ads, LinkedIn
- Drive ROAS improvement through A/B testing of creatives and landing pages
- Analyze CAC, LTV, and attribution data for budget allocation
- Build dashboards in GA4, Looker Studio
- Lead a team of 2 junior marketers

Requirements:
- 4+ years in performance marketing
- Proficiency in Google Ads, Meta Business Manager, GA4
- Strong SQL skills for data analysis
- Experience with AppsFlyer or Adjust preferred
- Excellent analytical and communication skills`
  },
  engineering: {
    label: 'Software Engineer (Backend)',
    source: 'Razorpay — LinkedIn',
    jd: `Job Title: Software Engineer - Backend
Company: Razorpay
Location: Bangalore, India
Experience: 2-4 years

About the Role:
We are looking for a Backend Software Engineer to build and scale our payments infrastructure. You will work on high-throughput systems processing millions of transactions daily.

Key Responsibilities:
- Design and develop scalable REST APIs and microservices
- Optimize database queries and improve system performance
- Write clean, testable code with proper documentation
- Participate in code reviews and technical design discussions
- Monitor and debug production issues

Requirements:
- 2+ years of backend development experience
- Proficiency in Java, Go, or Node.js
- Strong understanding of distributed systems and databases
- Experience with MySQL, Redis, and message queues like Kafka
- Knowledge of AWS or GCP cloud services
- Familiarity with Docker and Kubernetes`
  },
  finance: {
    label: 'Financial Analyst',
    source: 'Deloitte India — Naukri',
    jd: `Job Title: Financial Analyst
Company: Deloitte India
Location: Mumbai, India
Experience: 2-5 years

About the Role:
We are seeking a Financial Analyst to join our advisory practice. You will support clients in financial planning, budgeting, and strategic decision making.

Key Responsibilities:
- Build and maintain complex financial models in Excel
- Prepare monthly P&L, balance sheet, and cash flow reports
- Conduct variance analysis and present findings to stakeholders
- Support M&A due diligence and valuation work
- Coordinate with cross-functional teams for budget forecasting

Requirements:
- 2+ years of experience in financial analysis or investment banking
- Advanced Excel and financial modeling skills
- Knowledge of accounting principles and GAAP
- Experience with Power BI or Tableau for dashboards
- CFA Level 1 or CA Inter preferred
- Strong attention to detail and analytical mindset`
  },
  hr: {
    label: 'HR Business Partner',
    source: 'Swiggy — LinkedIn',
    jd: `Job Title: HR Business Partner
Company: Swiggy
Location: Bangalore, India
Experience: 3-5 years

About the Role:
We are looking for an HR Business Partner to work closely with business leaders and drive people initiatives across our fast-growing organization.

Key Responsibilities:
- Partner with business leaders on talent management and organizational design
- Drive performance management cycles including goal setting and reviews
- Handle employee relations, grievances, and disciplinary processes
- Analyze HR metrics and present insights to leadership
- Lead hiring drives in coordination with talent acquisition team

Requirements:
- 3+ years of HRBP or generalist HR experience
- Strong knowledge of Indian labor laws and compliance
- Experience with HRMS tools like Darwinbox or Workday
- Excellent interpersonal and communication skills
- MBA in HR from a recognized institute preferred
- Ability to manage multiple stakeholders in a fast-paced environment`
  },
  operations: {
    label: 'Operations Manager',
    source: 'Delhivery — Naukri',
    jd: `Job Title: Operations Manager
Company: Delhivery
Location: Delhi NCR, India
Experience: 4-7 years

About the Role:
We are hiring an Operations Manager to oversee last-mile delivery operations for our Delhi region. You will manage a team of 50+ delivery executives and ensure SLA compliance.

Key Responsibilities:
- Manage end-to-end delivery operations for assigned zone
- Monitor daily KPIs including delivery success rate, TAT, and NPS
- Optimize route planning and fleet utilization
- Handle vendor relationships and third-party logistics partners
- Drive process improvements to reduce RTO and increase first attempt delivery

Requirements:
- 4+ years of experience in logistics or supply chain operations
- Strong data analysis skills using Excel or SQL
- Experience managing large field teams
- Knowledge of WMS and TMS tools
- Ability to work in a high-pressure, fast-paced environment
- Bachelor's degree in Operations, Supply Chain, or related field`
  }
}

export default function JDParser({ parsedJD, setParsedJD, setQuestions }) {
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [showSamples, setShowSamples] = useState(false)
  const timerRef = useRef(null)
  const fileRef = useRef(null)
  const nav = useNavigate()

  const parseJD = async () => {
    if (!jdText.trim()) { setError('Please paste or upload a job description first.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await axios.post('/api/parse-jd', { jdText })
      if (!data.success) throw new Error(data.error)
      setParsedJD(data.data)
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally { setLoading(false) }
  }

  const generateAssessment = async () => {
    if (!parsedJD) return
    setError(''); setGenLoading(true); setElapsed(0)
    timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000)
    try {
      const { data } = await axios.post('/api/generate-questions', { parsedJD })
      if (!data.success) throw new Error(data.error)
      setQuestions(data.data)
      clearInterval(timerRef.current)
      nav('/assessment')
    } catch (e) {
      setError(e.response?.data?.error || e.message)
      clearInterval(timerRef.current)
    } finally { setGenLoading(false) }
  }

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setJdText(e.target.result)
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="page-container">
      <div className="page-head">
        <div className="page-eyebrow">// STEP 01</div>
        <h1 className="page-title">JD <span>Parser</span></h1>
        <p className="page-sub">Paste any job description — AI extracts role intelligence and generates a tailored 12-question assessment in under 60 seconds.</p>
      </div>

      <div className="steps-row">
        {['Parse JD', 'Generate Questions', 'Assessment Ready'].map((s, i) => (
          <div key={i} className="step-item">
            <div className={`step-dot ${i === 0 && parsedJD ? 'done' : i === 0 ? 'active' : i === 1 && parsedJD ? 'active' : ''}`}>
              {i === 0 && parsedJD ? 'v' : i + 1}
            </div>
            <span className="step-lbl">{s}</span>
            {i < 2 && <div className={`step-line ${i === 0 && parsedJD ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-err">{error}</div>}

      <div className="card">
        <div className="card-hd">
          <span className="card-title">Job Description</span>
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <button className="btn-ghost" onClick={() => setShowSamples(!showSamples)}>
                Sample JDs
              </button>
              {showSamples && (
                <div className="samples-dropdown">
                  {Object.entries(SAMPLE_JDS).map(([key, val]) => (
                    <div key={key} className="sample-item"
                      onClick={() => { setJdText(val.jd); setShowSamples(false) }}>
                      <div className="sample-title">{val.label}</div>
                      <div className="sample-source">{val.source}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-ghost" onClick={() => fileRef.current.click()}>
              Upload File
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        </div>

        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <textarea
            className="jd-textarea"
            rows={13}
            placeholder="Paste job description here, or use Sample JDs, or drag and drop a .txt file..."
            value={jdText}
            onChange={e => setJdText(e.target.value)}
          />
          {dragOver && <div className="drop-overlay">Drop file here</div>}
        </div>

        <div className="card-actions">
          <button className="btn btn-primary" onClick={parseJD} disabled={loading}>
            {loading ? 'Parsing...' : 'Parse JD'}
          </button>
          {parsedJD && (
            <button className="btn btn-success" onClick={generateAssessment} disabled={genLoading}>
              {genLoading ? `Generating... ${elapsed}s` : 'Generate Assessment'}
            </button>
          )}
          {jdText && (
            <button className="btn-ghost" onClick={() => { setJdText(''); setParsedJD(null) }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {loading && <Loader text="Analyzing job description..." sub="Extracting role, seniority, skills and domain" />}
      {genLoading && <Loader text={`Generating assessment... ${elapsed}s`} sub="Creating 12 role-specific questions" />}

      {parsedJD && !loading && !genLoading && (
        <div className="card parsed-card">
          <div className="parsed-header">
            <div className="parsed-title">Parsed Role Intelligence</div>
            <div className="parsed-badge">AI Extracted</div>
          </div>
          <div className="parsed-grid">
            {[
              ['Role', parsedJD.title],
              ['Company', parsedJD.company],
              ['Seniority', parsedJD.seniority],
              ['Domain', parsedJD.domain],
              ['Experience', parsedJD.experience || 'N/A'],
              ['Location', parsedJD.location || 'N/A'],
            ].map(([label, val]) => (
              <div key={label} className="pi-box">
                <div className="pi-label">{label}</div>
                <div className={`pi-val ${label === 'Seniority' ? 'pi-accent' : ''}`}>{val}</div>
              </div>
            ))}
          </div>
          <div className="skills-section">
            <div className="pi-label" style={{ marginBottom: '10px' }}>Key Skills</div>
            <div className="skills-wrap">
              {(parsedJD.skills || []).map((s, i) => (
                <span key={i} className="skill-chip">{s}</span>
              ))}
            </div>
          </div>
          {parsedJD.summary && (
            <div className="summary-box">
              <div className="summary-label">// SUMMARY</div>
              <p>{parsedJD.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}