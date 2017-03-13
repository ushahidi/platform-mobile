import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import * as moment from 'moment';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'input-datetime',
  templateUrl: 'input-datetime.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputDateTimeComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  datetime: string = null;
  date: string = null;
  time: string = null;
  submitted: boolean = false;

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    if (this.value && this.value.value) {
      this.datetime = this.value.value;
      let components = this.value.value.split(" ");
      if (components && components.length > 0) {
        this.date = components[0];
        this.time = components[1];
      }
    }
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
