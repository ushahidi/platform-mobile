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
  required: boolean = false;
  value: string = "";

  @ViewChild('input') input: TextInput;

  constructor() {
  }

  ngOnInit() {
    console.log(`Text ${JSON.stringify(this.attribute)}`);
    this.required = this.attribute.required == "true";
  }

  setFocus(event) {
    console.log(`Text setFocus`);
    this.input.setFocus();
  }

}
