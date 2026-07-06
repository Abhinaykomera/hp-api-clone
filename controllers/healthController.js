
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HP API Clone is up and running 🧙',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};

module.exports = { getHealth };
