import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-radio',
  templateUrl: 'radio.html',
  inputs: ['label', 'type', 'value']
})
export class RadioComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
