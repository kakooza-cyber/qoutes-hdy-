import React, { useState, useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../../App';
import { ROUTES, APP_NAME } from '../../constants';
import Button from '../Button';
import Modal from '../Modal';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Only used for signup
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const { login, signup, loginWithProvider, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let success = false;
    if (isSignup) {
      success = await signup(username, email, password);
    } else {
      success = await login(username, password);
    }

    if (success) {
      navigate(ROUTES.HOME);
    } else {
      alert(isSignup ? 'Signup failed. Username or email might be taken.' : 'Login failed. Invalid credentials.');
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    const success = await loginWithProvider(provider);
    setSocialLoading(null);
    if (success) {
      navigate(ROUTES.HOME);
    } else {
      alert(`${provider} login failed. Please try again.`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl space-y-8 border border-purple-100">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            {isSignup ? 'Create an account' : `Sign in to ${APP_NAME}`}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:underline"
            >
              {isSignup ? 'sign in to your existing account' : 'start your free trial'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {isSignup && (
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 ${isSignup ? '' : 'rounded-b-md'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {!isSignup && (
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignup ? 'Signing Up...' : 'Logging In...'}
                </span>
              ) : (
                isSignup ? 'Sign Up' : 'Sign In'
              )}
            </Button>
          </div>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button 
            variant="secondary" 
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" 
            onClick={() => handleSocialLogin('google')}
            disabled={!!socialLoading}
          >
            {socialLoading === 'google' ? <i className="fas fa-spinner fa-spin text-lg"></i> : <i className="fab fa-google text-lg"></i>} 
            <span className="sr-only">Google</span>
          </Button>
          <Button 
            variant="secondary" 
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" 
            onClick={() => handleSocialLogin('facebook')}
            disabled={!!socialLoading}
          >
            {socialLoading === 'facebook' ? <i className="fas fa-spinner fa-spin text-lg"></i> : <i className="fab fa-facebook-f text-lg"></i>}
            <span className="sr-only">Facebook</span>
          </Button>
          <Button 
            variant="secondary" 
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" 
            onClick={() => handleSocialLogin('twitter')}
            disabled={!!socialLoading}
          >
            {socialLoading === 'twitter' ? <i className="fas fa-spinner fa-spin text-lg"></i> : <i className="fab fa-twitter text-lg"></i>}
            <span className="sr-only">Twitter</span>
          </Button>
        </div>
      </div>

      <Modal isOpen={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} title="Forgot Password">
        <p className="mb-4 text-gray-700">
          Enter your email address below and we'll send you a link to reset your password.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); alert('Password reset link sent (mock).'); setShowForgotPasswordModal(false); }}>
          <input
            type="email"
            placeholder="Email address"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
          <div className="flex justify-end mt-4 space-x-2">
            <Button type="button" variant="secondary" onClick={() => setShowForgotPasswordModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Send Reset Link</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;