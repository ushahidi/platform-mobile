import { Injectable } from '@angular/core';

import { Model } from '../models/model';
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

  @Column("id", "INTEGER", true)
  public id: number = null;

  @Column("deployment_id", "INTEGER", true)
  public deployment_id: number = null;

  @Column("email", "TEXT")
  public email: string = null;

  @Column("image", "TEXT")
  public image: string = null;

  @Column("name", "TEXT")
  public name: string = null;

  @Column("gravatar", "TEXT")
  public gravatar: string = null;

  @Column("created", "TEXT")
  public created: Date = null;

  @Column("updated", "TEXT")
  public updated: Date = null;

}
