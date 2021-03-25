import { Component, OnInit } from '@angular/core';
import * as Handsontable from 'handsontable';

@Component({
  selector: 'app-data-tables',
  templateUrl: './data-tables.component.html',
  styleUrls: ['./data-tables.component.css'],
})
export class DataTablesComponent implements OnInit {
  rawData: any[] = Handsontable.default.helper.createSpreadsheetData(5, 2);
  rawDataTableSettings: Handsontable.default.GridSettings;
  processedDataTableSettings: Handsontable.default.GridSettings;
  processedData: any[];

  constructor() {
    this.rawDataTableSettings = {
      rowHeaders: true,
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
      licenseKey: 'non-commercial-and-evaluation',
    };

    this.processedDataTableSettings = {
      // settings for the procesed data table
      // after processed data is changed: reload data
    };
  }

  ngOnInit(): void {
    console.log(this.rawDataTableSettings);
  }

  onSubmit() {
    console.log('raw data: ');
    console.log(this.rawData);
  }
}
