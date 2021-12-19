import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { numberFractionValidator } from 'src/app/shared/number-fraction.directive';

@Component({
  selector: 'app-data-table-form',
  templateUrl: './data-table-form.component.html',
  styleUrls: ['./data-table-form.component.css'],
})
export class DataTableFormComponent implements OnInit {
  @Input() curveStraighteningInstructionsForm: FormGroup;
  @Input() showXToConstantPower: boolean;
  @Input() showYToConstantPower: boolean;

  @Output() curveStraighteningInstructionsFormChange =
    new EventEmitter<FormGroup>();

  xOptions: string[] = ['x', 'ln(x)', 'log_10(x)', 'x^a'];
  yOptions: string[] = ['y', 'ln(y)', 'log_10(y)', 'y^a'];

  constructor() {}

  ngOnInit(): void {}

  get xCurveStraighteningInstructions() {
    return this.curveStraighteningInstructionsForm.get(
      'xCurveStraighteningInstructions'
    );
  }

  get yCurveStraighteningInstructions() {
    return this.curveStraighteningInstructionsForm.get(
      'yCurveStraighteningInstructions'
    );
  }

  changeXOption(event) {
    if (this.removeFirstWord(event.target.value) === 'x^a') {
      // event.target.value will either equal "3: x^a" or "x^a"
      this.showXToConstantPower = true;
      this.curveStraighteningInstructionsForm.patchValue({
        xToConstantPower: '',
      });
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.setValidators(
        [Validators.required, numberFractionValidator()]
      );
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.updateValueAndValidity();
    } else {
      this.showXToConstantPower = false;
      this.curveStraighteningInstructionsForm.patchValue({
        xToConstantPower: undefined,
      });
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.clearValidators();
      this.curveStraighteningInstructionsForm.controls.xToConstantPower.updateValueAndValidity();
    }

    this.xCurveStraighteningInstructions.setValue(
      this.removeFirstWord(event.target.value),
      {
        onlySelf: true,
      }
    );

    this.curveStraighteningInstructionsFormChange.emit(
      this.curveStraighteningInstructionsForm
    );
  }

  changeYOption(event) {
    if (this.removeFirstWord(event.target.value) === 'y^a') {
      // event.target.value will either equal "3: y^a" or "y^a"
      this.showYToConstantPower = true;
      this.curveStraighteningInstructionsForm.patchValue({
        yToConstantPower: '',
      });
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.setValidators(
        [Validators.required, numberFractionValidator()]
      );
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.updateValueAndValidity();
    } else {
      this.showYToConstantPower = false;
      this.curveStraighteningInstructionsForm.patchValue({
        yToConstantPower: undefined,
      });
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.clearValidators();
      this.curveStraighteningInstructionsForm.controls.yToConstantPower.updateValueAndValidity();
    }

    this.yCurveStraighteningInstructions.setValue(
      this.removeFirstWord(event.target.value),
      {
        onlySelf: true,
      }
    );

    this.curveStraighteningInstructionsFormChange.emit(
      this.curveStraighteningInstructionsForm
    );
  }

  private removeFirstWord(string: string): string {
    return string.substring(string.indexOf(' ') + 1);
  }
}
