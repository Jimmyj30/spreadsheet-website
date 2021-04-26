import {
  Component,
  Input,
  DoCheck,
  OnInit,
  KeyValueDiffers,
  KeyValueDiffer,
} from '@angular/core';
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
  // https://chart-studio.plotly.com/create/?fid=liana.wang%3A103#/

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

    // create array containing key-value differs
    // for each dataPoint object in processedDataTableData;
    this.objDiffers = new Array<KeyValueDiffer<string, any>>();
    this.processedDataTableData.forEach((dataPoint, index) => {
      this.objDiffers[index] = this.differs.find(dataPoint).create();
    });
  }

  ngDoCheck() {
    // updated scatter chart data that we can compare against the existing
    // scatter chart data
    let updatedScatterChartData = this.createScatterChartData(
      this.processedDataTableData
    );
    const currentScatterChartData = this.scatterChart.data[0];
    var updateScatterChartData: boolean = false;

    // update differs array for each ngDoCheck
    this.processedDataTableData.forEach((dataPoint, index) => {
      this.objDiffers[index] = this.differs.find(dataPoint).create();
    });

    // check difference between the data table data using differs...
    if (currentScatterChartData && updatedScatterChartData) {
      this.processedDataTableData.forEach((dataPoint, index) => {
        const objDiffer = this.objDiffers[index];
        const objChanges = objDiffer.diff(dataPoint);
        if (objChanges) {
          updateScatterChartData = true;
          // console.log('differ detected changes here!');
        }
      });
    }

    if (updateScatterChartData) {
      this.setScatterChartData(updatedScatterChartData);
    }
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

    // console.log('scatterChartData: ');
    // console.log(scatterChartData);
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
}
