'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getGoogleGeminiData } from '../../../src/lib/geminiApi';

// Initialize Supabase Client
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const GamePage = () => {
  const [tableName, setTableName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [questionData, setQuestionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [generatedQuestion, setGeneratedQuestion] = useState<string>('');

  const checkUsername = async () => {
    if (!username.trim()) return alert('Please enter a username.');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('username', username.trim());

      if (error) throw new Error(error.message);

      if (data && data.length > 0) {
        await supabase.from('students').update({ score: 0 }).eq('username', username.trim());
        setScore(0);
      } else {
        const { error: insertError } = await supabase.from('students').insert([{ username: username.trim(), score: 0 }]);
        if (insertError) throw new Error(insertError.message);
        setScore(0);
      }
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!tableName.trim() || !difficulty || !username.trim()) {
      return alert('Please fill all the fields.');
    }
  
    setLoading(true);
    try {
      // Check if the table exists and fetch the topic from the first row (id = 1)
      const { data, error } = await supabase
        .from(tableName)
        .select('topic')
        .eq('id', 1)
        .single(); // Fetch only the first row
  
      if (error || !data) {
        throw new Error(`Failed to fetch topic for table "${tableName}".`);
      }
  
      const { topic } = data;
  
      // Proceed with Gemini API call
      const prompt = `Create a ${difficulty} LeetCode-like question about the topic: ${topic}`;
      const response = await getGoogleGeminiData(prompt);
  
      // Store the generated question in state
      setGeneratedQuestion(response);
  
      // Insert the generated question into the table
      await supabase.from(tableName).insert([
        {
          difficulty,
          topic,
          question: response,
          createdby: username,
        },
      ]);
  
      alert('Question submitted successfully!');
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">Game Page</h1>

      <div className="flex flex-col gap-6">
        {/* Username Input */}
        <div className="form-group">
          <label className="block mb-2 text-lg font-medium">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="input"
          />
          
        </div>

        {/* Table Name Input */}
        <div className="form-group">
          <label className="block mb-2 text-lg font-medium">Table Name:</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
            className="input"
          />
        </div>

        {/* Difficulty Selection */}
        <div className="form-group">
          <label className="block mb-2 text-lg font-medium">Difficulty:</label>
          <div className="flex gap-4">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                className={`difficulty-btn ${difficulty === level ? 'selected' : ''}`}
                onClick={() => setDifficulty(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Question */}
        <button
          onClick={handleSubmitQuestion}
          disabled={loading}
          className="btn"
        >
          {loading ? 'Submitting...' : 'Submit Question'}
        </button>

        {/* Generated Question */}
        {generatedQuestion && (
          <div className="response-box mt-6">
            <h2 className="text-lg font-bold">Generated Question:</h2>
            <p className="mt-2">{generatedQuestion}</p>
          </div>
        )}

        {/* Display Questions */}
        {questionData.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold">Questions from Table:</h2>
            {questionData.map((item, index) => (
              <div key={index} className="question-card mt-4">
                <p><strong>Topic:</strong> {item.topic}</p>
                <p><strong>Difficulty:</strong> {item.difficulty}</p>
                <p><strong>Question:</strong> {item.question}</p>
              </div>
            ))}
          </div>
        )}

        <h4 className="text-lg font-bold mt-4">Current Score: {score}</h4>
      </div>
    </div>
  );
};

export default GamePage;
