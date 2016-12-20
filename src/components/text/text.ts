import { Component, ViewChild } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'field-text',
  templateUrl: 'text.html',
  inputs: ['attribute', 'formGroup']
})
export class TextComponent {

  formGroup: FormGroup;
  attribute: any = {};

  @ViewChild('input') input: TextInput;

  constructor() {
  }

  ngOnInit() {
    console.log(`Text ${JSON.stringify(this.attribute)}`);
  }

  setFocus(event) {
    console.log(`Text setFocus`);
    this.input.setFocus();
  }

}
