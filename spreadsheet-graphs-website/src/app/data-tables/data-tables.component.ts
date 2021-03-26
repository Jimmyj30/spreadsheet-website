import { Component, OnInit } from '@angular/core';
import * as Handsontable from 'handsontable';

@Component({
  selector: 'app-data-tables',
  templateUrl: './data-tables.component.html',
  styleUrls: ['./data-tables.component.css'],
})
export class DataTablesComponent implements OnInit {
  rawData: any[] = Handsontable.default.helper.createSpreadsheetData(10, 4);
  rawDataTableSettings: Handsontable.default.GridSettings;
  processedDataTableSettings: Handsontable.default.GridSettings;
  processedData: any[];

  constructor() {
    this.rawDataTableSettings = {
      rowHeaders: true,
      colHeaders: [
        'Uncertainties for Manipulated',
        'Manipulated',
        'Responding',
        'Uncertainties for Responding',
      ],

      filters: true,
      dropdownMenu: true,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      manualColumnResize: true,
      manualRowResize: true,
      wordWrap: true,
      maxCols: 4,
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
