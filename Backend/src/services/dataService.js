const crypto = require('crypto');

class DataService {
  constructor() {
    this.storage = {
      jobs: [],
      candidates: [],
      matches: []
    };
  }

  // ===== DATA MANAGEMENT =====

  addJobs(jobs) {
    this.storage.jobs = jobs;
    return { success: true, count: jobs.length };
  }

  addCandidates(candidates) {
    this.storage.candidates = candidates;
    return { success: true, count: candidates.length };
  }

  getJobs() {
    return this.storage.jobs;
  }

  getCandidates() {
    return this.storage.candidates;
  }

  // ===== SEARCH =====

  searchJobs(query) {
    const q = query.toLowerCase();
    return this.storage.jobs.filter(job =>
      job.title.includes(q) ||
      job.company.includes(q) ||
      job.skills.some(s => s.includes(q))
    );
  }

  searchCandidates(query) {
    const q = query.toLowerCase();
    return this.storage.candidates.filter(cand =>
      cand.name.includes(q) ||
      cand.title.includes(q) ||
      cand.skills.some(s => s.includes(q))
    );
  }

  // ===== FILTERING =====

  filterJobs(filters) {
    let results = this.storage.jobs;

    if (filters.location) {
      results = results.filter(j =>
        j.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minExperience) {
      results = results.filter(j => j.experience_years >= filters.minExperience);
    }

    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(j =>
        filters.skills.some(skill =>
          j.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    return results;
  }

  filterCandidates(filters) {
    let results = this.storage.candidates;

    if (filters.location) {
      results = results.filter(c =>
        c.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minExperience) {
      results = results.filter(c => c.experience_years >= filters.minExperience);
    }

    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(c =>
        filters.skills.some(skill =>
          c.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    return results;
  }

  // ===== DEDUPLICATION =====

  deduplicateJobs() {
    const seen = new Set();
    const deduplicated = [];
    const duplicates = [];

    this.storage.jobs.forEach(job => {
      const hash = this.createHash(
        `${job.title}:${job.skills.join(',')}:${job.location}`
      );

      if (seen.has(hash)) {
        duplicates.push(job);
      } else {
        seen.add(hash);
        deduplicated.push(job);
      }
    });

    return {
      deduplicated,
      duplicates,
      removed: duplicates.length
    };
  }

  deduplicateCandidates() {
    const seen = new Set();
    const deduplicated = [];
    const duplicates = [];

    this.storage.candidates.forEach(cand => {
      const hash = this.createHash(
        `${cand.name}:${cand.skills.join(',')}:${cand.location}`
      );

      if (seen.has(hash)) {
        duplicates.push(cand);
      } else {
        seen.add(hash);
        deduplicated.push(cand);
      }
    });

    return {
      deduplicated,
      duplicates,
      removed: duplicates.length
    };
  }

  // ===== UTILITY =====

  createHash(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  sanitize(data) {
    // Remove sensitive fields
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      delete sanitized.email;
      delete sanitized.phone;
      delete sanitized.salary;
      delete sanitized.ssn;
      return sanitized;
    }

    return data;
  }

  storeMatches(matches) {
    this.storage.matches = matches;
    return { success: true, count: matches.length };
  }

  getMatches() {
    return this.storage.matches;
  }
}

module.exports = new DataService();