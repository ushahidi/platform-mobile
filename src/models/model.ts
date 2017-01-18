import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

@Injectable()
export class Model {

  constructor(values:any=null) {
    this.copyInto(values);
  }

  public newInstance<M extends Model>(values:any=null) : M {
    return null;
  }

  public getTable() : string {
    return this.constructor['Table'];
  }

  public getColumns() : any[] {
    return this.constructor['Columns'];
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

  public isPersisted() : boolean {
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

}
