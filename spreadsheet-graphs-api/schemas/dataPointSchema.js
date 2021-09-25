var mongoose = require("mongoose");

// represents a data point (x,y) containing
// x,y coordinates and their respective uncertainties
const dataPoint = mongoose.Schema({
  xCoord: {
    type: String,
    // required: true,
  },
  yCoord: {
    type: String,
    required: true,
  },
  xUncertainty: {
    type: String,
    // required: true,
  },
  yUncertainty: {
    type: String,
    required: true,
  },
});

exports.dataPoint = dataPoint;
