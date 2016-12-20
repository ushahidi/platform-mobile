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

  @ViewChild('textarea') textarea: TextArea;

  constructor() {
  }

  ngOnInit() {
    console.log(`TextArea ${JSON.stringify(this.attribute)}`);
  }

  setFocus(event) {
    console.log(`TextArea setFocus`);
    this.textarea.setFocus();
  }

}
