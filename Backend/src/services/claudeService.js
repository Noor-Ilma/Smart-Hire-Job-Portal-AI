const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.cache = new Map();
    this.callCount = 0;
    this.lastReset = Date.now();
  }

  // ===== MATCH ANALYSIS =====

  async analyzeMatch(job, candidate, similarityScore) {
    const cacheKey = `${job.id}:${candidate.id}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const prompt = this.buildPrompt(job, candidate, similarityScore);
      
      const message = await this.client.messages.create({
        model: "claude-opus-4-20250805",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
      });

      const response = this.parseResponse(message.content[0].text);
      this.cache.set(cacheKey, response);
      this.callCount++;

      return response;
    } catch (err) {
      console.error('[CLAUDE] API Error:', err.message);
      return {
        explanation: 'Unable to analyze match at this time',
        score: Math.round(similarityScore * 100),
        recommendation: 'consider',
        error: err.message
      };
    }
  }

  async analyzeMatchesBatch(matches) {
    const results = [];

    for (const match of matches.slice(0, 10)) { // Limit to 10 calls
      const analysis = await this.analyzeMatch(
        match.job,
        match.candidate,
        match.similarity
      );

      results.push({
        job_id: match.job.id,
        candidate_id: match.candidate.id,
        ...analysis
      });
    }

    return results;
  }

  // ===== PROMPT BUILDING =====

  buildPrompt(job, candidate, similarityScore) {
    const skillOverlap = this.computeSkillOverlap(job.skills, candidate.skills);

    return `You are an expert recruiter. Analyze this job-candidate match.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company || 'N/A'}
- Required Skills: ${job.skills.join(', ')}
- Years of Experience: ${job.experience_years}+
- Location: ${job.location}

CANDIDATE PROFILE:
- Name: ${candidate.name || 'Anonymous'}
- Current Title: ${candidate.title}
- Skills: ${candidate.skills.join(', ')}
- Years of Experience: ${candidate.experience_years}
- Location: ${candidate.location}

MATCHING DATA:
- Semantic Similarity: ${(similarityScore * 100).toFixed(0)}%
- Skills Overlap: ${skillOverlap.matched.length}/${job.skills.length} (${(skillOverlap.percentage).toFixed(0)}%)
- Matched Skills: ${skillOverlap.matched.join(', ') || 'None'}
- Missing Skills: ${skillOverlap.missing.join(', ') || 'None'}
- Location Match: ${job.location.toLowerCase() === candidate.location.toLowerCase() ? 'Yes' : 'Different'}

YOUR TASK:
Provide a brief 2-3 sentence analysis and a final match score (0-100).

FORMAT YOUR RESPONSE EXACTLY AS:
ANALYSIS: [your 2-3 sentence analysis]
SCORE: [0-100 number only]
RECOMMENDATION: [hire|consider|pass]`;
  }

  // ===== RESPONSE PARSING =====

  parseResponse(text) {
    try {
      const analysisMatch = text.match(/ANALYSIS:\s*(.+?)(?=SCORE:|$)/s);
      const scoreMatch = text.match(/SCORE:\s*(\d+)/);
      const recommendationMatch = text.match(/RECOMMENDATION:\s*(\w+)/i);

      return {
        explanation: analysisMatch
          ? analysisMatch[1].trim().substring(0, 300)
          : 'Analysis unavailable',
        score: scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 50,
        recommendation: recommendationMatch
          ? recommendationMatch[1].toLowerCase()
          : 'consider'
      };
    } catch (err) {
      console.error('[CLAUDE] Parse error:', err.message);
      return {
        explanation: 'Could not parse response',
        score: 50,
        recommendation: 'consider'
      };
    }
  }

  // ===== UTILITY =====

  computeSkillOverlap(jobSkills, candidateSkills) {
    const jobSkillsSet = new Set(jobSkills.map(s => s.toLowerCase()));
    const candidateSkillsSet = new Set(candidateSkills.map(s => s.toLowerCase()));

    const matched = [...jobSkillsSet].filter(s => candidateSkillsSet.has(s));
    const missing = [...jobSkillsSet].filter(s => !candidateSkillsSet.has(s));
    const percentage = (matched.length / jobSkillsSet.size) * 100;

    return { matched, missing, percentage };
  }

  clearCache() {
    this.cache.clear();
  }

  getStats() {
    const uptime = Date.now() - this.lastReset;
    return {
      api_calls: this.callCount,
      cache_size: this.cache.size,
      uptime_minutes: Math.floor(uptime / 60000)
    };
  }
}

module.exports = new ClaudeService();