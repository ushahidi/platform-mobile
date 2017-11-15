import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Attribute } from '../models/attribute';

@Table("stages")
export class Stage extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data && data.allowed_privileges) {
      this.can_read = data.allowed_privileges.indexOf("read") > -1;
      this.can_create = data.allowed_privileges.indexOf("create") > -1;
      this.can_update = data.allowed_privileges.indexOf("update") > -1;
      this.can_delete = data.allowed_privileges.indexOf("delete") > -1;
    }
  }

  public newInstance<M extends Stage>(data:any=null):Stage {
    return new Stage(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id:number = null;

  @Column("form_id", INTEGER)
  public form_id:number = null;

  @Column("label", TEXT)
  public label:string = null;

  @Column("description", TEXT)
  public description:string = null;

  @Column("priority", INTEGER)
  public priority:number = null;

  @Column("type", TEXT)
  public type:string = null;

  @Column("icon", TEXT)
  public icon:string = null;

  @Column("required", BOOLEAN)
  public required:boolean = null;

  @Column("show_when_published", BOOLEAN)
  public show_when_published:boolean = null;

  @Column("can_read", BOOLEAN)
  public can_read:boolean = null;

  @Column("can_create", BOOLEAN)
  public can_create:boolean = null;

  @Column("can_update", BOOLEAN)
  public can_update:boolean = null;

  @Column("can_delete", BOOLEAN)
  public can_delete:boolean = null;

  public attributes:Attribute[] = [];

  loadAttributes(attributes:Attribute[]) {
    if (attributes) {
      let unsorted = [];
      for (let attribute of attributes) {
        if (attribute.form_id == this.form_id && attribute.form_stage_id == this.id) {
          if (this.show_when_published != null) {
            attribute.show_when_published = this.show_when_published;
          }
          unsorted.push(attribute);
        }
      }
      this.attributes = unsorted.sort(function(a, b) {
        return a.priority - b.priority;
      });
    }
    else {
      this.attributes = [];
    }
  }

}
