import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Injectable()
@Table("images")
export class Image extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.original_file_url) {
        this.url = encodeURI(data.original_file_url);
      }
      if (data.original_width) {
        this.width = data.original_width;
      }
      if (data.original_height) {
        this.height = data.original_height;
      }
      if (data.original_file_size) {
        this.filesize = data.original_file_size;
      }
      if (data.allowed_privileges) {
        this.can_read = data.allowed_privileges.indexOf("read") > -1;
        this.can_create = data.allowed_privileges.indexOf("create") > -1;
        this.can_update = data.allowed_privileges.indexOf("update") > -1;
        this.can_delete = data.allowed_privileges.indexOf("delete") > -1;
      }
    }
  }

  public newInstance<M extends Image>(data:any=null):Image {
    return new Image(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("post_id", INTEGER)
  public post_id: number = null;

  @Column("user_id", INTEGER)
  public user_id: number = null;

  @Column("url", TEXT)
  public url: string = null;

  @Column("mime", TEXT)
  public mime: string = null;

  @Column("caption", TEXT)
  public caption: string = null;

  @Column("filesize", INTEGER)
  public filesize: number = null;

  @Column("width", INTEGER)
  public width: number = null;

  @Column("height", INTEGER)
  public height: number = null;

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

}
