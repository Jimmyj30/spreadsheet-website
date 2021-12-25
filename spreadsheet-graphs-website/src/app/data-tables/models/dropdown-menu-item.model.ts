export class DropdownMenuItem {
  name: string;
  disabled?: Function;
  callback: Function;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
