import {
  Component,
  Input,
  DoCheck,
  OnInit,
  KeyValueDiffers,
  KeyValueDiffer,
} from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import { GraphUtilService } from 'src/app/data-tables/graphs/graph-util.service';
import { DataPoint } from '../models/data-point.model';
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
  // https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_config.js#L90-L110

  // onChanges can't "see" if the stuff in the array has changed so we need to use IterableDiffers....

  objDiffer: any;
  differ: any;
  objDiffers: Array<KeyValueDiffer<string, any>>;

  scatterChart;
  showTrendline: boolean = true;
  showUncertainties: boolean = true;

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
          title: {
            text: 'you can see how to add <sub>subscripts</sub>, <sup>superscripts</sup>, and<br>line breaks to graph labels/axes by clicking on this example',
          },
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
            visible: true,
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
            visible: true,
          },

          // line of best fit
          {
            type: 'line',
            x0: scatterChartData.lineOfBestFitInfo.x0,
            y0: scatterChartData.lineOfBestFitInfo.y0,
            x1: scatterChartData.lineOfBestFitInfo.x1,
            y1: scatterChartData.lineOfBestFitInfo.y1,
            line: {
              color: 'rgb(0,120,177)', // ~cerulean blue (same colour as graph data points)
              width: 2,
              dash: 'dot',
            },
            visible: true,
          },
        ],
        annotations: [
          // min gradient
          {
            text: this.generateMinGradientAnnotationText(scatterChartData),
            x: scatterChartData.minGradientInfo.x1,
            y: scatterChartData.minGradientInfo.y1,
            visible: true,
          },

          // max gradient
          {
            text: this.generateMaxGradientAnnotationText(scatterChartData),
            x: scatterChartData.maxGradientInfo.x1,
            y: scatterChartData.maxGradientInfo.y1,
            visible: true,
          },

          // line of best fit
          {
            text: this.generateLineOfBestFitAnnotationText(scatterChartData),
            x: scatterChartData.lineOfBestFitInfo.x1,
            y: scatterChartData.lineOfBestFitInfo.y1,
            visible: true,
          },
        ],
        showlegend: true,
      },
      config: {
        scrollZoom: true,
        editable: true,
        edits: {
          annotationPosition: false,
          shapePosition: false,
        },
      },
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

    let diffLengths =
      this.processedDataTableData.length !== currentScatterChartData.x.length;
    if (diffLengths) {
      updateScatterChartData = true;
    }

    // update differs array for each ngDoCheck
    this.processedDataTableData.forEach((dataPoint, index) => {
      // if the index is originally of bounds
      if (!this.objDiffers[index]) {
        this.objDiffers[index] = this.differs.find(dataPoint).create();
      }
    });

    // check difference between the data table data using differs...
    if (currentScatterChartData && this.processedDataTableData) {
      this.processedDataTableData.forEach((dataPoint, index) => {
        const objDiffer = this.objDiffers[index];
        const objChanges = objDiffer.diff(dataPoint);
        if (objChanges) {
          // console.log(objChanges);
          updateScatterChartData = true;
        }
      });
    }

    if (updateScatterChartData) {
      // console.log('differ detected changes here!');
      let updatedScatterChartData = this.createScatterChartData(
        this.processedDataTableData
      );
      console.log('update graph');
      this.setScatterChartData(updatedScatterChartData);
    }
  }

  onToggleTrendlines() {
    let shapes = this.scatterChart.layout.shapes;
    let annotations = this.scatterChart.layout.annotations;

    let update = {
      'shapes[0].visible': !shapes[0].visible,
      'shapes[1].visible': !shapes[1].visible,
      'shapes[2].visible': !shapes[2].visible,
      'annotations[0].visible': !annotations[0].visible,
      'annotations[1].visible': !annotations[1].visible,
      'annotations[2].visible': !annotations[2].visible,
    };

    this.showTrendline = !this.showTrendline;
    PlotlyModule.plotlyjs.relayout('graph', update);
  }

  onToggleUncertainties() {
    let data = this.scatterChart.data[0];

    let update = {
      'error_x.visible': !data.error_x.visible,
      'error_y.visible': !data.error_y.visible,
    };

    this.showUncertainties = !this.showUncertainties;
    PlotlyModule.plotlyjs.restyle('graph', update, 0);
  }

  private createScatterChartData(
    processedDataTableData: DataPoint[]
  ): PlotlyData {
    let xArray: number[] = [];
    let yArray: number[] = [];
    let errorXArray: number[] = [];
    let errorYArray: number[] = [];

    // double check type declarations...
    for (var i = 0; i < processedDataTableData.length; ++i) {
      xArray.push(Number(processedDataTableData[i].xCoord));
      yArray.push(Number(processedDataTableData[i].yCoord));
      errorXArray.push(Number(processedDataTableData[i].xUncertainty));
      errorYArray.push(Number(processedDataTableData[i].yUncertainty));
    }

    let InfoLOBF: LineInfo = this.graphUtilService.createLineOfBestFitInfo(
      xArray,
      yArray
    );
    let positiveSlopeOfLOBF = InfoLOBF.slope >= 0;

    const scatterChartData = new PlotlyData({
      x: xArray,
      y: yArray,
      errorXArray: errorXArray,
      errorYArray: errorYArray,
      minGradientInfo: this.graphUtilService.createMinGradientInfo(
        xArray,
        yArray,
        errorXArray,
        errorYArray,
        positiveSlopeOfLOBF
      ),
      maxGradientInfo: this.graphUtilService.createMaxGradientInfo(
        xArray,
        yArray,
        errorXArray,
        errorYArray,
        positiveSlopeOfLOBF
      ),
      lineOfBestFitInfo: InfoLOBF,
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

    currentScatterChartData.x = updatedProcessedDataTableData.x;
    currentScatterChartData.y = updatedProcessedDataTableData.y;
    currentScatterChartData.error_x.array =
      updatedProcessedDataTableData.errorXArray;
    currentScatterChartData.error_y.array =
      updatedProcessedDataTableData.errorYArray;

    // min gradient
    shapes[0].x0 = updatedProcessedDataTableData.minGradientInfo.x0;
    shapes[0].y0 = updatedProcessedDataTableData.minGradientInfo.y0;
    shapes[0].x1 = updatedProcessedDataTableData.minGradientInfo.x1;
    shapes[0].y1 = updatedProcessedDataTableData.minGradientInfo.y1;

    // max gradient
    shapes[1].x0 = updatedProcessedDataTableData.maxGradientInfo.x0;
    shapes[1].y0 = updatedProcessedDataTableData.maxGradientInfo.y0;
    shapes[1].x1 = updatedProcessedDataTableData.maxGradientInfo.x1;
    shapes[1].y1 = updatedProcessedDataTableData.maxGradientInfo.y1;

    // line of best fit
    shapes[2].x0 = updatedProcessedDataTableData.lineOfBestFitInfo.x0;
    shapes[2].y0 = updatedProcessedDataTableData.lineOfBestFitInfo.y0;
    shapes[2].x1 = updatedProcessedDataTableData.lineOfBestFitInfo.x1;
    shapes[2].y1 = updatedProcessedDataTableData.lineOfBestFitInfo.y1;

    // min gradient
    annotations[0].text = this.generateMinGradientAnnotationText(
      updatedProcessedDataTableData
    );
    annotations[0].x = updatedProcessedDataTableData.minGradientInfo.x1;
    annotations[0].y = updatedProcessedDataTableData.minGradientInfo.y1;

    // max gradient
    annotations[1].text = this.generateMaxGradientAnnotationText(
      updatedProcessedDataTableData
    );
    annotations[1].x = updatedProcessedDataTableData.maxGradientInfo.x1;
    annotations[1].y = updatedProcessedDataTableData.maxGradientInfo.y1;

    // line of best fit
    annotations[2].text = this.generateLineOfBestFitAnnotationText(
      updatedProcessedDataTableData
    );
    annotations[2].x = updatedProcessedDataTableData.lineOfBestFitInfo.x1;
    annotations[2].y = updatedProcessedDataTableData.lineOfBestFitInfo.y1;
  }

  private generateMinGradientAnnotationText(plotlyData: PlotlyData) {
    return `y=${plotlyData.minGradientInfo.slope}x+(${plotlyData.minGradientInfo.yIntercept})`;
  }

  private generateMaxGradientAnnotationText(plotlyData: PlotlyData) {
    return `y=${plotlyData.maxGradientInfo.slope}x+(${plotlyData.maxGradientInfo.yIntercept})`;
  }

  private generateLineOfBestFitAnnotationText(plotlyData: PlotlyData) {
    return `y=${plotlyData.lineOfBestFitInfo.slope}x+(${plotlyData.lineOfBestFitInfo.yIntercept})`;
  }
}
