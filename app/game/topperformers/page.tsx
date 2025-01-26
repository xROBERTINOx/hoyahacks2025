'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const TopPerformers = () => {
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds countdown
  const router = useRouter();

  // Fetch leaderboard from Supabase
  useEffect(() => {
    const getLeaderboard = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('students') // Assuming 'users' is your table
          .select('username, score')
          .order('score', { ascending: false }); // Sort by score, descending

        if (error) {
          console.error(error);
          alert(error);
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

  // Timer for auto redirection
  useEffect(() => {
    if (timeLeft <= 0) {
      router.push('/game/leaderboard'); // Redirect to leaderboard page
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router]);

  return (
    <div className="leaderboard-container">
      {/* Timer Bar */}
      <div className="timer-bar-container">
        <div
          className="timer-bar"
          style={{
            width: `${(timeLeft / 5) * 100}%`, // Percentage width based on time left
            transition: 'width 1s linear',
          }}
        ></div>
      </div>

      <h2 className="leaderboard-header">The Champions</h2>

      {loading ? (
        <div className="loader">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="no-data">No data available.</div>
      ) : (
        <div className="podium">
          {/* Second Performer (left) */}
          {leaderboard[1] && (
            <div className="second-performer">
              <div className="rank">2</div>
              <div className="username">{leaderboard[1].username}</div>
              <div className="score">{leaderboard[1].score} points</div>
            </div>
          )}

          {/* Top Performer (center) */}
          <div className="top-performer">
            <div className="rank">1</div>
            <div className="username">{leaderboard[0].username}</div>
            <div className="score">{leaderboard[0].score} points</div>
          </div>

          {/* Third Performer (right) */}
          {leaderboard[2] && (
            <div className="third-performer">
              <div className="rank">3</div>
              <div className="username">{leaderboard[2].username}</div>
              <div className="score">{leaderboard[2].score} points</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopPerformers;
