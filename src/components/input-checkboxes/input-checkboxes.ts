import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'input-checkboxes',
  templateUrl: 'input-checkboxes.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputCheckboxesComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  options: string[] = [];
  submitted: boolean = false;
  values: {} = {};

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.options = this.attribute.getOptions();
    for (let index in this.options) {
      let option = this.options[index];
      if (this.value && this.value.value == option) {
        this.values[option] = true;
      }
      else {
        this.values[option] = false;
      }
    }
  }

  hasValue() {
    for (let index in this.options) {
      let option = this.options[index];
      if (this.values[option]) {
        return true;
      }
    }
    return false;
  }

}
