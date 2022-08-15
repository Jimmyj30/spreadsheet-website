import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HotTableComponent, HotTableRegisterer } from '@handsontable/angular';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import * as Handsontable from 'handsontable';

import { DataTableService } from './data-table.service';
import { DataTable } from './models/data-table.model';
import { numberFractionValidator } from '../shared/number-fraction.directive';
import { ErrorHandlingService } from '../shared/error-handling.service';
import { Constants } from '../shared/constants';
import { DropdownMenuItem } from './models/dropdown-menu-item.model';
import { DataPoint } from './models/data-point.model';

@Component({
  selector: 'app-data-tables',
  templateUrl: './data-tables.component.html',
  styleUrls: ['./data-tables.component.css'],
})
export class DataTablesComponent implements OnInit {
  private hotRegisterer = new HotTableRegisterer();

  rawData: DataPoint[];
  rawDataTableSettings;
  rawDataTable: DataTable;
  rawDataTableHandsontableID = 'rawDataTable';

  processedData: DataPoint[];
  processedDataTableSettings;
  processedDataTable: DataTable;
  processedDataTableHandsontableID = 'processedDataTable';

  showXToConstantPower: boolean;
  showYToConstantPower: boolean;
  xOptions: string[] = ['x', 'ln(x)', 'log_10(x)', 'x^a']; // move things like this to a constants file
  yOptions: string[] = ['y', 'ln(y)', 'log_10(y)', 'y^a'];

  // we don't use validators for the form here as the first option is selected by default
  curveStraighteningInstructionsForm: FormGroup = this.fb.group({
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
  errorClass: string;
  invalidTableErrorMsg: string = Constants.FILL_OUT_SPREADSHEET_FULLY_MESSAGE;
  loading: boolean = false;
  showGraph: boolean = false;

  constructor(
    private readonly dataTableService: DataTableService,
    private readonly fb: FormBuilder,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly errorService: ErrorHandlingService
  ) {
    this.rawData = this.dataTableService.generateDefaultDataTable(
      Handsontable.default.helper.createSpreadsheetData(5, 4)
    );
    // add context menu for cells: https://handsontable.com/docs/8.3.2/demo-context-menu.html
    this.rawDataTableSettings = {
      data: this.rawData,
      rowHeaders: true,
      colHeaders: this.dataTableService.rawDataTableColHeaders,
      columns: this.dataTableService.dataTableDefaultColumnValues,

      afterChange: (changes) => this.validateHandsontable(),
      afterRemoveRow: (changes) => this.validateHandsontable(),
      afterCreateRow: (changes) => this.validateHandsontable(),

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
          increaseMantissa: this.generateIncreaseMantissa('rawDataTable'),
          decreaseMantissa: this.generateDecreaseMantissa('rawDataTable'),
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
        const errorObj = this.errorService.findError(err);
        this.error = errorObj.error;
        this.errorClass = errorObj.errorClass;
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

  onSubmit(): void {
    // form instructions...
    this.rawDataTable = this.dataTableService.generateRawDataTable(
      this.rawData,
      this.curveStraighteningInstructionsForm,
      this.rawDataTable
    );
    // console.log('rawDataTable: ', this.rawDataTable);

    // we send the raw data table using the API, and the API will store that raw data table (giving it an ID)
    // response might contain a message, a processedDataTable, and a rawDataTable id (_id) ...
    // we could then display the processedDataTable and give the rawDataTable an id
    // that will need to be used if we want update the raw data table...

    // if the processedDataTable exists and rawDataTable has an ID then
    // rawDataTable has been saved to the database
    if (this.processedDataTable && this.rawDataTable._id) {
      // the API returns a processedDataTable along with the ID of the raw data table...
      this.loading = true;
      this.dataTableService.updateDataTable(this.rawDataTable).subscribe(
        (response: any) => {
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
          // response contains a processedDataTable and a rawDataTableID...
          // this.processedDataTable is a plain object since the raw data table the user submits
          // can be used to calculate a processedDataTable that can then be sent as part of a request response
          this.loading = false;
          this.processedDataTable = response.processedDataTable;
          this.createProcessedDataTableSettings(response.processedDataTable);

          // add an ID to the raw data table to indicate it is now stored in the database
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

  onToggleGraph(): void {
    this.showGraph = !this.showGraph;
  }

  private createProcessedDataTableSettings(
    processedDataTable: DataTable
  ): void {
    this.processedDataTableSettings = JSON.parse(
      JSON.stringify(this.rawDataTableSettings)
    );
    this.processedDataTableSettings.data = processedDataTable.dataTableData;
    this.processedDataTableSettings.contextMenu = false;

    this.processedDataTableSettings.colHeaders =
      this.dataTableService.processedDataTableColHeaders;
    // the processed data table will have an _id attached to it that should
    // not be displayed as a column, so we will specify which columns are displayed here
    for (var i = 0; i < this.processedDataTableSettings.columns.length; ++i) {
      this.processedDataTableSettings.columns[i].readOnly = true;
    }

    this.processedDataTableSettings.dropdownMenu = {
      items: {
        increaseMantissa: this.generateIncreaseMantissa('processedDataTable'),
        decreaseMantissa: this.generateDecreaseMantissa('processedDataTable'),
      },
    };
    // console.log('processed data table settings: ', this.processedDataTableSettings);
  }

  private updateProcessedDataTableSettings(dataTable: DataTable): void {
    this.changeDetector.detectChanges();
    this.processedDataTableSettings.data = dataTable.dataTableData;
    this.refreshProcessedDataTable(this.processedDataTableSettings);
    // console.log('updated data table: ', this.processedDataTable);
  }

  private refreshProcessedDataTable(settings): void {
    this.processedDataTableRef.updateHotTable(settings);
  }

  private refreshRawDataTable(settings): void {
    this.rawDataTableRef.updateHotTable(settings);
  }

  private generateIncreaseMantissa(dataTableName: string): DropdownMenuItem {
    return {
      name: 'Increase column decimal places by one', // can be string or function...
      callback: (key, selection, clickEvent) => {
        // selection[0].end.col  and selection[0].start.col should be the same
        // as this dropdown menu can only select an entire column
        this.increaseMantissa(selection[0].end.col, dataTableName);
      },
    };
  }

  private generateDecreaseMantissa(dataTableName: string): DropdownMenuItem {
    return {
      name: 'Decrease column decimal places by one',
      disabled: () => {
        return !this.canDecreaseMantissa(dataTableName);
      },
      callback: (key, selection, clickEvent) => {
        this.decreaseMantissa(selection[0].end.col, dataTableName);
      },
    };
  }

  // you can shift the decimal place left as many times as you want
  // so there is no validity check for this operation
  private increaseMantissa(columnIndex, dataTable: string) {
    let dataTableVar = this.dataTableService.findDataTableVar(dataTable);

    this[`${dataTableVar}Settings`].columns[
      columnIndex
    ].numericFormat.pattern.mantissa += 1;
    this.hotRegisterer
      .getInstance(this[`${dataTableVar}HandsontableID`])
      .render();
  }

  // dataTable param has to either be "rawDataTable" or "processedDataTable"
  private decreaseMantissa(columnIndex, dataTable: string) {
    let dataTableVar = this.dataTableService.findDataTableVar(dataTable);

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

  private canDecreaseMantissa(dataTable: string): boolean {
    let dataTableVar = this.dataTableService.findDataTableVar(dataTable);

    if (this[`${dataTableVar}Settings`]) {
      let colIndex = this.hotRegisterer
        .getInstance(this[`${dataTableVar}HandsontableID`])
        .getSelectedRangeLast().from.col;
      let colMantissa =
        this[`${dataTableVar}Settings`].columns[colIndex].numericFormat.pattern
          .mantissa;

      return colMantissa >= 1; // we can shift right as long as mantissa is >= 1
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
      this.invalidTableErrorMsg = undefined;
    } else {
      // default error message for table without anything filled in yet
      this.invalidTableErrorMsg = Constants.FILL_OUT_SPREADSHEET_FULLY_MESSAGE;
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
    this.curveStraighteningInstructionsForm.patchValue(
      this.dataTableService.generateNewFormValues(res)
    );
    this.curveStraighteningInstructionsForm.updateValueAndValidity();
  }
}
