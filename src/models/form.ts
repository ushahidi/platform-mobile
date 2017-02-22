import { Injectable } from '@angular/core';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
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

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("name", TEXT)
  public name: string = null;

  @Column("description", TEXT)
  public description: string = null;

  @Column("type", TEXT)
  public type: string = null;

  @Column("color", TEXT)
  public color: string = null;

  @Column("disabled", BOOLEAN)
  public disabled: boolean = null;

  @Column("created", TEXT)
  public created: Date = null;

  @Column("updated", TEXT)
  public updated: Date = null;

  @Column("saved", TEXT)
  public saved: Date = null;

  @Column("can_read", BOOLEAN)
  public can_read: boolean = null;

  @Column("can_create", BOOLEAN)
  public can_create: boolean = null;

  @Column("can_update", BOOLEAN)
  public can_update: boolean = null;

  @Column("can_delete", BOOLEAN)
  public can_delete: boolean = null;

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
