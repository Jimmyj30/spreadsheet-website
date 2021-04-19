import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HotTableComponent } from '@handsontable/angular';
import {
  FormGroup,
  FormControl,
  FormArray,
  FormBuilder,
  Validators,
} from '@angular/forms';
import * as Handsontable from 'handsontable';
import { mergeMap } from 'rxjs/operators';

import { DataTableService } from '../shared/data-table.service';
import { DataTable } from './models/data-table.model';
import { DataPoint } from './models/data-point.model';
import { numberFractionValidator } from '../shared/number-fraction.directive';
import { of } from 'rxjs';

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

  // to run locally: ng serve --proxy-config proxy.conf.json

  rawData: any[] = this.generateDefaultDataTable(
    Handsontable.default.helper.createSpreadsheetData(5, 4)
  );
  rawDataTableSettings: Handsontable.default.GridSettings;
  rawDataTable: DataTable;

  processedData: any[];
  processedDataTableSettings: Handsontable.default.GridSettings;
  processedDataTable: DataTable;

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

  // refresh the graph component with ngOnChanges when necessary

  errorMessage: string;
  showGraph: boolean = false;

  constructor(
    private readonly dataTableService: DataTableService,
    private readonly fb: FormBuilder
  ) {
    // add context menu for cells: https://handsontable.com/docs/8.3.2/demo-context-menu.html
    this.rawDataTableSettings = {
      data: this.rawData,
      rowHeaders: true,
      colHeaders: [
        'Uncertainties for Responding',
        'Responding',
        'Manipulated',
        'Uncertainties for Manipulated',
      ],
      columns: [
        { data: 'yUncertainty', type: 'numeric' },
        { data: 'yCoord', type: 'numeric' },
        { data: 'xCoord', type: 'numeric' },
        { data: 'xUncertainty', type: 'numeric' },
      ],
      afterValidate: (isValid, value, row, prop, source) => {},

      filters: true,
      dropdownMenu: true,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      manualColumnResize: true,
      manualRowResize: true,
      wordWrap: true,
      contextMenu: ['row_above', 'row_below', 'remove_row'],
      minRows: 5,
      maxCols: 4,
      licenseKey: 'non-commercial-and-evaluation',
    };

    window.onbeforeunload = function () {
      console.log('before unload');
      // this.onFinish();
      return null;
    };
  }

  ngOnInit(): void {
    console.log(this.rawDataTableSettings);
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

      _id: this.rawDataTable ? this.rawDataTable._id : undefined, // this.rawDataTable._id...
    });
    console.log('rawDataTable: ');
    console.log(this.rawDataTable);

    // we send the raw data table using the API, and the API will store that raw data table (giving it an ID), and
    // will also send a processed data table in the response as well...
    // response might contain a message, a processedDataTable, and a rawDataTable id (_id) ...
    // we could then display the processedDataTable and give the rawDataTable an id
    // that will need to be used if we want update the processed data table...

    if (this.processedDataTable && this.processedDataTable._id) {
      // we are updating processedDataTable based on the ID of the rawDataTable...
      // we could have the API return a processedDataTable along with the ID of the raw data table...
      this.dataTableService
        .updateDataTable(this.rawDataTable, this.processedDataTable._id)
        .subscribe((response: any) => {
          console.log('update table response: ');
          console.log(response);
          this.updateProcessedDataTableSettings(response.data);
        });
    } else {
      this.dataTableService
        .createDataTable(this.rawDataTable)
        .subscribe((response: any) => {
          console.log('create table response: ');
          console.log(response);

          // add an ID to the raw data table to indicate it is now stored in the database
          // return a processed data table as the response....
          // response contains a processedDataTable and a rawDataTableID
          this.processedDataTable = response.processedDataTable;
          this.createProcessedDataTableSettings(response.processedDataTable);

          //(gives raw data table an ID)
          this.rawDataTable._id = response.rawDataTableID;
        });
    }
  }

  onFinish(): void {
    if (this.processedDataTable && this.processedDataTable._id) {
      this.dataTableService
        .deleteDataTable(this.processedDataTable)
        .pipe(
          mergeMap(() => {
            if (this.rawDataTable && this.rawDataTable._id) {
              return this.dataTableService.deleteDataTable(this.rawDataTable);
            } else {
              return of(null);
            }
          })
        )
        .subscribe(() => {
          console.log('data table(s) deleted');
          window.location.reload();
        });
    }
  }

  onGenerateGraph(): void {
    this.showGraph = true;
  }

  private createProcessedDataTableSettings(
    processedDataTable: DataTable
  ): void {
    this.processedDataTableSettings = this.rawDataTableSettings;
    this.processedDataTableSettings.data = processedDataTable.dataTableData;
    this.processedDataTableSettings.contextMenu = false;

    (this.processedDataTableSettings.colHeaders = [
      'Uncertainties for Responding',
      'Responding',
      'Manipulated',
      'Uncertainties for Manipulated',
    ]),
      // the processed data table will have an _id attached to it that should
      // not be displayed as a column, so we will specify which columns are displayed here
      (this.processedDataTableSettings.columns = [
        { data: 'yUncertainty' },
        { data: 'yCoord' },
        { data: 'xCoord' },
        { data: 'xUncertainty' },
      ]);
    console.log('processed data table settings: ');
    console.log(this.processedDataTableSettings);
  }

  private updateProcessedDataTableSettings(dataTable: DataTable): void {
    this.processedDataTableSettings.data = dataTable.dataTableData;
    this.processedDataTable.dataTableData = dataTable.dataTableData; // updating the value of the processedDataTable object for the graph
    this.refreshProcessedDataTable(this.processedDataTableSettings);
    // changing the data of the processed data table based on the response...

    console.log('updated data table: ');
    console.log(this.processedDataTable);
  }

  private refreshProcessedDataTable(settings): void {
    this.processedDataTableRef.updateHotTable(settings);
  }

  private removeFirstWord(string: string): string {
    return string.substr(string.indexOf(' ') + 1);
  }

  private generateDefaultDataTable(dataTableArray: any[]): DataTable[] {
    let defaultDataTable = [];
    for (var i = 0; i < dataTableArray.length; ++i) {
      let row = new DataPoint({
        yUncertainty: dataTableArray[i][0],
        yCoord: dataTableArray[i][1],
        xCoord: dataTableArray[i][2],
        xUncertainty: dataTableArray[i][3],
      });
      defaultDataTable.push(row);
    }
    console.log('default data table data');
    console.log(defaultDataTable);
    return defaultDataTable;
  }

  // https://handsontable.com/docs/8.3.2/frameworks-wrapper-for-angular-hot-reference.html
  private isHandsontableValid(hotTableComponent): boolean {
    const rowsCount = hotTableComponent;
    for (let row = 0; row < rowsCount; row++) {
      const metaCols = hotTableComponent.row;
      if (metaCols.some((col) => !col.valid)) {
        return false;
      }
    }
    return true;
  }
}
