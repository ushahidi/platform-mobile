import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import * as moment from 'moment';

@Component({
  selector: 'field-datetime',
  templateUrl: 'datetime.html',
  inputs: ['attribute', 'formGroup']
})
export class DateTimeComponent {

  formGroup: FormGroup;
  attribute: any = {};
  datetime: string = null;
  date: string = null;
  time: string = null;

  constructor() {
  }

  ngOnInit() {
    console.log(`DateTime ${JSON.stringify(this.attribute)}`);
  }

  dateChanged(event) {
    if (this.date && this.time) {
      let datetime = moment(this.date + ' ' + this.time, "YYYY-MM-DD HH:mm");
      this.datetime = datetime.toDate().toISOString();
    }
    console.log(`DateTime dateChanged ${this.datetime}`);
  }

}
