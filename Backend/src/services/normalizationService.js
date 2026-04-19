class NormalizationService {
  // ===== JOB NORMALIZATION =====

  normalizeJob(job, source = 'unknown') {
    return {
      id: job.id || job.job_id || this.generateId(),
      source: source.toLowerCase(),
      title: this.normalizeText(
        job.title || job.position || job.job_title || ''
      ),
      company: this.normalizeText(
        job.company || job.company_name || 'Unknown'
      ),
      skills: this.normalizeSkills(job.skills || job.required_skills || []),
      experience_years: parseInt(job.experience || job.years_experience || 0),
      location: this.normalizeLocation(job.location || job.city || ''),
      description: (job.description || job.job_description || '')
        .substring(0, 1000),
      created_at: new Date().toISOString(),
      source_url: job.url || job.source_url || null,
    };
  }

  normalizeJobBatch(jobs, source = 'unknown') {
    return jobs.map(job => this.normalizeJob(job, source));
  }

  // ===== CANDIDATE NORMALIZATION =====

  normalizeCandidate(candidate, source = 'unknown') {
    return {
      id: candidate.id || candidate.candidate_id || this.generateId(),
      source: source.toLowerCase(),
      name: this.extractFirstName(candidate.name || candidate.full_name || ''),
      title: this.normalizeText(
        candidate.title || candidate.current_role || candidate.job_title || ''
      ),
      skills: this.normalizeSkills(
        candidate.skills || candidate.technical_skills || []
      ),
      experience_years: parseInt(
        candidate.experience || candidate.years_experience || 0
      ),
      location: this.normalizeLocation(
        candidate.location || candidate.city || ''
      ),
      summary: (candidate.summary || candidate.bio || candidate.description || '')
        .substring(0, 500),
      created_at: new Date().toISOString(),
      profile_url: candidate.url || candidate.profile_url || null,
    };
  }

  normalizeCandidateBatch(candidates, source = 'unknown') {
    return candidates.map(cand => this.normalizeCandidate(cand, source));
  }

  // ===== FIELD NORMALIZERS =====

  normalizeText(text) {
    if (!text) return '';
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  normalizeSkills(skills) {
    if (!skills) return [];
    
    let skillsArray = Array.isArray(skills) ? skills : [skills];
    
    return skillsArray
      .map(s => {
        if (typeof s === 'string') {
          return s.trim().toLowerCase();
        }
        return String(s).trim().toLowerCase();
      })
      .filter(s => s.length > 2 && s.length < 50)
      .filter((s, i, arr) => arr.indexOf(s) === i); // deduplicate
  }

  normalizeLocation(location) {
    if (!location) return 'Unknown';
    return location
      .trim()
      .toLowerCase()
      .split(',')
      .map(part => part.trim())
      .join(', ');
  }

  extractFirstName(fullName) {
    if (!fullName) return 'Anonymous';
    const firstName = fullName.trim().split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  }

  // ===== VALIDATION =====

  validateJob(job) {
    const errors = [];

    if (!job.title || job.title.trim().length === 0) {
      errors.push('Missing job title');
    }

    if (!job.location || job.location.trim().length === 0) {
      errors.push('Missing location');
    }

    if (!job.skills || job.skills.length === 0) {
      errors.push('Missing skills');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateCandidate(candidate) {
    const errors = [];

    if (!candidate.name || candidate.name.trim().length === 0) {
      errors.push('Missing name');
    }

    if (!candidate.title || candidate.title.trim().length === 0) {
      errors.push('Missing title');
    }

    if (!candidate.location || candidate.location.trim().length === 0) {
      errors.push('Missing location');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ===== UTILITY =====

  generateId() {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new NormalizationService();