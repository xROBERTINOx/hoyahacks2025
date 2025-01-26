'use client';

import { useState, useEffect } from 'react';
import { getGoogleGeminiData } from '../../src/lib/gemeniApi';

const Page = () => {
  const [difficulty, setDifficulty] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [geminiResponses, setGeminiResponses] = useState<
    { prompt: string; response: string; isHint?: boolean; hintNumber: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [hintCount, setHintCount] = useState<number>(0);
  const [score, setScore] = useState<number>(100);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!difficulty || !topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const prompt = `Generate a ${difficulty} level LeetCode question on ${topic}, without any asterisks or marks.`;
      const previousResponses = geminiResponses
        .filter(entry => !entry.isHint) // Only previous questions (not hints)
        .map(entry => entry.response);

      const response = await getGoogleGeminiData(prompt, previousResponses);

      setGeminiResponses((prevResponses) => [
        ...prevResponses,
        { prompt, response, hintNumber: 0 }, // No hint number for question generation
      ]);

      setQuestionSubmitted(true);
    } catch (err) {
      setError('Failed to fetch data from Gemini: ' + err);
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
      const prompt = `Acting as LeetCode, score the following code answer in ${language}: ${code}`;
      const response = await getGoogleGeminiData(prompt);

      setGeminiResponses((prevResponses) => [
        ...prevResponses,
        { prompt, response, hintNumber: 0 }, // No hint number for code submission
      ]);
    } catch (err) {
      setError('Failed to submit code to Gemini: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        {!questionSubmitted ? (
          <div className="center-box">
            <div className="form-group">
              <label>Select Difficulty:</label>
              <div className="difficulty-container">
                <button
                  type="button"
                  className={`difficulty-btn ${difficulty === 'easy' ? 'selected' : ''}`}
                  onClick={() => handleDifficultySelect('easy')}
                >
                  Easy
                </button>
                <button
                  type="button"
                  className={`difficulty-btn ${difficulty === 'medium' ? 'selected' : ''}`}
                  onClick={() => handleDifficultySelect('medium')}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`difficulty-btn ${difficulty === 'hard' ? 'selected' : ''}`}
                  onClick={() => handleDifficultySelect('hard')}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="topic">Enter Topic:</label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={handleTopicChange}
                placeholder="Enter topic"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Loading...' : 'Generate Question'}
            </button>
          </div>
        ) : (
          <>
            <div className="left-section">
              <div className="response-box">
                <pre>{geminiResponses.filter(entry => !entry.isHint)[0]?.response}</pre>
              </div>
            </div>

            <div className="right-section">
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
            </div>
          </>
        )}
      </form>

      {questionSubmitted && (
        <>
          <div className="hint-container">
            <button
              type="button"
              onClick={handleHintRequest}
              disabled={loading}
              className="hint-btn"
            >
              {loading ? 'Loading Hint...' : 'Request Hint'}
            </button>
          </div>

          <div className="score-container">
            <h4>Current Score: {score}</h4>
          </div>

          <div className="submit-container">
            <button
              type="submit"
              onClick={handleSubmitCode}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Loading...' : 'Submit Code'}
            </button>
          </div>
        </>
      )}

      {geminiResponses.filter(entry => entry.isHint).length > 0 && (
        <div className="hint-responses">
          {/* Reverse the order of hints when displaying */}
          
          {geminiResponses
            .filter(entry => entry.isHint) // Get only hint responses
            .reverse() // Reverse the hints here to show Hint 3 first
            .map((entry) => (
              <div
                key={entry.hintNumber} // Key is now the hintNumber
                className={`hint-card ${entry.hintNumber === 4 ? 'exceeded' : 'regular'}`} // Apply 'exceeded' class if it's Hint 4
              >
                <h5>Hint {entry.hintNumber}:</h5>
                <p>{entry.response}</p>
              </div>
            ))}
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Page;
