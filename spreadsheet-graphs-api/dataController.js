// dataController.js

// Import data model
DataTable = require("./dataTableModel");

// Handle index actions
exports.index = function (req, res) {
  DataTable.get(function (err, dataTables) {
    if (err) {
      res.json({
        status: "error",
        message: err,
      });
    } else {
    }
    res.json({
      status: "success",
      message: "Data retrieved successfully",
      data: dataTables,
    });
  });
};

// Handle create data table actions
exports.new = function (req, res) {
  var dataTable = new DataTable();
  // dataTable.name = req.body.name ? req.body.name : dataTable.name;
  dataTable.xCoords = req.body.xCoords ? req.body.xCoords : dataTable.xCoords;
  dataTable.yCoords = req.body.yCoords;
  dataTable.xUncertainties = req.body.xUncertainties;
  dataTable.yUncertainties = req.body.yUncertainties;
  dataTable.xLabel = req.body.xLabel;
  dataTable.yLabel = req.body.yLabel;

  dataTable.xCurveStraighteningInstructions =
    req.body.xCurveStraighteningInstructions;

  dataTable.yCurveStraighteningInstructions =
    req.body.yCurveStraighteningInstructions;

  // save the data table and check for errors
  dataTable.save(function (err) {
    if (err) res.json(err);
    else {
    }
    res.json({
      message: "New data table created!",
      data: dataTable,
    });
  });
};

// Handle view data table info
exports.view = function (req, res) {
  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (err) res.send(err);
    res.json({
      message: "data table details loading..",
      data: dataTable,
    });
  });
};

// Handle update data table info
exports.update = function (req, res) {
  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (err) res.send(err);
    else {
    }

    dataTable.xCoords = req.body.xCoords ? req.body.xCoords : dataTable.xCoords;
    dataTable.yCoords = req.body.yCoords;
    dataTable.xUncertainties = req.body.xUncertainties;
    dataTable.yUncertainties = req.body.yUncertainties;
    // save the data table and check for errors
    dataTable.save(function (err) {
      if (err) res.json(err);
      else {
      }

      res.json({
        message: "data table info updated",
        data: dataTable,
      });
    });
  });
};

// Handle delete data table
exports.delete = function (req, res) {
  DataTable.remove(
    {
      _id: req.params.dataTable_id,
    },
    function (err, dataTable) {
      if (err) res.send(err);
      else {
      }

      res.json({
        status: "success",
        message: "data table deleted",
      });
    }
  );
};

// Commands...
// GET /api/data-tables will list all data tables
// POST /api/data-tables will make a new data table
// GET /api/data-tables/{id} will list a single data table
// PUT /api/data-tables/{id} update a single data table
// DELETE /data-tables/{id} will delete a single data table

// - req and res mean request and response...
//
