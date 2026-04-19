const express = require('express');
const router = express.Router();

const {
  extractSkills,
  matchJobs
} = require('../services/resumeMatchingService');

// Extract skills only
router.post('/extract-skills', (req, res) => {
  try {
    const { resume_text } = req.body;

    const skills = extractSkills(resume_text);

    res.json({ skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Match resume with jobs
router.post('/resume-match', (req, res) => {
  try {
    const { resume_text, jobs } = req.body;

    const result = matchJobs(resume_text, jobs);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;