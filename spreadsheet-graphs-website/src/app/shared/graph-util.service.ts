import { Injectable } from '@angular/core';
import { LineInfo } from '../data-tables/models/line.model';
import * as regression from 'regression';
@Injectable({ providedIn: 'root' })
export class GraphUtilService {
  constructor() {}

  createMinGradientInfo(
    xArray: number[],
    yArray: number[],
    errorXArray: number[],
    errorYArray: number[]
  ) {
    let smallestXIndex = this.findSmallestIndex(xArray, xArray.length);
    let largestXIndex = this.findLargestIndex(xArray, xArray.length);

    // assuming that xArray[index] corresponds to the point yArray[index]
    // min gradient: top left of leftmost data point to bottom right of rightmost data point
    let x0: number =
      Number(xArray[smallestXIndex]) - Number(errorXArray[smallestXIndex]);
    let y0: number =
      Number(yArray[smallestXIndex]) + Number(errorYArray[smallestXIndex]);
    let x1: number =
      Number(xArray[largestXIndex]) + Number(errorXArray[largestXIndex]);
    let y1: number =
      Number(yArray[largestXIndex]) - Number(errorYArray[largestXIndex]);
    let overflowFactor: number = 1.1; // axis wil go 10% beyond the rightmost data point

    // y = mx + b  --> b = y - mx
    let slope: number = (y0 - y1) / (x0 - x1);
    let yIntercept: number = y0 - slope * x0;

    return new LineInfo({
      x0: 0,
      y0: yIntercept,
      x1: overflowFactor * x1,
      y1: slope * (overflowFactor * x1) + yIntercept,
      slope: Number(slope.toFixed(3)),
      yIntercept: Number(yIntercept.toFixed(3)),
    });
  }

  createMaxGradientInfo(
    xArray: number[],
    yArray: number[],
    errorXArray: number[],
    errorYArray: number[]
  ) {
    // assuming that xArray[index] corresponds to the point yArray[index]
    // max gradient: bottom right of leftmost data point to top left of rightmost data point
    let smallestXIndex = this.findSmallestIndex(xArray, xArray.length);
    let largestXIndex = this.findLargestIndex(xArray, xArray.length);

    let x0: number =
      Number(xArray[smallestXIndex]) + Number(errorXArray[smallestXIndex]);
    let y0: number =
      Number(yArray[smallestXIndex]) - Number(errorYArray[smallestXIndex]);
    let x1: number =
      Number(xArray[largestXIndex]) - Number(errorXArray[largestXIndex]);
    let y1: number =
      Number(yArray[largestXIndex]) + Number(errorYArray[largestXIndex]);
    let overflowFactor: number = 1.1; // axis wil go 10% beyond the rightmost data point

    // y = mx + b  --> b = y - mx
    let slope: number = (y0 - y1) / (x0 - x1);
    let yIntercept: number = y0 - slope * x0;

    return new LineInfo({
      x0: 0,
      y0: yIntercept,
      x1: overflowFactor * x1,
      y1: slope * (overflowFactor * x1) + yIntercept,
      slope: Number(slope.toFixed(3)),
      yIntercept: Number(yIntercept.toFixed(3)),
    });
  }

  // line of best fit
  createLineOfBestFitInfo(xArray: number[], yArray: number[], precision = 3) {
    const data = this.generateRegressionData(xArray, yArray);
    const result = regression.linear(data, {
      precision: precision,
    });

    let overflowFactor: number = 1.1;
    let x1 = xArray[this.findLargestIndex(xArray, xArray.length)];

    let slope = result.equation[0];
    let yIntercept = result.equation[1];

    // result.equation[0] is the slope of the line of best fit
    // result.equation[1] is the y intercept of the line of best fit
    return new LineInfo({
      x0: 0,
      y0: yIntercept,
      x1: overflowFactor * x1,
      y1: slope * (overflowFactor * x1) + yIntercept,
      slope: slope,
      yIntercept: yIntercept,
    });
  }

  // finds the index associated with the largest element
  // for a "slice" of an array (going from index 0 to the "index" parameter)
  private findLargestIndex(array: any[], index: number) {
    let largestIndex = 0;
    for (var i = 0; i < index; ++i) {
      if (array[largestIndex] < array[i]) {
        largestIndex = i;
      }
    }
    return largestIndex;
  }

  // finds the index associated with the smallest element
  // for a "slice" of an array (going from index 0 to the "index" parameter)
  private findSmallestIndex(array: any[], index: number) {
    let smallestIndex = 0;
    for (var i = 0; i < index; ++i) {
      if (array[smallestIndex] > array[i]) {
        smallestIndex = i;
      }
    }
    return smallestIndex;
  }

  private generateRegressionData(xArray: number[], yArray: number[]) {
    const data = [];
    if (xArray.length === yArray.length) {
      for (var i = 0; i < xArray.length; ++i) {
        let coordinatePair = [xArray[i], yArray[i]];
        data.push(coordinatePair);
      }
    }
    return data;
  }
}
