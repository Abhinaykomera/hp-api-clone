/**
 * server.js — Entry point
 *
 * Loads environment variables, connects to MongoDB,
 * then starts the HTTP server.
 */

const dotenv = require('dotenv');
dotenv.config(); // Must be called before anything reads process.env

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to the database, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `🚀  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });
});
