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
  required: boolean = false;

  constructor() {
  }

  ngOnInit() {
    console.log(`DateTime ${JSON.stringify(this.attribute)}`);
    this.required = this.attribute.required == "true";
  }

  dateChanged(event) {
    if (this.date && this.time) {
      let datetime = moment(this.date + ' ' + this.time, "YYYY-MM-DD HH:mm");
      this.datetime = datetime.toDate().toISOString();
    }
    else {
      this.datetime = null;
    }
    console.log(`DateTime dateChanged ${this.datetime}`);
  }

}
