import { Component, ViewChild } from '@angular/core';
import { RadioGroup } from 'ionic-angular';
import { FormGroup } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector:'input-radio',
  templateUrl:'input-radio.html',
  inputs:['value', 'attribute', 'formGroup', 'submitted']
})
export class InputRadioComponent {

  formGroup:FormGroup = null;
  attribute:Attribute = null;
  value:Value = null;
  options:string[] = [];
  submitted:boolean = false;
  selection:string = "";

  @ViewChild('radioGroup')
  radioGroup:RadioGroup;

  constructor(public logger:LoggerService) {

  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute.label);
    this.options = this.attribute.getOptions();
    if (this.value && this.value.value) {
      this.selection = this.value.value;
    }
    else {
      this.selection = "";
    }
  }

  ngAfterViewInit() {

  }

  radioChanged(event) {
    this.logger.info(this, "radioChanged", event);
    this.selection = event.toString();
  }

  hasValue() {
    return this.selection && this.selection.length > 0;
  }

}
