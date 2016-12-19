import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'field-datetime',
  templateUrl: 'datetime.html',
  inputs: ['attribute', 'formGroup']
})
export class DateTimeComponent {

  formGroup: FormGroup;
  attribute: any = {};

  @ViewChild('date') date: DateTime;
  @ViewChild('time') time: DateTime;

  constructor() {
  }

  ngOnInit() {
    console.log(`DateTime ${JSON.stringify(this.attribute)}`);
  }

}
