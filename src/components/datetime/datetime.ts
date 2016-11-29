import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-datetime',
  templateUrl: 'datetime.html',
  inputs: ['label', 'type', 'value']
})
export class DateTimeComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
