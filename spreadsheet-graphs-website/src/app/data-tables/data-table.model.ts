export class DataTable {
  public id?: any;
  public xCoords: number[];
  public yCoords: number[];
  public xUncertainties: number[];
  public yUncertainties: number[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }

  // these are the required variables -- using them for now to test if the api works...
}
