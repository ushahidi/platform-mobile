import { Injectable } from '@angular/core';

import { Table, TABLE } from '../decorators/table';
import { Column, COLUMNS } from '../decorators/column';

export let TEXT:string = "TEXT";
export let INTEGER:string = "INTEGER";
export let DOUBLE:string = "DOUBLE";
export let PRIMARY_KEY:boolean = true;

@Injectable()
export class Model {

  constructor(values:any=null) {
    this.copyInto(values);
  }

  public newInstance<M extends Model>(values:any=null) : M {
    return null;
  }

  public getTable() : string {
    return this.constructor[TABLE];
  }

  public getColumns() : any[] {
    return this.constructor[COLUMNS];
  }

  public getValues() : any {
    let values = {};
    let columns = this.getColumns();
    for (let index in columns) {
      let column = columns[index];
      let property = column.property;
      values[property] = this[property];
    }
    return values;
  }

  public hasKeys() : boolean {
    let columns = this.getColumns();
    for (let index in columns) {
      let column = columns[index];
      let property = column.property;
      if (column.key == true && this[property] == null) {
        return false;
      }
    }
    return true;
  }

  public copyInto(values:any) : Model {
    if (values != null) {
      for (let key in values) {
        if (values[key] != null) {
          this[key] = values[key];
        }
      }
    }
    return this;
  }

  public isPersisted() : boolean {
    return false;
  }

}
