import Core from "handsontable/core";

export class DropdownMenuItem {
  name: string;
  disabled?: (this: Core) => boolean;
  callback: (key: any, selection: any, clickEvent: any) => void;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
