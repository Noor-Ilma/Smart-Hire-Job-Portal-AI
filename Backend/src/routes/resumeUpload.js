const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const dataService = require('../services/dataService');
const normalizationService = require('../services/normalizationService');

const router = express.Router();
const upload = multer();

// Upload PDF Resume
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    console.log("🔥 Resume API HIT");

    // ✅ CHECK FILE EXISTS
    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 File received:", req.file.originalname);

    const pdfBuffer = req.file.buffer;

    // ✅ PARSE PDF
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    console.log("📄 Extracted text length:", text.length);

    // ✅ SIMPLE SKILL EXTRACTION
    const skills = [];
    const skillKeywords = [
      'python', 'java', 'react', 'node', 'sql',
      'machine learning', 'aws', 'docker', 'html', 'css'
    ];

    skillKeywords.forEach(skill => {
      if (text.toLowerCase().includes(skill)) {
        skills.push(skill);
      }
    });

    console.log("🧠 Extracted skills:", skills);

    // ✅ CREATE CANDIDATE
    const candidate = {
  id: "cand_" + Date.now(),
  name: text.split('\n')[0] || "Uploaded Candidate", // first line as name
  title: "Resume Candidate",
  skills: skills,
  experience: 1,
  location: "From Resume",
  summary: text.substring(0, 300), // small preview
  source: "resume"
};
    const normalized = normalizationService.normalizeCandidate(candidate);
    dataService.addCandidates([normalized]);

    res.json({
  success: true,
  extracted_skills: skills,
  resume_text: text,   // ⭐ ADD THIS LINE
  message: "Resume processed successfully"
});
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;