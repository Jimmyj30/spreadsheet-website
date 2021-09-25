var mongoose = require("mongoose");

// curve straightening instructions...
const instruction = new mongoose.Schema({
  //"type" of function -- eg: LOG_BASE_E, LOG_BASE_10, TO_CONST_POWER, MULTIPLIED_BY_CONSTANT_VARIABLE...
  functionClass: {
    type: String,
    required: true,
  },
  // value that will get filled in if straightening a curve of type
  // y = x^a, where a is some constant power
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

exports.instruction = instruction;
