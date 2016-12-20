import { Component, ViewChild } from '@angular/core';
import { Checkbox } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'field-checkboxes',
  templateUrl: 'checkboxes.html',
    inputs: ['attribute', 'formGroup']
})
export class CheckboxesComponent {

  formGroup: FormGroup;
  attribute: any = {};
  options: any = [];
  values: any = {};

  constructor() {
  }

  ngOnInit() {
    console.log(`Checkboxes ${JSON.stringify(this.attribute)}`);
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
  }
}
