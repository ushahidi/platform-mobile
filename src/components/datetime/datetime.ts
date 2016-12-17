import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'ionic-angular';

@Component({
  selector: 'field-datetime',
  templateUrl: 'datetime.html',
  inputs: ['attribute', 'formGroup']
})
export class DateTimeComponent {

  attribute: any = {};

  @ViewChild('date') date: DateTime;
  @ViewChild('time') time: DateTime;

  constructor() {
  }

}
