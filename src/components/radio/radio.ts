import { Component, ViewChild } from '@angular/core';
import { RadioGroup } from 'ionic-angular';
import { FormGroup } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-radio',
  templateUrl: 'radio.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class RadioComponent {

  formGroup: FormGroup = null;
  attribute: Attribute = null;
  value: Value = null;
  options: string[] = [];
  submitted: boolean = false;
  selection: string = "";

  @ViewChild('radioGroup')
  radioGroup: RadioGroup;

  constructor(public logger:LoggerService) {

  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute);
    this.options = this.attribute.getOptions();
    if (this.value) {
      this.logger.info(this, "Value", this.value.value);
      this.selection = this.value.value;
    }
    else {
      this.logger.info(this, "Value", "[Blank]");
      this.selection = "";
    }
  }

  ngAfterViewInit() {

  }

  radioChanged(event) {
    this.logger.info(this, "radioChanged", event);
    this.selection = event.toString();
  }

}
