import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Quote } from '../types';

/**
 * Initializes the GoogleGenAI client with the API key from environment variables.
 * It's crucial to create a new instance before each API call to ensure the latest API key is used.
 */
const getGeminiClient = () => {
  // Ensure process.env.API_KEY is available in the Netlify Functions environment
  if (!process.env.API_KEY) {
    console.error('Gemini API_KEY is not set. Please ensure it is configured in your environment.');
    // For local development, you might want to provide a fallback or throw an error.
    // In a real Netlify Function, this would typically be handled by Netlify's environment variable injection.
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a quote using the Gemini API.
 * @param category The desired category for the quote.
 * @returns A promise that resolves to a Quote object, or null if generation fails.
 */
export const generateQuote = async (category: string = 'Inspiration'): Promise<Quote | null> => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.error('Gemini client not initialized due to missing API key.');
      return null;
    }

    const modelName = 'gemini-2.5-flash'; // Suitable for basic text tasks

    const prompt = `Generate a ${category.toLowerCase()} quote. Provide the quote text and the author. Format the response as plain text like this:
    "Quote text here." - Author Name`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.9,
        maxOutputTokens: 100,
        systemInstruction: 'You are a poetic assistant specializing in generating concise, meaningful quotes.'
      }
    });

    const rawText = response.text?.trim();

    if (!rawText) {
      console.error('Gemini API returned an empty response for quote generation.');
      return null;
    }

    // Attempt to parse the raw text into a Quote object
    const quoteMatch = rawText.match(/"([^"]+)"\s*-\s*(.+)/);

    if (quoteMatch && quoteMatch[1] && quoteMatch[2]) {
      return {
        id: `gemini-${Date.now()}`, // Unique ID for generated quote
        text: quoteMatch[1].trim(),
        author: quoteMatch[2].trim(),
        category: category,
        imageUrl: `https://picsum.photos/seed/${category}/1600/900`, // Dynamic image based on category
        likes: 0, // Generated quotes start with 0 likes
      };
    } else {
      console.error('Failed to parse Gemini quote response:', rawText);
      // Fallback for parsing issues: return the raw text as quote
      return {
        id: `gemini-${Date.now()}`,
        text: rawText,
        author: 'Gemini AI',
        category: category,
        imageUrl: `https://picsum.photos/seed/${category}/1600/900`,
        likes: 0,
      };
    }
  } catch (error) {
    console.error('Error generating quote with Gemini API:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      // Specific error handling for API key issues or model not found
      console.error("Gemini API Key might be invalid or not selected. Please check window.aistudio.openSelectKey() if applicable.");
      // This is where you might prompt the user to select an API key in a full client-side app
      // if (window.aistudio && window.aistudio.openSelectKey) {
      //   await window.aistudio.openSelectKey();
      // }
    }
    return null;
  }
};

/**
 * Utility to decode base64 string to Uint8Array (for audio/image data).
 * @param base64 The base64 encoded string.
 * @returns Uint8Array representation.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Utility to encode Uint8Array to base64 string.
 * @param bytes The Uint8Array to encode.
 * @returns Base64 encoded string.
 */
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
