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
  // https://stackoverflow.com/questions/35748484/detect-changes-in-objects-inside-array-in-angular2
  // http://plnkr.co/edit/JV7xcMhAuupnSdwrd8XB?p=preview&preview

  // plotly:
  // https://plotly.com/javascript/error-bars/
  // https://plotly.com/javascript/line-and-scatter/
  // https://chart-studio.plotly.com/create/?fid=DashawnBrown%3A0

  // onChanges can't "see" if the stuff in the array has changed so we need to use IterableDiffers....

  objDiffer: any;
  differ: any;
  objDiffers: Array<KeyValueDiffer<string, any>>;

  scatterChart;

  constructor(private differs: KeyValueDiffers) {
    this.differ = this.differs.find([]).create();
  }

  ngOnInit(): void {
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
          mode: 'markers',
          type: 'scatter',
        },
      ],
      layout: { title: 'Test Graph Title' },
    };

    // create array containing many differs;
    this.objDiffers = new Array<KeyValueDiffer<string, any>>();
    this.processedDataTableData.forEach((dataPoint, index) => {
      this.objDiffers[index] = this.differs.find(dataPoint).create();
    });
  }

  ngDoCheck() {
    // comparison of equality between updatedProcessedDataTableData and this.scatterChartData
    // works, but we can try something else with the differs...

    // updated scatter chart data that we can compare against the existing
    // scatter chart data
    let updatedScatterChartData = this.createScatterChartData(
      this.processedDataTableData
    );
    const currentScatterChartData = this.scatterChart.data[0];

    // check if this.scatterChart and updatedScatterChartData exists
    if (currentScatterChartData && updatedScatterChartData) {
      if (this.compareScatterChartDataLengths(updatedScatterChartData)) {
        // if the lengths of the arrays with the updated data table data are different
        // update the data set
        this.setScatterChartData(updatedScatterChartData);
      } else {
        // if the lengths of the arrays with the updated data table are the same
        // check individual elements and update the data set if needed
        for (var element in updatedScatterChartData) {
          for (var i = 0; i < updatedScatterChartData[element].length; ++i) {
            if (element === 'errorXArray') {
              if (
                currentScatterChartData.error_x.array[i] !==
                updatedScatterChartData[element][i]
              ) {
                this.setScatterChartData(updatedScatterChartData);
              }
            } else if (element === 'errorYArray') {
              if (
                currentScatterChartData.error_y.array[i] !==
                updatedScatterChartData[element][i]
              ) {
                this.setScatterChartData(updatedScatterChartData);
              }
            } else if (element === 'x' || element === 'y') {
              if (
                currentScatterChartData[element][i] !==
                updatedScatterChartData[element][i]
              ) {
                this.setScatterChartData(updatedScatterChartData);
              }
            }
          }
        }
      }
    }

    // WIP:
    // check difference between the data table data...
    this.processedDataTableData.forEach((dataPoint, index) => {
      const objDiffer = this.objDiffers[index];
      const objChanges = objDiffer.diff(dataPoint);
      if (objChanges) {
        objChanges.forEachChangedItem((changedItem) => {
          console.log(changedItem.key);
          console.log('differ detected change!');
        });
      }
    });
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

  // update or set scatter chart data
  private setScatterChartData(updatedProcessedDataTableData: PlotlyData): void {
    const currentScatterChartData = this.scatterChart.data[0];

    currentScatterChartData.x = updatedProcessedDataTableData.x;
    currentScatterChartData.y = updatedProcessedDataTableData.y;
    currentScatterChartData.error_x.array =
      updatedProcessedDataTableData.errorXArray;
    currentScatterChartData.error_y.array =
      updatedProcessedDataTableData.errorYArray;
  }

  private compareScatterChartDataLengths(updatedScatterChartData: PlotlyData) {
    // return true if the lengths of the scatter chart data arrays are all the same
    // return false if the lengths of the scatter chart data arrays are all different
    const currentScatterChartData = this.scatterChart.data[0];

    if (
      updatedScatterChartData.x.length === currentScatterChartData.x.length &&
      updatedScatterChartData.y.length === currentScatterChartData.y.length &&
      updatedScatterChartData.errorXArray.length ===
        currentScatterChartData.error_x.array.length &&
      updatedScatterChartData.errorYArray.length ===
        currentScatterChartData.error_y.array.length
    ) {
      return true;
    } else {
      return false;
    }
  }
}
