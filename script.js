//browserify script.js -o bundle.js

var container = document.getElementById('spreadsheet');
var myData = Handsontable.helper.createSpreadsheetData(5, 2);

var hotStart = new Handsontable(container, {
  data: myData,
  rowHeaders: true,
  colHeaders: true,
  colHeaders: ['Manipulated', 'Responding'],
  filters: true,
  dropdownMenu: true,
  fillHandle: {
    direction: 'vertical',
    autoInsertRow: true,
  },
  manualColumnResize: true,
  manualRowResize: true,
  maxCols: 2,
  licenseKey: 'non-commercial-and-evaluation'
});
