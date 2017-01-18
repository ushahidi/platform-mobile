import { Component, ViewChild } from '@angular/core';
import { TextArea } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-textarea',
  templateUrl: 'textarea.html',
  inputs: ['attribute', 'formGroup']
})
export class TextAreaComponent {

  formGroup: FormGroup;
  attribute: any = {};
  required: boolean = false;
  focused: boolean = false;
  value: string = "";

  @ViewChild('textarea')
  textarea: TextArea;

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute);
  }

  onFocus(event) {
    this.logger.info(this, "onFocus", this.attribute);
    this.focused = true;
  }

  onBlur(event) {
    this.logger.info(this, "onBlur", this.attribute);
    this.focused = false;
  }
}
