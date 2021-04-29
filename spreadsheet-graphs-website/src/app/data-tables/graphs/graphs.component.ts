import {
  Component,
  Input,
  DoCheck,
  OnInit,
  KeyValueDiffers,
  KeyValueDiffer,
} from '@angular/core';
import { GraphUtilService } from 'src/app/shared/graph-util.service';
import { DataPoint } from '../models/data-point.model';
import { DataTable } from '../models/data-table.model';
import { LineInfo } from '../models/line.model';
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

  constructor(
    private differs: KeyValueDiffers,
    private readonly graphUtilService: GraphUtilService
  ) {
    this.differ = this.differs.find([]).create();
  }

  ngOnInit(): void {
    const scatterChartData = this.createScatterChartData(
      this.processedDataTableData
    );
    // use this to get info about the line of best fit: https://www.npmjs.com/package/regression
    // https://plotly.com/javascript/legend/
    // https://codepen.io/etpinard/pen/PZgPKx

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

          name: 'Click Here to Edit<br>Trace Name',
        },
      ],
      layout: {
        title: 'Click Here to Edit Chart Title',
        hovermode: 'closest',
        xaxis: {
          rangemode: 'tozero',
          autorange: true,
          ticks: 'outside',
          hoverformat: '.2f',
        },
        yaxis: {
          rangemode: 'tozero',
          autorange: true,
          ticks: 'outside',
          hoverformat: '.2f',
        },
        shapes: [
          // min gradient
          {
            type: 'line',
            x0: scatterChartData.minGradientInfo.x0,
            y0: scatterChartData.minGradientInfo.y0,
            x1: scatterChartData.minGradientInfo.x1,
            y1: scatterChartData.minGradientInfo.y1,
            line: {
              color: 'rgb(169,169,169)', //dark grey
              width: 2,
              dash: 'dot',
            },
          },

          // max gradient
          {
            type: 'line',
            x0: scatterChartData.maxGradientInfo.x0,
            y0: scatterChartData.maxGradientInfo.y0,
            x1: scatterChartData.maxGradientInfo.x1,
            y1: scatterChartData.maxGradientInfo.y1,
            line: {
              color: 'rgb(255,140,0)', //dark orange
              width: 2,
              dash: 'dot',
            },
          },
        ],
        annotations: [
          // min gradient
          {
            text: `y=${scatterChartData.minGradientInfo.slope}x+${scatterChartData.minGradientInfo.yIntercept}`,
            x: scatterChartData.minGradientInfo.x1,
            y: scatterChartData.minGradientInfo.y1,
          },

          // max gradient
          {
            text: `y=${scatterChartData.maxGradientInfo.slope}x+${scatterChartData.maxGradientInfo.yIntercept}`,
            x: scatterChartData.maxGradientInfo.x1,
            y: scatterChartData.maxGradientInfo.y1,
          },

          // line of best fit
        ],
        showlegend: true,
      },
      config: { scrollZoom: true, editable: true },
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
    const currentScatterChartData = this.scatterChart.data[0];
    let updateScatterChartData: boolean = false;

    // update differs array for each ngDoCheck
    this.processedDataTableData.forEach((dataPoint, index) => {
      this.objDiffers[index] = this.differs.find(dataPoint).create();
    });

    // check difference between the data table data using differs...
    if (currentScatterChartData && this.processedDataTableData) {
      this.processedDataTableData.forEach((dataPoint, index) => {
        const objDiffer = this.objDiffers[index];
        const objChanges = objDiffer.diff(dataPoint);
        if (objChanges) {
          updateScatterChartData = true;
        }
      });
    }

    if (updateScatterChartData) {
      let updatedScatterChartData = this.createScatterChartData(
        this.processedDataTableData
      );
      this.setScatterChartData(updatedScatterChartData);
      // console.log('differ detected changes here!');
      // console.log(updatedScatterChartData);
    }
  }

  private createScatterChartData(
    processedDataTableData: DataPoint[]
  ): PlotlyData {
    var xArray: number[] = [];
    var yArray: number[] = [];
    var errorXArray: number[] = [];
    var errorYArray: number[] = [];

    // double check type declarations...
    for (var i = 0; i < processedDataTableData.length; ++i) {
      xArray.push(Number(processedDataTableData[i].xCoord));
      yArray.push(Number(processedDataTableData[i].yCoord));
      errorXArray.push(Number(processedDataTableData[i].xUncertainty));
      errorYArray.push(Number(processedDataTableData[i].yUncertainty));
    }

    const scatterChartData = new PlotlyData({
      x: xArray,
      y: yArray,
      errorXArray: errorXArray,
      errorYArray: errorYArray,
      minGradientInfo: this.graphUtilService.createMinGradientInfo(
        xArray,
        yArray,
        errorXArray,
        errorYArray
      ),
      maxGradientInfo: this.graphUtilService.createMaxGradientInfo(
        xArray,
        yArray,
        errorXArray,
        errorYArray
      ),
    });

    // console.log('scatterChartData: ');
    // console.log(scatterChartData);
    return scatterChartData;
  }

  // update or set scatter chart data
  private setScatterChartData(updatedProcessedDataTableData: PlotlyData): void {
    const currentScatterChartData = this.scatterChart.data[0];
    let shapes = this.scatterChart.layout.shapes;
    let annotations = this.scatterChart.layout.annotations;

    let minGradientAnnotation = `y=${updatedProcessedDataTableData.minGradientInfo.slope}x+(${updatedProcessedDataTableData.minGradientInfo.yIntercept})`;
    let maxGradientAnnotation = `y=${updatedProcessedDataTableData.maxGradientInfo.slope}x+(${updatedProcessedDataTableData.maxGradientInfo.yIntercept})`;

    currentScatterChartData.x = updatedProcessedDataTableData.x;
    currentScatterChartData.y = updatedProcessedDataTableData.y;
    currentScatterChartData.error_x.array =
      updatedProcessedDataTableData.errorXArray;
    currentScatterChartData.error_y.array =
      updatedProcessedDataTableData.errorYArray;

    shapes[0].x0 = updatedProcessedDataTableData.minGradientInfo.x0;
    shapes[0].y0 = updatedProcessedDataTableData.minGradientInfo.y0;
    shapes[0].x1 = updatedProcessedDataTableData.minGradientInfo.x1;
    shapes[0].y1 = updatedProcessedDataTableData.minGradientInfo.y1;

    shapes[1].x0 = updatedProcessedDataTableData.maxGradientInfo.x0;
    shapes[1].y0 = updatedProcessedDataTableData.maxGradientInfo.y0;
    shapes[1].x1 = updatedProcessedDataTableData.maxGradientInfo.x1;
    shapes[1].y1 = updatedProcessedDataTableData.maxGradientInfo.y1;

    annotations[0].text = minGradientAnnotation;
    annotations[0].x = updatedProcessedDataTableData.minGradientInfo.x1;
    annotations[0].y = updatedProcessedDataTableData.minGradientInfo.y1;

    annotations[1].text = maxGradientAnnotation;
    annotations[1].x = updatedProcessedDataTableData.maxGradientInfo.x1;
    annotations[1].y = updatedProcessedDataTableData.maxGradientInfo.y1;
  }
}
