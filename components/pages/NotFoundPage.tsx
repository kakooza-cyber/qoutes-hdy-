import React from 'react';
import { NavLink } from 'react-router-dom';
import Button from '../Button';
import { ROUTES, APP_NAME } from '../../constants';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="text-center bg-white p-10 rounded-xl shadow-2xl border border-purple-100 max-w-md">
        <h1 className="text-7xl md:text-9xl font-extrabold text-purple-600 mb-4 animate-bounce">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <NavLink to={ROUTES.HOME}>
          <Button variant="primary" size="lg">
            Go to Homepage
          </Button>
        </NavLink>
      </div>
    </div>
  );
};

export default NotFoundPage;