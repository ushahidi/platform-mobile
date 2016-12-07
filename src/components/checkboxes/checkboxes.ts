import { Component, ViewChild } from '@angular/core';
import { Checkbox } from 'ionic-angular';

@Component({
  selector: 'field-checkboxes',
  templateUrl: 'checkboxes.html',
    inputs: ['attribute']
})
export class CheckboxesComponent {

  attribute: any = {};

  @ViewChild('checkbox') checkbox: Checkbox;

  constructor() {
  }

}
