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

  @ViewChild('datetime') datetime: DateTime;

  constructor() {
  }

  ngOnInit() {
    console.log(`Date ${JSON.stringify(this.attribute)}`);
  }
}
