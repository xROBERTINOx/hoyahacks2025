'use client';

import { useState, useEffect } from 'react';
import { getGoogleGeminiData } from '../../src/lib/gemeniApi';

const Page = () => {
  const [difficulty, setDifficulty] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [geminiResponses, setGeminiResponses] = useState<
    { prompt: string; response: string; isHint?: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [hintCount, setHintCount] = useState<number>(0);
  const [score, setScore] = useState<number>(100);

  const [userWantsHint, setUserWantsHint] = useState(false);
  const [hint, setHint] = useState('');

  // Initialize score from localStorage or set to 100
  useEffect(() => {
    const storedScore = localStorage.getItem('score');
    if (storedScore) {
      setScore(Number(storedScore));
    } else {
      localStorage.setItem('score', '100');
    }
  }, []);

  const handleDifficultySelect = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);
  };

  const handleTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(event.target.value);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value);
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  // Request Hint and adjust score based on hint count
  const handleHintRequest = async () => {
    try {
      if (hintCount >= 3) {
        setScore((prevScore) => prevScore - 10); // Deduct points after 3 hints
        localStorage.setItem('score', String(score - 10));
      }
  
      const prompt = `Don't include any asterisks or marks. Imagine 4 levels of hints, where 4 nearly gives away the answer and 1 is quite vague. Give a level ${
        hintCount + 1
      } LeetCode-like hint for the coding question you provided.`;
  
      const response = await getGoogleGeminiData(prompt);
  
      // Append only hint responses to a separate "hints" state
      setGeminiResponses((prevResponses) => [
        ...prevResponses,
        { prompt: 'Hint', response, isHint: true }, // Mark as hint explicitly
      ]);
  
      setHintCount((prevCount) => prevCount + 1); // Increment hint count
      setUserWantsHint(true);
    } catch (err) {
      setError('Failed to fetch hint from Gemini');
    }
  };
  
  
  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!difficulty || !topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const prompt = `don't include any asterisks or any marks, I only want the text keep all the examples and such like a leetcode problem. make a ${difficulty} leetcode question on ${topic}`;
      const previousResponses = geminiResponses.map(entry => entry.response);

      const response = await getGoogleGeminiData(prompt, previousResponses);

      setGeminiResponses((prevResponses) => [
        ...prevResponses,
        { prompt, response },
      ]);

      setQuestionSubmitted(true);
    } catch (err) {
      setError('Failed to fetch data from Gemini');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!language.trim() || !code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const prompt = `acting as leetcode, score the following coding answer to the previous leetcode coding problem, only send me back a number no text, using the language: ${language}, and the following code: ${code}`;
      const previousResponses = geminiResponses.map(entry => entry.response);
    
      const response = await getGoogleGeminiData(prompt, previousResponses);
    
      setGeminiResponses((prevResponses) => [
        { prompt, response }, // Add the new response at the beginning
        ...prevResponses,    // Include the existing responses after it
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
            <div>
              <h2>Question:</h2>
              <p>{geminiResponses[0]?.prompt}</p> 
              <h3>Response:</h3>
              <pre>{geminiResponses[0]?.response}</pre> 
            </div>


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
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'monospace',
                  width: '100%',
                  height: '200px',
                  padding: '10px',
                  border: '1px solid #3c3c3c',
                  borderRadius: '4px',
                  resize: 'none',
                }}
              />
            </div>

            <button type="submit" onClick={handleSubmitCode} disabled={loading}>
              {loading ? 'Loading...' : 'Submit Code'}
            </button>
          </>
        )}
      </form>


      {questionSubmitted && (
        <button
          type="button"
          onClick={handleHintRequest}
          disabled={loading}
          style={{
            backgroundColor: loading ? 'darkgrey' : 'lightgrey', // Dark grey when loading, light grey otherwise
            color: 'black',
            borderRadius: '0',
            padding: '10px 20px',
            margin: '5px',
            cursor: loading ? 'not-allowed' : 'pointer', // Pointer changes to not-allowed when disabled
            opacity: loading ? 0.7 : 1, // Slightly faded appearance when loading
          }}
        >
          {loading ? 'Loading Hint...' : 'Request Hint'}
        </button>
      )}


{/* Display hint count and points deduction message */}
{hintCount > 0 && (
  <div>
    {hintCount == 3 && (
      <p>
        If you use another hint, you will be docked points!
      </p>
    )}
    {hintCount > 3 && (
      <p style={{ color: 'red', fontWeight: 'bold' }}>
        You have requested more than 3 hints. 10 points have been deducted from your score.
      </p>
    )}
  </div>
)}


{/* Display only hint-related responses */}
{geminiResponses.filter((entry) => entry.isHint).length > 0 && (
  <div style={{ marginTop: '10px' }}>
    {geminiResponses
      .filter((entry) => entry.isHint) // Ensure only hints are displayed
      .map((entry, index) => (
        <div
          key={index}
          style={{
            backgroundColor: index >= 3 ? 'red' : 'yellow', // Hints after 3rd are red
            color: index >= 3 ? 'white' : 'black', // White text for red background
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid black',
          }}
        >
          <h5>Hint {index + 1}:</h5>
          <p>{entry.response}</p>
        </div>
      ))}
  </div>
)}


      <div>
        <h4>Current Score: {score}</h4>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default Page;
