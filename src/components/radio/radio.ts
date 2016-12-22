import { Component, ViewChild } from '@angular/core';
import { RadioGroup } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'field-radio',
  templateUrl: 'radio.html',
  inputs: ['attribute', 'formGroup']
})
export class RadioComponent {

  formGroup: FormGroup;
  attribute: any = {};
  options: any = [];
  value: string = "";
  required: boolean = false;

  @ViewChild('radio') radio: RadioGroup;

  constructor() {
  }

  ngOnInit() {
    console.log(`Radio ${JSON.stringify(this.attribute)}`);
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
    this.required = this.attribute.required == "true";
  }

  radioChanged(event) {
    console.log(`Radio radioChanged ${event}`);
    this.value = event;
  }

}
