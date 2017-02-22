import { Injectable } from '@angular/core';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { User } from '../models/user';
import { Form } from '../models/form';
import { Post } from '../models/post';
import { Collection } from '../models/collection';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

@Injectable()
@Table("deployments")
export class Deployment extends Model {

  constructor(values:any=null) {
    super(values);
    this.copyInto(values);
  }

  public newInstance<M extends Deployment>(values:any=null) : Deployment {
    return new Deployment(values);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("url", TEXT)
  public url: string = null;

  @Column("name", TEXT)
  public name: string = null;

  @Column("domain", TEXT)
  public domain: string = null;

  @Column("subdomain", TEXT)
  public subdomain: string = null;

  @Column("status", TEXT)
  public status: string = null;

  @Column("description", TEXT)
  public description: string = null;

  @Column("email", TEXT)
  public email: string = null;

  @Column("image", TEXT)
  public image: string = null;

  @Column("username", TEXT)
  public username: string = null;

  @Column("password", TEXT)
  public password: string = null;

  @Column("user_id", INTEGER)
  public user_id: number = null;

  @Column("access_token", TEXT)
  public access_token: string = null;

  @Column("refresh_token", TEXT)
  public refresh_token: string = null;

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

  public users: User[] = [];

  public forms: Form[] = [];

  public posts: Post[] = [];

  public collections: Collection[] = [];

}
