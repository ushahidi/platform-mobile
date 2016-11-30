import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-date',
  templateUrl: 'date.html',
    inputs: ['attribute']
})
export class DateComponent {

  attribute: any = {};

  constructor() {
  }

}
