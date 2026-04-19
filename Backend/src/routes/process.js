const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const normalizationService = require('../services/normalizationService');
const deduplicationService = require('../services/deduplicationService');
const hfService = require('../services/huggingFaceService');
const claudeService = require('../services/claudeService');
const matchingService = require('../services/matchingService');

// ===== NORMALIZE =====

router.post('/normalize', (req, res) => {
  try {
    const { type } = req.body;

    if (type === 'jobs') {
      const jobs = dataService.getJobs();
      const normalized = jobs.map(j => normalizationService.normalizeJob(j));
      dataService.addJobs(normalized);
      res.json({ success: true, count: normalized.length });
    } else if (type === 'candidates') {
      const candidates = dataService.getCandidates();
      const normalized = candidates.map(c =>
        normalizationService.normalizeCandidate(c)
      );
      dataService.addCandidates(normalized);
      res.json({ success: true, count: normalized.length });
    } else {
      res.status(400).json({ error: 'Specify type: jobs or candidates' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DEDUPLICATE =====

router.post('/deduplicate', (req, res) => {
  try {
    const { type } = req.body;

    let result;
    if (type === 'jobs') {
      result = dataService.deduplicateJobs();
      dataService.addJobs(result.deduplicated);
    } else if (type === 'candidates') {
      result = dataService.deduplicateCandidates();
      dataService.addCandidates(result.deduplicated);
    } else {
      return res.status(400).json({ error: 'Specify type: jobs or candidates' });
    }

    res.json({
      success: true,
      before: result.deduplicated.length + result.duplicates.length,
      after: result.deduplicated.length,
      removed: result.removed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== EXTRACT SKILLS =====

router.post('/extract-skills', async (req, res) => {
  try {
    const { type } = req.body;
    const results = {};

    if (type === 'jobs') {
      const jobs = dataService.getJobs();
      for (const job of jobs) {
        const skills = await hfService.extractSkills(job.description);
        results[job.id] = {
          extracted: skills,
          merged: [...new Set([...job.skills, ...skills])]
        };
        job.extracted_skills = skills;
      }
      dataService.addJobs(jobs);
    } else if (type === 'candidates') {
      const candidates = dataService.getCandidates();
      for (const cand of candidates) {
        const skills = await hfService.extractSkills(cand.summary);
        results[cand.id] = {
          extracted: skills,
          merged: [...new Set([...cand.skills, ...skills])]
        };
        cand.extracted_skills = skills;
      }
      dataService.addCandidates(candidates);
    }

    res.json({
      success: true,
      skills_extracted: Object.keys(results).length,
      results: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MATCHING & RANKING =====

router.post('/match', async (req, res) => {
  try {
    const jobs = dataService.getJobs();
    const candidates = dataService.getCandidates();

    if (jobs.length === 0 || candidates.length === 0) {
      return res.status(400).json({
        error: 'Need both jobs and candidates data to match'
      });
    }

    const matches = [];

    // Compute similarities
    for (const job of jobs) {
      for (const candidate of candidates) {
        const similarity = matchingService.computeSimilarity(
          job.skills,
          candidate.skills
        );

        if (similarity > 0.5) { // Only include matches above threshold
          matches.push({
            job,
            candidate,
            similarity
          });
        }
      }
    }

    // Sort by similarity
    matches.sort((a, b) => b.similarity - a.similarity);

    // Get Claude analysis for top matches
    const topMatches = matches.slice(0, 10);
    const analyzed = await Promise.all(
      topMatches.map(async (match) => {
        const analysis = await claudeService.analyzeMatch(
          match.job,
          match.candidate,
          match.similarity
        );
        return {
          ...match,
          claude_analysis: analysis
        };
      })
    );

    // Re-sort by Claude score
    analyzed.sort((a, b) =>
      (b.claude_analysis?.score || 0) - (a.claude_analysis?.score || 0)
    );

    dataService.storeMatches(analyzed);

    res.json({
      success: true,
      total_analyzed: matches.length,
      with_claude: analyzed.length,
      results: analyzed.map(m => ({
        job_id: m.job.id,
        job_title: m.job.title,
        candidate_id: m.candidate.id,
        candidate_name: m.candidate.name,
        similarity: (m.similarity * 100).toFixed(1),
        claude_score: m.claude_analysis?.score,
        recommendation: m.claude_analysis?.recommendation,
        explanation: m.claude_analysis?.explanation
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;