import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { HotTableComponent, HotTableRegisterer } from '@handsontable/angular';
import { GridSettings } from 'handsontable/settings';
import { DataTableService } from '../data-table.service';
import { DropdownMenuItem } from '../models/dropdown-menu-item.model';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent implements OnInit {
  private hotRegisterer = new HotTableRegisterer();

  @ViewChild('hotTableRef', { static: false })
  hotTableRef: HotTableComponent;

  @Input('hotId') hotId: string;
  @Input('hotSettings') hotSettings;

  constructor(private readonly dataTableService: DataTableService) {}

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  ngOnInit() {
    this.hotSettings.dropdownMenu.items.increaseMantissa =
      this.generateIncreaseMantissa(this.hotId);
    this.hotSettings.dropdownMenu.items.decreaseMantissa =
      this.generateDecreaseMantissa(this.hotId);
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
    console.log("increasing mantissa")
    let dataTableVar = this.dataTableService.findDataTableVar(dataTable);
    this[`${dataTableVar}Settings`].columns[
      columnIndex
    ].numericFormat.pattern.mantissa += 1;
    this.hotRegisterer
      .getInstance(this.hotId)
      .render();
  }

  // dataTable param has to either be "rawDataTable" or "processedDataTable"
  private decreaseMantissa(columnIndex, dataTable: string) {
    console.log("decreasing mantissa")
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
}
