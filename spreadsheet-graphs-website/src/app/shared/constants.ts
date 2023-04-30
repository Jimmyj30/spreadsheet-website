import { Settings } from 'handsontable/plugins/contextMenu';
import { Settings as AutofillSettings } from 'handsontable/plugins/autofill';

export class Constants {
  public static dataTableDefaultColumnValues = [
    {
      data: 'xUncertainty',
      type: 'numeric',
      numericFormat: {
        pattern: {
          mantissa: 2,
        },
      },
      allowEmpty: false,
    },
    {
      data: 'xCoord',
      type: 'numeric',
      numericFormat: {
        pattern: {
          mantissa: 2,
        },
      },
      allowEmpty: false,
    },
    {
      data: 'yCoord',
      type: 'numeric',
      numericFormat: {
        pattern: {
          mantissa: 2,
        },
      },
      allowEmpty: false,
    },
    {
      data: 'yUncertainty',
      type: 'numeric',
      numericFormat: {
        pattern: {
          mantissa: 2,
        },
      },
      allowEmpty: false,
    },
  ];

  public static dropdownMenuItems: Settings = {
    items: {
      clear_column: {},
      alignment: {},
      sp1: { name: '---------' },
    },
  };

  public static fillHandleSettings: AutofillSettings = {
    direction: 'vertical',
    autoInsertRow: true,
  };

  public static rawDataTableColHeaders: string[] = [
    'Uncertainties for<br>Manipulated Variable',
    'Manipulated Variable',
    'Responding Variable',
    'Uncertainties for<br>Responding Variable',
  ];

  public static processedDataTableColHeaders: string[] = [
    'Uncertainties for Curve Straightened<br>Manipulated Variable',
    'Curve Straightened<br>Manipulated Variable',
    'Curve Straightened<br>Responding Variable',
    'Uncertainties for Curve Straightened<br>Responding Variable',
  ];

  public static FILL_OUT_SPREADSHEET_FULLY_MESSAGE: string =
    'Please fully fill out the above spreadsheet with real numbers.';

  public static graphXAxis = {
    title: {
      text: `you can see how to add <sub>subscripts</sub>, <sup>superscripts</sup>, and
      <br> line breaks to graph labels/axes by clicking on this example`,
    },
    rangemode: 'tozero',
    autorange: true,
    ticks: 'outside',
    hoverformat: '.2f',
  };

  public static graphYAxis = {
    rangemode: 'tozero',
    autorange: true,
    ticks: 'outside',
    hoverformat: '.2f',
  };
}
