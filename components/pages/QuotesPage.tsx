import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote } from '../../types';
import { fetchQuotes } from '../../services/quoteService';
import QuoteCard from '../QuoteCard';
import LoadingSpinner from '../LoadingSpinner';
import Button from '../Button';
import { QUOTE_CATEGORIES } from '../../constants';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants';

const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [styleVariant, setStyleVariant] = useState<'minimalist' | 'typography' | 'image-based'>('image-based');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastQuoteElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  const loadQuotes = useCallback(async (page: number, append: boolean = false) => {
    if (!append) {
      setLoading(true);
      setQuotes([]);
      setCurrentPage(1); // Reset page when filters change
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const data = await fetchQuotes(
        selectedCategory === 'All' ? undefined : selectedCategory,
        searchTerm ? searchTerm : undefined, // Assuming searchTerm can filter by author or text
        undefined, // Theme filter is less explicit for generic quotes page
        page,
        10 // Limit per page
      );

      if (data.length === 0) {
        setHasMore(false);
      }

      setQuotes(prevQuotes => (append ? [...prevQuotes, ...data] : data));
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
      setError('An error occurred while loading quotes.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    loadQuotes(1); // Load initial quotes or when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    if (currentPage > 1) {
      loadQuotes(currentPage, true); // Load more when page changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleQuoteUpdated = useCallback((updatedQuote: Quote) => {
    setQuotes(prevQuotes =>
      prevQuotes.map(q => (q.id === updatedQuote.id ? updatedQuote : q))
    );
  }, []);

  const MemoizedQuoteCard: React.FC<{ quote: Quote; styleVariant: 'minimalist' | 'typography' | 'image-based'; onQuoteUpdated: (updatedQuote: Quote) => void }> = React.memo(({ quote, styleVariant, onQuoteUpdated }) => (
    <QuoteCard quote={quote} styleVariant={styleVariant} onQuoteUpdated={onQuoteUpdated} />
  ));

  return (
    <div className="py-10">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12 drop-shadow-md">
        Explore Our Quote Collection
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search by author or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
        />
        <div className="relative w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-full shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-purple-500 transition-all duration-300"
          >
            <option value="All">All Categories</option>
            {QUOTE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setStyleVariant('image-based')}
            variant={styleVariant === 'image-based' ? 'primary' : 'secondary'}
            size="sm"
          >
            Image
          </Button>
          <Button
            onClick={() => setStyleVariant('typography')}
            variant={styleVariant === 'typography' ? 'primary' : 'secondary'}
            size="sm"
          >
            Typography
          </Button>
          <Button
            onClick={() => setStyleVariant('minimalist')}
            variant={styleVariant === 'minimalist' ? 'primary' : 'secondary'}
            size="sm"
          >
            Minimal
          </Button>
        </div>
      </div>

      <div className="text-center mb-8">
        <NavLink to={ROUTES.SUBMIT_QUOTE}>
          <Button variant="primary" size="lg" className="shadow-lg">
            <i className="fas fa-plus mr-2"></i> Submit Your Own Quote
          </Button>
        </NavLink>
      </div>


      {loading && !loadingMore && <LoadingSpinner />}
      {error && <p className="text-center text-red-500 text-lg mt-4">{error}</p>}

      {!loading && !error && quotes.length === 0 && (
        <p className="text-center text-gray-600 text-xl mt-8">No quotes found for your selection.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {quotes.map((quote, index) => {
          if (quotes.length === index + 1) {
            return (
              <div ref={lastQuoteElementRef} key={quote.id}>
                <MemoizedQuoteCard quote={quote} styleVariant={styleVariant} onQuoteUpdated={handleQuoteUpdated} />
              </div>
            );
          } else {
            return (
              <MemoizedQuoteCard key={quote.id} quote={quote} styleVariant={styleVariant} onQuoteUpdated={handleQuoteUpdated} />
            );
          }
        })}
      </div>

      {loadingMore && <LoadingSpinner />}
      {!hasMore && quotes.length > 0 && (
        <p className="text-center text-gray-600 text-lg mt-8">You've reached the end of the collection!</p>
      )}
    </div>
  );
};

export default QuotesPage;