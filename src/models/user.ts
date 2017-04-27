import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, PRIMARY_KEY } from '../models/model';

@Injectable()
@Table("users")
export class User extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.id) {
        this.id = data.id;
      }
      if (data.role) {
        this.role = data.role;
      }
      if (data.email) {
        this.email = data.email;
      }
      if (data.name) {
        this.name = data.name;
      }
      if (data.realname) {
        this.name = data.realname;
      }
      if (data.gravatar) {
        this.gravatar = data.gravatar;
        this.image = `https://www.gravatar.com/avatar/${data.gravatar}.jpg?s=32`;
      }
    }
  }

  public newInstance<M extends User>(data:any=null):User {
    return new User(data);
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

  @Column("role", TEXT)
  public role: string = null;

  @Column("gravatar", TEXT)
  public gravatar: string = null;

  @Column("created", TEXT)
  public created: Date = null;

  @Column("updated", TEXT)
  public updated: Date = null;

  @Column("saved", TEXT)
  public saved: Date = null;

}
