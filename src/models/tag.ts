import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Injectable()
@Table("tags")
export class Tag extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.parent) {
        this.parent_id = data.parent.id;
      }
      if (data.allowed_privileges) {
        this.can_read = data.allowed_privileges.indexOf("read") > -1;
        this.can_create = data.allowed_privileges.indexOf("create") > -1;
        this.can_update = data.allowed_privileges.indexOf("update") > -1;
        this.can_delete = data.allowed_privileges.indexOf("delete") > -1;
      }
    }
  }

  public newInstance<M extends Tag>(data:any=null):Tag {
    return new Tag(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("form_id", INTEGER)
  public form_id: number = null;

  @Column("parent_id", INTEGER)
  public parent_id: number = null;

  @Column("tag", TEXT)
  public tag: string = null;

  @Column("slug", TEXT)
  public slug: string = null;

  @Column("type", TEXT)
  public type: string = null;

  @Column("color", TEXT)
  public color: string = null;

  @Column("icon", TEXT)
  public icon: string = null;

  @Column("description", TEXT)
  public description: string = null;

  @Column("priority", INTEGER)
  public priority: number = null;

  @Column("role", TEXT)
  public role: string = null;

  @Column("children", TEXT)
  public children: string = null;

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

  public tags: Tag[] = [];

}
