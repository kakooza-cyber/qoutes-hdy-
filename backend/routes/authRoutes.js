const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Generate Token Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        likedQuotes: user.likedQuotes,
        favoritedQuotes: user.favoritedQuotes,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        likedQuotes: user.likedQuotes,
        favoritedQuotes: user.favoritedQuotes,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/social-login
// @desc    Mock Social Login (Creates or Logs in user based on provider)
router.post('/social-login', async (req, res) => {
  const { provider } = req.body;
  // In a real app, you would verify the token from the provider here.
  // For this demo, we mock it by creating/finding a user based on the provider name.
  
  const mockEmail = `user@${provider}.com`;
  
  try {
    let user = await User.findOne({ email: mockEmail });
    
    if (!user) {
      // Create new social user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('socialPassword123', salt); // Dummy password
      
      user = new User({
        username: `${provider.charAt(0).toUpperCase() + provider.slice(1)}User`,
        email: mockEmail,
        password: hashedPassword,
        avatarUrl: `https://picsum.photos/seed/${provider}/150/150`,
      });
      await user.save();
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        likedQuotes: user.likedQuotes,
        favoritedQuotes: user.favoritedQuotes,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error during social login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/me
// @desc    Update user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    // Prevent updating sensitive fields directly like password via this route
    delete updates.password;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      likedQuotes: user.likedQuotes,
      favoritedQuotes: user.favoritedQuotes,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;