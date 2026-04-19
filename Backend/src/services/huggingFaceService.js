class HuggingFaceService {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
    this.pipeline = null;
  }

  async initialize() {
    try {
      if (!this.initialized) {
        const { pipeline } = require("@xenova/transformers");
        this.pipeline = pipeline;
        this.initialized = true;
        console.log('[HF] Transformers library initialized');
      }
    } catch (err) {
      console.error('[HF] Initialization error:', err.message);
      console.log('[HF] Continuing without Transformers - using mock extraction');
      this.initialized = false;
    }
  }

  // ===== SKILL EXTRACTION =====

  async extractSkills(text) {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const cacheKey = this.hashText(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.initialize();

      if (!this.initialized || !this.pipeline) {
        return this.mockExtractSkills(text);
      }

      const classifier = await this.pipeline('ner', 'Xenova/bert-base-NER');
      const results = await classifier(text.substring(0, 512)); // Limit input

      const skills = results
        .filter(r => r.entity.includes('SKILL') && r.score > 0.7)
        .map(r => r.word.toLowerCase().trim())
        .filter(s => s.length > 2)
        .filter((s, i, arr) => arr.indexOf(s) === i);

      this.cache.set(cacheKey, skills);
      return skills;
    } catch (err) {
      console.warn('[HF] Extraction error, using mock:', err.message);
      return this.mockExtractSkills(text);
    }
  }

  async extractSkillsBatch(texts) {
    const results = {};

    for (const [id, text] of Object.entries(texts)) {
      results[id] = await this.extractSkills(text);
    }

    return results;
  }

  // ===== MOCK EXTRACTION (Fallback) =====

  mockExtractSkills(text) {
    const commonSkills = [
      'python', 'javascript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
      'react', 'vue', 'angular', 'nodejs', 'express', 'fastapi',
      'sql', 'mongodb', 'postgresql', 'redis', 'elasticsearch',
      'git', 'linux', 'windows', 'macos', 'bash', 'shell',
      'machine learning', 'deep learning', 'nlp', 'cv', 'computer vision',
      'agile', 'scrum', 'jira', 'slack', 'confluence'
    ];

    const lowerText = text.toLowerCase();
    return commonSkills.filter(skill => lowerText.includes(skill));
  }

  // ===== UTILITY =====

  hashText(text) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(text).digest('hex');
  }

  clearCache() {
    this.cache.clear();
  }

  cacheSize() {
    return this.cache.size;
  }
}

module.exports = new HuggingFaceService();