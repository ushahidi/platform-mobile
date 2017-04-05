import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Value } from '../models/value';
import { Form } from '../models/form';
import { User } from '../models/user';
import { Image } from '../models/image';

@Injectable()
@Table("posts")
export class Post extends Model {

  constructor(values:any=null) {
    super(values);
    this.copyInto(values);
  }

  public newInstance<M extends Post>(values:any=null) : Post {
    return new Post(values);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("form_id", INTEGER)
  public form_id: number = null;

  @Column("user_id", INTEGER)
  public user_id: number = null;

  @Column("title", TEXT)
  public title: string = null;

  @Column("description", TEXT)
  public description: string = null;

  @Column("url", TEXT)
  public url: string = null;

  @Column("slug", TEXT)
  public slug: string = null;

  @Column("type", TEXT)
  public type: string = null;

  @Column("status", TEXT)
  public status: string = null;

  @Column("color", TEXT)
  public color: string = null;

  @Column("image_url", TEXT)
  public image_url: string = null;

  @Column("pending", BOOLEAN)
  public pending: boolean = null;

  @Column("latitude", DOUBLE)
  public latitude: number = null;

  @Column("longitude", DOUBLE)
  public longitude: number = null;

  @Column("posted", TEXT)
  public posted: Date = null;

  @Column("created", TEXT)
  public created: Date = null;

  @Column("updated", TEXT)
  public updated: Date = null;

  @Column("saved", TEXT)
  public saved: Date = null;

  @Column("user_name", TEXT)
  public user_name: string = null;

  @Column("user_image", TEXT)
  public user_image: string = null;

  @Column("form_name", TEXT)
  public form_name: string = null;

  @Column("can_read", BOOLEAN)
  public can_read: boolean = null;

  @Column("can_create", BOOLEAN)
  public can_create: boolean = null;

  @Column("can_update", BOOLEAN)
  public can_update: boolean = null;

  @Column("can_delete", BOOLEAN)
  public can_delete: boolean = null;

  public form: Form = null;

  public user: User = null;

  public image: Image = null;

  public values: Value[] = [];

  loadValues(values:Value[]) {
    this.values = [];
    for (var i = 0; i < values.length; i++) {
      let value:Value = values[i];
      if (value.post_id == this.id) {
        this.values.push(value);
      }
    }
  }

  loadUser(users:User[]) {
    for (var i = 0; i < users.length; i++) {
      let user:User = users[i];
      if (user.id == this.user_id) {
        this.user = user;
        this.user_name = user.name;
        this.user_image = user.image;
        break;
      }
    }
  }

  loadForm(forms:Form[]) {
    for (var i = 0; i < forms.length; i++) {
      let form:Form = forms[i];
      if (form.id == this.form_id) {
        this.form = form;
        this.form_name = form.name;
        break;
      }
    }
  }

  loadImage(images:Image[], id:any) {
    for (var i = 0; i < images.length; i++) {
      let image:Image = images[i];
      if (image.id == id) {
        this.image = image;
        this.image_url = image.url;
        break;
      }
    }
  }

  hasValues():boolean {
    if (this.values && this.values.length > 0) {
      for (let value of this.values) {
        if (value.input == null) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

}
