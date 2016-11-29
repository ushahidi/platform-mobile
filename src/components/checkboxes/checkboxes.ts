import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-checkboxes',
  templateUrl: 'checkboxes.html',
  inputs: ['label', 'type', 'value']
})
export class CheckboxesComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
