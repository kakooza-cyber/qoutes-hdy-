import { Quote, Proverb, User } from '../types';
import { getCurrentUser, _internalUpdateUser } from './authService';
import { generateQuote } from './geminiService';

const QUOTES_STORAGE_KEY = 'quotely_quotes';

// Initial Seed Data
const MOCK_QUOTES: Quote[] = [
  { id: '1', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'Motivation', imageUrl: 'https://picsum.photos/seed/stevejobs/1600/900', likes: 120 },
  { id: '2', text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'Inspiration', imageUrl: 'https://picsum.photos/seed/roosevelt/1600/900', likes: 90 },
  { id: '3', text: 'Life is 10% what happens to you and 90% how you react to it.', author: 'Charles R. Swindoll', category: 'Life', imageUrl: 'https://picsum.photos/seed/swindoll/1600/900', likes: 95 },
  { id: '4', text: 'Success is not final, failure is not fatal: It is the courage to continue that counts.', author: 'Winston Churchill', category: 'Success', imageUrl: 'https://picsum.photos/seed/churchill/1600/900', likes: 150 },
  { id: '5', text: 'Happiness depends upon ourselves.', author: 'Aristotle', category: 'Happiness', imageUrl: 'https://picsum.photos/seed/aristotle/1600/900', likes: 85 },
];

const getStoredQuotes = (): Quote[] => {
  const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  
  // Seed if empty
  localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(MOCK_QUOTES));
  return MOCK_QUOTES;
};

const saveQuotes = (quotes: Quote[]) => {
  localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<Quote[]> => {
  await delay(600);
  let quotes = getStoredQuotes();

  if (category && category !== 'All') {
    quotes = quotes.filter(q => q.category === category);
  }
  
  if (author && author !== 'All') {
    quotes = quotes.filter(q => q.author === author);
  }

  if (search) {
    const lowerSearch = search.toLowerCase();
    quotes = quotes.filter(q => 
      q.text.toLowerCase().includes(lowerSearch) || 
      q.author.toLowerCase().includes(lowerSearch)
    );
  }

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const paginatedQuotes = quotes.slice(startIndex, startIndex + limit);

  return enhanceQuotesWithUserStatus(paginatedQuotes, getCurrentUser());
};

export const fetchDailyQuote = async (): Promise<Quote | null> => {
  await delay(500);
  const quotes = getStoredQuotes();
  
  // Use the day of the year to select a consistent quote for the day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % quotes.length;
  const quote = quotes[index] || quotes[0];

  if (!quote) {
    // Fallback to Gemini if for some reason local is empty
    const generated = await generateQuote('Inspiration');
    if (generated) {
      saveQuotes([...quotes, generated]); // Save generated quote
      return enhanceQuotesWithUserStatus([generated], getCurrentUser())[0];
    }
    return null;
  }

  return enhanceQuotesWithUserStatus([quote], getCurrentUser())[0];
};

const mockProverbs: Proverb[] = [
  { id: 'p1', text: 'Actions speak louder than words.', theme: 'Integrity', origin: 'English' },
  { id: 'p2', text: 'When in Rome, do as the Romans do.', theme: 'Patience', origin: 'Latin' },
  { id: 'p3', text: 'A friend in need is a friend indeed.', theme: 'Friendship', origin: 'English' },
  { id: 'p4', text: 'Fall seven times, stand up eight.', theme: 'Perseverance', origin: 'Japanese' },
  { id: 'p5', text: 'Knowledge is power.', theme: 'Wisdom', origin: 'English' },
];

export const fetchProverbs = async (theme?: string, search?: string): Promise<Proverb[]> => {
  await delay(500);
  let filtered = [...mockProverbs];
  
  if (theme && theme !== 'All') {
    filtered = filtered.filter(p => p.theme === theme);
  }
  
  if (search) {
    filtered = filtered.filter(p => p.text.toLowerCase().includes(search.toLowerCase()));
  }
  
  return filtered;
};

export const toggleLikeQuote = async (quoteId: string, isCurrentlyLiked: boolean): Promise<{ likes: number; isLiked: boolean } | null> => {
  await delay(300);
  const user = getCurrentUser();
  if (!user) return null;

  const quotes = getStoredQuotes();
  const quoteIndex = quotes.findIndex(q => q.id === quoteId);
  
  if (quoteIndex === -1) return null;

  const quote = quotes[quoteIndex];
  
  // Update User
  let newLikedQuotes = [...user.likedQuotes];
  if (isCurrentlyLiked) {
    newLikedQuotes = newLikedQuotes.filter(id => id !== quoteId);
    quote.likes = Math.max(0, quote.likes - 1);
  } else {
    newLikedQuotes.push(quoteId);
    quote.likes += 1;
  }
  
  // Update user in auth service
  _internalUpdateUser({ ...user, likedQuotes: newLikedQuotes });
  
  // Update quote in storage
  quotes[quoteIndex] = quote;
  saveQuotes(quotes);

  return { likes: quote.likes, isLiked: !isCurrentlyLiked };
};

export const toggleFavoriteQuote = async (quoteId: string, isCurrentlyFavorited: boolean): Promise<{ isFavorited: boolean } | null> => {
  await delay(300);
  const user = getCurrentUser();
  if (!user) return null;

  // Update User
  let newFavoritedQuotes = [...user.favoritedQuotes];
  if (isCurrentlyFavorited) {
    newFavoritedQuotes = newFavoritedQuotes.filter(id => id !== quoteId);
  } else {
    newFavoritedQuotes.push(quoteId);
  }

  // Update user in auth service
  _internalUpdateUser({ ...user, favoritedQuotes: newFavoritedQuotes });

  return { isFavorited: !isCurrentlyFavorited };
};

export const submitQuote = async (text: string, author: string, category: string): Promise<Quote> => {
  await delay(800);
  const quotes = getStoredQuotes();
  const user = getCurrentUser();

  const newQuote: Quote = {
    id: `custom-${Date.now()}`,
    text,
    author,
    category,
    imageUrl: `https://picsum.photos/seed/${category}-${Date.now()}/1600/900`,
    likes: 0,
  };

  quotes.unshift(newQuote); // Add to beginning
  saveQuotes(quotes);

  return enhanceQuotesWithUserStatus([newQuote], user)[0];
};

export const fetchLikedQuotes = async (): Promise<Quote[]> => {
  const user = getCurrentUser();
  if (!user) return [];
  const allQuotes = await fetchQuotes('All', 'All', '', 1, 1000); // Fetch all to filter
  return allQuotes.filter(q => user.likedQuotes.includes(q.id));
};

export const fetchFavoritedQuotes = async (): Promise<Quote[]> => {
  const user = getCurrentUser();
  if (!user) return [];
  const allQuotes = await fetchQuotes('All', 'All', '', 1, 1000);
  return allQuotes.filter(q => user.favoritedQuotes.includes(q.id));
};