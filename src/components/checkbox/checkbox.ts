import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-checkbox',
  templateUrl: 'checkbox.html',
  inputs: ['label', 'type', 'value']
})
export class CheckboxComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
