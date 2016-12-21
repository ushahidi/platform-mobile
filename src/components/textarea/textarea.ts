import { Component, ViewChild } from '@angular/core';
import { TextArea } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'field-textarea',
  templateUrl: 'textarea.html',
  inputs: ['attribute', 'formGroup']
})
export class TextAreaComponent {

  formGroup: FormGroup;
  attribute: any = {};
  required: boolean = false;
  focused: boolean = false;
  value: string = "";

  @ViewChild('textarea') textarea: TextArea;

  constructor() {
  }

  ngOnInit() {
    console.log(`TextArea ${JSON.stringify(this.attribute)}`);
  }

  onFocus(event) {
    console.log(`TextArea onFocus ${JSON.stringify(this.attribute)}`);
    this.focused = true;
  }

  onBlur(event) {
    console.log(`TextArea onBlur ${JSON.stringify(this.attribute)}`);
    this.focused = false;
  }
}
