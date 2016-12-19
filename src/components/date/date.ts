import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

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

  constructor() {
  }

  ngOnInit() {
    console.log(`Date ${JSON.stringify(this.attribute)}`);
  }

  dateChanged(event) {
    this.datetime = new Date(this.date).toISOString();
    console.log(`Date dateChanged ${this.datetime}`);
  }
}
