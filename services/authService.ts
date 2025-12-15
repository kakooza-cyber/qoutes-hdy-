import { User } from '../types';

// Keys for LocalStorage
const USERS_STORAGE_KEY = 'quotely_users';
const CURRENT_USER_KEY = 'quotely_current_user';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get all users
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

let currentUser: User | null = null;

// Initial hydration
try {
  const storedUser = localStorage.getItem(CURRENT_USER_KEY);
  if (storedUser) currentUser = JSON.parse(storedUser);
} catch (e) {
  console.error("Error parsing stored user", e);
}

export const login = async (username: string, password: string): Promise<boolean> => {
  await delay(800); // Simulate network request
  const users = getUsers();
  
  // Simple check (in a real app, passwords should be hashed)
  const user = users.find(u => u.username === username && (u as any).password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    return true;
  }
  return false;
};

export const signup = async (username: string, email: string, password: string): Promise<boolean> => {
  await delay(800);
  const users = getUsers();
  
  if (users.some(u => u.username === username || u.email === email)) {
    return false; // User exists
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    email,
    avatarUrl: `https://picsum.photos/seed/${username}/150/150`,
    likedQuotes: [],
    favoritedQuotes: [],
  };

  // Save password in a real app would be hashed. Storing here for mock login to work.
  (newUser as any).password = password;

  users.push(newUser);
  saveUsers(users);
  
  currentUser = newUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return true;
};

export const loginWithSocial = async (provider: string): Promise<boolean> => {
  await delay(1000);
  const users = getUsers();
  const mockEmail = `user@${provider}.com`;
  
  let user = users.find(u => u.email === mockEmail);
  
  if (!user) {
    user = {
      id: `social-${provider}-${Date.now()}`,
      username: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: mockEmail,
      avatarUrl: `https://picsum.photos/seed/${provider}/150/150`,
      likedQuotes: [],
      favoritedQuotes: [],
    };
    users.push(user);
    saveUsers(users);
  }

  currentUser = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return true;
};

export const updateCurrentUser = async (updates: Partial<User>): Promise<void> => {
  await delay(500);
  if (!currentUser) return;

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === currentUser!.id);

  if (userIndex !== -1) {
    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    saveUsers(users);
    
    currentUser = updatedUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  }
};

export const logout = (): void => {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

// Internal helper for other services to update user data (like likes/favorites)
export const _internalUpdateUser = (updatedUser: User) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === updatedUser.id);
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    saveUsers(users);
    currentUser = updatedUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  }
};