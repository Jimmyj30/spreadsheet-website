import { AbstractControl, ValidatorFn } from '@angular/forms';

/* Input for this validator function has to be a number (eg: 1.23, -0.5) or a fraction (eg: 3/4, -1/3) */
export function numberFractionValidator(): ValidatorFn {
  const DECIMAL_REGEX = /^-?[0-9]\d*(\.\d+)?$/;
  const FRACTION_REGEX = /^-?[1-9][0-9]*\/[1-9][0-9]*$/;
  return (control: AbstractControl) => {
    if (
      control.value &&
      (control.value.match(DECIMAL_REGEX) ||
        control.value.match(FRACTION_REGEX))
    ) {
      return null;
    } else {
      return {
        wrongFormat: control.value,
      };
    }
  };
}
