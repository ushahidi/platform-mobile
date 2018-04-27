import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import * as moment from 'moment';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'input-date',
  templateUrl: 'input-date.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputDateComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  datetime: string = null;
  date: string = null;
  submitted: boolean = false;
  today:string = null;

  constructor(public logger:LoggerService) {
    this.today = moment().format();
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.today = moment().format();
    if (this.value && this.value.value) {
      this.datetime = this.value.value;
      let components = this.value.value.split(" ");
      if (components && components.length > 0) {
        this.date = components[0];
      }
    }
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
