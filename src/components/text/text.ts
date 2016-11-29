import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-text',
  templateUrl: 'text.html',
  inputs: ['label', 'type', 'value']
})
export class TextComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
