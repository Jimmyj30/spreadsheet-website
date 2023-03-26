// check if an error exists
exports.checkError = function (
  error,
  auth,
  dataTable,
  checkDataTable = false,
  matchUid = false
) {
  if (error || !auth) {
    return true;
  }
  if (checkDataTable && !dataTable) {
    return true;
  }
  if (matchUid && auth.uid !== dataTable?.firebase_uid) {
    return true;
  }
  return false;
};

// send error responses
exports.getError = function (
  error,
  auth,
  dataTable,
  checkDataTable = false,
  matchUid = false
) {
  let statusCode;
  let statusMessage;

  if (!auth) {
    statusCode = 401;
    statusMessage = "401 unauthorized";
  } else if (error) {
    statusCode = 400;
    statusMessage = error;
  } else if (checkDataTable && !dataTable) {
    statusCode = 404;
    statusMessage = "404 data table not found";
  } else if (matchUid && auth.uid !== dataTable?.firebase_uid) {
    statusCode = 403;
    statusMessage = "403 unauthorized";
  } else {
    statusCode = 500;
    statusMessage = "500 internal server error";
  }

  return {
    statusCode: statusCode,
    status: "error " + statusCode,
    message: statusMessage,
  };
};
