import React, { useState, useEffect } from 'react';
import styles from './SearchFilter.module.css';

export function SearchFilter({ jobs, candidates, onFilter }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('jobs');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const performFilter = () => {
      const query = searchQuery.toLowerCase();
      const locQuery = filterLocation.toLowerCase();

      let filtered;
      if (filterType === 'jobs') {
        filtered = jobs.filter(job =>
          (job.title.includes(query) ||
            job.company.includes(query) ||
            job.skills.some(s => s.toLowerCase().includes(query))) &&
          (locQuery === '' || job.location.toLowerCase().includes(locQuery))
        );
      } else {
        filtered = candidates.filter(cand =>
          (cand.name.includes(query) ||
            cand.title.includes(query) ||
            cand.skills.some(s => s.toLowerCase().includes(query))) &&
          (locQuery === '' || cand.location.toLowerCase().includes(locQuery))
        );
      }

      setResults(filtered);
      onFilter({ type: filterType, results: filtered });
    };

    performFilter();
  }, [searchQuery, filterLocation, filterType, jobs, candidates, onFilter]);

  return (
    <div className={styles.container}>
      <h3>🔍 Search & Filter</h3>

      <div className={styles.controls}>
        <div className={styles.group}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by title, company, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.group}>
          <label>Location:</label>
          <input
            type="text"
            placeholder="Filter by location..."
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.group}>
          <label>Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.select}
          >
            <option value="jobs">Jobs</option>
            <option value="candidates">Candidates</option>
          </select>
        </div>
      </div>

      <div className={styles.resultCount}>
        Found: <strong>{results.length}</strong> results
      </div>
    </div>
  );
}