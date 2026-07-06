const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI stored in MONGO_URI env variable.
 *
 * Supports both:
 *   - Local:  mongodb://localhost:27017/hp-api-clone
 *   - Atlas:  mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/hp-api-clone
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer needed in Mongoose 7+/8+ but kept
      // here as documentation of what they used to do.
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(
      `✅  MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`
    );
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
