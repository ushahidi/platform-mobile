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
  }

}
