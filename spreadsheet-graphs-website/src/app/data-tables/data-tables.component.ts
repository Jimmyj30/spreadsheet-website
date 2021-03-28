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
  processedDataTableSettings: Handsontable.default.GridSettings;
  processedData: any[];

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

  private generateArrayColumns(array) {
    if (array && array[0]) {
      let columnsArray = [];
      for (let i = 0; i < array[0].length; i++) {
        if (!columnsArray[i]) {
          columnsArray.push([]);
        }
        for (let j = 0; j < array.length; j++) {
          columnsArray[i].push(array[j][i]);
        }
      }
      return columnsArray;
    }
  }

  ngOnInit(): void {
    console.log(this.rawDataTableSettings);
  }

  onSubmit() {
    const rawDataColumnsArray = this.generateArrayColumns(this.rawData);
    const rawDataTable = new DataTable({
      xUncertainties: rawDataColumnsArray[0],
      xCoords: rawDataColumnsArray[1],
      yCoords: rawDataColumnsArray[2],
      yUncertainties: rawDataColumnsArray[3],
    });
    console.log(rawDataTable);

    this.dataTableService
      .createDataTable(rawDataTable)
      .subscribe((response) => {
        console.log('response: ');
        console.log(response);
      });
  }
}
