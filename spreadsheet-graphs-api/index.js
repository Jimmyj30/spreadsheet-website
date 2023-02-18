// Import CORS
const cors = require("cors");
// Import express
let express = require("express");
// Import Mongoose
let mongoose = require("mongoose");
// Initialize the app
let app = express();
app.use(cors());

// Load env vars
require("dotenv").config();

// Import routes
let apiRoutes = require("./api-routes");

// Import auth
let decodeIDToken = require("./middleware/authenticateToken");

// Deploy on Heroku: https://developer.mongodb.com/how-to/use-atlas-on-heroku/
// https://devcenter.heroku.com/articles/deploying-nodejs

// Body parser now depreciated: use "express" to handle requests instead
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(decodeIDToken);

// Connect to Mongoose and set connection variable
const localhost = "127.0.0.1";
const uri =
  process.env.MONGODB_URI ||
  `mongodb://${localhost}:27017/spreadsheet-graphs-api`;
mongoose.set("strictQuery", false);
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Added check for DB connection
let db = mongoose.connection;
db.on("connected", () => console.log("Connected"));
db.on("error", (err) => console.log("Connection failed with - ", err));

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
