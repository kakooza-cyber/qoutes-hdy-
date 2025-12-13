import React, { useState, useEffect, useCallback } from 'react';
import { Quote } from '../../types';
import { fetchDailyQuote } from '../../services/quoteService';
import QuoteCard from '../QuoteCard';
import LoadingSpinner from '../LoadingSpinner';
import Button from '../Button';
import { MOCK_DAILY_QUOTE_IMAGE } from '../../constants';

const QuotesOfTheDayPage: React.FC = () => {
  const [quoteOfTheDay, setQuoteOfTheDay] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuoteOfTheDay = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const quote = await fetchDailyQuote();
      if (quote) {
        setQuoteOfTheDay(quote);
      } else {
        setError('Could not fetch the Quote of the Day. Please try again later.');
      }
    } catch (err) {
      console.error('Failed to fetch daily quote:', err);
      setError('An error occurred while loading the Quote of the Day.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuoteOfTheDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleQuoteUpdated = useCallback((updatedQuote: Quote) => {
    setQuoteOfTheDay(updatedQuote);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-600">Loading your daily dose of inspiration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={loadQuoteOfTheDay} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  if (!quoteOfTheDay) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">No Quote Found Today</h2>
        <p className="text-gray-700 mb-6">It seems we couldn't find a special quote for you right now.</p>
        <Button onClick={loadQuoteOfTheDay} variant="primary">
          Generate New Quote
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12 px-4 bg-cover bg-center rounded-xl shadow-2xl overflow-hidden"
      style={{ backgroundImage: `url(${quoteOfTheDay.imageUrl || MOCK_DAILY_QUOTE_IMAGE})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div> {/* Dark overlay */}
      <h1 className="relative z-10 text-5xl font-extrabold text-white mb-8 drop-shadow-lg text-center leading-tight">
        Quote of the Day
      </h1>
      <div className="relative z-10 w-full max-w-3xl">
        <QuoteCard quote={quoteOfTheDay} styleVariant="image-based" onQuoteUpdated={handleQuoteUpdated} />
      </div>
    </div>
  );
};

export default QuotesOfTheDayPage;