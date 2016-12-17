import { Component, ViewChild } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'field-text',
  templateUrl: 'text.html',
  inputs: ['attribute', 'formGroup']
})
export class TextComponent {

  attribute: any = {};

  @ViewChild('input') input: TextInput;

  constructor() {
  }

}
