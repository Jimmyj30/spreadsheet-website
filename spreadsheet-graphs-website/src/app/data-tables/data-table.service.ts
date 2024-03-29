import { Injectable } from '@angular/core';
import { DataPoint } from './models/data-point.model';

import { DataTable } from './models/data-table.model';
import { Constants } from '../shared/constants';
import { DataStorageService } from '../shared/data-storage.service';
import { GridSettings } from 'handsontable/settings';

@Injectable({ providedIn: 'root' })
export class DataTableService {
  constructor(private api: DataStorageService) {}

  dataTableDefaultColumnValues = Constants.dataTableDefaultColumnValues;
  rawDataTableColHeaders = Constants.rawDataTableColHeaders;
  processedDataTableColHeaders = Constants.processedDataTableColHeaders;

  dataTableFormXOptions: string[] = ['x', 'ln(x)', 'log_10(x)', 'x^a'];
  dataTableFormYOptions: string[] = ['y', 'ln(y)', 'log_10(y)', 'y^a'];

  // "static" configuration settings
  // for the raw data table (and the processed one too)
  // in data-tables.component.ts
  dataTableStaticSettings: GridSettings = {
    filters: true,
    fillHandle: Constants.fillHandleSettings,
    manualColumnResize: true,
    manualRowResize: true,
    wordWrap: true,
    preventOverflow: 'horizontal',

    contextMenu: ['row_above', 'row_below', 'remove_row'],
    dropdownMenu: Constants.dropdownMenuItems,

    minRows: 5,
    maxCols: 4,
    licenseKey: 'non-commercial-and-evaluation',
  };

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

  generateDefaultDataTable(dataTableArray: any[]): DataPoint[] {
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

  generateRawDataTable(
    rawData,
    curveStraighteningInstructionsForm,
    rawDataTable
  ) {
    return new DataTable({
      dataTableData: rawData,

      xCurveStraighteningInstructions: {
        functionClass: this.removeFirstWord(
          curveStraighteningInstructionsForm.value
            .xCurveStraighteningInstructions
        ),
        constantPower:
          curveStraighteningInstructionsForm.value.xToConstantPower ||
          undefined,
      },
      yCurveStraighteningInstructions: {
        functionClass: this.removeFirstWord(
          curveStraighteningInstructionsForm.value
            .yCurveStraighteningInstructions
        ),
        constantPower:
          curveStraighteningInstructionsForm.value.yToConstantPower ||
          undefined,
      },

      _id: rawDataTable ? rawDataTable._id || undefined : undefined,
    });
  }

  findDataTableVar(dataTable: string) {
    if (dataTable === 'rawDataTable') {
      return 'rawDataTable';
    } else if (dataTable === 'processedDataTable') {
      return 'processedDataTable';
    }
  }

  generateNewFormValues(res): {
    xCurveStraighteningInstructions: string;
    yCurveStraighteningInstructions: string;
    xToConstantPower: string;
    yToConstantPower: string;
  } {
    let xCurveStraighteningInstructions =
      res['rawDataTable']['xCurveStraighteningInstructions'];
    let yCurveStraighteningInstructions =
      res['rawDataTable']['yCurveStraighteningInstructions'];

    let newFormVal = {
      xCurveStraighteningInstructions:
        xCurveStraighteningInstructions.functionClass,
      yCurveStraighteningInstructions:
        yCurveStraighteningInstructions.functionClass,
      xToConstantPower: xCurveStraighteningInstructions.constantPower,
      yToConstantPower: yCurveStraighteningInstructions.constantPower,
    };

    return newFormVal;
  }

  private removeFirstWord(string: string): string {
    return string.substring(string.indexOf(' ') + 1);
  }
}
