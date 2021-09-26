// dataTablesModel.js
var mongoose = require("mongoose");
const { dataPoint } = require("./schemas/dataPointSchema.js");
const { instruction } = require("./schemas/instructionSchema.js");
const {
  dataTableFullCoordinateExists,
  processCoordinate,
  processUncertainty,
} = require("./utils/dataProcessingUtils");

// https://mongoosejs.com/docs/schematypes.html#arrays

// Setup schema
var dataTableSchema = mongoose.Schema({
  dataTableData: {
    // the numeric data stored in the data table
    // array of dataPoints that represent the "rows" of the data table
    type: [dataPoint],
    required: true,
  },
  xLabel: {
    // label for the x-axis
    type: String,
  },
  yLabel: {
    // label for the y-axis
    type: String,
  },
  xCurveStraighteningInstructions: {
    // curve straightening instructions for each "x" coordinate
    type: instruction,
  },
  yCurveStraighteningInstructions: {
    // curve straightening instructions for each "y" coordinate
    type: instruction,
  },
  create_date: {
    type: Date,
    default: Date.now,
  },
});

dataTableSchema.methods.generateProcessedDataTable = function (dataTable) {
  return generateProcessedDataTable(dataTable);
};

function generateProcessedDataTable(dataTable) {
  let processedDataTable = new DataTable();

  // copy over processedDataTable's data as the raw data table's data
  // which will be overwritten by later functions
  processedDataTable.dataTableData = dataTable.dataTableData;

  for (var i = 0; i < dataTable.dataTableData.length; ++i) {
    if (dataTableFullCoordinateExists(dataTable, i, "x")) {
      processedDataTable.dataTableData[i].xCoord = processCoordinate(
        dataTable,
        i,
        "x"
      );
      processedDataTable.dataTableData[i].xUncertainty = processUncertainty(
        dataTable,
        i,
        "x"
      );
    }
    if (dataTableFullCoordinateExists(dataTable, i, "y")) {
      processedDataTable.dataTableData[i].yCoord = processCoordinate(
        dataTable,
        i,
        "y"
      );
      processedDataTable.dataTableData[i].yUncertainty = processUncertainty(
        dataTable,
        i,
        "y"
      );
    }

    var id = mongoose.Types.ObjectId();
    processedDataTable.dataTableData[i]._id = id;
  }

  return processedDataTable;
}

// Export data table model
// Mongoose automatically looks for the plural, lowercased version of your model name as the collection name
var DataTable = (module.exports = mongoose.model("dataTable", dataTableSchema));

// https://stackoverflow.com/questions/58172762/how-to-export-multiple-schemas-in-same-file-in-mongoose

// export dataPoint if it is needed later
// module.exports.DataPoint = mongoose.model("dataPoint", dataPoint);

module.exports.get = function (callback, limit) {
  DataTable.find(callback).limit(limit);
};
