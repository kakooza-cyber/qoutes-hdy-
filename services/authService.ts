import { User } from '../types';

let currentUser: User | null = null;
let users: User[] = [
  { id: '1', username: 'testuser', email: 'test@example.com', likedQuotes: [], favoritedQuotes: [] },
];

/**
 * Simulates a login API call.
 * @param username The username for login.
 * @param password The password for login.
 * @returns A promise resolving to true if login is successful, false otherwise.
 */
export const login = async (username: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Basic mock authentication
      const user = users.find(u => u.username === username);
      if (user && password === 'password123') { // Mock password
        currentUser = user;
        console.log('User logged in:', currentUser.username);
        resolve(true);
      } else {
        console.log('Login failed for user:', username);
        resolve(false);
      }
    }, 1000); // Simulate network delay
  });
};

/**
 * Simulates a signup API call.
 * @param username The username for signup.
 * @param email The email for signup.
 * @param password The password for signup.
 * @returns A promise resolving to true if signup is successful, false otherwise.
 */
export const signup = async (username: string, email: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (users.some(u => u.username === username || u.email === email)) {
        console.log('Signup failed: Username or email already exists.');
        resolve(false);
      } else {
        const newUser: User = {
          id: String(users.length + 1),
          username,
          email,
          likedQuotes: [],
          favoritedQuotes: [],
        };
        users.push(newUser);
        currentUser = newUser;
        console.log('User signed up and logged in:', currentUser.username);
        resolve(true);
      }
    }, 1000); // Simulate network delay
  });
};

/**
 * Simulates a social media login.
 * @param provider The provider name (google, facebook, twitter).
 */
export const loginWithSocial = async (provider: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a mock user based on the provider
      const socialUser: User = {
        id: `social-${provider}-${Date.now()}`,
        username: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        email: `user@${provider}.com`,
        avatarUrl: `https://picsum.photos/seed/${provider}/150/150`,
        likedQuotes: [],
        favoritedQuotes: [],
      };
      
      // Check if user already exists (mock logic) or add them
      const existing = users.find(u => u.email === socialUser.email);
      if (existing) {
        currentUser = existing;
      } else {
        users.push(socialUser);
        currentUser = socialUser;
      }
      
      console.log(`User logged in via ${provider}:`, currentUser.username);
      resolve(true);
    }, 1500);
  });
};

/**
 * Updates the current user's profile.
 * @param updates Partial user object with fields to update.
 */
export const updateCurrentUser = async (updates: Partial<User>): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (currentUser) {
        currentUser = { ...currentUser, ...updates };
        // Update the user in the 'users' array as well
        const index = users.findIndex(u => u.id === currentUser?.id);
        if (index !== -1) {
          users[index] = currentUser;
        }
        console.log('User profile updated', currentUser);
      }
      resolve();
    }, 500);
  });
};

/**
 * Simulates a logout action.
 */
export const logout = (): void => {
  currentUser = null;
  console.log('User logged out.');
};

/**
 * Retrieves the currently logged-in user.
 * @returns The current user or null if no user is logged in.
 */
export const getCurrentUser = (): User | null => {
  return currentUser;
};