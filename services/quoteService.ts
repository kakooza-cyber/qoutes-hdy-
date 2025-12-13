import { Quote, Proverb, User } from '../types';
import { QUOTE_CATEGORIES, PROVERB_THEMES } from '../constants';
import { getCurrentUser } from './authService';
import { generateQuote } from './geminiService';

// Mock Data Store
let mockQuotes: Quote[] = [
  {
    id: 'q1',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    category: 'Motivation',
    imageUrl: 'https://picsum.photos/seed/stevejobs/1600/900',
    likes: 120,
  },
  {
    id: 'q2',
    text: 'Believe you can and you\'re halfway there.',
    author: 'Theodore Roosevelt',
    category: 'Inspiration',
    imageUrl: 'https://picsum.photos/seed/roosevelt/1600/900',
    likes: 90,
  },
  {
    id: 'q3',
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
    category: 'Success',
    imageUrl: 'https://picsum.photos/seed/eleanor/1600/900',
    likes: 150,
  },
  {
    id: 'q4',
    text: 'Love all, trust a few, do wrong to none.',
    author: 'William Shakespeare',
    category: 'Love',
    imageUrl: 'https://picsum.photos/seed/shakespeare/1600/900',
    likes: 80,
  },
  {
    id: 'q5',
    text: 'Strive not to be a success, but rather to be of value.',
    author: 'Albert Einstein',
    category: 'Life',
    imageUrl: 'https://picsum.photos/seed/einstein/1600/900',
    likes: 110,
  },
  {
    id: 'q6',
    text: 'It is during our darkest moments that we must focus to see the light.',
    author: 'Aristotle',
    category: 'Wisdom',
    imageUrl: 'https://picsum.photos/seed/aristotle/1600/900',
    likes: 70,
  },
  {
    id: 'q7',
    text: 'The best way to predict the future is to create it.',
    author: 'Abraham Lincoln',
    category: 'Motivation',
    imageUrl: 'https://picsum.photos/seed/lincoln/1600/900',
    likes: 130,
  },
  {
    id: 'q8',
    text: 'Life is 10% what happens to you and 90% how you react to it.',
    author: 'Charles R. Swindoll',
    category: 'Life',
    imageUrl: 'https://picsum.photos/seed/swindoll/1600/900',
    likes: 95,
  },
  {
    id: 'q9',
    text: 'Be yourself; everyone else is already taken.',
    author: 'Oscar Wilde',
    category: 'Humor',
    imageUrl: 'https://picsum.photos/seed/wilde/1600/900',
    likes: 60,
  },
  {
    id: 'q10',
    text: 'To live is the rarest thing in the world. Most people exist, that is all.',
    author: 'Oscar Wilde',
    category: 'Life',
    imageUrl: 'https://picsum.photos/seed/wilde2/1600/900',
    likes: 85,
  },
];

let mockProverbs: Proverb[] = [
  { id: 'p1', text: 'Actions speak louder than words.', theme: 'Integrity', origin: 'English' },
  { id: 'p2', text: 'When in Rome, do as the Romans do.', theme: 'Patience', origin: 'Latin' },
  { id: 'p3', text: 'A friend in need is a friend indeed.', theme: 'Friendship', origin: 'English' },
  { id: 'p4', text: 'The early bird catches the worm.', theme: 'Hard Work', origin: 'English' },
  { id: 'p5', text: 'Where there\'s a will, there\'s a way.', theme: 'Perseverance', origin: 'English' },
  { id: 'p6', text: 'All that glitters is not gold.', theme: 'Wisdom', origin: 'English' },
  { id: 'p7', text: 'Don\'t count your chickens before they hatch.', theme: 'Wisdom', origin: 'English' },
  { id: 'p8', text: 'Still waters run deep.', theme: 'Wisdom', origin: 'English' },
  { id: 'p9', text: 'Too many cooks spoil the broth.', theme: 'Hard Work', origin: 'English' },
  { id: 'p10', text: 'A journey of a thousand miles begins with a single step.', theme: 'Perseverance', origin: 'Chinese' },
  { id: 'p11', text: 'Better late than never.', theme: 'Patience', origin: 'English' },
  { id: 'p12', text: 'Look before you leap.', theme: 'Wisdom', origin: 'English' },
];

// Helper to get quotes with user-specific liked/favorited status
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

/**
 * Fetches quotes with optional filtering and pagination.
 * @param category Optional category to filter by.
 * @param author Optional author to filter by.
 * @param theme Optional theme to filter by (for quotes).
 * @param page Current page number (for pagination/infinite scroll).
 * @param limit Number of items per page.
 * @returns A promise resolving to an array of quotes.
 */
export const fetchQuotes = async (
  category?: string,
  author?: string,
  theme?: string,
  page: number = 1,
  limit: number = 10
): Promise<Quote[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredQuotes = [...mockQuotes];
      if (category && category !== 'All') {
        filteredQuotes = filteredQuotes.filter(q => q.category === category);
      }
      if (author && author !== 'All') {
        filteredQuotes = filteredQuotes.filter(q => q.author === author);
      }
      if (theme && theme !== 'All') {
        // For quotes, 'theme' might map to 'category' or require more complex tagging
        filteredQuotes = filteredQuotes.filter(q => q.category.toLowerCase().includes(theme.toLowerCase()));
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

      const user = getCurrentUser();
      resolve(enhanceQuotesWithUserStatus(paginatedQuotes, user));
    }, 700);
  });
};

/**
 * Fetches a single quote of the day. Tries to get from mock data first, then Gemini.
 * @returns A promise resolving to a single quote.
 */
export const fetchDailyQuote = async (): Promise<Quote | null> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      // For a real app, this would query a backend for a truly daily quote,
      // perhaps with caching to ensure it's the same for the day.
      // Here, we'll pick a random one from existing, or generate one.

      const currentDay = new Date().toDateString();
      const storedDailyQuote = localStorage.getItem(`dailyQuote-${currentDay}`);

      if (storedDailyQuote) {
        const user = getCurrentUser();
        const quote = JSON.parse(storedDailyQuote) as Quote;
        resolve(enhanceQuotesWithUserStatus([quote], user)[0]);
        return;
      }

      let dailyQuote: Quote | null = null;
      if (mockQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * mockQuotes.length);
        dailyQuote = { ...mockQuotes[randomIndex] };
      }

      // If no mock quote or just want to try Gemini for a fresh one
      if (!dailyQuote) {
        console.log('Falling back to Gemini to generate daily quote...');
        const randomCategory = QUOTE_CATEGORIES[Math.floor(Math.random() * QUOTE_CATEGORIES.length)];
        const generated = await generateQuote(randomCategory);
        if (generated) {
          dailyQuote = generated;
        }
      }

      if (dailyQuote) {
        localStorage.setItem(`dailyQuote-${currentDay}`, JSON.stringify(dailyQuote));
        const user = getCurrentUser();
        resolve(enhanceQuotesWithUserStatus([dailyQuote], user)[0]);
      } else {
        resolve(null);
      }
    }, 1000);
  });
};

/**
 * Fetches proverbs with optional filtering and search.
 * @param theme Optional theme to filter by.
 * @param search Optional search term for proverb text or origin.
 * @returns A promise resolving to an array of proverbs.
 */
export const fetchProverbs = async (theme?: string, search?: string): Promise<Proverb[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredProverbs = [...mockProverbs];

      if (theme && theme !== 'All') {
        filteredProverbs = filteredProverbs.filter(p => p.theme === theme);
      }
      if (search) {
        const searchTermLower = search.toLowerCase();
        filteredProverbs = filteredProverbs.filter(
          p => p.text.toLowerCase().includes(searchTermLower) ||
             p.origin?.toLowerCase().includes(searchTermLower)
        );
      }
      resolve(filteredProverbs);
    }, 700);
  });
};

/**
 * Toggles the like status of a quote.
 * @param quoteId The ID of the quote to like/unlike.
 * @param isCurrentlyLiked The current like status.
 * @returns A promise resolving to the new like count and status.
 */
export const toggleLikeQuote = async (quoteId: string, isCurrentlyLiked: boolean): Promise<{ likes: number; isLiked: boolean } | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (!user) {
        reject('User not authenticated.');
        return;
      }

      const quoteIndex = mockQuotes.findIndex(q => q.id === quoteId);
      if (quoteIndex > -1) {
        const quote = mockQuotes[quoteIndex];
        let newLikes = quote.likes;
        let newIsLiked = !isCurrentlyLiked;

        if (newIsLiked) {
          newLikes++;
          user.likedQuotes.push(quoteId);
        } else {
          newLikes--;
          user.likedQuotes = user.likedQuotes.filter(id => id !== quoteId);
        }
        mockQuotes[quoteIndex] = { ...quote, likes: newLikes };
        console.log(`Quote ${quoteId} likes: ${newLikes}, isLiked: ${newIsLiked}`);
        resolve({ likes: newLikes, isLiked: newIsLiked });
      } else {
        reject('Quote not found.');
      }
    }, 300);
  });
};

/**
 * Toggles the favorite status of a quote.
 * @param quoteId The ID of the quote to favorite/unfavorite.
 * @param isCurrentlyFavorited The current favorite status.
 * @returns A promise resolving to the new favorite status.
 */
export const toggleFavoriteQuote = async (quoteId: string, isCurrentlyFavorited: boolean): Promise<{ isFavorited: boolean } | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (!user) {
        reject('User not authenticated.');
        return;
      }

      const quote = mockQuotes.find(q => q.id === quoteId);
      if (quote) {
        let newIsFavorited = !isCurrentlyFavorited;

        if (newIsFavorited) {
          user.favoritedQuotes.push(quoteId);
        } else {
          user.favoritedQuotes = user.favoritedQuotes.filter(id => id !== quoteId);
        }
        console.log(`Quote ${quoteId} isFavorited: ${newIsFavorited}`);
        resolve({ isFavorited: newIsFavorited });
      } else {
        reject('Quote not found.');
      }
    }, 300);
  });
};

/**
 * Submits a new quote to the collection.
 * @param text The text of the new quote.
 * @param author The author of the new quote.
 * @param category The category of the new quote.
 * @returns A promise resolving to the newly added quote.
 */
export const submitQuote = async (text: string, author: string, category: string): Promise<Quote> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newQuote: Quote = {
        id: `q${mockQuotes.length + 1}`,
        text,
        author,
        category,
        imageUrl: `https://picsum.photos/seed/${category}-${Date.now()}/1600/900`,
        likes: 0,
        isLiked: false,
        isFavorited: false,
      };
      mockQuotes.unshift(newQuote); // Add to the beginning
      resolve(newQuote);
    }, 500);
  });
};

/**
 * Fetches quotes liked by the current user.
 * @returns A promise resolving to an array of liked quotes.
 */
export const fetchLikedQuotes = async (): Promise<Quote[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (!user) {
        reject('User not authenticated.');
        return;
      }
      const liked = mockQuotes.filter(q => user.likedQuotes.includes(q.id));
      resolve(enhanceQuotesWithUserStatus(liked, user));
    }, 500);
  });
};

/**
 * Fetches quotes favorited by the current user.
 * @returns A promise resolving to an array of favorited quotes.
 */
export const fetchFavoritedQuotes = async (): Promise<Quote[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (!user) {
        reject('User not authenticated.');
        return;
      }
      const favorited = mockQuotes.filter(q => user.favoritedQuotes.includes(q.id));
      resolve(enhanceQuotesWithUserStatus(favorited, user));
    }, 500);
  });
};
