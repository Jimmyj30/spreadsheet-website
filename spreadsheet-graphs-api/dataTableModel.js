// dataTablesModel.js
var mongoose = require("mongoose");
const { dataPoint } = require("./schemas/dataPointSchema.js");
const { instruction } = require("./schemas/instructionSchema.js");

// https://mongoosejs.com/docs/schematypes.html#arrays

// Setup schema
var dataTableSchema = mongoose.Schema({
  dataTableData: {
    // the numeric data stored in the data table
    // array of dataPoints that represent the "rows" of the data table
    type: [dataPoint],
    required: true,
    validate(array) {
      return array.every(
        (v) => v.xCoord && v.yCoord && v.xUncertainty && v.yUncertainty
      );
    },
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

// dataTableSchema.statics.testMethod = function () {
//   console.log("test");
// };

// Export data table model
// Mongoose automatically looks for the plural, lowercased version of your model name as the collection name
var DataTable = (module.exports = mongoose.model("dataTable", dataTableSchema));

// https://stackoverflow.com/questions/58172762/how-to-export-multiple-schemas-in-same-file-in-mongoose

// export dataPoint if it is needed later
// module.exports.DataPoint = mongoose.model("dataPoint", dataPoint);

module.exports.get = function (callback, limit) {
  DataTable.find(callback).limit(limit);
};
