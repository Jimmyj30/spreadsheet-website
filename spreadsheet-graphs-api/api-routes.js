// Initialize express router
let router = require("express").Router();

// Set default API response
router.get("/", function (req, res) {
  res.json({
    status: "API is Working",
    message: "private spreadsheet API",
  });
});

// Import data table controller
var dataTableController = require("./dataController");

// data table routes
// relate GET, POST, etc to the functions in dataController.js
router
  .route("/data-tables")
  .get(dataTableController.index)
  .post(dataTableController.new);

router
  .route("/data-tables/:dataTable_id")
  .get(dataTableController.view)
  .patch(dataTableController.update)
  .put(dataTableController.update)
  .delete(dataTableController.delete);

// Export API routes
module.exports = router;
