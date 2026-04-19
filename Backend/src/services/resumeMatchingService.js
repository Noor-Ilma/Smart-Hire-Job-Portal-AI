const normalizeSkill = (skill) => {
  const map = {
    js: "javascript",
    ml: "machine learning",
    py: "python",
  };
  const s = skill.toLowerCase().trim();
  return map[s] || s;
};

const extractSkills = (text) => {
  const keywords = [
    "python","java","javascript","react","node","sql",
    "machine learning","aws","docker","html","css",
    "kubernetes","tensorflow","pytorch"
  ];

  const found = [];
  const lower = text.toLowerCase();

  keywords.forEach(k => {
    if (lower.includes(k)) {
      found.push(normalizeSkill(k));
    }
  });

  return [...new Set(found)];
};

const matchJobs = (resumeText, jobs) => {
  const resumeSkills = extractSkills(resumeText);

  const results = jobs.map(job => {
    const jobSkills = job.skills.map(s => normalizeSkill(s));

    const matching = resumeSkills.filter(s =>
      jobSkills.includes(s)
    );

    const missing = jobSkills.filter(s =>
      !resumeSkills.includes(s)
    );

    const score = jobSkills.length === 0
      ? 0
      : Math.round((matching.length / jobSkills.length) * 100);

    let recommendation = "Weak Match";
    if (score > 75) recommendation = "Strong Match";
    else if (score >= 50) recommendation = "Good Match";

    return {
      job_title: job.title,
      company: job.company,
      match_percentage: score,
      matching_skills: matching,
      missing_skills: missing,
      recommendation,
      explanation: `${matching.length} skills matched out of ${jobSkills.length}`
    };
  });

  return {
    candidate_skills: resumeSkills,
    matches: results.sort((a, b) => b.match_percentage - a.match_percentage)
  };
};

module.exports = {
  extractSkills,
  matchJobs
};