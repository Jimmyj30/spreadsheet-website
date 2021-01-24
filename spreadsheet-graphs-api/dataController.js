// dataController.js

// Import data model
DataPoint = require("./dataPointModel");

// Handle index actions
exports.index = function (req, res) {
  DataPoint.get(function (err, dataPoints) {
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
      data: dataPoints,
    });
  });
};

// Handle create data point actions
exports.new = function (req, res) {
  var dataPoint = new DataPoint();
  dataPoint.name = req.body.name ? req.body.name : dataPoint.name;
  dataPoint.gender = req.body.gender;
  dataPoint.email = req.body.email;
  dataPoint.phone = req.body.phone;
  // save the data point and check for errors
  dataPoint.save(function (err) {
    if (err) res.json(err);
    else {
    }
    res.json({
      message: "New data point created!",
      data: dataPoint,
    });
  });
};

// Handle view data point info
exports.view = function (req, res) {
  DataPoint.findById(req.params.dataPoint_id, function (err, dataPoint) {
    if (err) res.send(err);
    res.json({
      message: "data point details loading..",
      data: dataPoint,
    });
  });
};

// Handle update data point info
exports.update = function (req, res) {
  DataPoint.findById(req.params.dataPoint_id, function (err, dataPoint) {
    if (err) res.send(err);
    else {
    }

    dataPoint.name = req.body.name ? req.body.name : dataPoint.name;
    dataPoint.gender = req.body.gender;
    dataPoint.email = req.body.email;
    dataPoint.phone = req.body.phone;
    // save the data point and check for errors
    dataPoint.save(function (err) {
      if (err) res.json(err);
      else {
      }

      res.json({
        message: "data point Info updated",
        data: dataPoint,
      });
    });
  });
};

// Handle delete data point
exports.delete = function (req, res) {
  DataPoint.remove(
    {
      _id: req.params.dataPoint_id,
    },
    function (err, dataPoint) {
      if (err) res.send(err);
      else {
      }

      res.json({
        status: "success",
        message: "data point deleted",
      });
    }
  );
};

// Commands...
// GET /api/data-points will list all data points
// POST /api/data-points will make a new data point
// GET /api/data-points/{id} will list a single data point
// PUT /api/data-points/{id} update a single data point
// DELETE /data-points/contacts/{id} will delete a single data point

// - req and res mean...
//
