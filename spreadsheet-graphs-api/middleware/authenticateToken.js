//authenticateToken.js

var admin = require("firebase-admin");
var serviceAccount;

if (process?.env?.GOOGLE_CREDENTIALS) {
  serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
  serviceAccount = require("./serviceAccount.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function decodeIDToken(req, res, next) {
  const header = req.headers?.authorization;

  if (
    header !== "Bearer null" &&
    req.headers?.authorization?.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req["currentUser"] = decodedToken;
    } catch (err) {
      req["currentUser"] = undefined;
    }
  } else {
    req["currentUser"] = undefined;
  }
  next();
}

module.exports = decodeIDToken;
