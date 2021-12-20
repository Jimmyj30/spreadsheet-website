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

  public static rawDataTableColHeaders = [
    'Uncertainties for<br>Manipulated Variable',
    'Manipulated Variable',
    'Responding Variable',
    'Uncertainties for<br>Responding Variable',
  ];

  public static processedDataTableColHeaders = [
    'Uncertainties for Curve Straightened<br>Manipulated Variable',
    'Curve Straightened<br>Manipulated Variable',
    'Curve Straightened<br>Responding Variable',
    'Uncertainties for Curve Straightened<br>Responding Variable',
  ];
}
