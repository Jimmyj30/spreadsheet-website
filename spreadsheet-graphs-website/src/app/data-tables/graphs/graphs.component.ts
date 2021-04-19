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
import { PlotlyData } from '../models/plotly-data.model';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
})
export class GraphsComponent implements OnInit, DoCheck {
  @Input('processedDataTableData') processedDataTableData: DataPoint[];

  // https://anotherdevblog.com/2019/06/30/when-ngonchanges-is-not-enough/
  // https://stackoverflow.com/questions/42962394/angular-2-how-to-detect-changes-in-an-array-input-property
  // http://plnkr.co/edit/JV7xcMhAuupnSdwrd8XB?p=preview&preview

  // plotly:
  // https://plotly.com/javascript/error-bars/
  // https://plotly.com/javascript/line-and-scatter/
  // https://chart-studio.plotly.com/create/?fid=DashawnBrown%3A0

  // onChanges can't "see" if the stuff in the array has changed so we need to use IterableDiffers....

  iterableDiffer: IterableDiffer<any>;
  objDiffer: Object;
  objDiffers: Array<KeyValueDiffer<string, any>>;

  scatterChart;

  constructor(private differs: KeyValueDiffers) {}

  ngOnInit(): void {
    // create object containing many differs;
    // this.objDiffers = new Array<KeyValueDiffer<string, any>>();
    // this.processedDataTableData.forEach((itemGroup, index) => {
    //   this.objDiffers[index] = this.differs.find(itemGroup).create();
    // });
    console.log(this.processedDataTableData);
    const scatterChartData = this.createScatterChartData(
      this.processedDataTableData
    );

    this.scatterChart = {
      data: [
        {
          x: scatterChartData.x,
          y: scatterChartData.y,

          error_x: {
            type: 'data',
            array: scatterChartData.errorXArray,
            visible: true,
          },
          error_y: {
            type: 'data',
            array: scatterChartData.errorYArray,
            visible: true,
          },
          type: 'scatter',
        },
      ],
      layout: { title: 'Test Graph Title' },
    };
  }

  ngDoCheck() {
    console.log(this.processedDataTableData);

    // comparison of equality between updatedProcessedDataTableData and this.scatterChartData
    // works, but we can try something else with the differs...
    // let updatedProcessedDataTableData = this.createScatterChartData(
    //   this.processedDataTableData
    // );
    // if (
    //   updatedProcessedDataTableData.length !==
    //   this.scatterChartData[0].data.length
    // ) {
    //   // if lengths are different, automatically update the data set
    //   this.scatterChartData[0].data = this.createScatterChartData(
    //     this.processedDataTableData
    //   );
    // } else {
    //   for (var i = 0; i < updatedProcessedDataTableData.length; ++i) {
    //     for (var element in updatedProcessedDataTableData[i]) {
    //       if (
    //         this.scatterChartData[0].data[i][element] !=
    //         updatedProcessedDataTableData[i][element]
    //       ) {
    //         this.scatterChartData[0].data = this.createScatterChartData(
    //           this.processedDataTableData
    //         );
    //         console.log('updated scatter chart data: ');
    //         console.log(this.scatterChartData[0].data);
    //       }
    //     }
    //   }
    // }

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
    // if ('changes') {
    //   console.log('Changes detected!');
    //   if (this.scatterChartData) {
    //     this.scatterChartData[0].data = this.createScatterChartData(
    //       this.processedDataTableData
    //     );
    //     console.log('updated scatter chart data: ');
    //     console.log(this.scatterChartData[0].data);
    //   }
    // }
  }

  private createScatterChartData(
    processedDataTableData: DataPoint[]
  ): PlotlyData {
    var xArray: Number[] = [];
    var yArray: Number[] = [];
    var errorXArray: Number[] = [];
    var errorYArray: Number[] = [];

    for (var i = 0; i < processedDataTableData.length; ++i) {
      xArray.push(processedDataTableData[i].xCoord);
      yArray.push(processedDataTableData[i].yCoord);
      errorXArray.push(processedDataTableData[i].xUncertainty);
      errorYArray.push(processedDataTableData[i].yUncertainty);
    }

    const scatterChartData = new PlotlyData({
      x: xArray,
      y: yArray,
      errorXArray: errorXArray,
      errorYArray: errorYArray,
    });

    console.log('scatterChartData: ');
    console.log(scatterChartData);
    return scatterChartData;
  }
}
