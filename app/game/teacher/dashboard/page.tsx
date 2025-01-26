'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client securely using environment variables
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const TeacherPage = () => {
  const [tableName, setTableName] = useState('');
const [questions, setQuestions] = useState<{ topic: string; question: string; difficulty: string }[]>([]);
const [students, setStudents] = useState<{ name: string; score: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // Flag for form submission
  const [, setGameStarted] = useState(false);


  // Fetch questions for the table
  const fetchQuestions = async (table: string) => {
    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (error) {
      setError('Error fetching questions: ' + error.message);
    } else {
      setQuestions(data);
    }
  };

  // Fetch students and their scores
  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students') // Assuming 'students' table holds students and their scores
      .select('*');

    if (error) {
      setError('Error fetching students: ' + error.message);
    } else {
      setStudents(data);
    }
  };

  // Subscribe to real-time updates for the questions table
  const subscribeToTable = (table: string) => {
    const subscription = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        (payload) => {
          setQuestions((prevQuestions) => [
            ...prevQuestions,
            {
              topic: payload.new.topic,
              question: payload.new.question,
              difficulty: payload.new.difficulty,
            },
          ]);
        }
      )
      .subscribe();

    return subscription;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!tableName) {
      setError('Please provide a challenge name.');
      return;
    }

    setLoading(true);
    setError('');

    const cleanTableName = tableName.replace(/\s+/g, '');

    await fetchQuestions(cleanTableName);
    await fetchStudents();

    // Subscribe to the table for real-time updates
    subscribeToTable(cleanTableName);

    setIsSubmitted(true); // Mark form as submitted
    setLoading(false);
  };

  // Refresh data (questions and students)
  const refreshData = async () => {
    if (!tableName) return;

    setLoading(true);
    setError('');

    const cleanTableName = tableName.replace(/\s+/g, '');

    await fetchQuestions(cleanTableName);
    await fetchStudents();

    setLoading(false);
  };

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const startGame = async () => {
    if (!tableName) {
      setError('No challenge selected');
      return;
    }
  
    try {
      // Update the 'hasGameStarted' column in the challenge table
      const { error } = await supabase
        .from(tableName) // Use the selected table
        .update({ hasgamestarted: true }) // Set hasGameStarted to true
        .eq('id', 1); // Assuming the first row is the game setup
  
      if (error) {
        console.error('Error starting game:', error); // Log the specific error
        throw new Error(error.message || 'Unknown error starting the game');
      }
  
      // Update local state to reflect the game has started
      setGameStarted(true);
  
      console.log('Game has started for challenge:', tableName);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Game start failed: ${err.message}`);
        console.error('Error details:', err); // Log error details
      } else {
        setError('Game start failed: An unknown error occurred.');
        console.error('Unknown error:', err); // Log unknown error details
      }
    }
  };
  
  

  return (
    <div className="container">
      <h1 className="header">Teacher Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      {!isSubmitted ? (
        // Show form if not submitted
        <>
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

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Fetching Data...' : 'Submit'}
          </button>
        </>
      ) : (
        // Show the challenge name and hide form after submission
        <h2 className="challenge-name">Challenge: {tableName}</h2>
      )}

      {isSubmitted && (
        <>

<button 
 onClick={startGame}
 className="w-full mt-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
>
 Start Game
</button>


          {/* Questions Section */}
          <div className="section">
            <h2 className="section-title">Questions in {tableName}</h2>
            <div className="questions-list">
              {questions.length > 0 ? (
                questions.map((question, index) => (
                  <div key={index} className="question-card">
                    <h3 className="question-topic">{question.topic}</h3>
                    <p>{question.question}</p>
                    <p><strong>Difficulty:</strong> {question.difficulty}</p>
                  </div>
                ))
              ) : (
                <p>No questions available.</p>
              )}
            </div>
          </div>

          {/* Students Section */}
          <div className="section">
            <h2 className="section-title">Students and Their Scores</h2>
            <div className="students-list">
              {students.length > 0 ? (
                students.map((student, index) => (
                  <div key={index} className="student-card">
                    <h3 className="student-name">{student.name}</h3>
                    <p><strong>Score:</strong> {student.score}</p>
                  </div>
                ))
              ) : (
                <p>No students found.</p>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? 'Refreshing Data...' : 'Refresh Data'}
          </button>
        </>
      )}
    </div>
  );
};

export default TeacherPage;
