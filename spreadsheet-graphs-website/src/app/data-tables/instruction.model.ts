export class Instruction {
  //"type" of function -- eg: LOG_BASE_E, LOG_BASE_10, TO_CONST_POWER, MULTIPLIED_BY_CONSTANT_VARIABLE...
  functionClass: String;

  constantPower: Number;
  constantVariableValue: Number;
  constantVariableUncertainty: Number;
}
