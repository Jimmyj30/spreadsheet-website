import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HotTableComponent } from '@handsontable/angular';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
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

  // https://www.positronx.io/angular-7-select-dropdown-examples-with-reactive-forms/

  // to run locally: ng serve --proxy-config proxy.conf.json

  rawData: any[] = Handsontable.default.helper.createSpreadsheetData(10, 4);
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
    xCurveStraighteningInstructions: new FormControl(this.xOptions[0]),
    xToConstantPower: new FormControl(''),
    yCurveStraighteningInstructions: new FormControl(this.yOptions[0]),
    yToConstantPower: new FormControl(''),
  });
  // add validators for xToConstantPower and yToConstantPower

  @ViewChild('processedDataTableRef', { static: false })
  processedDataTableRef: HotTableComponent;

  constructor(
    private readonly dataTableService: DataTableService,
    private readonly fb: FormBuilder
  ) {
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
    } else {
      this.showXToConstantPower = false;
      this.curveStraighteningInstructionsForm.value.xToConstantPower = undefined;
    }

    this.xCurveStraighteningInstructions.setValue(event.target.value, {
      onlySelf: true,
    });
  }

  changeYOption(event) {
    if (this.removeFirstWord(event.target.value) === 'y^a') {
      // event.target.value will either equal "3: y^a" or "y^a"
      this.showYToConstantPower = true;
    } else {
      this.showYToConstantPower = false;
      this.curveStraighteningInstructionsForm.value.yToConstantPower = undefined;
    }

    this.yCurveStraighteningInstructions.setValue(event.target.value, {
      onlySelf: true,
    });
  }

  onSubmit() {
    // form instructions...
    console.log(
      this.removeFirstWord(
        this.curveStraighteningInstructionsForm.value
          .xCurveStraighteningInstructions
      )
    );
    console.log(
      this.removeFirstWord(
        this.curveStraighteningInstructionsForm.value
          .yCurveStraighteningInstructions
      )
    );

    let rawDataColumnsArray = this.flipArrayOrientation(this.rawData);
    this.rawDataTable = new DataTable({
      yUncertainties: rawDataColumnsArray[0],
      yCoords: rawDataColumnsArray[1],
      xCoords: rawDataColumnsArray[2],
      xUncertainties: rawDataColumnsArray[3],
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

      _id: this.processedDataTable ? this.processedDataTable._id : undefined,
      // this.rawDataTable._id...
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
          // this.updateRawDataTableSettings... (gives raw data table an ID)
        });
    }
  }

  onFinish() {
    this.dataTableService
      .deleteDataTable(this.processedDataTable)
      .subscribe(() => {
        console.log('data table deleted');
        window.location.reload();
      });
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
    this.refreshProcessedDataTable(this.processedDataTableSettings);

    console.log('updated data table: ');
    console.log(this.processedDataTableSettings);
  }

  private refreshProcessedDataTable(settings) {
    this.processedDataTableRef.updateHotTable(settings);
  }

  private removeFirstWord(string: string) {
    return string.substr(string.indexOf(' ') + 1);
  }
}
