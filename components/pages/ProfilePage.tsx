import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from '../../App';
import { Quote } from '../../types';
import { fetchLikedQuotes, fetchFavoritedQuotes } from '../../services/quoteService';
import LoadingSpinner from '../LoadingSpinner';
import QuoteCard from '../QuoteCard';
import Button from '../Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading, updateUserProfile } = useContext(AuthContext);
  const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
  const [favoritedQuotes, setFavoritedQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'liked' | 'favorited'>('liked');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadQuotes = useCallback(async () => {
    if (!isAuthenticated || !user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    setQuotesLoading(true);
    setError(null);
    try {
      const liked = await fetchLikedQuotes();
      setLikedQuotes(liked);

      const favorited = await fetchFavoritedQuotes();
      setFavoritedQuotes(favorited);
    } catch (err) {
      console.error('Failed to fetch user quotes:', err);
      setError('An error occurred while loading your quotes.');
    } finally {
      setQuotesLoading(false);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN); // Redirect if not authenticated after auth check
    } else if (!authLoading && isAuthenticated && user) {
      loadQuotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user]);

  const handleQuoteUpdated = useCallback((updatedQuote: Quote) => {
    setLikedQuotes(prev => prev.map(q => (q.id === updatedQuote.id ? updatedQuote : q)));
    setFavoritedQuotes(prev => prev.map(q => (q.id === updatedQuote.id ? updatedQuote : q)));
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert("File size too large. Please upload an image smaller than 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateUserProfile({ avatarUrl: base64String });
      } catch (e) {
        console.error("Failed to update profile picture", e);
        alert("Failed to upload image.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (authLoading || quotesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={loadQuotes} variant="primary">
          Reload Profile
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">User Not Found</h2>
        <p className="text-gray-700 mb-6">Please login to view your profile.</p>
        <Button onClick={() => navigate(ROUTES.LOGIN)} variant="primary">
          Go to Login
        </Button>
      </div>
    );
  }

  const quotesToDisplay = activeTab === 'liked' ? likedQuotes : favoritedQuotes;

  return (
    <div className="py-10">
      <div className="bg-white p-8 rounded-xl shadow-2xl mb-10 border border-purple-100 max-w-2xl mx-auto text-center relative">
        <div className="relative inline-block mx-auto mb-6">
          <img
            src={user.avatarUrl || 'https://picsum.photos/seed/useravatar/150/150'}
            alt="User Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-300 shadow-md"
          />
          <button 
            onClick={triggerFileInput}
            className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 shadow-lg hover:bg-purple-700 transition duration-300"
            title="Change Profile Picture"
            disabled={isUploading}
          >
            {isUploading ? (
              <i className="fas fa-spinner fa-spin text-sm"></i>
            ) : (
              <i className="fas fa-camera text-sm"></i>
            )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{user.username}</h1>
        <p className="text-lg text-gray-600">{user.email}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('liked')}
            className={`py-3 px-6 text-lg font-medium ${activeTab === 'liked' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-gray-500 hover:text-gray-700'} focus:outline-none transition duration-300`}
          >
            Liked Quotes ({likedQuotes.length})
          </button>
          <button
            onClick={() => setActiveTab('favorited')}
            className={`py-3 px-6 text-lg font-medium ${activeTab === 'favorited' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-gray-500 hover:text-gray-700'} focus:outline-none transition duration-300`}
          >
            Favorited Quotes ({favoritedQuotes.length})
          </button>
        </div>

        {quotesToDisplay.length === 0 ? (
          <p className="text-center text-gray-600 text-xl mt-12">
            You haven't {activeTab === 'liked' ? 'liked' : 'favorited'} any quotes yet.
            <br />
            Explore the <Button variant="ghost" className="inline-block text-purple-600 text-xl px-2" onClick={() => navigate(ROUTES.QUOTES)}>Quotes page</Button> to find some!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quotesToDisplay.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} styleVariant="typography" onQuoteUpdated={handleQuoteUpdated} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;