// dataController.js

// Import data model
const DataTable = require("./dataTableModel");

// Handle index actions
exports.index = function (req, res) {
  const auth = req.currentUser;

  DataTable.get(function (err, dataTables) {
    if (err || !auth) {
      let statusCode = getStatusCode(err, auth);
      let statusMessage = getStatusMessage(err, auth);
      res.status(statusCode).json({
        status: "error",
        message: statusMessage,
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
  // console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log(auth);

  var dataTable = new DataTable(req.body);
  var processedDataTable = dataTable.generateProcessedDataTable(dataTable);

  // save the data table and check for errors
  dataTable.save(function (err) {
    if (err || !auth) {
      let statusCode = getStatusCode(err, auth);
      let statusMessage = getStatusMessage(err, auth);
      res.status(statusCode).send(statusMessage);
    } else {
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
  // console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log(auth);

  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (err || dataTable == null || !auth) {
      let statusCode = getStatusCode(err, auth, dataTable == null);
      let statusMessage = getStatusMessage(err, auth, dataTable == null);
      res.status(statusCode).send(statusMessage);
    } else {
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
  // console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log(auth);

  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (err || dataTable == null || !auth) {
      let statusCode = getStatusCode(err, auth, dataTable == null);
      let statusMessage = getStatusMessage(err, auth, dataTable == null);
      res.status(statusCode).send(statusMessage);
    } else {
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
  // console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log(auth);

  DataTable.deleteOne(
    {
      _id: req.params.dataTable_id,
    },
    function (err, dataTable) {
      if (err || !auth) {
        let statusCode = getStatusCode(err, auth);
        let statusMessage = getStatusMessage(err, auth);
        res.status(statusCode).send(statusMessage);
      } else {
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

// might have more parameters later on...
function getStatusCode(error, auth, dataTableNotFound = false) {
  if (!auth) {
    return 403;
  }
  if (error) {
    return 520;
  }
  if (dataTableNotFound) {
    // request is fine but no table found
    return 200;
  }
  return 520;
}

function getStatusMessage(error, auth, dataTableNotFound = false) {
  if (!auth) {
    return "403 Forbidden";
  }
  if (error) {
    return error;
  }
  if (dataTableNotFound) {
    return "Data table not found";
  }
  return "error";
}
