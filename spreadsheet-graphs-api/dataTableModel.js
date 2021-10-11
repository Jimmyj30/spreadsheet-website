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
  firebase_uid: {
    type: String,
    // required: true,
  },
});

dataTableSchema.methods.generateProcessedDataTable = function (dataTable) {
  return generateProcessedDataTable(dataTable);
};

// generates a data table and it will not be saved to mongoDB.
// It will be seen by the front end but not be saved to back end
// since it can be generated from the original data table
// and we can "calculate" what the processed data table would be
// as long as we have access to the original data table
function generateProcessedDataTable(dataTable) {
  let processedDataTable = new DataTable();

  // copy over processedDataTable's data as the raw data table's data
  // which will be overwritten by later functions
  processedDataTable.dataTableData = dataTable.dataTableData;
  processedDataTable = processedDataTable.toObject();

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

    // processedDataTable does not need an ID since it will
    // not need to be saved to backend
    delete processedDataTable.dataTableData[i]._id;
  }
  delete processedDataTable._id;

  return processedDataTable;
}

// TODO: add checking for if API request contains valid instructions and data
// https://stackoverflow.com/questions/58172762/how-to-export-multiple-schemas-in-same-file-in-mongoose

// Export data table model
// Mongoose automatically looks for the plural, lowercased version of your model name as the collection name
var DataTable = (module.exports = mongoose.model("dataTable", dataTableSchema));

module.exports.get = function (callback, limit) {
  DataTable.find(callback).limit(limit);
};

// export dataPoint if it is needed later
// module.exports.DataPoint = mongoose.model("dataPoint", dataPoint);
