import { Instruction } from './instruction.model';
export class DataTable {
  public _id?: any;
  public xCoords: number[];
  public yCoords: number[];
  public xUncertainties: number[];
  public yUncertainties: number[];
  public xCurveStraighteningInstructions: Instruction;
  public yCurveStraighteningInstructions: Instruction;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }

  // these are the required variables -- using them for now to test if the api works...
}
