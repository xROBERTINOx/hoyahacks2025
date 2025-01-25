'use client';

import { useState } from 'react';
import { getGoogleGeminiData } from '../../src/lib/gemeniApi';

const Page = () => {
 
  const [difficulty, setDifficulty] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [geminiResponses, setGeminiResponses] = useState<
    { prompt: string; response: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  // Handle difficulty selection
  const handleDifficultySelect = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);
  };

  // Handle topic input change
  const handleTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(event.target.value);
  };

  // Handle language input change
  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value);
  };

  // Handle code input change
  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  // Handle form submission for the question
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();  // Prevent page reload
    if (!difficulty || !topic.trim()) return;  // Ignore empty input or missing difficulty/topic

    setLoading(true);
    setError(null);  // Reset previous error

    try {
      // Format the input prompt for Gemini
      const prompt = `don't include any asterisks or any marks, I only want the text keep all the examples and such like a leetcode problem. make a ${difficulty} leetcode question on ${topic}`;

      // Send the previous responses along with the new prompt to Gemini
      const previousResponses = geminiResponses.map(entry => entry.response);  // Get all previous responses

      // Get the response from Gemini, including conversation history
      const response = await getGoogleGeminiData(prompt, previousResponses);

      // Store the new prompt and its corresponding response
      setGeminiResponses((prevResponses) => [
        ...prevResponses,
        { prompt, response },  // Append new prompt and response
      ]);

      // Mark the question as submitted to show language and code inputs
      setQuestionSubmitted(true);
    } catch (err) {
      setError('Failed to fetch data from Gemini');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for the code
  const handleSubmitCode = async (event: React.FormEvent) => {
    event.preventDefault();  // Prevent page reload
    if (!language.trim() || !code.trim()) return;  // Ignore empty language or code

    setLoading(true);
    setError(null);  // Reset previous error

    try {
      // Format the prompt for Gemini with code and language
      const prompt = `acting as leetcode, score the follwoing coding answer to the previous leetcode coding problem, only send me back a number no text, using the language: ${language}, and the following code: ${code}`;

      // Send the previous responses along with the new code prompt to Gemini
      const previousResponses = geminiResponses.map(entry => entry.response);  // Get all previous responses

      // Get the response from Gemini, including conversation history
      const response = await getGoogleGeminiData(prompt, previousResponses);

      // Store the new prompt and its corresponding response
      setGeminiResponses((prevResponses) => [
        ...prevResponses,
        { prompt, response },  // Append new prompt and response
      ]);
    } catch (err) {
      setError('Failed to fetch data from Gemini');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Ask Google Gemini AI</h1>

      <form onSubmit={handleSubmit}>
        {/* Show difficulty and topic inputs before submission */}
        {!questionSubmitted ? (
          <>
            <div>
              <label>Select difficulty:</label>
              <div>
                <button
                  type="button"
                  onClick={() => handleDifficultySelect('easy')}
                  style={{
                    backgroundColor: difficulty === 'easy' ? 'darkgrey' : 'lightgrey',
                    color: 'black',
                    borderRadius: '0',
                    padding: '10px 20px',
                    margin: '5px',
                  }}
                >
                  Easy
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultySelect('medium')}
                  style={{
                    backgroundColor: difficulty === 'medium' ? 'darkgrey' : 'lightgrey',
                    color: 'black',
                    borderRadius: '0',
                    padding: '10px 20px',
                    margin: '5px',
                  }}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultySelect('hard')}
                  style={{
                    backgroundColor: difficulty === 'hard' ? 'darkgrey' : 'lightgrey',
                    color: 'black',
                    borderRadius: '0',
                    padding: '10px 20px',
                    margin: '5px',
                  }}
                >
                  Hard
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="topic">Enter topic:</label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={handleTopicChange}
                placeholder="Enter topic"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </button>
          </>
        ) : (
          <>
            {/* Display the previous question and response */}
            <div>
              <h2>Question:</h2>
              <p>{geminiResponses[geminiResponses.length - 1].prompt}</p>
              <h3>Response:</h3>
              <pre>{geminiResponses[geminiResponses.length - 1].response}</pre>
            </div>

            {/* Display the language and code inputs after submission */}
            <div>
              <label htmlFor="language">Enter programming language:</label>
              <input
                type="text"
                id="language"
                value={language}
                onChange={handleLanguageChange}
                placeholder="Enter language"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            <div>
              <label htmlFor="code">Enter your code:</label>
              <textarea
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter your code"
              style={{
                backgroundColor: '#1e1e1e', // Dark background
                color: '#d4d4d4', // Light text color
                fontFamily: 'monospace', // Monospace font
                width: '100%',
                height: '200px',
                padding: '10px',
                border: '1px solid #3c3c3c', // Border color
                borderRadius: '4px',
                resize: 'none', // Disable resizing
              }}
              />
            </div>

            <button type="submit" onClick={handleSubmitCode} disabled={loading}>
              {loading ? 'Loading...' : 'Submit Code'}
            </button>
          </>
        )}
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default Page;
