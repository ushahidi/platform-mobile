import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'ionic-angular';

@Component({
  selector: 'field-date',
  templateUrl: 'date.html',
    inputs: ['attribute']
})
export class DateComponent {

  attribute: any = {};

  @ViewChild('datetime') datetime: DateTime;

  constructor() {
  }

}
