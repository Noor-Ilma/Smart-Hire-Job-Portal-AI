const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// ===== EXPORT MATCHES =====

router.get('/matches/json', (req, res) => {
  try {
    const matches = dataService.getMatches();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=matches.json');
    
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/matches/csv', (req, res) => {
  try {
    const matches = dataService.getMatches();

    const headers = [
      'Job Title',
      'Company',
      'Candidate Name',
      'Candidate Title',
      'Similarity %',
      'Claude Score',
      'Recommendation',
      'Explanation'
    ];

    const rows = matches.map(m => [
      m.job.title,
      m.job.company,
      m.candidate.name,
      m.candidate.title,
      (m.similarity * 100).toFixed(1),
      m.claude_analysis?.score || 'N/A',
      m.claude_analysis?.recommendation || 'N/A',
      (m.claude_analysis?.explanation || '').replace(/"/g, '""')
    ]);

    const csv = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=matches.csv');
    
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== EXPORT JOBS =====

router.get('/jobs/csv', (req, res) => {
  try {
    const jobs = dataService.getJobs();

    const headers = [
      'Job ID',
      'Title',
      'Company',
      'Location',
      'Skills',
      'Experience',
      'Source'
    ];

    const rows = jobs.map(j => [
      j.id,
      j.title,
      j.company,
      j.location,
      j.skills.join('; '),
      j.experience_years,
      j.source
    ]);

    const csv = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs.csv');
    
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== EXPORT CANDIDATES =====

router.get('/candidates/csv', (req, res) => {
  try {
    const candidates = dataService.getCandidates();

    const headers = [
      'Candidate ID',
      'Name',
      'Title',
      'Location',
      'Skills',
      'Experience',
      'Source'
    ];

    const rows = candidates.map(c => [
      c.id,
      c.name,
      c.title,
      c.location,
      c.skills.join('; '),
      c.experience_years,
      c.source
    ]);

    const csv = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=candidates.csv');
    
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;