import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-datetime',
  templateUrl: 'datetime.html',
  inputs: ['attribute']
})
export class DateTimeComponent {

  attribute: any = {};

  constructor() {
  }

}
