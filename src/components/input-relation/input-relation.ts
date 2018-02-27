import { Component, ViewChild } from '@angular/core';
import { Select } from 'ionic-angular';
import { FormGroup } from '@angular/forms';

import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';
import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

@Component({
  selector: 'input-relation',
  templateUrl: 'input-relation.html',
  inputs: ['deployment', 'value', 'attribute', 'formGroup', 'submitted'],
  providers: [ LoggerService, DatabaseService ]
})
export class InputRelationComponent {

  deployment:Deployment = null;
  formGroup:FormGroup = null;
  attribute:Attribute = null;
  value:Value = null;
  submitted:boolean = false;
  text:string = "";
  selectOptions:{} = null;
  posts:Post[] = [];

  @ViewChild('select')
  select: Select;

  constructor(
    private logger:LoggerService,
    private database:DatabaseService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.selectOptions = {
      title: this.attribute.label
    };
    this.database.getPosts(this.deployment).then((posts:Post[]) => {
      this.posts = posts;
    },
    (error:any) => {
      this.posts = [];
    });
  }


  selectChanged(event) {
    this.logger.info(this, "selectChanged", this.text);
  }

}
