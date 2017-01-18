import { Component, ViewChild } from '@angular/core';
import { RadioGroup } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-radio',
  templateUrl: 'radio.html',
  inputs: ['attribute', 'formGroup']
})
export class RadioComponent {

  formGroup: FormGroup;
  attribute: any = {};
  options: any = [];
  value: string = "";
  required: boolean = false;

  @ViewChild('radio') radio: RadioGroup;

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute);
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
    this.required = this.attribute.required == "true";
  }

  radioChanged(event) {
    this.logger.info(this, "radioChanged", event);
    this.value = event;
  }

}
