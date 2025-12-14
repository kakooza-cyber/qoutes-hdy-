import { Quote, Proverb, User } from '../types';
import { getCurrentUser } from './authService';
import { generateQuote } from './geminiService';

const API_URL = 'http://localhost:5000/api/quotes';

// Helper for authorized requests
const authRequest = async (url: string, method: string = 'GET', body?: any) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
  return response.json();
};

const enhanceQuotesWithUserStatus = (quotes: Quote[], user: User | null): Quote[] => {
  if (!user) {
    return quotes.map(q => ({ ...q, isLiked: false, isFavorited: false }));
  }
  return quotes.map(q => ({
    ...q,
    isLiked: user.likedQuotes.includes(q.id),
    isFavorited: user.favoritedQuotes.includes(q.id),
  }));
};

export const fetchQuotes = async (
  category?: string,
  author?: string,
  theme?: string,
  page: number = 1,
  limit: number = 10
): Promise<Quote[]> => {
  try {
    // Seed DB if necessary (First run utility)
    try { await fetch(`${API_URL}/seed`, { method: 'POST' }); } catch (e) {}

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category && category !== 'All') queryParams.append('category', category);
    if (author && author !== 'All') queryParams.append('author', author);
    if (theme && theme !== 'All') queryParams.append('search', theme); // Mapping theme to search for now

    const data = await authRequest(`${API_URL}?${queryParams.toString()}`);
    const user = getCurrentUser();
    return enhanceQuotesWithUserStatus(data, user);
  } catch (error) {
    console.error("Fetch quotes error", error);
    return [];
  }
};

export const fetchDailyQuote = async (): Promise<Quote | null> => {
  try {
    const user = getCurrentUser();
    
    // Attempt to get from backend
    try {
      const data = await authRequest(`${API_URL}/daily`);
      if (data) return enhanceQuotesWithUserStatus([data], user)[0];
    } catch (e) {
       console.log("Backend daily quote failed, falling back to Gemini");
    }

    // Fallback to Gemini if backend is empty or fails
    const generated = await generateQuote('Inspiration');
    return generated ? enhanceQuotesWithUserStatus([generated], user)[0] : null;

  } catch (error) {
    console.error("Error fetching daily quote", error);
    return null;
  }
};

// Proverbs are currently mock-only in backend, so we'll keep the mock implementation here 
// or simpler: just reuse the quote structure but filter by 'Proverb' category if we had one.
// For now, retaining client-side mock for proverbs to save backend complexity, 
// as the user asked for "Quotes" backend mainly.
let mockProverbs: Proverb[] = [
  { id: 'p1', text: 'Actions speak louder than words.', theme: 'Integrity', origin: 'English' },
  { id: 'p2', text: 'When in Rome, do as the Romans do.', theme: 'Patience', origin: 'Latin' },
  { id: 'p3', text: 'A friend in need is a friend indeed.', theme: 'Friendship', origin: 'English' },
];

export const fetchProverbs = async (theme?: string, search?: string): Promise<Proverb[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockProverbs];
      if (theme && theme !== 'All') filtered = filtered.filter(p => p.theme === theme);
      if (search) filtered = filtered.filter(p => p.text.toLowerCase().includes(search.toLowerCase()));
      resolve(filtered);
    }, 500);
  });
};

export const toggleLikeQuote = async (quoteId: string, isCurrentlyLiked: boolean): Promise<{ likes: number; isLiked: boolean } | null> => {
  try {
    return await authRequest(`${API_URL}/${quoteId}/like`, 'POST');
  } catch (error) {
    console.error("Toggle like error", error);
    return null;
  }
};

export const toggleFavoriteQuote = async (quoteId: string, isCurrentlyFavorited: boolean): Promise<{ isFavorited: boolean } | null> => {
  try {
    return await authRequest(`${API_URL}/${quoteId}/favorite`, 'POST');
  } catch (error) {
    console.error("Toggle favorite error", error);
    return null;
  }
};

export const submitQuote = async (text: string, author: string, category: string): Promise<Quote> => {
  try {
    return await authRequest(`${API_URL}`, 'POST', { text, author, category });
  } catch (error) {
    console.error("Submit quote error", error);
    throw error;
  }
};

export const fetchLikedQuotes = async (): Promise<Quote[]> => {
  // Since the backend 'fetchQuotes' already enhances data with 'isLiked', 
  // we can just filter locally or add a backend endpoint. 
  // For efficiency, we'll fetch all and filter in this demo context, 
  // or relying on a dedicated endpoint is better.
  // Re-implementing using fetchQuotes for simplicity in this demo environment.
  const allQuotes = await fetchQuotes();
  return allQuotes.filter(q => q.isLiked);
};

export const fetchFavoritedQuotes = async (): Promise<Quote[]> => {
  const allQuotes = await fetchQuotes();
  return allQuotes.filter(q => q.isFavorited);
};