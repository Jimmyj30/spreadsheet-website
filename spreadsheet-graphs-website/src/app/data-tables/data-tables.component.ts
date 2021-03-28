import { Component, OnInit, ViewChild } from '@angular/core';
import { HotTableComponent } from '@handsontable/angular';
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
  rawDataTable: DataTable;

  processedData: any[];
  processedDataTableSettings: Handsontable.default.GridSettings;
  processedDataTable: DataTable;

  @ViewChild('processedDataTableRef', { static: false })
  processedDataTableRef: HotTableComponent;

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
  }

  ngOnInit(): void {
    console.log(this.rawDataTableSettings);
  }

  onSubmit() {
    let rawDataColumnsArray = this.flipArrayOrientation(this.rawData);
    this.rawDataTable = new DataTable({
      yUncertainties: rawDataColumnsArray[0],
      yCoords: rawDataColumnsArray[1],
      xCoords: rawDataColumnsArray[2],
      xUncertainties: rawDataColumnsArray[3],
      _id: this.processedDataTable ? this.processedDataTable._id : undefined,
    });
    console.log('rawDataTable: ');
    console.log(this.rawDataTable);

    // update this to better reflect how the responses should be organized...
    // if rawDataTable has an ID, then update the table in question
    // and display the affected rawDataTable as the processedDataTable...

    if (this.processedDataTable && this.processedDataTable._id) {
      // we are updating processedDataTable based on the ID of the rawDataTable...
      // we could have the API return a processedDataTable along with the ID of the raw data table...
      this.dataTableService
        .updateDataTable(this.rawDataTable)
        .subscribe((response: any) => {
          console.log('response: ');
          console.log(response);
          this.updateProcessedDataTableSettings(response.data);
        });
    } else {
      this.dataTableService
        .createDataTable(this.rawDataTable)
        .subscribe((response: any) => {
          console.log('response: ');
          console.log(response);

          // add an ID to the raw data table to indicate it is now stored in the database
          // return a processed data table as the response....

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
      dataTable.yUncertainties,
      dataTable.yCoords,
      dataTable.xCoords,
      dataTable.xUncertainties,
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
      dataTable.yUncertainties,
      dataTable.yCoords,
      dataTable.xCoords,
      dataTable.xUncertainties,
    ];
    this.processedDataTableSettings.data = this.flipArrayOrientation(
      arrayOfColumns
    );
    this.updateProcessedDataTable(this.processedDataTableSettings);

    console.log('updated data table: ');
    console.log(this.processedDataTableSettings);
  }

  private updateProcessedDataTable(settings) {
    this.processedDataTableRef.updateHotTable(settings);
  }
}
