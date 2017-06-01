import { Injectable } from '@angular/core';

import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, DOUBLE, PRIMARY_KEY } from '../models/model';

import { User } from '../models/user';
import { Form } from '../models/form';
import { Post } from '../models/post';
import { Tag } from '../models/tag';
import { Collection } from '../models/collection';

@Injectable()
@Table("deployments")
export class Deployment extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.name) {
        this.name = data.name;
      }
      if (data.deployment_name) {
        this.name = data.deployment_name;
      }
      if (data.tier) {
        this.tier = data.tier;
      }
      if (data.status) {
        this.status = data.status;
      }
      if (data.email) {
        this.email = data.email;
      }
      if (data.timezone) {
        this.timezone = data.timezone;
      }
      if (data.language) {
        this.language = data.language;
      }
      if (data.description) {
        this.description = data.description;
      }
      if (data.image) {
        if (data.image.indexOf(" ") != -1) {
          this.image = encodeURI(data.image);
        }
        else {
          this.image = data.image;
        }
      }
      if (data.image_header) {
        if (data.image_header.indexOf(" ") != -1) {
          this.image = encodeURI(data.image_header);
        }
        else {
          this.image = data.image_header;
        }
      }
      if (data.subdomain) {
        this.domain = `${data.subdomain}.ushahidi.io`;
        this.website = `https://${data.subdomain}.ushahidi.io`;
      }
      if (data.website) {
        this.website = data.website;
        this.domain = data.website.replace("https://","").replace("http://","");
      }
      if (data.domain && data.subdomain) {
        this.api = `https://${data.subdomain}.${data.domain}`;
      }
      if (data.backend_url) {
        this.api = data.backend_url;
      }
      if (this.website && data.backend_domain) {
        let link = document.createElement('a');
        link.setAttribute('href', this.website);
        let domain = link.hostname.substring(link.hostname.indexOf(".") + 1);
        this.api = this.website.replace(domain, data.backend_domain);
      }
      if (data.default_view) {
        this.map_zoom = data.default_view.zoom;
        this.map_style = data.default_view.baselayer;
        this.map_latitude = data.default_view.lat;
        this.map_longitude = data.default_view.lon;
      }
      if (data.client_id) {
        this.client_id = data.client_id;
      }
      if (data.client_secret) {
        this.client_secret = data.client_secret;
      }
      if (data.google_analytics_id) {
        this.google_analytics_id = data.google_analytics_id;
      }
      if (data.intercom_app_id) {
        this.intercom_app_id = data.intercom_app_id;
      }
      if (data.mapbox_api_key) {
        this.mapbox_api_key = data.mapbox_api_key;
      }
      if (data.allowed_privileges) {
        this.can_read = data.allowed_privileges.indexOf("read") > -1;
        this.can_create = data.allowed_privileges.indexOf("create") > -1;
        this.can_update = data.allowed_privileges.indexOf("update") > -1;
        this.can_delete = data.allowed_privileges.indexOf("delete") > -1;
      }
    }
  }

  public newInstance<M extends Deployment>(data:any=null):Deployment {
    return new Deployment(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id: number = null;

  @Column("name", TEXT)
  public name: string = null;

  @Column("api", TEXT)
  public api: string = null;

  @Column("website", TEXT)
  public website: string = null;

  @Column("domain", TEXT)
  public domain: string = null;

  @Column("status", TEXT)
  public status: string = null;

  @Column("tier", TEXT)
  public tier: string = null;

  @Column("description", TEXT)
  public description: string = null;

  @Column("timezone", TEXT)
  public timezone: string = null;

  @Column("language", TEXT)
  public language: string = null;

  @Column("email", TEXT)
  public email: string = null;

  @Column("image", TEXT)
  public image: string = null;

  @Column("users_count", INTEGER)
  public users_count: number = null;

  @Column("posts_count", INTEGER)
  public posts_count: number = null;

  @Column("forms_count", INTEGER)
  public forms_count: number = null;

  @Column("collections_count", INTEGER)
  public collections_count: number = null;

  @Column("images_count", INTEGER)
  public images_count: number = null;

  @Column("map_zoom", INTEGER)
  public map_zoom: number = null;

  @Column("map_style", TEXT)
  public map_style: string = null;

  @Column("map_latitude", DOUBLE)
  public map_latitude: number = null;

  @Column("map_longitude", DOUBLE)
  public map_longitude: number = null;

  @Column("client_id", TEXT)
  public client_id: string = null;

  @Column("client_secret", TEXT)
  public client_secret: string = null;

  @Column("google_analytics_id", TEXT)
  public google_analytics_id: string = null;

  @Column("intercom_app_id", TEXT)
  public intercom_app_id: string = null;

  @Column("mapbox_api_key", TEXT)
  public mapbox_api_key: string = null;

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

  public users: User[] = [];

  public forms: Form[] = [];

  public tags: Tag[] = [];

  public posts: Post[] = [];

  public collections: Collection[] = [];

  public hasPosts():boolean {
    return this.posts != null && this.posts.length > 0;
  }

  public hasForms():boolean {
    return this.forms != null && this.forms.length > 0;
  }

  public hasTags():boolean {
    return this.tags != null && this.tags.length > 0;
  }

  public hasCollections():boolean {
    return this.collections != null && this.collections.length > 0;
  }

  public canRead():boolean {
    return this.can_read != null && this.can_read == true;
  }

  public canUpdate():boolean {
    return this.can_update != null && this.can_update == true;
  }

  public canDelete():boolean {
    return this.can_delete != null && this.can_delete == true;
  }

}
