import { Component, ViewChild } from '@angular/core';
import { RadioGroup } from 'ionic-angular';

@Component({
  selector: 'field-radio',
  templateUrl: 'radio.html',
  inputs: ['attribute', 'formGroup']
})
export class RadioComponent {

  attribute: any = {};
  options: any = [];

  @ViewChild('radio') radio: RadioGroup;

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
