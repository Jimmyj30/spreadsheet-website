import { Instruction } from './instruction.model';
import { DataPoint } from './data-point.model';

export class DataTable {
  public _id?: any;
  public dataTableData: DataPoint[];
  public xCurveStraighteningInstructions: Instruction;
  public yCurveStraighteningInstructions: Instruction;

  // public xCoords: number[];
  // public yCoords: number[];
  // public xUncertainties: number[];
  // public yUncertainties: number[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }

  // these are the required variables -- using them for now to test if the api works...
}
