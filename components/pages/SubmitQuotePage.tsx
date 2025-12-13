import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { ROUTES, QUOTE_CATEGORIES } from '../../constants';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import { submitQuote } from '../../services/quoteService';

const SubmitQuotePage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteCategory, setQuoteCategory] = useState(QUOTE_CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN); // Redirect if not authenticated after auth check
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!quoteText.trim() || !quoteAuthor.trim()) {
      setError('Quote text and author cannot be empty.');
      setSubmitting(false);
      return;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to submit a quote.');
      setSubmitting(false);
      return;
    }

    try {
      const newQuote = await submitQuote(quoteText, quoteAuthor, quoteCategory);
      setSuccess(`Quote "${newQuote.text.substring(0, 50)}..." by ${newQuote.author} submitted successfully!`);
      setQuoteText('');
      setQuoteAuthor('');
      setQuoteCategory(QUOTE_CATEGORIES[0]);
    } catch (err) {
      console.error('Error submitting quote:', err);
      setError('Failed to submit quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12 drop-shadow-md">
        Submit Your Own Quote
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-2xl mb-10 border border-purple-100 max-w-2xl mx-auto">
        <p className="text-lg text-gray-700 mb-6 text-center">
          Share your favorite quotes or original thoughts with the Quotely community!
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="quoteText" className="block text-sm font-medium text-gray-700">
              Quote Text <span className="text-red-500">*</span>
            </label>
            <textarea
              id="quoteText"
              name="quoteText"
              rows={5}
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter the quote here..."
            ></textarea>
          </div>

          <div>
            <label htmlFor="quoteAuthor" className="block text-sm font-medium text-gray-700">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="quoteAuthor"
              name="quoteAuthor"
              value={quoteAuthor}
              onChange={(e) => setQuoteAuthor(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="e.g., Albert Einstein, Anonymous, Your Name"
            />
          </div>

          <div>
            <label htmlFor="quoteCategory" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="quoteCategory"
              name="quoteCategory"
              value={quoteCategory}
              onChange={(e) => setQuoteCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              {QUOTE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.QUOTES)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i> Submit Quote
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuotePage;