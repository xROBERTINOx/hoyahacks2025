'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getGoogleGeminiData } from '../../../src/lib/geminiApi';
// Assuming this function is already available

// Initialize Supabase Client
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const GamePage = () => {
  const [tableName, setTableName] = useState<string>(''); // Table name input
  const [difficulty, setDifficulty] = useState<string>(''); // Difficulty selection
  const [questionData, setQuestionData] = useState<any[]>([]); // Questions fetched from table
  const [loading, setLoading] = useState(false); // Loading state
  const [username, setUsername] = useState<string>(''); // Username input
  const [score, setScore] = useState<number>(0); // Score
  const [generatedQuestion, setGeneratedQuestion] = useState<string>(''); // Store generated question

  // Fetch questions from the specified table
  const fetchQuestionsFromTable = async (tableName: string) => {
    if (!tableName) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        alert('Error fetching questions: ' + error.message);
        return;
      }
      setQuestionData(data || []);
    } catch (err) {
      alert('Unexpected error fetching data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Check username in students table
  const checkUsername = async () => {
    if (!username) {
      alert('Please enter a username');
      return;
    }

    // Check if the username exists
    const { data, error } = await supabase
      .from('students') // Assuming 'students' is your table
      .select('*')
      .eq('username', username);

    if (error) {
      alert('Error checking username: ' + error.message);
      return;
    }

    if (data && data.length > 0) {
      // Username exists, reset score
      await supabase
        .from('students')
        .update({ score: 0 })
        .eq('username', username);
      setScore(0);
      alert('Your score has been reset!');
    } else {
      // Username does not exist, insert with score 0
      const { error: insertError } = await supabase
        .from('students')
        .insert([{ username, score: 0 }]);

      if (insertError) {
        alert('Error inserting username: ' + insertError.message);
        return;
      }

      setScore(0);
      alert('Welcome! Your score has been set to 0.');
    }
  };

  // Handle table name change
  const handleTableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
  };

  // Handle difficulty selection change
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
  };

  // Handle search table click
  const handleSearchTable = () => {
    if (!tableName) {
      alert('Please enter a table name.');
      return;
    }
    fetchQuestionsFromTable(tableName);
  };

  // Handle question submission and send data to Gemini
  const handleSubmitQuestion = async () => {
    if (!tableName || !difficulty || !username) {
      alert('Please provide table name, difficulty, and username.');
      return;
    }
  
    setLoading(true);
    try {
      // Send the difficulty and topic to Gemini API
      const prompt = `Create a ${difficulty} LeetCode-like question about the topic: ${tableName}`;
      const response = await getGoogleGeminiData(prompt);
  
      // Store the generated question in state
      setGeneratedQuestion(response);
  
      // Optionally, you can store the generated question in Supabase
      await supabase.from(tableName).insert([
        {
          difficulty,
          topic: tableName,
          question: response,
          createdby: username, // Add the createdby field with the username
        },
      ]);
  
      alert('Question submitted successfully!');
    } catch (err) {
      alert('Unexpected error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <h1>Game Page</h1>

      {/* Username Input */}
      <div>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </label>
        <button onClick={checkUsername} disabled={loading}>
          {loading ? 'Checking...' : 'Submit Username'}
        </button>
      </div>

      {/* Table Name Input */}
      <div>
        <label>
          Table Name:
          <input
            type="text"
            value={tableName}
            onChange={handleTableChange}
            placeholder="Enter table name"
          />
        </label>
        <button onClick={handleSearchTable} disabled={loading}>
          {loading ? 'Searching...' : 'Search Table'}
        </button>
      </div>

      {/* Difficulty Selection */}
      <div>
        <label>
          Difficulty:
          <select value={difficulty} onChange={handleDifficultyChange}>
            <option value="">Select Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>

      <button onClick={handleSubmitQuestion} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Question'}
      </button>

      <hr />

      <h2>Generated Question:</h2>
      {generatedQuestion ? (
        <div style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
          <p>{generatedQuestion}</p>
        </div>
      ) : (
        <p>No question generated yet. Submit a question to get started!</p>
      )}

      <h4>Current Score: {score}</h4>

      <div>
        {questionData.length > 0 ? (
          questionData.map((item, index) => (
            <div key={index} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
              <p><strong>Topic:</strong> {item.topic}</p>
              <p><strong>Difficulty:</strong> {item.difficulty}</p>
              <p><strong>Question:</strong> {item.question}</p> {/* Display the generated question */}
            </div>
          ))
        ) : (
          <p>No questions yet. Submit a question to start!</p>
        )}
      </div>
    </div>
  );
};

export default GamePage;
