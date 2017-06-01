import { Component, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';
import { Tag } from '../../models/tag';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'input-tags',
  templateUrl: 'input-tags.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputTagsComponent {

  zone:NgZone = null;
  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  submitted: boolean = false;
  values: {} = {};

  constructor(
    protected _zone:NgZone,
    protected logger:LoggerService) {
    this.zone = _zone;
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    for (let tag of this.attribute.tags) {
      if (this.value.value) {
        for (let value of this.value.value.split(",")) {
          if (value == tag.id.toString()) {
            this.values[tag.id] = true;
          }
          else {
            this.values[tag.id] = false;
          }
        }
      }
      else {
        this.values[tag.id] = false;
      }
    }
  }

  hasValue() {
    for (let tag of this.attribute.tags) {
      if (this.values[tag.id]) {
        return true;
      }
    }
    return false;
  }

  tagChecked(event:any, tag:Tag) {
    if (event.checked && tag.parent_id) {
      this.values[tag.parent_id] = true;
    }
  }

}
