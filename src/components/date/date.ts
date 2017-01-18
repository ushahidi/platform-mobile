import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-date',
  templateUrl: 'date.html',
    inputs: ['attribute', 'formGroup']
})
export class DateComponent {

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
    if (this.date) {
      this.datetime = new Date(this.date).toISOString();
    }
    else {
      this.datetime = null;
    }
    this.logger.info(this, "dateChanged", this.datetime);
  }
}
