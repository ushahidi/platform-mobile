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
  required: boolean = false;
  focused: boolean = false;
  value: string = "";

  @ViewChild('input') input: TextInput;

  constructor() {
  }

  ngOnInit() {
    console.log(`Number ${JSON.stringify(this.attribute)}`);
  }

  onFocus(event) {
    console.log(`Number onFocus ${JSON.stringify(this.attribute)}`);
    this.focused = true;
  }

  onBlur(event) {
    console.log(`Number onBlur ${JSON.stringify(this.attribute)}`);
    this.focused = false;
  }

}
