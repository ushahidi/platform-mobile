import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-select',
  templateUrl: 'select.html',
  inputs: ['label', 'type', 'value']
})
export class SelectComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
