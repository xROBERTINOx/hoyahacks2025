'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getGoogleGeminiData } from '../../../src/lib/geminiApi';
import './style.css';  // Adjust according to your file structure


// Initialize Supabase Client
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const GamePage = () => {
  const [tableName, setTableName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [questionData] = useState<{ topic: string; difficulty: string; question: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [score, setScore] = useState<number>(100);
  const [generatedQuestion, setGeneratedQuestion] = useState<string>('');
  const [hintCount, setHintCount] = useState<number>(0);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [geminiResponses, setGeminiResponses] = useState<
    { prompt: string; response: string; isHint?: boolean; hintNumber: number }[]
  >([]);
  const [, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value);
  };

  const handleSubmitQuestion = async () => {
    if (!tableName.trim() || !difficulty || !username.trim()) {
      return alert('Please fill all the fields.');
    }

    setLoading(true);

    try {
      // Check if the table exists
      const { error } = await supabase.from(tableName).select('*').limit(1);
      if (error) {
        throw new Error(`Table "${tableName}" does not exist or is inaccessible.`);
      }

      // Proceed with Gemini API call
      const prompt = `Create a ${difficulty} LeetCode-like question about the topic: ${tableName} just give me question do not add any additional info`;

      const response = await getGoogleGeminiData(prompt);

      // Store the generated question in state
      setGeneratedQuestion(response);

      // Insert the generated question into the table
      await supabase.from(tableName).insert([
        {
          difficulty,
          topic: tableName,
          question: response,
          createdby: username,
        },
      ]);

      setQuestionSubmitted(true);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  const handleHintRequest = async () => {
    try {
      if (hintCount >= 3) {
        setScore((prevScore) => prevScore - 10); // Deduct points after 3 hints
        localStorage.setItem('score', String(score - 10));
      }

      const prompt = `Don't include any asterisks or marks. Imagine 4 levels of hints, where 4 nearly gives away the answer and 1 is quite vague. Give a level ${
        hintCount + 1
      } LeetCode-like hint for the coding question you provided. just provide the hint do not include any other additional info`;

      const response = await getGoogleGeminiData(prompt);

      // Increment hint count
      const newHint = {
        prompt: `Hint ${hintCount + 1}`,
        response,
        isHint: true,
        hintNumber: hintCount + 1, // The order of hints
      };

      // Append the new hint to the list
      setGeminiResponses((prevResponses) => [...prevResponses, newHint]); // Append the new hint
      setHintCount((prevCount) => prevCount + 1); // Increment the hint count
    } catch (err) {
      setError('Failed to fetch hint from Gemini: ' + err);
    }
  };

  const handleSubmitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!language.trim() || !code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Send prompt to Gemini API
      const prompt = `Acting as LeetCode, score the following code answer in ${language}: ${code} from 0 to 100 and only return the numerical value, no words, with 50 and more being a pass`;
      const response = await getGoogleGeminiData(prompt);

      // Validate if the response is a number
      const scoreValue = parseInt(response);
      if (isNaN(scoreValue)) {
        alert("Wrong, please try again!");
        setLoading(false);
        return;
      }

      // Check if the score is passing
      if (scoreValue >= 50) {
        // Send another question to Gemini
        const newPrompt = `Acting as LeetCode, provide a new coding question in ${language} based on the previous question just the question not any other info`;
        const newResponse = await getGoogleGeminiData(newPrompt);

        // Update the state with the new question
        setGeneratedQuestion(newResponse);

        // Clear the answer and Gemini queue
        setCode(""); // Clear the answer input
        setGeminiResponses([]); // Clear the queue
      } else {
        alert("That answer is wrong, please try again!");
      }

      // Update score in the state
      const newScore = score + scoreValue;
      setScore(newScore);

      // Update score in Supabase
      const { data, error } = await supabase
        .from('users') // Replace 'users' with your actual table name
        .update({ score: newScore }) // Replace 'score' with the actual column name
        .eq('user_id', 'your-user-id'); // Replace 'your-user-id' with the current user ID

      if (error) {
        throw error;
      } else {
        console.log("Score updated in Supabase:", data);
      }

      // Add Gemini response to the state for display
      setGeminiResponses((prevResponses) => [
        ...prevResponses,
        { prompt, response, hintNumber: 0 }, // No hint number for code submission
      ]);
    } catch (err) {
      setError('Failed to submit code to Gemini or update score in Supabase: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Game Page</h1>

      <div className="flex flex-col gap-6">
        {!questionSubmitted ? (
          <div className="center-box">
            {/* Username Input */}
            <div className="form-group">
              <label className="form-label">Username:</label>
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
              <label className="form-label">Table Name:</label>
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
              <label className="form-label">Difficulty:</label>
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

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmitQuestion}
              disabled={loading}
              className="btn mt-4"
            >
              {loading ? 'Loading...' : 'Generate Question'}
            </button>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Left Section: Generated Question */}
            <div className="left-section w-full sm:w-1/2">
              <div className="response-box">
                <h2 className="text-lg font-bold"> Question:</h2>
                <p>{generatedQuestion}</p>
              </div>
            </div>

            {/* Right Section: Code Input */}
            <div className="right-section w-full sm:w-1/2">
              <div className="form-group">
                <label htmlFor="language">Programming Language:</label>
                <input
                  type="text"
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                  placeholder="Enter language"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="code">Your Code:</label>
                <textarea
                  id="code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Enter your code"
                  className="textarea"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleHintRequest}
                  disabled={loading}
                  className="hint-btn"
                >
                  {loading ? 'Loading Hint...' : 'Request Hint'}
                </button>

                <button
                  type="submit"
                  onClick={handleSubmitCode}
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Loading...' : 'Submit Code'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hint Responses */}
        {geminiResponses.filter((entry) => entry.isHint).length > 0 && (
          <div className="hint-responses mt-6">
            {geminiResponses
              .filter((entry) => entry.isHint)
              .reverse()
              .map((entry) => (
                <div
                  key={entry.hintNumber}
                  className={`hint-card ${entry.hintNumber === 4 ? 'exceeded' : 'regular'}`}
                >
                  <h5>Hint {entry.hintNumber}:</h5>
                  <p>{entry.response}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;


