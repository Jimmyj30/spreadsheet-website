// dataController.js

// Import data model
const DataTable = require("./dataTableModel");
let { checkError, getError } = require("./utils/httpUtils");

// Handle index actions
exports.index = function (req, res) {
  const auth = req.currentUser;

  DataTable.get(function (err, dataTables) {
    if (checkError(err, auth, true)) {
      let error = getError(err, auth, true);
      res.status(error.statusCode).json(error);
      return;
    } else if (auth.email !== "test@test.com") {
      res.status(403).json({
        status: "error 403",
        message: "403 unauthorized",
      });
      return;
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
  // console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log("auth: ", auth);

  let dataTable = new DataTable(req.body);
  dataTable.firebase_uid = auth?.uid;
  let processedDataTable = dataTable.generateProcessedDataTable(dataTable);

  DataTable.find({ firebase_uid: auth?.uid }, function (err, dataTables) {
    if (checkError(err, auth, true)) {
      let error = getError(err, auth, true);
      res.status(error.statusCode).json(error);
      return;
    } else if (dataTables.length > 0) {
      // can't make a new data table if one already exists
      res.status(400).json({
        status: "error 400",
        message: "400 bad request: data table already exists for this user",
      });
      return;
    }

    // save the data table and check for errors
    dataTable.save(function (err) {
      if (err) {
        res.json(err);
        return;
      }

      res.json({
        // we send the processed data table to the front end
        message: "New data table created!",
        rawDataTableID: dataTable._id,
        processedDataTable: processedDataTable,
      });
    });
  });
};

// Handle view data table info
exports.view = function (req, res) {
  // console.log(req.headers.authorization);
  const auth = req.currentUser;
  let query;
  console.log("auth: ", auth);

  if (req.params.dataTable_id) {
    query = { _id: req.params.dataTable_id };
  }
  if (auth?.uid && req.query["view-by-firebase-uid"]) {
    query = { firebase_uid: auth.uid };
  }

  DataTable.findOne(query, function (err, dataTable) {
    if (checkError(err, auth, dataTable, true, true)) {
      let error = getError(err, auth, dataTable, true, true);
      res.status(error.statusCode).json(error);
      return;
    }

    res.json({
      message: "data table details loading..",
      rawDataTable: dataTable,
      processedDataTable: dataTable.generateProcessedDataTable(dataTable),
    });
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
  console.log("auth: ", auth);

  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (checkError(err, auth, dataTable, true, true)) {
      let error = getError(err, auth, dataTable, true, true);
      res.status(error.statusCode).json(error);
      return;
    }

    dataTable.dataTableData = req.body.dataTableData;
    dataTable.xCurveStraighteningInstructions =
      req.body.xCurveStraighteningInstructions;
    dataTable.yCurveStraighteningInstructions =
      req.body.yCurveStraighteningInstructions;

    // make new processed data table from rawDataTable sent in request
    let processedDataTable = dataTable.generateProcessedDataTable(req.body);

    // save the updated data table and check for errors
    dataTable.save(function (err) {
      if (err) {
        res.json(err);
        return;
      }

      res.json({
        message: "data table info updated",
        data: processedDataTable,
      });
    });
  });
};

// Handle delete data table
exports.delete = function (req, res) {
  // console.log(req.headers.authorization);
  const auth = req.currentUser;
  console.log("auth:", auth);

  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (checkError(err, auth, dataTable, true, true)) {
      let error = getError(err, auth, dataTable, true, true);
      res.status(error.statusCode).json(error);
      return;
    }

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
          return;
        }

        res.json({
          status: "success",
          message: "data table deleted",
        });
      }
    );
  });
};

// Commands...
// GET /api/data-tables will list all data tables
// POST /api/data-tables will make a new data table
// GET /api/data-tables/{id} will list a single data table
// PUT /api/data-tables/{id} update a single data table
// DELETE /data-tables/{id} will delete a single data table

// - req and res mean request and response...
