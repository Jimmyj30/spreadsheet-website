import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HotTableComponent, HotTableRegisterer } from '@handsontable/angular';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent {
  private hotRegisterer = new HotTableRegisterer();

  @ViewChild('hotTableRef', { static: false })
  hotTableRef: HotTableComponent;


  
}
