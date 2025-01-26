'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import './style.css'; // Importing the CSS file

// Initialize Supabase Client
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw'
);

const TeacherPage = () => {
  const router = useRouter();

  const [tableName, setTableName] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('');
  const [defaultTopic, setDefaultTopic] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(5); // Default timer value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60); // Time in seconds

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    if (timeLeft <= 0) {
      router.push('/game/leaderboard'); // Redirect to leaderboard when the timer ends
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameStarted, router]);

  const handleCreateTable = async () => {
    if (!tableName || !defaultLanguage || !defaultTopic) {
      setError('Please provide a challenge name, default language, and default focus area.');
      return;
    }

    setLoading(true);
    setError('');

    const cleanTableName = tableName.replace(/\s+/g, '');
    const endTime = new Date(Date.now() + timerMinutes * 60000).toISOString(); // Calculate end time

    const query = `
      CREATE TABLE IF NOT EXISTS ${cleanTableName} (
        id SERIAL PRIMARY KEY,
        language TEXT DEFAULT '${defaultLanguage}',
        topic TEXT DEFAULT '${defaultTopic}',
        question TEXT DEFAULT 'none',
        difficulty TEXT NOT NULL,
        createdBy TEXT DEFAULT 'none',
        endtime TIMESTAMP
      );

      ALTER TABLE ${cleanTableName} ENABLE ROW LEVEL SECURITY;
      CREATE POLICY select_policy ON ${cleanTableName} FOR SELECT USING (true);
      CREATE POLICY insert_policy ON ${cleanTableName} FOR INSERT WITH CHECK (true);

      INSERT INTO ${cleanTableName} (language, topic, question, difficulty, createdBy, endtime)
      VALUES ('${defaultLanguage}', '${defaultTopic}', 'none', 'easy', 'none', '${endTime}');
    `;

    try {
      const { error } = await supabase.rpc('execute_sql', { sql: query });

      if (error) {
        setError('Error creating Challenge: ' + error.message);
      } else {
        alert(`Challenge "${tableName}" created successfully with default data including end time!`);
        setTableName('');
        setDefaultLanguage('');
        setDefaultTopic('');
        router.push('/game/teacher/dashboard'); // Redirect to the dashboard
      }
    } catch (err) {
      setError('Unexpected error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  

  const handleStartGame = async () => {
    setGameStarted(true);
    const endTime = new Date(Date.now() + timerMinutes * 60000).toISOString();

    // Update the endtime column in the table
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ endtime: endTime })
        .eq('id', 1); // Assuming the first row in the table is used for the game setup

      if (error) {
        console.error('Error updating endtime:', error);
      } else {
        console.log('End time saved:', endTime);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
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

      <div className="form-group">
        <label htmlFor="timer">Set Timer (Minutes):</label>
        <select
          id="timer"
          value={timerMinutes}
          onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
          className="input-field"
        >
          <option value={1}>1 Minute</option>
          <option value={3}>3 Minutes</option>
          <option value={5}>5 Minutes</option>
          <option value={10}>10 Minutes</option>
        </select>
      </div>

      {gameStarted ? (
        <>
          <div className="timer-bar">
            <div
              className="timer-bar-fill"
              style={{ width: `${(timeLeft / (timerMinutes * 60)) * 100}%` }}
            ></div>
          </div>
          <p>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} remaining</p>
        </>
      ) : (
        <button className="submit-btn" onClick={handleCreateTable} disabled={loading}>
          {loading ? 'Creating...' : 'Launch Challenge'}
        </button>
      )}

      {!gameStarted && (
        <button className="start-btn" onClick={handleStartGame}>
          Start Game
        </button>
      )}
    </div>
  );
};

export default TeacherPage;
