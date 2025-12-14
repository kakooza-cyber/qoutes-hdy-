const express = require('express');
const Quote = require('../models/Quote');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Mock data for seeding
const mockQuotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'Motivation', imageUrl: 'https://picsum.photos/seed/stevejobs/1600/900', likes: 120 },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'Inspiration', imageUrl: 'https://picsum.photos/seed/roosevelt/1600/900', likes: 90 },
  { text: 'Life is 10% what happens to you and 90% how you react to it.', author: 'Charles R. Swindoll', category: 'Life', imageUrl: 'https://picsum.photos/seed/swindoll/1600/900', likes: 95 },
];

// @route   POST /api/quotes/seed
// @desc    Seed the database with initial quotes (Utility route)
router.post('/seed', async (req, res) => {
  try {
    const count = await Quote.countDocuments();
    if (count === 0) {
      await Quote.insertMany(mockQuotes);
      res.json({ message: 'Database seeded' });
    } else {
      res.json({ message: 'Database already has quotes' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quotes
// @desc    Get all quotes (with filtering)
router.get('/', async (req, res) => {
  const { category, author, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (category && category !== 'All') query.category = category;
  if (author && author !== 'All') query.author = author;
  if (search) {
    query.$or = [
      { text: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const quotes = await Quote.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Convert _id to id for frontend compatibility
    const formattedQuotes = quotes.map(q => ({
      ...q._doc,
      id: q._id.toString()
    }));

    res.json(formattedQuotes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quotes
// @desc    Submit a new quote
router.post('/', authMiddleware, async (req, res) => {
  const { text, author, category } = req.body;
  try {
    const newQuote = new Quote({
      text,
      author,
      category,
      imageUrl: `https://picsum.photos/seed/${category}-${Date.now()}/1600/900`,
      submittedBy: req.user.id
    });
    const savedQuote = await newQuote.save();
    res.json({ ...savedQuote._doc, id: savedQuote._id.toString() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quotes/:id/like
// @desc    Toggle like on a quote
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!quote || !user) return res.status(404).json({ message: 'Quote or User not found' });

    const quoteIdStr = quote._id.toString();
    const isLiked = user.likedQuotes.includes(quoteIdStr);

    if (isLiked) {
      // Unlike
      user.likedQuotes = user.likedQuotes.filter(id => id !== quoteIdStr);
      quote.likes = Math.max(0, quote.likes - 1);
    } else {
      // Like
      user.likedQuotes.push(quoteIdStr);
      quote.likes += 1;
    }

    await user.save();
    await quote.save();

    res.json({ likes: quote.likes, isLiked: !isLiked });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quotes/:id/favorite
// @desc    Toggle favorite on a quote
router.post('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const quoteId = req.params.id;

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isFavorited = user.favoritedQuotes.includes(quoteId);

    if (isFavorited) {
      user.favoritedQuotes = user.favoritedQuotes.filter(id => id !== quoteId);
    } else {
      user.favoritedQuotes.push(quoteId);
    }

    await user.save();

    res.json({ isFavorited: !isFavorited });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quotes/daily
// @desc    Get quote of the day (Random from DB for now)
router.get('/daily', async (req, res) => {
  try {
    const count = await Quote.countDocuments();
    const random = Math.floor(Math.random() * count);
    const quote = await Quote.findOne().skip(random);
    
    if (quote) {
      res.json({ ...quote._doc, id: quote._id.toString() });
    } else {
      res.status(404).json({ message: 'No quotes available' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;