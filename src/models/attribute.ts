import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Tag } from '../models/tag';

@Injectable()
@Table("attributes")
export class Attribute extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.id) {
        this.id = data.id;
      }
      if (data.form_stage_id) {
        this.form_stage_id = data.form_stage_id;
      }
      if (data.key) {
        this.key = data.key;
      }
      if (data.label) {
        this.label = data.label;
      }
      if (data.instructions) {
        this.instructions = data.instructions;
      }
      if (data.input) {
        this.input = data.input;
      }
      if (data.type) {
        this.type = data.type;
      }
      if (data.required) {
        this.required = data.required;
      }
      if (data.priority) {
        this.priority = data.priority;
      }
      if (data.options) {
        this.options = data.options;
      }
      if (data.cardinality) {
        this.cardinality = data.cardinality;
      }
      if (data.form_id) {
        this.form_id = data.form_id;
      }
      if (data.allowed_privileges) {
        this.can_read = data.allowed_privileges.indexOf("read") > -1;
        this.can_create = data.allowed_privileges.indexOf("create") > -1;
        this.can_update = data.allowed_privileges.indexOf("update") > -1;
        this.can_delete = data.allowed_privileges.indexOf("delete") > -1;
      }
    }
  }

  public newInstance<M extends Attribute>(data:any=null):Attribute {
    return new Attribute(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("form_id", INTEGER)
  public form_id: number = null;

  @Column("form_stage_id", INTEGER)
  public form_stage_id: number = null;

  @Column("key", TEXT)
  public key: string = null;

  @Column("label", TEXT)
  public label: string = null;

  @Column("instructions", TEXT)
  public instructions: string = null;

  @Column("input", TEXT)
  public input: string = null;

  @Column("type", TEXT)
  public type: string = null;

  @Column("required", BOOLEAN)
  public required: boolean = null;

  @Column("priority", INTEGER)
  public priority: number = null;

  @Column("cardinality", INTEGER)
  public cardinality: number = null;

  @Column("options", TEXT)
  public options: string = null;

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

  public tags: Tag[] = [];

  getOptions():string[] {
    if (this.options == null) {
      return [];
    }
    else if (Array.isArray(this.options)) {
      return this.options;
    }
    else {
      return this.options.split(',');
    }
  }

  loadTags(tags:Tag[]) {
    if (this.input == 'tags' && tags && tags.length > 0) {
      let parents = [];
      let options:string[] = this.getOptions();
      for (let tag of tags) {
        tag.tags = tags.filter(_tag => _tag.parent_id == tag.id);
        if (tag.parent_id) {
          // IGNORE tags with parent_id since they are added as children
        }
        else if (options.indexOf(tag.id.toString()) != -1) {
          parents.push(tag);
        }
      }
      this.tags = parents;
    }
    else {
      this.tags = [];
    }
  }

}
