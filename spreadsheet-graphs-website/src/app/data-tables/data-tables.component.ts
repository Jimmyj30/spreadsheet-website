import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HotTableComponent, HotTableRegisterer } from '@handsontable/angular';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import * as Handsontable from 'handsontable';

import { DataTableService } from '../shared/data-table.service';
import { DataTable } from './models/data-table.model';
import { numberFractionValidator } from '../shared/number-fraction.directive';

const FILL_OUT_SPREADSHEET_FULLY_MESSAGE =
  'Please fully fill out the above spreadsheet with real numbers.';

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

  // https://www.positronx.io/angular-7-select-dropdown-examples-with-reactive-forms/
  // https://angular.io/guide/form-validation#defining-custom-validators

  // https://developer.okta.com/blog/2019/10/03/painless-node-authentication
  // https://medium.com/swlh/set-up-an-express-js-app-with-passport-js-and-mongodb-for-password-authentication-6ea05d95335c

  // to run locally: ng serve --proxy-config proxy.conf.json
  // https://medium.com/@ryanchenkie_40935/angular-cli-deployment-host-your-angular-2-app-on-heroku-3f266f13f352

  private hotRegisterer = new HotTableRegisterer();

  rawData: any[];
  rawDataTableSettings;
  rawDataTable: DataTable;
  rawDataTableHandsontableID = 'rawDataTable';

  processedData: any[];
  processedDataTableSettings;
  processedDataTable: DataTable;
  processedDataTableHandsontableID = 'processedDataTable';

  showXToConstantPower: boolean;
  showYToConstantPower: boolean;
  xOptions: any = ['x', 'ln(x)', 'log_10(x)', 'x^a'];
  yOptions: any = ['y', 'ln(y)', 'log_10(y)', 'y^a'];

  curveStraighteningInstructionsForm = this.fb.group({
    xCurveStraighteningInstructions: new FormControl(this.xOptions[0], []),
    xToConstantPower: new FormControl('', []),
    yCurveStraighteningInstructions: new FormControl(this.yOptions[0], []),
    yToConstantPower: new FormControl('', []),
  });

  @ViewChild('processedDataTableRef', { static: false })
  processedDataTableRef: HotTableComponent;

  @ViewChild('rawDataTableRef', { static: false })
  rawDataTableRef: HotTableComponent;

  error: string; //general error message
  invalidFormErrorMsg: string = FILL_OUT_SPREADSHEET_FULLY_MESSAGE;
  loading: boolean = false;
  showGraph: boolean = false;

  constructor(
    private readonly dataTableService: DataTableService,
    private readonly fb: FormBuilder,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    this.rawData = this.dataTableService.generateDefaultDataTable(
      Handsontable.default.helper.createSpreadsheetData(5, 4)
    );
    // add context menu for cells: https://handsontable.com/docs/8.3.2/demo-context-menu.html
    this.rawDataTableSettings = {
      data: this.rawData,
      rowHeaders: true,
      colHeaders: [
        'Uncertainties for<br>Manipulated Variable',
        'Manipulated Variable',
        'Responding Variable',
        'Uncertainties for<br>Responding Variable',
      ],
      columns: dataTableService.dataTableDefaultColumnValues,

      afterChange: (changes) => {
        this.validateHandsontable();
      },

      afterRemoveRow: (changes) => {
        this.validateHandsontable();
      },

      afterCreateRow: (changes) => {
        this.validateHandsontable();
      },

      filters: true,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      manualColumnResize: true,
      manualRowResize: true,
      wordWrap: true,

      contextMenu: ['row_above', 'row_below', 'remove_row'],
      dropdownMenu: {
        items: {
          clear_column: {},
          alignment: {},
          sp1: { name: '---------' },
          shiftDecimalLeft: {
            name: 'Increase column decimal places by one', // can be string or function...
            callback: (key, selection, clickEvent) => {
              // selection[0].end.col  and selection[0].start.col should be the same
              // as this dropdown menu can only select an entire column
              this.shiftDecimalPlaceLeft(selection[0].end.col, 'rawDataTable');
            },
          },
          shiftDecimalRight: {
            name: 'Decrease column decimal places by one',
            disabled: () => {
              return !this.canShiftDecimalPlaceRight('rawDataTable');
            },
            callback: (key, selection, clickEvent) => {
              this.shiftDecimalPlaceRight(selection[0].end.col, 'rawDataTable');
            },
          },
        },
      },

      minRows: 5,
      maxCols: 4,
      licenseKey: 'non-commercial-and-evaluation',
    };
  }

  ngOnInit(): void {
    // console.log(this.rawDataTableSettings);
    // this route is protected by a guard so you need to be
    // logged in to realistically access here
    this.loading = true;
    this.dataTableService.getDataTableFromLoggedInUser().subscribe(
      (res) => {
        if (res['rawDataTable'] && res['processedDataTable']) {
          this.setDataTableData(res);
          this.loadFormData(res);
        }
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.error = 'There was an error loading your data';
      }
    );
  }

  get xCurveStraighteningInstructions() {
    return this.curveStraighteningInstructionsForm.get(
      'xCurveStraighteningInstructions'
    );
  }

  get yCurveStraighteningInstructions() {
    return this.curveStraighteningInstructionsForm.get(
      'yCurveStraighteningInstructions'
    );
  }

  changeXOption(event) {
    if (this.removeFirstWord(event.target.value) === 'x^a') {
      // event.target.value will either equal "3: x^a" or "x^a"
      this.showXToConstantPower = true;
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.setValidators(
        [Validators.required, numberFractionValidator()]
      );
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.updateValueAndValidity();
    } else {
      this.showXToConstantPower = false;
      this.curveStraighteningInstructionsForm.patchValue({
        xToConstantPower: undefined,
      });
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.clearValidators();
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.updateValueAndValidity();
    }

    this.xCurveStraighteningInstructions.setValue(event.target.value, {
      onlySelf: true,
    });
  }

  changeYOption(event) {
    if (this.removeFirstWord(event.target.value) === 'y^a') {
      // event.target.value will either equal "3: y^a" or "y^a"
      this.showYToConstantPower = true;
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.setValidators(
        [Validators.required, numberFractionValidator()]
      );
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.updateValueAndValidity();
    } else {
      this.showYToConstantPower = false;
      this.curveStraighteningInstructionsForm.patchValue({
        yToConstantPower: undefined,
      });
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.clearValidators();
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.updateValueAndValidity();
    }

    this.yCurveStraighteningInstructions.setValue(event.target.value, {
      onlySelf: true,
    });
  }

  onSubmit(): void {
    // form instructions...
    this.rawDataTable = new DataTable({
      dataTableData: this.rawData,

      xCurveStraighteningInstructions: {
        functionClass: this.removeFirstWord(
          this.curveStraighteningInstructionsForm.value
            .xCurveStraighteningInstructions
        ),
        constantPower: this.curveStraighteningInstructionsForm.value
          .xToConstantPower
          ? this.curveStraighteningInstructionsForm.value.xToConstantPower
          : undefined,
      },
      yCurveStraighteningInstructions: {
        functionClass: this.removeFirstWord(
          this.curveStraighteningInstructionsForm.value
            .yCurveStraighteningInstructions
        ),
        constantPower: this.curveStraighteningInstructionsForm.value
          .yToConstantPower
          ? this.curveStraighteningInstructionsForm.value.yToConstantPower
          : undefined,
      },

      _id: this.rawDataTable ? this.rawDataTable._id : undefined,
    });
    // console.log('rawDataTable: ');
    // console.log(this.rawDataTable);

    // we send the raw data table using the API, and the API will store that raw data table (giving it an ID), and
    // will also send a processed data table in the response as well...
    // response might contain a message, a processedDataTable, and a rawDataTable id (_id) ...
    // we could then display the processedDataTable and give the rawDataTable an id
    // that will need to be used if we want update the processed data table...

    // if the processedDataTable exists and rawDataTable has an ID then
    // rawDataTable has been saved to the database
    if (this.processedDataTable && this.rawDataTable._id) {
      // the API returns a processedDataTable along with the ID of the raw data table...
      this.loading = true;
      this.dataTableService.updateDataTable(this.rawDataTable).subscribe(
        (response: any) => {
          // console.log('update table response: ');
          // console.log(response);
          this.loading = false;
          this.updateProcessedDataTableSettings(response.data);
          this.error = undefined;
        },
        (error) => {
          this.loading = false;
          this.error = error;
        }
      );
    } else {
      this.loading = true;
      this.dataTableService.createDataTable(this.rawDataTable).subscribe(
        (response: any) => {
          // console.log('create table response: ');
          // console.log(response);

          // add an ID to the raw data table to indicate it is now stored in the database
          // return a processed data table as the response....
          // response contains a processedDataTable and a rawDataTableID

          // this.processedDataTable is a plain object since only the raw data
          // table data can be changed by the user — the raw data gets updated in the
          // DB every time that it gets submitted to the API (creating/updating the
          // raw data table) and the processedDataTable is part of the API response
          this.loading = false;
          this.processedDataTable = response.processedDataTable;
          this.createProcessedDataTableSettings(response.processedDataTable);

          //(gives raw data table an ID)
          this.rawDataTable._id = response.rawDataTableID;
          this.error = undefined;
        },
        (error) => {
          this.loading = false;
          this.error = error;
        }
      );
    }
  }

  onFinish(): void {
    if (confirm('Are you sure you want to delete your data?')) {
      if (
        this.rawDataTable &&
        this.rawDataTable._id &&
        this.processedDataTable
      ) {
        this.dataTableService.deleteDataTable(this.rawDataTable).subscribe(
          () => {
            console.log('data table(s) deleted');
            window.location.reload();
          },
          (error) => {
            this.error = error;
            this.loading = false;
          }
        );
      }
    }
  }

  onGenerateGraph(): void {
    this.showGraph = true;
  }

  private createProcessedDataTableSettings(
    processedDataTable: DataTable
  ): void {
    this.processedDataTableSettings = JSON.parse(
      JSON.stringify(this.rawDataTableSettings)
    );
    this.processedDataTableSettings.data = processedDataTable.dataTableData;
    this.processedDataTableSettings.contextMenu = false;

    this.processedDataTableSettings.colHeaders = [
      'Uncertainties for Curve Straightened<br>Manipulated Variable',
      'Curve Straightened<br>Manipulated Variable',
      'Curve Straightened<br>Responding Variable',
      'Uncertainties for Curve Straightened<br>Responding Variable',
    ];
    // the processed data table will have an _id attached to it that should
    // not be displayed as a column, so we will specify which columns are displayed here
    for (var i = 0; i < this.processedDataTableSettings.columns.length; ++i) {
      this.processedDataTableSettings.columns[i].readOnly = true;
    }

    this.processedDataTableSettings.dropdownMenu = {
      items: {
        shiftDecimalLeft: {
          name: 'Increase column decimal places by one', // can be string or function...
          callback: (key, selection, clickEvent) => {
            // selection[0].end.col  and selection[0].start.col should be the same
            // as this dropdown menu can only select an entire column
            this.shiftDecimalPlaceLeft(
              selection[0].end.col,
              'processedDataTable'
            );
          },
        },
        shiftDecimalRight: {
          name: 'Decrease column decimal places by one',
          disabled: () => {
            return !this.canShiftDecimalPlaceRight('processedDataTable');
          },
          callback: (key, selection, clickEvent) => {
            this.shiftDecimalPlaceRight(
              selection[0].end.col,
              'processedDataTable'
            );
          },
        },
      },
    };
    // console.log('processed data table settings: ');
    // console.log(this.processedDataTableSettings);
  }

  private updateProcessedDataTableSettings(dataTable: DataTable): void {
    this.changeDetector.detectChanges();
    this.processedDataTableSettings.data = dataTable.dataTableData;
    this.refreshProcessedDataTable(this.processedDataTableSettings);
    // changing the data of the processed data table based on the response...

    // console.log('updated data table: ');
    // console.log(this.processedDataTable);
  }

  private refreshProcessedDataTable(settings): void {
    this.processedDataTableRef.updateHotTable(settings);
  }

  private refreshRawDataTable(settings): void {
    this.rawDataTableRef.updateHotTable(settings);
  }

  private removeFirstWord(string: string): string {
    return string.substring(string.indexOf(' ') + 1);
  }

  // you can shift the decimal place left as many
  // times as you want so there is no validity check
  // for this operation
  // TODO: separate mantissas for processed and
  private shiftDecimalPlaceLeft(columnIndex, dataTable) {
    let dataTableVar;
    if (dataTable === 'rawDataTable') {
      dataTableVar = 'rawDataTable';
    } else if (dataTable === 'processedDataTable') {
      dataTableVar = 'processedDataTable';
    }

    this[`${dataTableVar}Settings`].columns[
      columnIndex
    ].numericFormat.pattern.mantissa += 1;
    this.hotRegisterer
      .getInstance(this[`${dataTableVar}HandsontableID`])
      .render();
  }

  // dataTable param has to either be rawDataTable or processedDataTable
  private shiftDecimalPlaceRight(columnIndex, dataTable) {
    let dataTableVar;
    if (dataTable === 'rawDataTable') {
      dataTableVar = 'rawDataTable';
    } else if (dataTable === 'processedDataTable') {
      dataTableVar = 'processedDataTable';
    }

    let colMantissa =
      this[`${dataTableVar}Settings`].columns[columnIndex].numericFormat.pattern
        .mantissa;

    if (colMantissa !== 0) {
      this[`${dataTableVar}Settings`].columns[
        columnIndex
      ].numericFormat.pattern.mantissa -= 1;
      this.hotRegisterer
        .getInstance(this[`${dataTableVar}HandsontableID`])
        .render();
    }
  }

  private canShiftDecimalPlaceRight(dataTable) {
    let dataTableVar;
    if (dataTable === 'rawDataTable') {
      dataTableVar = 'rawDataTable';
    } else if (dataTable === 'processedDataTable') {
      dataTableVar = 'processedDataTable';
    }

    if (this[`${dataTableVar}Settings`]) {
      let colIndex = this.hotRegisterer
        .getInstance(this[`${dataTableVar}HandsontableID`])
        .getSelectedRangeLast().from.col;
      let colMantissa =
        this[`${dataTableVar}Settings`].columns[colIndex].numericFormat.pattern
          .mantissa;

      if (colMantissa !== 0) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  private validateHandsontable() {
    let dataArray = this.hotRegisterer
      .getInstance(this.rawDataTableHandsontableID)
      .getData();

    let minRows = 5; // data table should only have 5+ rows
    if (
      this.dataTableService.isHandsontableValid(dataArray) &&
      dataArray.length >= minRows
    ) {
      this.invalidFormErrorMsg = undefined;
    } else {
      // default value for table without anything filled in yet
      this.invalidFormErrorMsg = FILL_OUT_SPREADSHEET_FULLY_MESSAGE;
    }
  }

  private setDataTableData(res): void {
    this.rawData = res['rawDataTable']['dataTableData'];
    this.rawDataTableSettings.data = this.rawData;
    this.rawDataTable = res['rawDataTable'];
    this.rawDataTable._id = res['rawDataTable']['_id'];
    this.refreshRawDataTable(this.rawDataTableSettings);

    this.processedDataTable = res['processedDataTable'];
    this.createProcessedDataTableSettings(res['processedDataTable']);
  }

  private loadFormData(res): void {
    let xCurveStraighteningInstructions =
      res['rawDataTable']['xCurveStraighteningInstructions'];
    let yCurveStraighteningInstructions =
      res['rawDataTable']['yCurveStraighteningInstructions'];

    if (xCurveStraighteningInstructions.constantPower) {
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.setValidators(
        [Validators.required, numberFractionValidator()]
      );
      this.showXToConstantPower = true;
    }
    if (yCurveStraighteningInstructions.constantPower) {
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.setValidators(
        [Validators.required, numberFractionValidator()]
      );
      this.showYToConstantPower = true;
    }
    this.curveStraighteningInstructionsForm.patchValue({
      xCurveStraighteningInstructions:
        xCurveStraighteningInstructions.functionClass,
      yCurveStraighteningInstructions:
        yCurveStraighteningInstructions.functionClass,
      xToConstantPower: xCurveStraighteningInstructions.constantPower,
      yToConstantPower: yCurveStraighteningInstructions.constantPower,
    });
    this.curveStraighteningInstructionsForm.updateValueAndValidity();
  }
}
