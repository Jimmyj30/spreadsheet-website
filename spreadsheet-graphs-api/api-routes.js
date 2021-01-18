// Initialize express router
let router = require("express").Router();

// Set default API response
router.get("/", function (req, res) {
  res.json({
    status: "API is Working",
    message: "private spreadsheet API",
  });
});

// Export API routes
module.exports = router;
