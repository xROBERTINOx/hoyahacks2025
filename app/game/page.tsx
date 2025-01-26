'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabase = createClient(
  'https://ezgwrtlffasgcngovzdg.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3dydGxmZmFzZ2NuZ292emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTUzMDksImV4cCI6MjA1MzM5MTMwOX0.xFGHErSi5Ovzr_PGWE9TYqj80eJ57EEAK9Z9UDLGMyw' // Replace with your Supabase Anon Public Key
);

const GamePage = () => {
    const [question, setQuestion] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [language, setLanguage] = useState('');
    interface Question {
      id: number;
      language: string;
      topic: string;
      difficulty: string;
    }

    const [questionData, setQuestionData] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
  
    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
          try {
            const { data, error } = await supabase.from('questions').select('*');
            if (error) {
              alert('Error fetching initial data: ' + error.message);
              return;
            }
            if (data) {
              setQuestionData(data);
              alert('Initial data fetched successfully! Questions: ' + JSON.stringify(data));
            }
          } catch (err) {
            alert('Unexpected error fetching data: ' + (err instanceof Error ? err.message : 'Unknown error'));
          }
        };
      
        fetchData();
      
        // Realtime subscription to listen for new questions
        const channel = supabase
          .channel('realtime:public:questions') // Ensure correct channel name
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'questions' }, // Explicitly target schema and table
            (payload) => {
              alert('Realtime update received!');
              if (payload.new) {
                const newQuestion: Question = {
                  id: payload.new.id,
                  language: payload.new.language,
                  topic: payload.new.topic,
                  difficulty: payload.new.difficulty,
                };
                setQuestionData((prevData) => [...prevData, newQuestion]);
                alert('New question added: ' + JSON.stringify(payload.new));
              } else {
                alert('No "new" data found in the payload.');
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              alert('Successfully subscribed to realtime updates for public.questions.');
            } else {
              alert('Error subscribing to realtime updates: ' + status);
            }
          });
      
        // Cleanup subscription on unmount
        return () => {
          channel.unsubscribe().catch((err) => {
            alert('Error unsubscribing from channel: ' + err.message);
          });
        };
    }, []);
      
      
      
      
  
    // Handle the form submission to add a new question
    const handleSubmitQuestion = async () => {
        setLoading(true);
      
        const { data, error } = await supabase.from('questions').insert([
          {
            language,
            topic: question,
            difficulty,
          },
        ]);
      
        if (error) {
          alert('Error submitting question: ' + error.message);  // Display error message
        } else {
          alert('Question submitted successfully!');
          console.log('Submitted question data:', data);  // Check structure of returned data
      
          // If data is not empty and is an array or object, update state
          if (data) {
            if (Array.isArray(data)) {
              setQuestionData((prevData) => [...prevData, ...data]); // Handle multiple inserted rows
            } else {
              setQuestionData((prevData) => [...prevData, data]); // Handle a single inserted row
            }
          }
        }
      
        setLoading(false);
        setQuestion('');  // Clear question input after submission
      };
      
    
  
    return (
      <div>
        <h1>Game Page</h1>
  
        {/* Teacher inputs for question submission */}
        <div>
          <label>
            Question:
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question"
            />
          </label>
          <label>
            Difficulty:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Language:
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Enter the language"
            />
          </label>
  
          <button onClick={handleSubmitQuestion} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Question'}
          </button>
        </div>
  
        <hr />
  
        <h2>Questions:</h2>
<div>
  {questionData.length > 0 ? (
    questionData.map((item, index) => (
      <div key={index} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
        <p><strong>Language:</strong> {item.language}</p>
        <p><strong>Topic:</strong> {item.topic}</p>
        <p><strong>Difficulty:</strong> {item.difficulty}</p>
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
  