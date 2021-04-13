// dataController.js

// Import data model
DataTable = require("./dataTableModel");

// Import mongoose
var mongoose = require("mongoose");

// Import math.js
// https://mathjs.org/examples/expressions.js.html
var math = require("mathjs");

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
  console.log(req);
  console.log(req.query.processedDataTable_id);
  console.log(req.params.dataTable_id);
  // req.query.parametername can be used to store information...
  // req.params.dataTable_id refers to the _id of the raw data table
  DataTable.findById(req.params.dataTable_id, function (err, dataTable) {
    if (err) res.send(err);
    else {
      dataTable.dataTableData = req.body.dataTableData;

      dataTable.xCurveStraighteningInstructions =
        req.body.xCurveStraighteningInstructions;
      dataTable.yCurveStraighteningInstructions =
        req.body.yCurveStraighteningInstructions;

      // save the updated data table and check for errors
      dataTable.save(function (err) {
        if (err) res.json(err);
        else {
          // then find the existing processed data table by id
          DataTable.findById(
            req.query.processedDataTable_id,
            function (err, dataTable) {
              if (err) res.json(err);
              else {
                // "dataTable" here refers to the processed data table
                // update the processed data table based on the raw data table in the request
                dataTable = updateProcessedDataTable(dataTable, req.body);

                // save the processed data table as well
                dataTable.save(function (err) {
                  if (err) res.json(err);
                  else {
                    res.json({
                      message: "data table info updated",
                      data: dataTable,
                    });
                  }
                });
              }
            }
          );
        }
      });
    }
  });
};

// Handle delete data table
exports.delete = function (req, res) {
  DataTable.deleteOne(
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
  let processedDataTable = new DataTable();

  // copy over processedDataTable's data as the raw data table's data...
  processedDataTable.dataTableData = dataTable.dataTableData;

  for (var i = 0; i < dataTable.dataTableData.length; ++i) {
    if (
      dataTable.xCurveStraighteningInstructions.constantPower &&
      dataTableFullXCoordinateExists(dataTable, i)
    ) {
      processedDataTable.dataTableData[i].xCoord = returnRealValuesOnly(
        math.pow(
          dataTable.dataTableData[i].xCoord,
          math.evaluate(dataTable.xCurveStraighteningInstructions.constantPower)
        )
      );
    }
    if (
      dataTable.xCurveStraighteningInstructions.functionClass === "ln(x)" &&
      dataTableFullXCoordinateExists(dataTable, i)
    ) {
      processedDataTable.dataTableData[i].xCoord = returnRealValuesOnly(
        math.log(dataTable.dataTableData[i].xCoord)
      );
      processedDataTable.dataTableData[i].xUncertainty =
        dataTable.dataTableData[i].xUncertainty;
    }

    if (dataTableFullYCoordinateExists(dataTable, i)) {
      processedDataTable.dataTableData[i].yCoord = processYDataPoint(
        dataTable,
        i
      );
      processedDataTable.dataTableData[i].yUncertainty = processYUncertainty(
        dataTable,
        i
      );
    }

    var id = mongoose.Types.ObjectId();
    processedDataTable.dataTableData[i]._id = id;
  }

  return processedDataTable;
}

function updateProcessedDataTable(processedDataTable, rawDataTable) {
  // include rawDataTable as a parameter since it contains the curve straightening instructions
  for (var i = 0; i < processedDataTable.dataTableData.length; ++i) {
    if (dataTableFullXCoordinateExists(rawDataTable, i)) {
      if (rawDataTable.xCurveStraighteningInstructions.constantPower) {
        processedDataTable.dataTableData[i].xCoord = returnRealValuesOnly(
          math.pow(
            rawDataTable.dataTableData[i].xCoord,
            math.evaluate(
              rawDataTable.xCurveStraighteningInstructions.constantPower
            )
          )
        );
        processedDataTable.dataTableData[i].xUncertainty =
          rawDataTable.dataTableData[i].xUncertainty;
      }
      if (rawDataTable.xCurveStraighteningInstructions.functionClass === "x") {
        processedDataTable.dataTableData[i].xCoord =
          rawDataTable.dataTableData[i].xCoord;
        processedDataTable.dataTableData[i].xUncertainty =
          rawDataTable.dataTableData[i].xUncertainty;
      }
      if (
        rawDataTable.xCurveStraighteningInstructions.functionClass === "ln(x)"
      ) {
        processedDataTable.dataTableData[i].xCoord = returnRealValuesOnly(
          math.log(rawDataTable.dataTableData[i].xCoord)
        );
        processedDataTable.dataTableData[i].xUncertainty =
          rawDataTable.dataTableData[i].xUncertainty;
      }
    }

    if (dataTableFullYCoordinateExists(rawDataTable, i)) {
      processedDataTable.dataTableData[i].yCoord = processYDataPoint(
        rawDataTable,
        i
      );
      processedDataTable.dataTableData[i].yUncertainty = processYUncertainty(
        rawDataTable,
        i
      );
    }
  }
  return processedDataTable;
}

function returnRealValuesOnly(value) {
  if (math.im(value)) {
    return NaN;
  } else {
    return value;
  }
}

function dataTableFullXCoordinateExists(dataTable, index) {
  if (
    dataTable.dataTableData[index].xCoord &&
    dataTable.dataTableData[index].xUncertainty
  ) {
    return true;
  }
  return false;
}

function dataTableFullYCoordinateExists(dataTable, index) {
  if (
    dataTable.dataTableData[index].yCoord &&
    dataTable.dataTableData[index].yUncertainty
  ) {
    return true;
  }
  return false;
}

// process data point based on data table instructions
function processYDataPoint(dataTable, index) {
  if (dataTable.yCurveStraighteningInstructions.constantPower) {
    return returnRealValuesOnly(
      math.pow(
        dataTable.dataTableData[index].yCoord,
        math.evaluate(dataTable.yCurveStraighteningInstructions.constantPower)
      )
    );
  }
  if (dataTable.yCurveStraighteningInstructions.functionClass === "y") {
    return dataTable.dataTableData[index].yCoord;
  }
  if (dataTable.yCurveStraighteningInstructions.functionClass === "ln(y)") {
    return returnRealValuesOnly(
      math.log(dataTable.dataTableData[index].yCoord)
    );
  }
}

// process uncertainty based on data table instructions
function processYUncertainty(dataTable, index) {
  // WIP
  if (dataTable.dataTableData[index].yUncertainty) {
    return dataTable.dataTableData[index].yUncertainty;
  }
}
