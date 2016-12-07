import { Component, ViewChild } from '@angular/core';
import { TextInput } from 'ionic-angular';

@Component({
  selector: 'field-text',
  templateUrl: 'text.html',
  inputs: ['attribute']
})
export class TextComponent {

  attribute: any = {};

  @ViewChild('input') input: TextInput;

  constructor() {
  }

}
