// dataPointsModel.js
var mongoose = require("mongoose");
// Setup schema
var dataPointSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: String,
  phone: String,
  create_date: {
    type: Date,
    default: Date.now,
  },
});
// Export data point model
var DataPoint = (module.exports = mongoose.model("dataPoint", dataPointSchema));

module.exports.get = function (callback, limit) {
  DataPoint.find(callback).limit(limit);
};
