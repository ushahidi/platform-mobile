import { Component, ViewChild } from '@angular/core';
import { Select } from 'ionic-angular';

@Component({
  selector: 'field-select',
  templateUrl: 'select.html',
  inputs: ['attribute']
})
export class SelectComponent {

  attribute: any = {};
  options: any = [];

  @ViewChild('select') select: Select;

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
