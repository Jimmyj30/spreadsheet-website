import {
  Component,
  Input,
  IterableDiffer,
  DoCheck,
  OnInit,
  KeyValueDiffers,
  KeyValueDiffer,
} from '@angular/core';
import { ChartDataSets, ChartType } from 'chart.js';
import { ChartOptions } from 'chart.js';
import { DataPoint } from '../models/data-point.model';
import { DataTable } from '../models/data-table.model';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
})
export class GraphsComponent implements OnInit, DoCheck {
  @Input('processedDataTableData') processedDataTableData: DataPoint[];

  // https://stackblitz.com/edit/ng2-charts-scatter-template
  // https://anotherdevblog.com/2019/06/30/when-ngonchanges-is-not-enough/
  // https://stackoverflow.com/questions/42962394/angular-2-how-to-detect-changes-in-an-array-input-property
  // http://plnkr.co/edit/JV7xcMhAuupnSdwrd8XB?p=preview&preview
  // onChanges can't "see" if the stuff in the array has changed so we need to use IterableDiffers....

  iterableDiffer: IterableDiffer<any>;
  objDiffer: Object;
  objDiffers: Array<KeyValueDiffer<string, any>>;

  scatterChartOptions: ChartOptions;
  scatterChartData: ChartDataSets[];
  scatterChartType: ChartType;

  constructor(private differs: KeyValueDiffers) {}

  ngOnInit(): void {
    // create object containing many differs;
    // this.objDiffers = new Array<KeyValueDiffer<string, any>>();
    // this.processedDataTableData.forEach((itemGroup, index) => {
    //   this.objDiffers[index] = this.differs.find(itemGroup).create();
    // });

    this.scatterChartOptions = {
      responsive: true,
    };
    this.scatterChartData = [
      {
        data: this.createScatterChartData(this.processedDataTableData),
        label: 'Test graph',
        pointRadius: 10,
      },
    ];
    this.scatterChartType = 'scatter';
  }

  ngDoCheck() {
    // WIP:
    // check difference between the data table data...
    // this.processedDataTableData.forEach((itemGroup, index) => {
    //   const objDiffer = this.objDiffers[index];
    //   const objChanges = objDiffer.diff(itemGroup);
    //   if (objChanges) {
    //     objChanges.forEachChangedItem((changedItem) => {
    //       console.log(changedItem.key);
    //     });
    //   }
    // });
    // if ("changes") {
    //   console.log('Changes detected!');
    //   if (this.scatterChartData) {
    //     this.scatterChartData[0].data = this.createScatterChartData(
    //       this.processedDataTable
    //     );
    //     console.log('updated scatter chart data: ');
    //     console.log(this.scatterChartData[0].data);
    //   }
    // }
  }

  private createScatterChartData(processedDataTableData: DataPoint[]) {
    const scatterChartData = [];
    for (var i = 0; i < processedDataTableData.length; ++i) {
      scatterChartData.push({
        x: processedDataTableData[i].xCoord,
        y: processedDataTableData[i].yCoord,
      });
    }
    console.log('scatterChartData: ');
    console.log(scatterChartData);
    return scatterChartData;
  }
}
