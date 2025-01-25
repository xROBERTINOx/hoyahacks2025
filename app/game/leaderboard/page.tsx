'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './style.css';  // Importing the CSS file

// Initialize Supabase Client securely using environment variables
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch leaderboard from Supabase
  useEffect(() => {
    const getLeaderboard = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('students') // Assuming 'students' is your table
          .select('username, score')
          .order('score', { ascending: false }); // Sort by score, descending

        if (error) {
          console.error(error);
          return;
        }

        setLeaderboard(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    getLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-header">Leaderboard</h2>

      {loading ? (
        <div className="loader">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="no-data">No data available.</div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`leaderboard-item 
                ${index === 0 ? 'top-performer' : ''} 
                ${index === 1 ? 'second-performer' : ''} 
                ${index === 2 ? 'third-performer' : ''}`}
            >
              <div className="rank">{index + 1}</div>
              <div className="username">{entry.username}</div>
              <div className="score">{entry.score} points</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
