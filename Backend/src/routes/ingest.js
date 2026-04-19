const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const normalizationService = require('../services/normalizationService');
const mockData = require('../mockData');

// ===== MOCK DATA ENDPOINTS =====

router.get('/mock/jobs', (req, res) => {
  try {
    const normalized = normalizationService.normalizeJobBatch(
      mockData.jobs,
      'linkedin'
    );
    dataService.addJobs(normalized);
    
    res.json({
      success: true,
      count: normalized.length,
      data: normalized
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mock/candidates', (req, res) => {
  try {
    const normalized = normalizationService.normalizeCandidateBatch(
      mockData.candidates,
      'naukri'
    );
    dataService.addCandidates(normalized);
    
    res.json({
      success: true,
      count: normalized.length,
      data: normalized
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CSV UPLOAD =====

router.post('/upload', (req, res) => {
  try {
    const { data, type, source } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    if (!['jobs', 'candidates'].includes(type)) {
      return res.status(400).json({ error: 'Type must be jobs or candidates' });
    }

    const sourceLabel = source || 'csv';

    let normalized;
    if (type === 'jobs') {
      normalized = normalizationService.normalizeJobBatch(data, sourceLabel);
      dataService.addJobs(normalized);
    } else {
      normalized = normalizationService.normalizeCandidateBatch(data, sourceLabel);
      dataService.addCandidates(normalized);
    }

    res.json({
      success: true,
      count: normalized.length,
      data: normalized,
      type
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DATA STATUS =====

router.get('/status', (req, res) => {
  const jobs = dataService.getJobs();
  const candidates = dataService.getCandidates();

  res.json({
    jobs: {
      count: jobs.length,
      sources: [...new Set(jobs.map(j => j.source))]
    },
    candidates: {
      count: candidates.length,
      sources: [...new Set(candidates.map(c => c.source))]
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;