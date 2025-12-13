import React, { useEffect, useRef, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../constants';
import { AuthContext } from '../App';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Quotes of the Day', path: ROUTES.QUOTES_OF_THE_DAY },
    { name: 'Proverbs', path: ROUTES.PROVERBS },
    { name: 'Quotes', path: ROUTES.QUOTES },
    { name: 'Submit Quote', path: ROUTES.SUBMIT_QUOTE },
    { name: 'About Us', path: ROUTES.ABOUT_US },
    { name: 'Profile', path: ROUTES.PROFILE },
  ];

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = ''; // Restore scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hamburger-menu-title"
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-75"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar content */}
      <div
        ref={menuRef}
        className="relative w-72 bg-gradient-to-b from-purple-800 to-indigo-800 h-full shadow-2xl p-6 flex flex-col"
        id="hamburger-navigation-menu"
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-purple-600">
          <h2 id="hamburger-menu-title" className="text-3xl font-bold text-white">Navigation</h2>
          <button
            onClick={onClose}
            className="text-white text-3xl p-2 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Close navigation menu"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block text-white text-xl py-3 px-4 rounded-lg transition duration-300 ${
                      isActive ? 'bg-purple-600 font-semibold' : 'hover:bg-purple-700'
                    }`
                  }
                  onClick={onClose}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <div className="mt-8 pt-4 border-t border-purple-600 text-center">
            <NavLink
              to={ROUTES.PROFILE}
              className="flex items-center justify-center space-x-3 text-white hover:text-purple-200 transition duration-300"
              onClick={onClose}
            >
              <img
                src={user?.avatarUrl || 'https://picsum.photos/seed/avatar/50/50'}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-purple-300 object-cover"
              />
              <span className="font-semibold text-lg">{user?.username || 'Profile'}</span>
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default HamburgerMenu;