//browserify script.js -o bundle.js

var container_1 = document.getElementById('spreadsheet_1');
var container_2 = document.getElementById('spreadsheet_2');
var myData = Handsontable.helper.createSpreadsheetData(5, 2);

var linkedHot = new Handsontable(container_2, {
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


  //linkedHot will always need an extra row...

  afterCreateRow: function(index,amount){
  //updatesettings

  },

  manualColumnResize: true,
  manualRowResize: true,
  maxCols: 2,
  licenseKey: 'non-commercial-and-evaluation'
});

var hotStart = new Handsontable(container_1, {
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


  //linkedHot is the "second" spreadsheet (it is below "hotStart")
  //if this data is changed, linkedHot will change...
  afterChange: function(changes,source){
  linkedHot.render();

  },
  
  afterCreateRow: function(index,amount){
  linkedHot.render();
  //inserts a row after the last row...(that's what the 'Nothing' parameter does)
  linkedHot.alter('insert_row', 'Nothing');
  },

  manualColumnResize: true,
  manualRowResize: true,
  maxCols: 2,
  licenseKey: 'non-commercial-and-evaluation'
});



/*
function getCarData() {
  return [{
    car: "VW Passat",
    year: 2001,
    price_usd: 7000
  }, {
    car: "Hyundai Coupe",
    year: 2002,
    price_usd: 8330
  }, {
    car: "VW Polo",
    year: 1996,
    price_usd: 3900
  }];
}

var
  container = document.getElementById('example1'),
  hot;

hot = new Handsontable(container, {
  data: getCarData(),
  colHeaders: ['Car', 'Year', 'Price USD'],
  rowHeaders: true,
  readOnly: true,
  outsideClickDeselects: false,
  afterSelection: function(r, c, r2, c2) {
    if (r === 0) {
      hot2.updateSettings({
        data: [
          ['yellow', true],
          ['red', false],
          ['blue', false]
        ]
      })
    } else if (r === 1) {
      hot2.updateSettings({
        data: [
          ['black', true]
        ]
      })
    } else if (r === 2) {
      hot2.updateSettings({
        data: [
          ['green', false],
          ['blue', false],
          ['red', true],
          ['black', true]
        ]
      })
    }
  },
  currentRowClassName: 'currentRow',
});

var
  container2 = document.getElementById('example2'),
  hot2;

hot2 = new Handsontable(container2, {
  data: Handsontable.helper.createSpreadsheetData(2, 2),
  colHeaders: ['Chassis color', 'ABS'],
  readOnly: true,
  columns: [
    {},{ type:'checkbox' }
  ]
});

*/
