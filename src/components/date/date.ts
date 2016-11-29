import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-date',
  templateUrl: 'date.html',
  inputs: ['label', 'type', 'value']
})
export class DateComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
