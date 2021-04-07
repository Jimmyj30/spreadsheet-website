// dataTablesModel.js
var mongoose = require("mongoose");
// https://mongoosejs.com/docs/schematypes.html#arrays

// curve straightening instructions...
const Instruction = new mongoose.Schema({
  //"type" of function -- eg: LOG_BASE_E, LOG_BASE_10, TO_CONST_POWER, MULTIPLIED_BY_CONSTANT_VARIABLE...
  functionClass: {
    type: String,
    required: true,
  },
  constantPower: {
    type: String, // will get processed as a number in the backend
  },
  constantVariableValue: {
    type: Number,
  },
  constantVariableUncertainty: {
    type: Number,
  },
});

// data points (one "row" of a data table)...
const dataPoint = new mongoose.Schema({
  xCoord: {
    type: Number,
    required: true,
  },
  yCoord: {
    type: Number,
    required: true,
  },
  xUncertainty: {
    type: Number,
    required: true,
  },
  yUncertainty: {
    type: Number,
    required: true,
  },
});

module.exports.Instruction = Instruction;
module.exports.dataPoint = dataPoint;

// Setup schema
var dataTableSchema = mongoose.Schema({
  dataTableData: {
    // the numeric data stored in the data table
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
    type: Instruction,
  },
  yCurveStraighteningInstructions: {
    // curve straightening instructions for each "y" coordinate
    type: Instruction,
  },
  create_date: {
    type: Date,
    default: Date.now,
  },

  // ******* old data format for the table *************
  // xCoords: {
  //   // “x” coordinates of the data table
  //   type: Array,
  //   required: true,
  // },
  // yCoords: {
  //   // “y” coordinates of the data table
  //   type: Array,
  //   required: true,
  // },
  // xUncertainties: {
  //   // uncertainties corresponding to each “x” coordinate
  //   type: Array,
  //   required: true,
  // },
  // yUncertainties: {
  //   // uncertainties corresponding to each “y” coordinate
  //   type: Array,
  //   required: true,
  // },
});

// Export data table model
// Mongoose automatically looks for the plural, lowercased version of your model name as the collection name
var DataTable = (module.exports = mongoose.model("dataTable", dataTableSchema));

module.exports.get = function (callback, limit) {
  DataTable.find(callback).limit(limit);
};
