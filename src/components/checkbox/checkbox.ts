import { Component, ViewChild } from '@angular/core';
import { Checkbox } from 'ionic-angular';

@Component({
  selector: 'field-checkbox',
  templateUrl: 'checkbox.html',
  inputs: ['attribute']
})
export class CheckboxComponent {

  attribute: any = {};
  options: any = [];

  @ViewChild('checkbox') checkbox: Checkbox;

  constructor() {
  }

  ngOnInit() {
    if (this.attribute.options) {
      if (Array.isArray(this.attribute.options)) {
        this.options = this.attribute.options;
      }
      else {
        this.options = this.attribute.options.split(',');  
      }
    }
    else {
      this.options = [];
    }
  }

}
