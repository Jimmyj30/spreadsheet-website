// WIP
// Import math.js
// https://mathjs.org/examples/expressions.js.html
var math = require("mathjs");

// *******************************************
// **** general utility helper functions *****
// *******************************************
function returnRealValuesOnly(value) {
  if (math.im(value)) {
    return NaN;
  } else {
    return value;
  }
}

function isRealNumber(value) {
  if (!(typeof value === "string" || typeof value === "number")) {
    return false; // only process strings or numbers
  }
  if (!isNaN(value) && isFinite(value)) {
    return true;
  } else {
    return false;
  }
}

// ****************************************************************
// ******** utility functions for processing data table data ******
// ****************************************************************

// ********** full coordinate exists function ************
exports.dataTableFullCoordinateExists = function (dataTable, index, coordVar) {
  // coordVariable has to be either  "x" or "y"
  // we are accessing dataTable.dataTableData[index].xCoord or
  // dataTable.dataTableData[index].yCoord this way
  if (
    isRealNumber(dataTable.dataTableData[index][`${coordVar}Coord`]) &&
    isRealNumber(dataTable.dataTableData[index][`${coordVar}Uncertainty`])
  ) {
    return true;
  }
  return false;
};

// ****** process Coordinate function *********
exports.processCoordinate = function (dataTable, index, coordVar) {
  // coordVariable has to be either  "x" or "y"
  // we are accessing xCoord or yCoord properties this way
  if (!dataTable[`${coordVar}CurveStraighteningInstructions`]) {
    return dataTable.dataTableData[index][`${coordVar}Coord`];
  }
  if (
    dataTable[`${coordVar}CurveStraighteningInstructions`].constantPower &&
    dataTable[`${coordVar}CurveStraighteningInstructions`].functionClass ===
      `${coordVar}^a`
  ) {
    return returnRealValuesOnly(
      math.pow(
        dataTable.dataTableData[index][`${coordVar}Coord`],
        math.evaluate(
          dataTable[`${coordVar}CurveStraighteningInstructions`].constantPower
        )
      )
    );
  }
  if (
    dataTable[`${coordVar}CurveStraighteningInstructions`].functionClass ===
    `${coordVar}`
  ) {
    return dataTable.dataTableData[index][`${coordVar}Coord`];
  }
  if (
    dataTable[`${coordVar}CurveStraighteningInstructions`].functionClass ===
    `ln(${coordVar})`
  ) {
    return returnRealValuesOnly(
      math.log(dataTable.dataTableData[index][`${coordVar}Coord`])
    );
  }
  if (
    dataTable[`${coordVar}CurveStraighteningInstructions`].functionClass ===
    `log_10(${coordVar})`
  ) {
    return returnRealValuesOnly(
      math.log10(dataTable.dataTableData[index][`${coordVar}Coord`])
    );
  }
  // if instruction doesn't match any case, return original value
  return dataTable.dataTableData[index][`${coordVar}Coord`];
};

// ******* process Uncertainty function **********
exports.processUncertainty = function (dataTable, index, coordVar) {
  // coordVariable has to be either  "x" or "y"
  // we are accessing xCoord or yCoord properties this way
  if (!dataTable[`${coordVar}CurveStraighteningInstructions`]) {
    return math.abs(dataTable.dataTableData[index][`${coordVar}Uncertainty`]);
  }
  if (
    dataTable[`${coordVar}CurveStraighteningInstructions`].constantPower &&
    dataTable[`${coordVar}CurveStraighteningInstructions`].functionClass ===
      `${coordVar}^a`
  ) {
    const processedCoordinateValue = returnRealValuesOnly(
      math.pow(
        dataTable.dataTableData[index][`${coordVar}Coord`],
        math.evaluate(
          dataTable[`${coordVar}CurveStraighteningInstructions`].constantPower
        )
      )
    );
    return math.abs(
      returnRealValuesOnly(
        math
          .chain(dataTable.dataTableData[index][`${coordVar}Uncertainty`])
          .divide(dataTable.dataTableData[index][`${coordVar}Coord`])
          .multiply(
            math.evaluate(
              dataTable[`${coordVar}CurveStraighteningInstructions`]
                .constantPower
            )
          )
          .multiply(processedCoordinateValue)
          .done()
      )
    );
  }
  if (
    dataTable[`${coordVar}CurveStraighteningInstructions`].functionClass ===
    `${coordVar}`
  ) {
    return math.abs(dataTable.dataTableData[index][`${coordVar}Uncertainty`]);
  }
  if (
    dataTable[`${coordVar}CurveStraighteningInstructions`].functionClass ===
    `ln(${coordVar})`
  ) {
    return math.abs(
      returnRealValuesOnly(
        math.divide(
          dataTable.dataTableData[index][`${coordVar}Uncertainty`],
          dataTable.dataTableData[index][`${coordVar}Coord`]
        )
      )
    );
  }
  if (
    dataTable[`${coordVar}CurveStraighteningInstructions`].functionClass ===
    `log_10(${coordVar})`
  ) {
    return math.abs(
      returnRealValuesOnly(
        math.divide(
          dataTable.dataTableData[index][`${coordVar}Uncertainty`],
          math.multiply(
            dataTable.dataTableData[index][`${coordVar}Coord`],
            math.log(10)
          )
        )
      )
    );
  }
  // if instruction doesn't match any case, return original value
  return math.abs(dataTable.dataTableData[index][`${coordVar}Uncertainty`]);
};
