import { Component, ViewChild } from '@angular/core';
import { RadioButton, RadioGroup } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-radio',
  templateUrl: 'radio.html',
  inputs: ['value', 'attribute', 'formGroup']
})
export class RadioComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  options: string[] = [];
  required: boolean = false;
  selection: string = "";

  @ViewChild('radioGroup')
  radioGroup: RadioGroup;

  constructor(public logger:LoggerService) {

  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.options = this.attribute.getOptions();
    if (this.value) {
      this.selection = this.value.value;
    }
    else {
      this.selection = "";
    }
  }

  radioChanged(event) {
    this.logger.info(this, "radioChanged", event);
    this.selection = event;
  }

}
