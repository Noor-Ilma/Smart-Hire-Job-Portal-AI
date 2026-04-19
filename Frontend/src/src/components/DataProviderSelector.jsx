import React, { useState } from 'react';
import { ingestionAPI } from '../api';
import styles from './DataProviderSelector.module.css';

export function DataProviderSelector({ onDataLoaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadType, setUploadType] = useState('jobs');

  // Load mock jobs
  const loadMockJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ingestionAPI.loadMockJobs();
      onDataLoaded({
        type: 'jobs',
        data: response.data.data,
        source: 'linkedin'
      });
    } catch (err) {
      setError(`Failed to load jobs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load mock candidates
  const loadMockCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ingestionAPI.loadMockCandidates();
      onDataLoaded({
        type: 'candidates',
        data: response.data.data,
        source: 'naukri'
      });
    } catch (err) {
      setError(`Failed to load candidates: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CSV Upload
  const handleFileUpload = async (e) => {
    try {
      setLoading(true);
      setError(null);

      const file = e.target.files[0];
      if (!file) return;

      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = values[i];
          });
          return obj;
        });

      await ingestionAPI.uploadCSV(data, uploadType, 'csv');

      onDataLoaded({
        type: uploadType,
        data: data,
        source: 'csv'
      });
    } catch (err) {
      setError(`Failed to upload file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 NEW: PDF Resume Upload
  const handleResumeUpload = async (e) => {
    try {
      setLoading(true);
      setError(null);

      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("http://localhost:5000/api/resume", {
  method: "POST",
  body: formData
});

if (!res.ok) {
  throw new Error("Server error");
}

      const data = await res.json();

      // ⭐ ADD THIS BLOCK

// 1. Get jobs data
const jobsRes = await fetch("http://localhost:5000/api/ingest/mock/jobs");
const jobsJson = await jobsRes.json();

// 2. Send resume to matching API
const matchRes = await fetch("http://localhost:5000/api/process/resume-match", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    resume_text: data.resume_text,
    jobs: jobsJson.data
  })
});

const matchData = await matchRes.json();

// 3. Show result
alert("Top Match: " + matchData.matches[0].job_title + 
      " (" + matchData.matches[0].match_percentage + "%)");

      alert("✅ Resume uploaded!\nSkills: " + data.extracted_skills.join(", "));

    } catch (err) {
      setError("Resume upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>📊 Data Provider Selector</h2>

      {/* Mock Data */}
      <div className={styles.section}>
        <h3>Quick Start (Mock Data)</h3>

        <button onClick={loadMockJobs} disabled={loading} className={styles.button}>
          {loading ? 'Loading...' : '📋 Load Sample Jobs (LinkedIn)'}
        </button>

        <button onClick={loadMockCandidates} disabled={loading} className={styles.button}>
          {loading ? 'Loading...' : '👥 Load Sample Candidates (Naukri)'}
        </button>
      </div>

      {/* CSV Upload */}
      <div className={styles.section}>
        <h3>Upload CSV</h3>

        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
          className={styles.select}
        >
          <option value="jobs">Jobs Data</option>
          <option value="candidates">Candidates Data</option>
        </select>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </div>

      {/* 🚀 NEW: Resume Upload */}
      <div className={styles.section}>
        <h3>Upload Resume (PDF)</h3>

        <input
          type="file"
          accept=".pdf"
          onChange={handleResumeUpload}
          disabled={loading}
        />
      </div>

      {error && <div className={styles.error}>❌ {error}</div>}
    </div>
  );
}