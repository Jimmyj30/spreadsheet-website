// Initialize express router
let router = require("express").Router();

// Set default API response
router.get("/", function (req, res) {
  res.json({
    status: "API is Working",
    message: "private spreadsheet API",
  });
});

// Import data point controller
var dataPointController = require("./dataController");

// data point routes
router
  .route("/data-points")
  .get(dataPointController.index)
  .post(dataPointController.new);

router
  .route("/data-points/:dataPoint_id")
  .get(dataPointController.view)
  .patch(dataPointController.update)
  .put(dataPointController.update)
  .delete(dataPointController.delete);

// Export API routes
module.exports = router;
