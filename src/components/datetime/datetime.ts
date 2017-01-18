import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import * as moment from 'moment';

import { LoggerService } from '../../providers/logger-service';

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

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute);
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
    this.logger.info(this, "dateChanged", this.datetime);
  }

}
