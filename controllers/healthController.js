/**
 * controllers/healthController.js
 *
 * Handler(s) for the /api/health route.
 * Keeping logic in a controller (not in the route file) follows MVC.
 */

// @desc    Health-check — confirm the API and DB are alive
// @route   GET /api/health
// @access  Public
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HP API Clone is up and running 🧙',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};

module.exports = { getHealth };
