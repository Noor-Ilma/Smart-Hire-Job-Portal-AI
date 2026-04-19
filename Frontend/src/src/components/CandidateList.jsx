import React, { useState } from 'react';
import styles from './CandidateList.module.css';

export function CandidateList({ candidates }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  if (!candidates || candidates.length === 0) {
    return <div className={styles.empty}>No candidates loaded yet</div>;
  }

  const paginatedCandidates = candidates.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(candidates.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <h2>👥 Candidates ({candidates.length})</h2>

      <div className={styles.listContainer}>
        {paginatedCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className={`${styles.candidateCard} ${selectedCandidate?.id === candidate.id ? styles.selected : ''}`}
            onClick={() => setSelectedCandidate(candidate)}
          >
            <div className={styles.candidateHeader}>
              <h3>{candidate.name}</h3>
              <span className={styles.title}>{candidate.title}</span>
            </div>
            <div className={styles.candidateMeta}>
              <span className={styles.badge}>{candidate.source}</span>
              <span className={styles.badge}>{candidate.experience_years}+ yrs</span>
              <span className={styles.badge}>{candidate.location}</span>
            </div>
            <div className={styles.skills}>
              {candidate.skills.slice(0, 4).map((skill, i) => (
                <span key={i} className={styles.skill}>{skill}</span>
              ))}
              {candidate.skills.length > 4 && (
                <span className={styles.skillMore}>+{candidate.skills.length - 4}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCandidate && (
        <div className={styles.details}>
          <h3>Candidate Profile</h3>
          <p><strong>Name:</strong> {selectedCandidate.name}</p>
          <p><strong>Current Title:</strong> {selectedCandidate.title}</p>
          <p><strong>Location:</strong> {selectedCandidate.location}</p>
          <p><strong>Experience:</strong> {selectedCandidate.experience_years}+ years</p>
          <p><strong>Skills:</strong> {selectedCandidate.skills.join(', ')}</p>
          <p><strong>Summary:</strong> {selectedCandidate.summary}</p>
          <button
            onClick={() => setSelectedCandidate(null)}
            className={styles.closeButton}
          >
            ✕ Close
          </button>
        </div>
      )}

      <div className={styles.pagination}>
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          ← Previous
        </button>
        <span>{page + 1} / {totalPages}</span>
        <button
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}