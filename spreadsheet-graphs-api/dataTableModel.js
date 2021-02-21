// dataTablesModel.js
var mongoose = require("mongoose");
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
  // xCurveStraighteningInstructions: Instruction,
  // yCurveStraighteningInstructions: Instruction
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
