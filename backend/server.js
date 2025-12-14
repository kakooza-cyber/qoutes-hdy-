const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const quoteRoutes = require('./routes/quoteRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quotely', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Quotely API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});