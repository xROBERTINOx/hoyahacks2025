'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const TeacherPage = () => {
  const [tableName, setTableName] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('');
  const [defaultTopic, setDefaultTopic] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to create a new table and enable realtime
  const handleCreateTable = async () => {
    if (!tableName || !defaultLanguage || !defaultTopic) {
      alert('Please provide both a table name, default language, and default topic.');
      return;
    }

    setLoading(true);

    const query = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        language TEXT DEFAULT '${defaultLanguage}',  -- Default language
        topic TEXT DEFAULT '${defaultTopic}',      -- Default topic
        question TEXT DEFAULT 'none',              -- Default question (set to "none")
        difficulty TEXT NOT NULL,
      );
      
      -- Enable Row-Level Security (RLS) for the table
      ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

      -- Create policy for select (reading data)
      CREATE POLICY select_policy
      ON ${tableName}
      FOR SELECT
      USING (true);
      
      -- Create policy for insert (writing data)
      CREATE POLICY insert_policy
      ON ${tableName}
      FOR INSERT
      WITH CHECK (true);
    `;

    try {
      const { error } = await supabase.rpc('execute_sql', { sql: query });

      if (error) {
        alert('Error creating table: ' + error.message);
      } else {
        alert(`Table "${tableName}" created successfully with default language "${defaultLanguage}", default topic "${defaultTopic}", and default question "none".`);

        // Set up realtime subscription on the table
        setupRealtimeSubscription(tableName);

        setTableName('');
        setDefaultLanguage('');
        setDefaultTopic('');
      }
    } catch (err) {
      alert('Unexpected error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Function to set up realtime subscription on the table
  const setupRealtimeSubscription = (tableName: string) => {
    const channel = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload: any) => {
        console.log('Realtime update received:', payload);
        // Handle the realtime update (e.g., update UI)
      })
      .subscribe();

    console.log(`Subscribed to realtime updates for table: ${tableName}`);
  };

  return (
    <div>
      <h1>Create a New Table</h1>
      <div>
        <label>
          Table Name:
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
          />
        </label>
        <label>
          Language:
          <input
            type="text"
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            placeholder="Enter default language"
          />
        </label>
        <label>
          Topic:
          <input
            type="text"
            value={defaultTopic}
            onChange={(e) => setDefaultTopic(e.target.value)}
            placeholder="Enter default topic"
          />
        </label>
        <button onClick={handleCreateTable} disabled={loading}>
          {loading ? 'Creating...' : 'Create Table'}
        </button>
      </div>
    </div>
  );
};

export default TeacherPage;
