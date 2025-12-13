import React from 'react';
import { APP_NAME, APP_TAGLINE, SOCIAL_MEDIA_LINKS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-12 shadow-inner">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-6 md:space-y-0 px-4">
        <div className="text-lg font-semibold">
          &copy; {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}
        </div>

        <div className="flex space-x-6 text-2xl">
          <a href={SOCIAL_MEDIA_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition duration-300">
            <i className="fab fa-facebook-f"></i> {/* Font Awesome for Facebook */}
          </a>
          <a href={SOCIAL_MEDIA_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition duration-300">
            <i className="fab fa-twitter"></i> {/* Font Awesome for Twitter */}
          </a>
          <a href={SOCIAL_MEDIA_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition duration-300">
            <i className="fab fa-instagram"></i> {/* Font Awesome for Instagram */}
          </a>
          <a href={SOCIAL_MEDIA_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition duration-300">
            <i className="fab fa-linkedin-in"></i> {/* Font Awesome for LinkedIn */}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;