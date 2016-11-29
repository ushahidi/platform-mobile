import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-textarea',
  templateUrl: 'textarea.html',
  inputs: ['label', 'type', 'value']
})
export class TextAreaComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
