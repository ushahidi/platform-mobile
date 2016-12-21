import { Component, ViewChild } from '@angular/core';
import { Checkbox } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'field-checkbox',
  templateUrl: 'checkbox.html',
  inputs: ['attribute', 'formGroup', 'formGroupChild']
})
export class CheckboxComponent {

  formGroup: FormGroup;
  formGroupChild: FormGroup;
  attribute: any = {};
  options: any = [];
  values: any = {};
  required: boolean = false;

  constructor() {
  }

  ngOnInit() {
    console.log(`Checkbox ${JSON.stringify(this.attribute)}`);
    if (this.attribute.options) {
      if (Array.isArray(this.attribute.options)) {
        this.options = this.attribute.options;
      }
      else {
        this.options = this.attribute.options.split(',');
      }
    }
    else {
      this.options = [];
    }
    for (let index in this.options) {
      let option = this.options[index];
      this.values[option] = false;
    }
    this.required = this.attribute.required == "true";
  }

  checkChanged(event) {
    console.log(`Checkbox checkChanged`);
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
