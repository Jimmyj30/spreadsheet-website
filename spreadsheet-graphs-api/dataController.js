// dataController.js

// Import data model
const DataTable = require("./dataTableModel");

// Handle index actions
exports.index = function (req, res) {
  const auth = req.currentUser;

  // later: make this only for an "admin" account
  // once the other user role stuff can be handled

  DataTable.get(function (err, dataTables) {
    if (checkError(err, auth, true)) {
      res.json(getError(err, auth, true));
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

  let dataTable = new DataTable(req.body);
  dataTable.firebase_uid = auth?.uid;
  let processedDataTable = dataTable.generateProcessedDataTable(dataTable);

  DataTable.find({ firebase_uid: auth?.uid }, function (err, dataTables) {
    if (checkError(err, auth, true)) {
      res.json(getError(err, auth, true));
    } else if (dataTables.length > 0) {
      // can't make a new data table if one already exists
      res.status(400).json({
        status: "error 400",
        message: "400 bad request: data table already exists for this user",
      });
    } else {
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
    }
  });
};

// Handle view data table info
exports.view = function (req, res) {
  // console.log(req.headers.authorization);
  const auth = req.currentUser;
  let query;
  console.log(auth);

  if (req.params.dataTable_id) {
    query = { _id: req.params.dataTable_id };
  }
  if (auth?.uid && req.query["view-by-firebase-uid"]) {
    query = { firebase_uid: auth.uid };
  }

  DataTable.findOne(query, function (err, dataTable) {
    if (checkError(err, auth, dataTable, true, true)) {
      res.json(getError(err, auth, dataTable, true, true));
    } else {
      res.json({
        message: "data table details loading..",
        rawDataTable: dataTable,
        processedDataTable: dataTable.generateProcessedDataTable(dataTable),
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
    if (checkError(err, auth, dataTable, true, true)) {
      res.json(getError(err, auth, dataTable, true, true));
    } else {
      dataTable.dataTableData = req.body.dataTableData;

      dataTable.xCurveStraighteningInstructions =
        req.body.xCurveStraighteningInstructions;
      dataTable.yCurveStraighteningInstructions =
        req.body.yCurveStraighteningInstructions;

      // make new processed data table from rawDataTable sent in request
      let processedDataTable = dataTable.generateProcessedDataTable(req.body);

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

  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (checkError(err, auth, dataTable, true, true)) {
      res.json(getError(err, auth, dataTable, true, true));
    } else {
      DataTable.deleteOne(
        {
          _id: req.params.dataTable_id,
          firebase_uid: auth.uid,
        },
        function (err, deleteResult) {
          let dataTableNotFound = deleteResult.deletedCount === 0;
          if (dataTableNotFound) {
            res.status(404).json({
              status: "error 404",
              message: "404 data table not found",
            });
          } else {
            res.json({
              status: "success",
              message: "data table deleted",
            });
          }
        }
      );
    }
  });
};

// Commands...
// GET /api/data-tables will list all data tables
// POST /api/data-tables will make a new data table
// GET /api/data-tables/{id} will list a single data table
// PUT /api/data-tables/{id} update a single data table
// DELETE /data-tables/{id} will delete a single data table

// - req and res mean request and response...

// check if an error exists
function checkError(
  error,
  auth,
  dataTable,
  checkDataTable = false,
  matchUid = false
) {
  if (error || !auth) {
    return true;
  }
  if (checkDataTable && !dataTable) {
    return true;
  }
  if (matchUid && auth.uid !== dataTable?.firebase_uid) {
    return true;
  }
  return false;
}

// send error responses
function getError(
  error,
  auth,
  dataTable,
  checkDataTable = false,
  matchUid = false
) {
  let statusCode;
  let statusMessage;

  if (!auth) {
    statusCode = 401;
    statusMessage = "401 unauthorized";
  } else if (error) {
    statusCode = 400;
    statusMessage = error;
  } else if (checkDataTable && !dataTable) {
    statusCode = 404;
    statusMessage = "404 data table not found";
  } else if (matchUid && auth.uid !== dataTable?.firebase_uid) {
    statusCode = 403;
    statusMessage = "403 unauthorized";
  } else {
    statusCode = 500;
    statusMessage = "500 internal server error";
  }

  return {
    status: "error " + statusCode,
    message: statusMessage,
  };
}
