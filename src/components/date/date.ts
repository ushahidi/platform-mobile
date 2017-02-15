import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-date',
  templateUrl: 'date.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class DateComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  datetime: string = null;
  date: string = null;
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
