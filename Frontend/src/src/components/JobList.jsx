import React, { useState } from 'react';
import styles from './JobList.module.css';

export function JobList({ jobs }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  if (!jobs || jobs.length === 0) {
    return <div className={styles.empty}>No jobs loaded yet</div>;
  }

  const paginatedJobs = jobs.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <h2>📋 Jobs ({jobs.length})</h2>

      <div className={styles.listContainer}>
        {paginatedJobs.map((job) => (
          <div
            key={job.id}
            className={`${styles.jobCard} ${selectedJob?.id === job.id ? styles.selected : ''}`}
            onClick={() => setSelectedJob(job)}
          >
            <div className={styles.jobHeader}>
              <h3>{job.title}</h3>
              <span className={styles.company}>{job.company}</span>
            </div>
            <div className={styles.jobMeta}>
              <span className={styles.badge}>{job.source}</span>
              <span className={styles.badge}>{job.experience_years}+ yrs</span>
              <span className={styles.badge}>{job.location}</span>
            </div>
            <div className={styles.skills}>
              {job.skills.slice(0, 4).map((skill, i) => (
                <span key={i} className={styles.skill}>{skill}</span>
              ))}
              {job.skills.length > 4 && (
                <span className={styles.skillMore}>+{job.skills.length - 4}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedJob && (
        <div className={styles.details}>
          <h3>Job Details</h3>
          <p><strong>Title:</strong> {selectedJob.title}</p>
          <p><strong>Company:</strong> {selectedJob.company}</p>
          <p><strong>Location:</strong> {selectedJob.location}</p>
          <p><strong>Experience:</strong> {selectedJob.experience_years}+ years</p>
          <p><strong>Skills Required:</strong> {selectedJob.skills.join(', ')}</p>
          <p><strong>Description:</strong> {selectedJob.description}</p>
          <button
            onClick={() => setSelectedJob(null)}
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