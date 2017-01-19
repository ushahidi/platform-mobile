import { Injectable } from '@angular/core';

import { Model, TEXT, INTEGER, DOUBLE, PRIMARY_KEY } from '../models/model';
import { Deployment } from '../models/deployment';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

@Injectable()
@Table("images")
export class Image extends Model {

  constructor(values:any=null) {
    super(values);
    this.copyInto(values);
  }

  public newInstance<M extends Image>(values:any=null) : Image {
    return new Image(values);
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
  public created: string = null;

  @Column("updated", TEXT)
  public updated: string = null;

}
