const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });
  const text = completion.choices[0].message.content;
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return clean;
}

app.get("/", (req, res) => res.json({ status: "Beat Claude Backend running" }));

app.post("/api/parse-jd", async (req, res) => {
  try {
    const { jdText } = req.body;
    if (!jdText) return res.status(400).json({ error: "jdText required" });

    const prompt = `You are an expert HR analyst. Parse this JD and return ONLY a JSON object with these exact keys, no markdown, no extra text:
{
  "title": "job title",
  "company": "company name",
  "seniority": "junior|mid|senior|lead|executive",
  "domain": "marketing|engineering|finance|operations|hr|sales|product|design|other",
  "experience": "e.g. 4-6 years",
  "location": "location",
  "skills": ["skill1", "skill2"],
  "responsibilities": ["resp1", "resp2"],
  "requirements": ["req1", "req2"],
  "summary": "2-3 sentence summary"
}

JD:
${jdText}`;

    const result = await callGroq(prompt);
    const parsed = JSON.parse(result);
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/generate-questions", async (req, res) => {
  try {
    const { parsedJD } = req.body;
    if (!parsedJD) return res.status(400).json({ error: "parsedJD required" });

    const prompt = `You are an expert assessment designer. Create exactly 12 assessment questions for:
Role: ${parsedJD.title} at ${parsedJD.company}
Domain: ${parsedJD.domain}
Seniority: ${parsedJD.seniority}
Skills: ${(parsedJD.skills || []).join(", ")}
Responsibilities: ${(parsedJD.responsibilities || []).slice(0, 4).join("; ")}

Return ONLY a JSON array of 12 questions, no markdown, no extra text. Mix:
- 3 MCQ (type: "mcq")
- 3 Short Answer (type: "short")
- 3 Scenario (type: "scenario")
- 3 Task (type: "task")

Each question object:
{
  "id": 1,
  "type": "mcq|short|scenario|task",
  "text": "question text",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctAnswer": "A",
  "idealAnswer": "ideal answer description",
  "marks": 5,
  "difficulty": "easy|medium|hard"
}
options and correctAnswer only for mcq. marks: mcq=5, short=8, scenario=12, task=10`;

    const result = await callGroq(prompt);
    const questions = JSON.parse(result);
    res.json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/score-answers", async (req, res) => {
  try {
    const { questions, answers, parsedJD } = req.body;

    const answersForScoring = questions.map((q) => ({
      questionId: q.id,
      type: q.type,
      question: q.text,
      candidateAnswer: answers[q.id] || "(no answer)",
      correctAnswer: q.correctAnswer || null,
      idealAnswer: q.idealAnswer,
      maxMarks: q.marks,
    }));

    const prompt = `You are a strict but fair assessor. Score these answers for role: ${parsedJD?.title || "Unknown"}.

${JSON.stringify(answersForScoring, null, 2)}

Return ONLY this JSON, no markdown, no extra text:
{
  "scores": [
    {
      "questionId": 1,
      "marksAwarded": 4,
      "maxMarks": 5,
      "feedback": "one line feedback",
      "correct": true
    }
  ],
  "totalScore": 75,
  "maxScore": 100,
  "percentage": 75,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "recommendation": "advance|maybe|pass",
  "recommendationReason": "brief reason",
  "aiComment": "2-sentence overall assessment"
}

MCQ: full marks if correct letter, 0 if wrong. Others: partial credit based on quality.`;

    const result = await callGroq(prompt);
    const scored = JSON.parse(result);
    res.json({ success: true, data: scored });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));