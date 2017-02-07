import { Injectable } from '@angular/core';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Deployment } from '../models/deployment';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

@Injectable()
@Table("users")
export class User extends Model {

  constructor(values:any=null) {
    super(values);
    this.copyInto(values);
  }

  public newInstance<M extends User>(values:any=null) : User {
    return new User(values);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("email", TEXT)
  public email: string = null;

  @Column("image", TEXT)
  public image: string = null;

  @Column("name", TEXT)
  public name: string = null;

  @Column("gravatar", TEXT)
  public gravatar: string = null;

  @Column("created", TEXT)
  public created: Date = null;

  @Column("updated", TEXT)
  public updated: Date = null;

  @Column("saved", TEXT)
  public saved: Date = null;

}
