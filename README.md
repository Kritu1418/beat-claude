# Beat Claude — AI Hiring Companion

An AI-powered hiring tool that reads job descriptions, generates role-specific assessments, scores candidates, and recommends who moves forward — without any human effort.

---

## What It Does

**JD Parser**
Paste any job description. The AI reads it and pulls out the role title, seniority level, required skills, domain, and key responsibilities automatically.

**Assessment Generator**
Based on the parsed JD, the system creates 12 role-specific questions — a mix of MCQs, short answers, scenario-based questions, and practical tasks. Every assessment is unique to the role.

**Candidate Interface**
Candidates register and take the test through a clean interface. There is a live timer, question navigation, and auto-save on every answer.

**AI Scorer**
Once submitted, every response is evaluated by AI. The same answer always gets the same score — no bias, no inconsistency.

**Leaderboard**
All candidates are ranked by score. Recruiters can see strengths, weaknesses, and AI recommendations for each candidate. They can also override any recommendation with one click.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| AI Model | Groq API — LLaMA 3.3 70B |
| Styling | CSS Variables, Inter + JetBrains Mono |
| Storage | localStorage |

---

## Supported Roles

Works across any function — paste any JD and it adapts:

- Performance Marketing
- Software Engineering
- Financial Analysis
- HR Business Partner
- Operations Management

---

## Getting Started

### Prerequisites
- Node.js v18+
- Groq API key (free at console.groq.com)

### Setup

**1. Clone the repo**
```bash
git clone https://github.com/Kritu1418/beat-claude.git
cd beat-claude
```

**2. Backend setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

Start the backend:
```bash
npm run dev
```

**3. Frontend setup**
```bash
cd frontend
npm install
npm run dev
```

**4. Open in browser**
```
http://localhost:5173
```

---

## How to Use

1. Go to **JD Parser** — paste a job description or pick a sample JD
2. Click **Parse JD** — AI extracts role intelligence in seconds
3. Click **Generate Assessment** — 12 questions are created for that role
4. Go to **Take Test** — candidate registers and takes the timed test
5. Submit — AI scores every answer and shows results instantly
6. Go to **Leaderboard** — see all candidates ranked with recommendations

---

## Project Structure

```
beat-claude/
├── backend/
│   ├── server.js        # Express API + Groq AI calls
│   ├── package.json
│   └── .env             # API keys (not committed)
└── frontend/
    ├── src/
    │   ├── pages/       # JDParser, Assessment, TakeTest, Leaderboard
    │   ├── components/  # Header, Loader
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

---

## Features

- Generates complete assessments in under 60 seconds
- Consistent scoring — same answer, same score every time
- Works for any role across any industry
- Recruiter can override AI recommendations
- Dark and light mode support
- File upload and drag-and-drop for JDs
- 5 built-in sample JDs from real companies

---

Built for the GrowthSchool Fellowship — Problem Statement #1 HR
