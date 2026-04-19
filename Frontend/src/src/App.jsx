import React, { useState, useEffect } from 'react';
import { DataProviderSelector } from './components/DataProviderSelector';
import { JobList } from './components/JobList';
import { CandidateList } from './components/CandidateList';
import { MatchResults } from './components/MatchResults';
import { SearchFilter } from './components/SearchFilter';
import { processingAPI } from './api';
import styles from './App.module.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');

  const handleDataLoaded = (data) => {
    if (data.type === 'jobs') {
      setJobs(data.data);
    } else {
      setCandidates(data.data);
    }
    setError(null);
  };

  const runMatching = async () => {
    try {
      setLoading(true);
      setError(null);

      if (jobs.length === 0 || candidates.length === 0) {
        setError('Please load both jobs and candidates data first');
        setLoading(false);
        return;
      }

      // Call match API
      const response = await processingAPI.match(jobs, candidates);
      
      const formattedMatches = response.data.results.map(r => ({
        job_id: r.job_id,
        job_title: r.job_title,
        candidate_id: r.candidate_id,
        candidate_name: r.candidate_name,
        similarity: r.similarity,
        claude_score: r.claude_score || 50,
        recommendation: r.recommendation || 'consider',
        explanation: r.explanation || 'No explanation available',
        job: jobs.find(j => j.id === r.job_id),
        candidate: candidates.find(c => c.id === r.candidate_id),
      }));

      setMatches(formattedMatches);
      setActiveTab('results');
    } catch (err) {
      setError(`Matching failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1> SMART HIRE</h1>
        <p>AI-Powered Job Matching Platform</p>
      </header>

      <div className={styles.mainContent}>
        <aside className={styles.sidebar}>
          <DataProviderSelector onDataLoaded={handleDataLoaded} />

          <div className={styles.actionButtons}>
            <button
              onClick={runMatching}
              disabled={loading || jobs.length === 0 || candidates.length === 0}
              className={styles.primaryButton}
            >
              {loading ? '⏳ Processing...' : '▶️ Run Matching'}
            </button>
          </div>

          <SearchFilter
            jobs={jobs}
            candidates={candidates}
            onFilter={setFilteredResults}
          />
        </aside>

        <main className={styles.content}>
          {error && <div className={styles.errorBanner}>❌ {error}</div>}

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'jobs' ? styles.active : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              📋 Jobs ({jobs.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'candidates' ? styles.active : ''}`}
              onClick={() => setActiveTab('candidates')}
            >
              👥 Candidates ({candidates.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'results' ? styles.active : ''}`}
              onClick={() => setActiveTab('results')}
            >
              🎯 Matches ({matches.length})
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'jobs' && (
              <JobList
                jobs={filteredResults?.type === 'jobs' ? filteredResults.results : jobs}
              />
            )}

            {activeTab === 'candidates' && (
              <CandidateList
                candidates={
                  filteredResults?.type === 'candidates'
                    ? filteredResults.results
                    : candidates
                }
              />
            )}

            {activeTab === 'results' && (
              <MatchResults matches={matches} loading={loading} />
            )}
          </div>
        </main>
      </div>

      <footer className={styles.footer}>
        <p>MVP System • Built in 1 Hour • Open Source</p>
      </footer>
    </div>
  );
}

export default App;