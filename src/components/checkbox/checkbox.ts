import { Component, ViewChild } from '@angular/core';
import { Checkbox } from 'ionic-angular';

@Component({
  selector: 'field-checkbox',
  templateUrl: 'checkbox.html',
  inputs: ['attribute']
})
export class CheckboxComponent {

  attribute: any = {};

  @ViewChild('checkbox') checkbox: Checkbox;

  constructor() {
  }

}
