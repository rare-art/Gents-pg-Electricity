const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');
const seedData = require('./seed');

dotenv.config();

// Ensure reliable DNS SRV resolution for MongoDB Atlas on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback to default DNS if override unavailable
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Imports
const authRoutes = require('./routes/auth');
const residentRoutes = require('./routes/residents');
const meterRoutes = require('./routes/meters');
const billRoutes = require('./routes/bills');
const paymentRoutes = require('./routes/payments');
const statsRoutes = require('./routes/stats');

// Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GentsPG Electricity Backend API is running seamlessly' });
});

// Database Connection Logic
const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    console.log('⚡ No MONGODB_URI found in environment. Initializing MongoDB Memory Server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      await mongoose.connect(fallbackUri);
      console.log('🟢 Connected to Fallback In-Memory MongoDB Database.');
      await seedData();
    } catch (err) {
      console.error('❌ Failed to initialize Mongo Memory Server:', err.message);
    }
    return;
  }

  try {
    console.log('⚡ Connecting to MongoDB Atlas database...');
    await mongoose.connect(mongoUri);
    console.log('🟢 Connected to MongoDB Atlas Database successfully.');
    await seedData();
  } catch (err) {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
  }
};

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 GentsPG Electricity Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
    }
  });
};

connectDatabase().then(() => {
  startServer(PORT);
});

