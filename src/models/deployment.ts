import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

import { User } from '../models/user';
import { Form } from '../models/form';
import { Post } from '../models/post';
import { Collection } from '../models/collection';

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

  @Column("name", TEXT)
  public name: string = null;

  @Column("api", TEXT)
  public api: string = null;

  @Column("website", TEXT)
  public website: string = null;

  @Column("domain", TEXT)
  public domain: string = null;

  @Column("status", TEXT)
  public status: string = null;

  @Column("tier", TEXT)
  public tier: string = null;

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

  @Column("users_count", INTEGER)
  public users_count: number = null;

  @Column("posts_count", INTEGER)
  public posts_count: number = null;

  @Column("forms_count", INTEGER)
  public forms_count: number = null;

  @Column("collections_count", INTEGER)
  public collections_count: number = null;

  @Column("images_count", INTEGER)
  public images_count: number = null;

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

  public hasUsername():boolean {
    return this.username != null && this.username.length > 0;
  }

  public hasPassword():boolean {
    return this.password != null && this.password.length > 0;
  }

  public hasAccessToken():boolean {
    return this.access_token != null && this.access_token.length > 0;
  }

  public canRead():boolean {
    return this.can_read != null && this.can_read == true;
  }

  public canUpdate():boolean {
    return this.can_update != null && this.can_update == true;
  }

  public canDelete():boolean {
    return this.can_delete != null && this.can_delete == true;
  }

}
