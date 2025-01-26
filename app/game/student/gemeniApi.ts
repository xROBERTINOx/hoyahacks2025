import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();


// Use the environment variable for the API key
const NEXT_PUBLIC_GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!NEXT_PUBLIC_GOOGLE_API_KEY) {
  throw new Error('NEXT_PUBLIC_GOOGLE_API_KEY is not defined in your environment variables');
}

// Function to interact with Google Gemini AI and accept a prompt and previous responses
export const getGoogleGeminiData = async (prompt: string, previousResponses: string[] = []) => {
  try {
    alert("hi");
    // Initialize the Google Generative AI SDK with the API key
    const genAI = new GoogleGenerativeAI(NEXT_PUBLIC_GOOGLE_API_KEY);

    // Set the model to use for generating content (you can change this to a different model)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Combine previous responses with the new prompt to form the conversation context
    const conversationContext = [...previousResponses, prompt].join('\n');

    // Request the content from Gemini with the provided conversation context
    const result = await model.generateContent(conversationContext);

    // Return the text response from the AI model
    return result.response.text();
  } catch (error) {
    console.error('Error with Gemini AI:', error);
    throw new Error('Failed to fetch data from Gemini');
  }
};
