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
  dataTable.dataTableData = req.body.dataTableData;

  dataTable.xCurveStraighteningInstructions =
    req.body.xCurveStraighteningInstructions;
  dataTable.yCurveStraighteningInstructions =
    req.body.yCurveStraighteningInstructions;

  var processedDataTable = generateProcessedDataTable(dataTable);
  console.log(dataTable._id);
  console.log(processedDataTable._id);

  // save the data table and check for errors
  dataTable.save(function (err) {
    if (err) res.json(err);
    else {
      processedDataTable.save(function (err) {
        if (err) res.json(err);
        else {
          res.json({
            message: "New data table created!",
            rawDataTableID: dataTable._id,
            processedDataTable: processedDataTable,
          });
        }
      });
    }
  });

  // DataTable.insertMany([processedDataTable, dataTable], function (err) {
  //   if (err) res.json(err);
  //   else {
  //     res.json({
  //       message: "New data table created!",
  //       rawDataTableID: dataTable._id,
  //       processedDataTable: processedDataTable,
  //     });
  //   }
  // });
};

// Handle view data table info
exports.view = function (req, res) {
  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (err) res.send(err);
    else {
    }
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

    dataTable.dataTableData = req.body.dataTableData;

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

function generateProcessedDataTable(dataTable) {
  processedDataTable = new DataTable();

  processedDataTable.dataTableData = dataTable.dataTableData;

  for (var i = 0; i < dataTable.dataTableData.length; ++i) {
    if (
      dataTable.dataTableData[i].xCoord &&
      dataTable.dataTableData[i].xUncertainty &&
      dataTable.xCurveStraighteningInstructions.constantPower
    ) {
      // test calculation (raising "x" to the power of some constant "a")...
      // will add a math library after I change the dataTableModel...
      processedDataTable.dataTableData[i].xCoord =
        processedDataTable.dataTableData[i].xCoord **
        dataTable.xCurveStraighteningInstructions.constantPower;
    }
  }

  return processedDataTable;
}

function updateProcessedDataTable(dataTable) {
  //...
}
