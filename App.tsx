import React, { useState, useEffect, createContext, useCallback, useContext } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './components/pages/LoginPage';
import QuotesOfTheDayPage from './components/pages/QuotesOfTheDayPage';
import ProverbsPage from './components/pages/ProverbsPage';
import QuotesPage from './components/pages/QuotesPage';
import AboutUsPage from './components/pages/AboutUsPage';
import ProfilePage from './components/pages/ProfilePage';
import SubmitQuotePage from './components/pages/SubmitQuotePage';
import NotFoundPage from './components/pages/NotFoundPage';
import { ROUTES } from './constants';
import { AuthContextType, User, ChildrenProps } from './types';
import { 
  login as authLogin, 
  signup as authSignup, 
  logout as authLogout, 
  getCurrentUser,
  updateCurrentUser,
  loginWithSocial
} from './services/authService';
import LoadingSpinner from './components/LoadingSpinner';

// Create AuthContext with a default (null) value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  signup: async () => false,
  loginWithProvider: async () => false,
  updateUserProfile: async () => {},
  logout: () => {},
  loading: true,
});

// ProtectedRoute component
const ProtectedRoute: React.FC<ChildrenProps> = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate initial auth check (e.g., from local storage or session)
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const storedUser = getCurrentUser(); // In a real app, this might involve a token check
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await authLogin(username, password);
      if (success) {
        setUser(getCurrentUser());
      }
      return success;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await authSignup(username, email, password);
      if (success) {
        setUser(getCurrentUser());
      }
      return success;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithProvider = useCallback(async (provider: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await loginWithSocial(provider);
      if (success) {
        setUser(getCurrentUser());
      }
      return success;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    await updateCurrentUser(updates);
    setUser(getCurrentUser());
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithProvider,
    updateUserProfile,
    logout,
    loading,
  };

  return (
    <HashRouter>
      <AuthContext.Provider value={authContextValue}>
        <Layout>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.HOME} element={<ProtectedRoute><QuotesOfTheDayPage /></ProtectedRoute>} />
            <Route path={ROUTES.QUOTES_OF_THE_DAY} element={<ProtectedRoute><QuotesOfTheDayPage /></ProtectedRoute>} />
            <Route path={ROUTES.PROVERBS} element={<ProtectedRoute><ProverbsPage /></ProtectedRoute>} />
            <Route path={ROUTES.QUOTES} element={<ProtectedRoute><QuotesPage /></ProtectedRoute>} />
            <Route path={ROUTES.ABOUT_US} element={<ProtectedRoute><AboutUsPage /></ProtectedRoute>} />
            <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path={ROUTES.SUBMIT_QUOTE} element={<ProtectedRoute><SubmitQuotePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AuthContext.Provider>
    </HashRouter>
  );
};

export default App;