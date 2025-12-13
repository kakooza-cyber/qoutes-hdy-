import React, { useState, useEffect, useCallback } from 'react';
import { Proverb } from '../../types';
import { fetchProverbs } from '../../services/quoteService';
import LoadingSpinner from '../LoadingSpinner';
import Button from '../Button';
import { PROVERB_THEMES } from '../../constants';

const ProverbsPage: React.FC = () => {
  const [proverbs, setProverbs] = useState<Proverb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadProverbs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProverbs(selectedTheme === 'All' ? undefined : selectedTheme, searchTerm);
      setProverbs(data);
    } catch (err) {
      console.error('Failed to fetch proverbs:', err);
      setError('An error occurred while loading proverbs.');
    } finally {
      setLoading(false);
    }
  }, [selectedTheme, searchTerm]);

  useEffect(() => {
    loadProverbs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTheme, searchTerm]);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const MemoizedProverbCard: React.FC<{ proverb: Proverb }> = React.memo(({ proverb }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
      <p className="text-xl italic text-gray-800 leading-relaxed">"{proverb.text}"</p>
      {proverb.origin && (
        <p className="mt-3 text-right text-sm text-gray-600 font-medium">
          - {proverb.origin}
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
          {proverb.theme}
        </span>
      </div>
    </div>
  ));

  return (
    <div className="py-10">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12 drop-shadow-md">
        Proverbs from Around the World
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search proverbs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
        />
        <div className="relative w-full md:w-auto">
          <select
            value={selectedTheme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-full shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-purple-500 transition-all duration-300"
          >
            <option value="All">All Themes</option>
            {PROVERB_THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-center text-red-500 text-lg mt-4">{error}</p>}

      {!loading && !error && proverbs.length === 0 && (
        <p className="text-center text-gray-600 text-xl mt-8">No proverbs found for your selection.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {!loading && !error && proverbs.map((proverb) => (
          <MemoizedProverbCard key={proverb.id} proverb={proverb} />
        ))}
      </div>
    </div>
  );
};

export default ProverbsPage;