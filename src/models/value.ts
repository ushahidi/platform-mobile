import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, PRIMARY_KEY } from '../models/model';
import { Image } from '../models/image';
import { Attribute } from '../models/attribute';

@Injectable()
@Table("values_")
export class Value extends Model {

  constructor(values:any=null) {
    super(values);
    this.copyInto(values);
  }

  public newInstance<M extends Value>(values:any=null) : Value {
    return new Value(values);
  }

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("post_id", INTEGER, PRIMARY_KEY)
  public post_id: number = null;

  @Column("key", TEXT, PRIMARY_KEY)
  public key: string = null;

  @Column("value", TEXT)
  public value: string = null;

  @Column("label", TEXT)
  public label: string = null;

  @Column("input", TEXT)
  public input: string = null;

  @Column("type", TEXT)
  public type: string = null;

  @Column("cardinality", INTEGER)
  public cardinality: number = null;

  @Column("image", TEXT)
  public image: string = null;

  @Column("caption", TEXT)
  public caption: string = null;

  @Column("saved", TEXT)
  public saved: Date = null;

  public attribute: Attribute = null;

  loadAttribute(attributes:Attribute[]) {
    for (var i = 0; i < attributes.length; i++) {
      let attribute:Attribute = attributes[i];
      if (attribute.key == this.key) {
         this.attribute = attribute;
         this.type = attribute.type;
         this.input = attribute.input;
         this.label = attribute.label;
         this.cardinality = attribute.cardinality;
         break;
      }
    }
  }

  loadImage(images:Image[]) {
    for (var i = 0; i < images.length; i++) {
      let image:Image = images[i];
      if (image.id.toString() == this.value) {
        this.image = image.url;
        break;
      }
    }
  }

  hasPendingImage() {
    return this.input == 'upload' && this.value && this.value.indexOf("file:") > -1;
  }

  hasPendingVideo() {
    return this.input == 'video' && this.value && this.value.indexOf("file:") > -1;
  }

  hasPendingAddress() {
    return this.input == 'location' && this.value && this.value.indexOf(", ") > -1;
  }
}
