import { Component, ViewChild } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'field-number',
  templateUrl: 'number.html',
  inputs: ['attribute', 'formGroup']
})
export class NumberComponent {

  formGroup: FormGroup;
  attribute: any = {};

  @ViewChild('input') input: TextInput;

  constructor() {
  }

  ngOnInit() {
    console.log(`Number ${JSON.stringify(this.attribute)}`);
  }

  setFocus(input) {
    console.log(`Number setFocus`);
    this.input.setFocus();
  }

}
