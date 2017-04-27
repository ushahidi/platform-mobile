import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Form } from '../models/form';

@Injectable()
@Table("filters")
export class Filter extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Filter>(data:any=null):Filter {
    return new Filter(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("deployment_id", INTEGER, PRIMARY_KEY)
  public deployment_id: number = null;

  @Column("search_text", TEXT)
  public search_text: string = null;

  @Column("show_inreview", BOOLEAN)
  public show_inreview: boolean = null;

  @Column("show_published", BOOLEAN)
  public show_published: boolean = null;

  @Column("show_archived", BOOLEAN)
  public show_archived: boolean = null;

  @Column("show_forms", TEXT)
  public show_forms: string = null;

  @Column("saved", TEXT)
  public saved: Date = null;

  public showForm(form:Form) : boolean {
    if (this.show_forms != null && this.show_forms.length > 0) {
      let forms:string[] = this.show_forms.split(",");
      return forms.indexOf(form.id.toString()) > -1;
    }
    return false;
  }

  public addForm(form:Form) {
    if (this.show_forms != null && this.show_forms.length > 0) {
      let forms:string[] = this.show_forms.split(",");
      forms.push(form.id.toString());
      this.show_forms = forms.join(",");
    }
    else {
      this.show_forms = form.id.toString();
    }
  }

  public removeForm(form:Form) {
    if (this.show_forms != null && this.show_forms.length > 0) {
      let forms:string[] = this.show_forms.split(",");
      var index = forms.indexOf(form.id.toString(), 0);
      if (index > -1) {
        forms.splice(index, 1);
      }
      this.show_forms = forms.join(",");
    }
  }

  public getStatus():string {
    let status = [];
    if (this.show_published) {
      status.push("published");
    }
    if (this.show_archived) {
      status.push("archived");
    }
    if (this.show_inreview) {
      status.push("draft");
    }
    return status.join(",");
  }

}
