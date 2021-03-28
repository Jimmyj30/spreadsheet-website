import { Component, OnInit } from '@angular/core';
import * as Handsontable from 'handsontable';

import { DataTableService } from '../shared/data-table.service';
import { DataTable } from './data-table.model';

@Component({
  selector: 'app-data-tables',
  templateUrl: './data-tables.component.html',
  styleUrls: ['./data-tables.component.css'],
})
export class DataTablesComponent implements OnInit {
  // https://handsontable.com/docs/8.3.2/tutorial-data-sources.html
  // (Object data source with custom data schema section)

  // https://stackoverflow.com/questions/46007985/refresh-handsontable-angular-4
  // use @ViewChild and refresh the new handsontable....

  // to run locally: ng serve --proxy-config proxy.conf.json

  rawData: any[] = Handsontable.default.helper.createSpreadsheetData(10, 4);
  rawDataTableSettings: Handsontable.default.GridSettings;

  processedData: any[];
  processedDataTableSettings: Handsontable.default.GridSettings;
  processedDataTable: DataTable;

  constructor(private readonly dataTableService: DataTableService) {
    this.rawDataTableSettings = {
      data: this.rawData,
      rowHeaders: true,
      colHeaders: [
        'Uncertainties for Manipulated',
        'Manipulated',
        'Responding',
        'Uncertainties for Responding',
      ],
      columns: [{ data: 0 }, { data: 1 }, { data: 2 }, { data: 3 }],

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
    let rawDataColumnsArray = this.flipArrayOrientation(this.rawData);
    let rawDataTable = new DataTable({
      xUncertainties: rawDataColumnsArray[0],
      xCoords: rawDataColumnsArray[1],
      yCoords: rawDataColumnsArray[2],
      yUncertainties: rawDataColumnsArray[3],
      _id: this.processedDataTable ? this.processedDataTable._id : undefined,
    });
    console.log('rawDataTable: ');
    console.log(rawDataTable);

    // update this to better reflect how the responses should be organized...
    // if rawDataTable has an ID, then update the table in question
    // and display the affected rawDataTable as the processedDataTable...

    if (this.processedDataTable && this.processedDataTable._id) {
      this.dataTableService
        .updateDataTable(rawDataTable)
        .subscribe((response: any) => {
          console.log('response: ');
          console.log(response);
          this.updateProcessedDataTableSettings(response.data);
        });
    } else {
      this.dataTableService
        .createDataTable(rawDataTable)
        .subscribe((response: any) => {
          console.log('response: ');
          console.log(response);
          this.processedDataTable = response.data;
          this.createProcessedDataTableSettings(this.processedDataTable);
        });
    }
  }

  private flipArrayOrientation(array) {
    // turns a 2D array of rows into a 2D array of columns, and
    // turns a 2D array of columns into a 2D array of rows
    if (array && array[0]) {
      let flippedArray = [];
      for (let i = 0; i < array[0].length; i++) {
        if (!flippedArray[i]) {
          flippedArray.push([]);
        }
        for (let j = 0; j < array.length; j++) {
          flippedArray[i].push(array[j][i]);
        }
      }
      return flippedArray;
    }
  }

  private createProcessedDataTableSettings(dataTable: DataTable) {
    let arrayOfColumns = [
      dataTable.xUncertainties,
      dataTable.xCoords,
      dataTable.yCoords,
      dataTable.yUncertainties,
    ];

    this.processedDataTableSettings = this.rawDataTableSettings;
    this.processedDataTableSettings.data = this.flipArrayOrientation(
      arrayOfColumns
    );
    this.processedDataTableSettings.colHeaders = [
      'Uncertainties for Manipulated',
      'Manipulated',
      'Responding',
      'Uncertainties for Responding',
    ];
  }

  private updateProcessedDataTableSettings(dataTable: DataTable) {
    let arrayOfColumns = [
      dataTable.xUncertainties,
      dataTable.xCoords,
      dataTable.yCoords,
      dataTable.yUncertainties,
    ];
    this.processedDataTableSettings.data = this.flipArrayOrientation(
      arrayOfColumns
    );

    console.log('updated data table: ');
    console.log(this.processedDataTableSettings);
  }
}
