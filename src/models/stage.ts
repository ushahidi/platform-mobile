import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Attribute } from '../models/attribute';

@Injectable()
@Table("stages")
export class Stage extends Model {

  constructor(values:any=null) {
    super(values);
    this.copyInto(values);
  }

  public newInstance<M extends Stage>(values:any=null) : Stage {
    return new Stage(values);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("form_id", INTEGER)
  public form_id: number = null;

  @Column("label", TEXT)
  public label: string = null;

  @Column("description", TEXT)
  public description: string = null;

  @Column("priority", INTEGER)
  public priority: number = null;

  @Column("task", TEXT)
  public task: string = null;

  @Column("icon", TEXT)
  public icon: string = null;

  @Column("required", BOOLEAN)
  public required: boolean = null;

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
    if (attributes) {
      for (var i = 0; i < attributes.length; i++) {
        let attribute:Attribute = attributes[i];
        if (attribute.form_stage_id == this.id) {
          attribute.form_stage_id = this.id;
          this.attributes.push(attribute);
        }
      }
      this.attributes = this.attributes.sort((a, b) => {
        return a.priority - b.priority;
      });
    }
  }

}
