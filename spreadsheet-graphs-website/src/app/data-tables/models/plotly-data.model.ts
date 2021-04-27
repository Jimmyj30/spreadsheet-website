import { LineInfo } from './line.model';

// stores data related to creating a plotly graph
export class PlotlyData {
  public x: number[];
  public y: number[];
  public errorXArray: number[];
  public errorYArray: number[];

  public minGradientInfo: LineInfo;
  public maxGradientInfo: LineInfo;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
