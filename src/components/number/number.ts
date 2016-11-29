import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-number',
  templateUrl: 'number.html',
  inputs: ['label', 'type', 'value']
})
export class NumberComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
