import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../constants';
import { AuthContext } from '../App';
import HamburgerMenu from './HamburgerMenu'; // Import the new HamburgerMenu component

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for hamburger menu

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // Close menu on logout
    navigate(ROUTES.LOGIN); // Redirect to login after logout
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {isAuthenticated && (
            <button
              onClick={toggleMenu}
              className="mr-4 text-2xl p-2 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              aria-controls="hamburger-navigation-menu"
            >
              <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          )}
          <NavLink to={ROUTES.HOME} className="text-3xl font-bold tracking-tight hover:text-purple-200 transition duration-300">
            {APP_NAME}
          </NavLink>
        </div>


        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NavLink
                to={ROUTES.PROFILE}
                className="flex items-center space-x-2 text-white hover:text-purple-200 transition duration-300"
                onClick={() => setIsMenuOpen(false)} // Close menu if profile is clicked
              >
                <img
                  src={user?.avatarUrl || 'https://picsum.photos/seed/avatar/50/50'}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-purple-300 object-cover"
                />
                <span className="font-semibold hidden sm:inline">{user?.username || 'Profile'}</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to={ROUTES.LOGIN}
              className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-md"
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
      {isAuthenticated && <HamburgerMenu isOpen={isMenuOpen} onClose={toggleMenu} />}
    </nav>
  );
};

export default Navbar;