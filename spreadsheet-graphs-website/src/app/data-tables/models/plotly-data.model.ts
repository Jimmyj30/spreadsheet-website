// stores data related to creating a plotly graph
export class PlotlyData {
  public x: number[];
  public y: number[];
  public errorXArray: number[];
  public errorYArray: number[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
