// dataTablesModel.js
var mongoose = require("mongoose");
// https://mongoosejs.com/docs/schematypes.html#arrays

const Instruction = new mongoose.Schema({
  //"type" of function -- eg: LOG_BASE_E, LOG_BASE_10, TO_CONST_POWER, MULTIPLIED_BY_CONSTANT_VARIABLE...
  functionClass: {
    type: String,
    required: true,
  },
  constantPower: {
    type: Number,
  },
  constantVariableValue: {
    type: Number,
  },
  constantVariableUncertainty: {
    type: Number,
  },
});

module.exports.Instruction = Instruction;

// Setup schema
var dataTableSchema = mongoose.Schema({
  xCoords: {
    // “x” coordinates of the data table
    type: Array,
    required: true,
  },
  yCoords: {
    // “y” coordinates of the data table
    type: Array,
    required: true,
  },
  xUncertainties: {
    // uncertainties corresponding to each “x” coordinate
    type: Array,
    required: true,
  },
  yUncertainties: {
    // uncertainties corresponding to each “y” coordinate
    type: Array,
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
});
// Export data table model
var DataTable = (module.exports = mongoose.model("dataTable", dataTableSchema));

module.exports.get = function (callback, limit) {
  DataTable.find(callback).limit(limit);
};
