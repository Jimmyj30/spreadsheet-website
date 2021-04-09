export class DataPoint {
  public xCoord: number;
  public yCoord: number;
  public xUncertainty: number;
  public yUncertainty: number;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
