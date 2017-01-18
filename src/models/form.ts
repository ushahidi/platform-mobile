import { Injectable } from '@angular/core';

import { Model } from '../models/model';
import { Deployment } from '../models/deployment';
import { Attribute } from '../models/attribute';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

@Injectable()
@Table("forms")
export class Form extends Model {

  constructor(values:any=null) {
    super(values);
    this.copyInto(values);
  }

  public newInstance<M extends Form>(values:any=null) : Form {
    return new Form(values);
  }

  @Column("id", "INTEGER", true)
  public id: number = null;

  @Column("deployment_id", "INTEGER", true)
  public deployment_id: number = null;

  @Column("name", "TEXT")
  public name: string = null;

  @Column("description", "TEXT")
  public description: string = null;

  @Column("type", "TEXT")
  public type: string = null;

  @Column("color", "TEXT")
  public color: string = null;

  @Column("disabled", "INTEGER")
  public disabled: boolean = null;

  @Column("created", "TEXT")
  public created: Date = null;

  @Column("updated", "TEXT")
  public updated: Date = null;

  public attributes: Attribute[] = [];

  loadAttributes(attributes:Attribute[]) {
    this.attributes = [];
    for (var i = 0; i < attributes.length; i++) {
      let attribute:Attribute = attributes[i];
      if (attribute.form_id == this.id) {
        this.attributes.push(attribute);
      }
    }
    this.attributes = this.attributes.sort(function(a, b){
      return a.cardinality - b.cardinality;
    });
  }

}
