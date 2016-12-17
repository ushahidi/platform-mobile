import { Component, ViewChild } from '@angular/core';
import { TextArea } from 'ionic-angular';

@Component({
  selector: 'field-textarea',
  templateUrl: 'textarea.html',
  inputs: ['attribute', 'formGroup']
})
export class TextAreaComponent {

  attribute: any = {};

  @ViewChild('textarea') textarea: TextArea;

  constructor() {
  }

}
