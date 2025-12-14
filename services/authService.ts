import { User } from '../types';

const API_URL = 'http://localhost:5000/api/auth';

// Helper to handle requests
const request = async (endpoint: string, method: string, body?: any, token?: string) => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) throw new Error('API Request Failed');
  return response.json();
};

let currentUser: User | null = null;

// Initial check to hydrate user from local storage
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser) currentUser = JSON.parse(storedUser);
} catch (e) {
  console.error("Error parsing stored user", e);
}

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const data = await request('/login', 'POST', { username, password });
    if (data.token) {
      currentUser = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const signup = async (username: string, email: string, password: string): Promise<boolean> => {
  try {
    const data = await request('/signup', 'POST', { username, email, password });
    if (data.token) {
      currentUser = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const loginWithSocial = async (provider: string): Promise<boolean> => {
  try {
    const data = await request('/social-login', 'POST', { provider });
    if (data.token) {
      currentUser = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updateCurrentUser = async (updates: Partial<User>): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const updatedUser = await request('/me', 'PUT', updates, token);
    currentUser = updatedUser;
    localStorage.setItem('user', JSON.stringify(currentUser));
  } catch (error) {
    console.error("Failed to update profile", error);
  }
};

export const logout = (): void => {
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};