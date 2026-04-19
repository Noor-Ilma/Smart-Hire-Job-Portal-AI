class MatchingService {
  computeSimilarity(jobSkills, candidateSkills) {
    if (!jobSkills.length || !candidateSkills.length) {
      return 0;
    }

    const jobSet = new Set(jobSkills.map(s => s.toLowerCase()));
    const candSet = new Set(candidateSkills.map(s => s.toLowerCase()));

    const intersection = [...jobSet].filter(skill => candSet.has(skill)).length;
    const union = new Set([...jobSet, ...candSet]).size;

    const jaccardSimilarity = intersection / union;

    return Math.min(1.0, jaccardSimilarity);
  }
}

module.exports = new MatchingService();