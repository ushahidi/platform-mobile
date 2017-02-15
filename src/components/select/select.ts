import { Component, ViewChild } from '@angular/core';
import { Select } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-select',
  templateUrl: 'select.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class SelectComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  options: string[] = [];
  selectOptions: {} = null;
  submitted: boolean = false;
  text: string = "";

  @ViewChild('select')
  select: Select;

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.selectOptions = {
      title: this.attribute.label
    };
    this.options = this.attribute.getOptions();
    if (this.value && this.value.value) {
      this.text = this.value.value;
    }
    else {
      this.text = "";
    }
  }

  selectChanged(event) {
    this.logger.info(this, "selectChanged", this.text);
  }

}
