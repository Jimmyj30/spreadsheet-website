export class Instruction {
  //"type" of function -- eg: LOG_BASE_E, LOG_BASE_10, TO_CONST_POWER, MULTIPLIED_BY_CONSTANT_VARIABLE...
  functionClass: String;

  constantPower: String; // will get converted into a number later by the backend...
  constantVariableValue: Number;
  constantVariableUncertainty: Number;
}
