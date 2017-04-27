import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Login } from '../models/login';
import { Stage } from '../models/stage';
import { Attribute } from '../models/attribute';

@Injectable()
@Table("forms")
export class Form extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.id) {
        this.id = data.id;
      }
      if (data.type) {
        this.type = data.type;
      }
      if (data.name) {
        this.name = data.name;
      }
      if (data.color) {
        this.color = data.color;
      }
      if (data.created) {
        this.created = data.created;
      }
      if (data.updated) {
        this.updated = data.updated;
      }
      if (data.disabled) {
        this.disabled = data.disabled;
      }
      if (data.description) {
        this.description = data.description;
      }
      if (data.everyone_can_create) {
        this.can_submit = data.everyone_can_create;
      }
      if (data.can_create) {
        this.user_roles = JSON.stringify(data.can_create);
      }
      if (data.allowed_privileges) {
        this.can_read = data.allowed_privileges.indexOf("read") > -1;
        this.can_create = data.allowed_privileges.indexOf("create") > -1;
        this.can_update = data.allowed_privileges.indexOf("update") > -1;
        this.can_delete = data.allowed_privileges.indexOf("delete") > -1;
      }
    }
  }

  public newInstance<M extends Form>(data:any=null):Form {
    return new Form(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("name", TEXT)
  public name: string = null;

  @Column("description", TEXT)
  public description: string = null;

  @Column("type", TEXT)
  public type: string = null;

  @Column("color", TEXT)
  public color: string = null;

  @Column("disabled", BOOLEAN)
  public disabled: boolean = null;

  @Column("user_roles", TEXT)
  public user_roles: string = null;

  @Column("created", TEXT)
  public created: Date = null;

  @Column("updated", TEXT)
  public updated: Date = null;

  @Column("saved", TEXT)
  public saved: Date = null;

  @Column("can_submit", BOOLEAN)
  public can_submit: boolean = null;

  @Column("can_read", BOOLEAN)
  public can_read: boolean = null;

  @Column("can_create", BOOLEAN)
  public can_create: boolean = null;

  @Column("can_update", BOOLEAN)
  public can_update: boolean = null;

  @Column("can_delete", BOOLEAN)
  public can_delete: boolean = null;

  public stages: Stage[] = [];

  public attributes: Attribute[] = [];

  loadStages(stages:Stage[]) {
    if (stages) {
      let unsorted = [];
      for (let stage of stages) {
        if (stage.form_id == this.id) {
          unsorted.push(stage);
        }
      }
      this.stages = unsorted.sort(function(a, b) {
        return a.priority - b.priority;
      });
    }
    else {
      this.stages = [];
    }
  }

  loadAttributes(attributes:Attribute[]) {
    if (attributes) {
      let unsorted = [];
      for (let attribute of attributes) {
        if (attribute.form_id == this.id) {
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

  canSubmit(login:Login=null) {
    if (this.disabled == true) {
      return false;
    }
    if (this.can_submit == true) {
      return true;
    }
    if (login && login.user_role && login.user_role.length > 0) {
      if (login.user_role == 'admin') {
        return true;
      }
      if (this.user_roles && this.user_roles.length > 0) {
        let user_roles = JSON.parse(this.user_roles);
        for (let user_role of user_roles) {
          if (user_role === login.user_role) {
            return true;
          }
        }
      }
    }
    return false;
  }

}
