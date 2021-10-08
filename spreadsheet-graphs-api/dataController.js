// dataController.js

// Import data model
DataTable = require("./dataTableModel");
DataPoint = require("./dataTableModel");

// Import mongoose
var mongoose = require("mongoose");

// Handle index actions
exports.index = function (req, res) {
  const auth = req.currentUser;

  DataTable.get(function (err, dataTables) {
    if (err || !auth) {
      // TODO:  add a function to
      // send particular error messages
      res.json({
        status: "error",
        message: err ? err : "403 Forbidden",
      });
    } else {
      res.json({
        status: "success",
        message: "Data retrieved successfully",
        data: dataTables,
      });
    }
  });
};

// Handle create data table actions
exports.new = function (req, res) {
  console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log(auth);

  var dataTable = new DataTable(req.body);
  var processedDataTable = dataTable.generateProcessedDataTable(dataTable);

  // save the data table and check for errors
  dataTable.save(function (err) {
    if (err) res.json(err);
    else {
      res.json({
        // we send the processed data table to the front end
        message: "New data table created!",
        rawDataTableID: dataTable._id,
        processedDataTable: processedDataTable,
      });
    }
  });
};

// Handle view data table info
exports.view = function (req, res) {
  console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log(auth);

  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (err) res.send(err);
    else {
      res.json({
        message: "data table details loading..",
        data: dataTable,
      });
    }
  });
};

// Handle update data table info
exports.update = function (req, res) {
  // https://dev.to/gathoni/express-req-params-req-query-and-req-body-4lpc
  // req.query.parametername can be used to store information
  // req.params.dataTable_id refers to the _id of the raw data table
  // req.body is the latest version of the raw data table from the front-end
  console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log(auth);

  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (err || dataTable == null) res.send(err ? err : "error");
    else {
      dataTable.dataTableData = req.body.dataTableData;

      dataTable.xCurveStraighteningInstructions =
        req.body.xCurveStraighteningInstructions;
      dataTable.yCurveStraighteningInstructions =
        req.body.yCurveStraighteningInstructions;

      // make new processed data table from rawDataTable sent in request
      var processedDataTable = dataTable.generateProcessedDataTable(req.body);

      // save the updated data table and check for errors
      dataTable.save(function (err) {
        if (err) res.json(err);
        else {
          res.json({
            message: "data table info updated",
            data: processedDataTable,
          });
        }
      });
    }
  });
};

// Handle delete data table
exports.delete = function (req, res) {
  console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log(auth);
  console.log(auth.uid);

  DataTable.deleteOne(
    {
      _id: req.params.dataTable_id,
    },
    function (err, dataTable) {
      if (err) res.send(err);
      else {
        res.json({
          status: "success",
          message: "data table deleted",
        });
      }
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
