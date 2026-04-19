import React, { useState } from 'react';
import { exportAPI } from '../api';
import styles from './MatchResults.module.css';

export function MatchResults({ matches, loading }) {
  const [sortBy, setSortBy] = useState('claude_score');
  const [selectedMatch, setSelectedMatch] = useState(null);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          🔄 Processing matches... (This may take a minute)
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          No matches found. Load data and click "Run Matching" to get started.
        </div>
      </div>
    );
  }

  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === 'claude_score') {
      return (b.claude_analysis?.score || 0) - (a.claude_analysis?.score || 0);
    } else if (sortBy === 'similarity') {
      return parseFloat(b.similarity) - parseFloat(a.similarity);
    }
    return 0;
  });

  const handleExportCSV = () => {
    exportAPI.exportMatchesCSV();
  };

  const handleExportJSON = async () => {
    try {
      const response = await exportAPI.exportMatchesJSON();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'matches.json';
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>🎯 Match Results ({matches.length})</h2>
        <div className={styles.controls}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="claude_score">Sort by AI Score</option>
            <option value="similarity">Sort by Similarity</option>
          </select>
          <button onClick={handleExportCSV} className={styles.buttonExport}>
            📥 Export CSV
          </button>
          <button onClick={handleExportJSON} className={styles.buttonExport}>
            📥 Export JSON
          </button>
        </div>
      </div>

      <div className={styles.matchesContainer}>
        {sortedMatches.slice(0, 20).map((match, idx) => (
          <div
            key={idx}
            className={`${styles.matchCard} ${selectedMatch === idx ? styles.expanded : ''}`}
            onClick={() => setSelectedMatch(selectedMatch === idx ? null : idx)}
          >
            <div className={styles.matchHeader}>
              <div className={styles.matchTitles}>
                <h3 className={styles.jobTitle}>{match.job_title}</h3>
                <span className={styles.arrow}>→</span>
                <h3 className={styles.candidateName}>{match.candidate_name}</h3>
              </div>
              <div className={styles.matchScores}>
                <span className={styles.scoreChip}>
                  AI Score: {match.claude_score}/100
                </span>
                <span className={styles.scoreChip + ' ' + styles.similarity}>
                  Match: {match.similarity}%
                </span>
                <span
                  className={`${styles.scoreChip} ${styles.recommendation} ${styles[match.recommendation]}`}
                >
                  {match.recommendation?.toUpperCase()}
                </span>
              </div>
            </div>

            {selectedMatch === idx && (
              <div className={styles.matchDetails}>
                <div className={styles.explanation}>
                  <strong>Analysis:</strong>
                  <p>{match.explanation}</p>
                </div>
                <div className={styles.metadata}>
                  <p>
                    <strong>Job Company:</strong> {match.job.company || 'N/A'}
                  </p>
                  <p>
                    <strong>Candidate Title:</strong> {match.candidate.title}
                  </p>
                  <p>
                    <strong>Candidate Location:</strong> {match.candidate.location}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}