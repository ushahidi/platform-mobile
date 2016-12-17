import { Component, ViewChild } from '@angular/core';
import { TextInput } from 'ionic-angular';

@Component({
  selector: 'field-number',
  templateUrl: 'number.html',
  inputs: ['attribute', 'formGroup']
})
export class NumberComponent {

  attribute: any = {};

  @ViewChild('input') input: TextInput;

  constructor() {
  }

}
