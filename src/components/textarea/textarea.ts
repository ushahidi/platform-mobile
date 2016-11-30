import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-textarea',
  templateUrl: 'textarea.html',
  inputs: ['attribute']
})
export class TextAreaComponent {

  attribute: string;

  constructor() {
  }

}
