import { Injectable } from '@angular/core';

import { Model } from '../models/model';
import { User } from '../models/user';
import { Form } from '../models/form';
import { Post } from '../models/post';

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

  @Column("id", "INTEGER", true)
  public id: number = null;

  @Column("url", "TEXT")
  public url: string = null;

  @Column("name", "TEXT")
  public name: string = null;

  @Column("domain", "TEXT")
  public domain: string = null;

  @Column("subdomain", "TEXT")
  public subdomain: string = null;

  @Column("status", "TEXT")
  public status: string = null;

  @Column("description", "TEXT")
  public description: string = null;

  @Column("email", "TEXT")
  public email: string = null;

  @Column("image", "TEXT")
  public image: string = null;

  @Column("username", "TEXT")
  public username: string = null;

  @Column("password", "TEXT")
  public password: string = null;

  @Column("access_token", "TEXT")
  public access_token: string = null;

  @Column("refresh_token", "TEXT")
  public refresh_token: string = null;

  public users: User[] = [];

  public forms: Form[] = [];

  public posts: Post[] = [];

}
