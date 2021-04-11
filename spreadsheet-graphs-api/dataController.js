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
      dataTable.yCurveStraighteningInstructions.constantPower &&
      dataTableFullYCoordinateExists(dataTable, i)
    ) {
      processedDataTable.dataTableData[i].yCoord = returnRealValuesOnly(
        math.pow(
          dataTable.dataTableData[i].yCoord,
          math.evaluate(dataTable.yCurveStraighteningInstructions.constantPower)
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
    if (
      dataTable.yCurveStraighteningInstructions.functionClass === "ln(y)" &&
      dataTableFullYCoordinateExists(dataTable, i)
    ) {
      processedDataTable.dataTableData[i].yCoord = returnRealValuesOnly(
        math.log(dataTable.dataTableData[i].yCoord)
      );
      processedDataTable.dataTableData[i].yUncertainty =
        dataTable.dataTableData[i].yUncertainty;
    }

    var id = mongoose.Types.ObjectId();
    processedDataTable.dataTableData[i]._id = id;
  }

  return processedDataTable;
}

function updateProcessedDataTable(processedDataTable, rawDataTable) {
  // include rawDataTable as a parameter since it contains the curve straightening instructions
  for (var i = 0; i < processedDataTable.dataTableData.length; ++i) {
    if (
      rawDataTable.xCurveStraighteningInstructions.constantPower &&
      dataTableFullXCoordinateExists(rawDataTable, i)
    ) {
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
    if (
      rawDataTable.yCurveStraighteningInstructions.constantPower &&
      dataTableFullYCoordinateExists(rawDataTable, i)
    ) {
      processedDataTable.dataTableData[i].yCoord = returnRealValuesOnly(
        math.pow(
          rawDataTable.dataTableData[i].yCoord,
          math.evaluate(
            rawDataTable.yCurveStraighteningInstructions.constantPower
          )
        )
      );
      processedDataTable.dataTableData[i].yUncertainty =
        rawDataTable.dataTableData[i].yUncertainty;
    }
    if (
      rawDataTable.xCurveStraighteningInstructions.functionClass === "x" &&
      dataTableFullXCoordinateExists(rawDataTable, i)
    ) {
      processedDataTable.dataTableData[i].xCoord =
        rawDataTable.dataTableData[i].xCoord;
      processedDataTable.dataTableData[i].xUncertainty =
        rawDataTable.dataTableData[i].xUncertainty;
    }
    if (
      rawDataTable.yCurveStraighteningInstructions.functionClass === "y" &&
      dataTableFullYCoordinateExists(rawDataTable, i)
    ) {
      processedDataTable.dataTableData[i].yCoord =
        rawDataTable.dataTableData[i].yCoord;
      processedDataTable.dataTableData[i].yUncertainty =
        rawDataTable.dataTableData[i].yUncertainty;
    }
    if (
      rawDataTable.xCurveStraighteningInstructions.functionClass === "ln(x)" &&
      dataTableFullXCoordinateExists(rawDataTable, i)
    ) {
      processedDataTable.dataTableData[i].xCoord = returnRealValuesOnly(
        math.log(rawDataTable.dataTableData[i].xCoord)
      );
      processedDataTable.dataTableData[i].xUncertainty =
        rawDataTable.dataTableData[i].xUncertainty;
    }
    if (
      rawDataTable.yCurveStraighteningInstructions.functionClass === "ln(y)" &&
      dataTableFullYCoordinateExists(rawDataTable, i)
    ) {
      processedDataTable.dataTableData[i].yCoord = returnRealValuesOnly(
        math.log(rawDataTable.dataTableData[i].yCoord)
      );
      processedDataTable.dataTableData[i].yUncertainty =
        rawDataTable.dataTableData[i].yUncertainty;
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
  // coordinateAxis is either "x" or "y"
  if (
    dataTable.dataTableData[index].xCoord &&
    dataTable.dataTableData[index].xCoord
  ) {
    return true;
  }
  return false;
}

function dataTableFullYCoordinateExists(dataTable, index) {
  // coordinateAxis is either "x" or "y"
  if (
    dataTable.dataTableData[index].yCoord &&
    dataTable.dataTableData[index].yCoord
  ) {
    return true;
  }
  return false;
}
