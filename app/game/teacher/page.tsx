'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './style.css';  // Importing the CSS file

// Initialize Supabase Client securely using environment variables
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const TeacherPage = () => {
  const [tableName, setTableName] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('');
  const [defaultTopic, setDefaultTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle table creation
  const handleCreateTable = async () => {
    if (!tableName || !defaultLanguage || !defaultTopic) {
      setError('Please provide a challenge name, default language, and default focus area.');
      return;
    }

    setLoading(true);
    setError('');

    // Clean table name by removing spaces
    const cleanTableName = tableName.replace(/\s+/g, '');

    const query = `
      CREATE TABLE IF NOT EXISTS ${cleanTableName} (
        id SERIAL PRIMARY KEY,
        language TEXT DEFAULT '${defaultLanguage}',  
        topic TEXT DEFAULT '${defaultTopic}',      
        question TEXT DEFAULT 'none',              
        difficulty TEXT NOT NULL
      );
      
      ALTER TABLE ${cleanTableName} ENABLE ROW LEVEL SECURITY;
      CREATE POLICY select_policy ON ${cleanTableName} FOR SELECT USING (true);
      CREATE POLICY insert_policy ON ${cleanTableName} FOR INSERT WITH CHECK (true);
    `;

    try {
      const { error } = await supabase.rpc('execute_sql', { sql: query });

      if (error) {
        setError('Error creating Challenge: ' + error.message);
      } else {
        alert(`Challenge "${tableName}" created successfully!`);
        setupRealtimeSubscription(cleanTableName);
        setTableName('');
        setDefaultLanguage('');
        setDefaultTopic('');
      }
    } catch (err) {
      setError('Unexpected error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription on the table
  const setupRealtimeSubscription = (cleanTableName: string) => {
    const channel = supabase
      .channel(`public:${cleanTableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: cleanTableName }, (payload: any) => {
        console.log('Realtime update received:', payload);
      })
      .subscribe();
  };

  return (
    <div className="container">
      <h1 className="header">Craft a Challenge</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="tableName">Challenge Name:</label>
        <input
          id="tableName"
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Enter challenge name"
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="defaultLanguage">Language:</label>
        <input
          id="defaultLanguage"
          type="text"
          value={defaultLanguage}
          onChange={(e) => setDefaultLanguage(e.target.value)}
          placeholder="Enter default language"
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="defaultTopic">Challenge Focus Area:</label>
        <input
          id="defaultTopic"
          type="text"
          value={defaultTopic}
          onChange={(e) => setDefaultTopic(e.target.value)}
          placeholder="Enter default topic"
          className="input-field"
        />
      </div>

      <button className="submit-btn" onClick={handleCreateTable} disabled={loading}>
        {loading ? 'Creating...' : 'Launch Challenge'}
      </button>
    </div>
  );
};

export default TeacherPage;
