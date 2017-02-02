import { Injectable } from '@angular/core';

import { Model, TEXT, INTEGER, DOUBLE, PRIMARY_KEY } from '../models/model';
import { Deployment } from '../models/deployment';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

@Injectable()
@Table("collections")
export class Collection extends Model {

  constructor(values:any=null) {
    super(values);
    this.copyInto(values);
  }

  public newInstance<M extends Collection>(values:any=null) : Collection {
    return new Collection(values);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("name", TEXT)
  public name: string = null;

  @Column("description", TEXT)
  public description: string = null;

  @Column("view", TEXT)
  public view: string = null;

  @Column("featured", INTEGER)
  public featured: boolean = null;

  @Column("options", TEXT)
  public options: string = null;

  @Column("created", TEXT)
  public created: Date = null;

  @Column("updated", TEXT)
  public updated: Date = null;

  @Column("can_read", INTEGER)
  public can_read: boolean = null;

  @Column("can_create", INTEGER)
  public can_create: boolean = null;

  @Column("can_update", INTEGER)
  public can_update: boolean = null;

  @Column("can_delete", INTEGER)
  public can_delete: boolean = null;

}
