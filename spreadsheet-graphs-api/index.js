// Import CORS
const cors = require("cors");
// Import express
let express = require("express");
// Import Mongoose
let mongoose = require("mongoose");
// Initialize the app
let app = express();
app.use(cors());

// Import routes
let apiRoutes = require("./api-routes");

// Deploy on Heroku: https://developer.mongodb.com/how-to/use-atlas-on-heroku/

// Body parser now depreciated: use "express" to handle requests instead
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Connect to Mongoose and set connection variable
const uri =
  process.env.MONGODB_URI || "mongodb://localhost/spreadsheet-graphs-api";
mongoose.connect(uri, {
  useNewUrlParser: true,
});
var db = mongoose.connection;

// Added check for DB connection
if (!db) console.log("Error connecting db");
else console.log("Db connected successfully");

// Setup server port
var port = process.env.PORT || 8080;

// Send message for default URL
app.get("/", (req, res) => res.send("Hello World with Express"));

// Use Api routes in the App
app.use("/api", apiRoutes);
// Launch app to listen to specified port
app.listen(port, function () {
  console.log("Running RestHub on port " + port);
});
