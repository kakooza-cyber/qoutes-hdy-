import React, { useState, useContext, useCallback } from 'react';
import { Quote } from '../types';
import Button from './Button';
import SocialShareButtons from './SocialShareButtons';
import { toggleLikeQuote, toggleFavoriteQuote } from '../services/quoteService';
import { AuthContext } from '../App';

interface QuoteCardProps {
  quote: Quote;
  styleVariant?: 'minimalist' | 'typography' | 'image-based';
  onQuoteUpdated?: (updatedQuote: Quote) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, styleVariant = 'image-based', onQuoteUpdated }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [currentQuote, setCurrentQuote] = useState(quote);
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      alert('Please login to like quotes.');
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    try {
      const result = await toggleLikeQuote(currentQuote.id, currentQuote.isLiked || false);
      if (result) {
        const updated = { ...currentQuote, likes: result.likes, isLiked: result.isLiked };
        setCurrentQuote(updated);
        onQuoteUpdated?.(updated);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like status. Please try again.');
    } finally {
      setIsLiking(false);
    }
  }, [isAuthenticated, isLiking, currentQuote, onQuoteUpdated]);

  const handleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      alert('Please login to favorite quotes.');
      return;
    }
    if (isFavoriting) return;

    setIsFavoriting(true);
    try {
      const result = await toggleFavoriteQuote(currentQuote.id, currentQuote.isFavorited || false);
      if (result) {
        const updated = { ...currentQuote, isFavorited: result.isFavorited };
        setCurrentQuote(updated);
        onQuoteUpdated?.(updated);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    } finally {
      setIsFavoriting(false);
    }
  }, [isAuthenticated, isFavoriting, currentQuote, onQuoteUpdated]);

  const renderCardContent = () => {
    switch (styleVariant) {
      case 'minimalist':
        return (
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-xl italic text-gray-700 leading-relaxed">"{currentQuote.text}"</p>
            <p className="mt-4 text-right font-semibold text-gray-900">- {currentQuote.author}</p>
            <p className="text-right text-sm text-gray-500">{currentQuote.category}</p>
          </div>
        );
      case 'typography':
        return (
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-3xl font-bold text-purple-800 leading-tight mb-4">"{currentQuote.text}"</h3>
            <p className="text-xl text-right font-medium text-indigo-700">- {currentQuote.author}</p>
            <p className="text-right text-md text-gray-600">{currentQuote.category}</p>
          </div>
        );
      case 'image-based':
      default:
        return (
          <div
            className="relative w-full h-80 sm:h-96 md:h-[450px] lg:h-[550px] bg-cover bg-center rounded-lg shadow-xl overflow-hidden flex items-center justify-center p-6 md:p-10"
            style={{ backgroundImage: `url(${currentQuote.imageUrl || 'https://picsum.photos/seed/quoteplaceholder/1600/900'})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center p-4">
              <p className="text-white text-xl sm:text-2xl md:text-3xl font-playfair italic leading-relaxed md:leading-snug">
                "{currentQuote.text}"
              </p>
              <p className="mt-4 text-white text-md sm:text-lg md:text-xl font-semibold">- {currentQuote.author}</p>
              <p className="text-white text-sm md:text-base opacity-80">{currentQuote.category}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto my-8">
      {renderCardContent()}
      <div className="flex justify-center space-x-4 mt-6">
        <Button
          onClick={handleLike}
          disabled={isLiking}
          variant={currentQuote.isLiked ? 'primary' : 'outline'}
          className="flex items-center space-x-2"
        >
          <i className={`fa-heart ${currentQuote.isLiked ? 'fas text-white' : 'far text-purple-600'}`}></i>
          <span>{currentQuote.likes} Likes</span>
        </Button>
        <Button
          onClick={handleFavorite}
          disabled={isFavoriting}
          variant={currentQuote.isFavorited ? 'primary' : 'outline'}
          className="flex items-center space-x-2"
        >
          <i className={`fa-star ${currentQuote.isFavorited ? 'fas text-white' : 'far text-purple-600'}`}></i>
          <span>Favorite</span>
        </Button>
        <Button onClick={() => setShowShareOptions(!showShareOptions)} variant="secondary" className="flex items-center space-x-2">
          <i className="fas fa-share-alt"></i>
          <span>Share</span>
        </Button>
      </div>
      {showShareOptions && (
        <div className="mt-4">
          <SocialShareButtons quoteText={currentQuote.text} author={currentQuote.author} />
        </div>
      )}
    </div>
  );
};

export default QuoteCard;