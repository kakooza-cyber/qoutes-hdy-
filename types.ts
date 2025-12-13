import { ReactNode } from 'react';

/**
 * Represents a single quote object.
 */
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  imageUrl?: string;
  likes: number;
  isLiked?: boolean;
  isFavorited?: boolean;
}

/**
 * Represents a proverb object.
 */
export interface Proverb {
  id: string;
  text: string;
  origin?: string;
  theme: string;
}

/**
 * Represents a user in the application.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  likedQuotes: string[]; // Array of quote IDs
  favoritedQuotes: string[]; // Array of quote IDs
}

/**
 * Represents the authentication context state and actions.
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

/**
 * Props for children elements.
 */
export interface ChildrenProps {
  children: ReactNode;
}

/**
 * Represents the structure of a function call from the Gemini API.
 */
export interface GeminiFunctionCall {
  args: { [key: string]: string | number };
  name: string;
  id: string;
}

/**
 * Represents a part of the content in a Gemini API response.
 */
export interface GeminiContentPart {
  inlineData?: {
    data: string;
    mimeType: string;
  };
  text?: string;
}

/**
 * Represents a candidate in a Gemini API response.
 */
export interface GeminiCandidate {
  content: {
    parts: GeminiContentPart[];
  };
  groundingMetadata?: {
    groundingChunks: {
      web?: { uri: string; title: string };
      maps?: { uri: string; title: string; placeAnswerSources?: { reviewSnippets: { uri: string }[] } };
    }[];
  };
  // Other properties like finishReason, safetyRatings, etc.
}

/**
 * Represents the full response from a Gemini API `generateContent` call.
 */
export interface GeminiGenerateContentResponse {
  candidates: GeminiCandidate[];
  text: string; // The text getter on the response object
  functionCalls?: GeminiFunctionCall[];
}

/**
 * Enumerates available voice names for text-to-speech.
 */
export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

/**
 * Enumerates modalities for Gemini API responses.
 */
export enum Modality {
  AUDIO = 'AUDIO',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}