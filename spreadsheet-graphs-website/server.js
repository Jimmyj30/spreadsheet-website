// server.js (for Heroku deployment)

// Require Express.js server and create Express.js app
const express = require("express");
const compression = require("compression"); //use gzip to compress files
const path = require("path");
const app = express();

// If an incoming request uses a protocol other than HTTPS,
// redirect that request to the same url but with HTTPS
const forceSSL = function () {
  return function (req, res, next) {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(["https://", req.get("Host"), req.url].join(""));
    }
    next();
  };
};

// Instruct the app to use forceSSL (forcing HTTPS on all web traffic)
app.use(forceSSL());

// serve compressed files
app.use(compression());

// Run the app by serving the static files in the dist directory
// The dist directory will be made on postinstall, which will happen
// when the spreadsheet-graphs-website app is getting deployed to Heroku
app.use(express.static(__dirname + "/dist/spreadsheet-graphs-website"));

// For all GET requests (getting data that can be displayed on website),
// send back index.html so that PathLocationStrategy can be used
app.get("/*", function (req, res) {
  res.sendFile(
    path.join(__dirname + "/dist/spreadsheet-graphs-website/index.html")
  );
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
