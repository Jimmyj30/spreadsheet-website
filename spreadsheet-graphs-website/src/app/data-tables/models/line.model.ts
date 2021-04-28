export class LineInfo {
  public x0: number;
  public y0: number;
  public x1: number;
  public y1: number;
  public slope: number;
  public yIntercept: number;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
