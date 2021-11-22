import { Injectable } from '@angular/core';
import { DataPoint } from '../data-tables/models/data-point.model';

import { DataTable } from '../data-tables/models/data-table.model';
import { DataStorageService } from './data-storage.service';

@Injectable({ providedIn: 'root' })
export class DataTableService {
  constructor(private api: DataStorageService) {}

  createDataTable(dataTable: DataTable) {
    return this.api.createDataTable(dataTable);
  }

  updateDataTable(dataTable: DataTable) {
    return this.api.updateDataTable(dataTable);
  }

  deleteDataTable(dataTable: DataTable) {
    return this.api.deleteDataTable(dataTable);
  }

  getDataTableFromLoggedInUser() {
    return this.api.getDataTableByFirebaseUid();
  }

  generateDefaultDataTable(dataTableArray: any[]): DataTable[] {
    let defaultDataTable = [];
    for (var i = 0; i < dataTableArray.length; ++i) {
      let row = new DataPoint({
        xUncertainty: dataTableArray[i][0],
        xCoord: dataTableArray[i][1],
        yCoord: dataTableArray[i][2],
        yUncertainty: dataTableArray[i][3],
      });
      defaultDataTable.push(row);
    }
    // console.log('default data table data');
    // console.log(defaultDataTable);
    return defaultDataTable;
  }

  // https://handsontable.com/docs/8.3.2/frameworks-wrapper-for-angular-hot-reference.html
  // dataArray is a 2D array of strings
  isHandsontableValid(dataArray): boolean {
    // go through all the entries and determine if they are real numbers
    if (dataArray) {
      let rowCount = dataArray.length;
      let colCount = dataArray[0].length;
      for (var i = 0; i < rowCount; ++i) {
        for (var j = 0; j < colCount; ++j) {
          let value = Number(dataArray[i][j]);
          // if value is a falsy value except the number 0, or if value is not a real number
          if (
            (dataArray[i][j] !== 0 && !dataArray[i][j]) ||
            !(typeof value === 'number' && !isNaN(value) && isFinite(value))
          ) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  dataTableDefaultColumnValues = [
    {
      data: 'xUncertainty',
      type: 'numeric',
      numericFormat: {
        pattern: {
          mantissa: 2,
        },
      },
      allowEmpty: false,
    },
    {
      data: 'xCoord',
      type: 'numeric',
      numericFormat: {
        pattern: {
          mantissa: 2,
        },
      },
      allowEmpty: false,
    },
    {
      data: 'yCoord',
      type: 'numeric',
      numericFormat: {
        pattern: {
          mantissa: 2,
        },
      },
      allowEmpty: false,
    },
    {
      data: 'yUncertainty',
      type: 'numeric',
      numericFormat: {
        pattern: {
          mantissa: 2,
        },
      },
      allowEmpty: false,
    },
  ];
}
