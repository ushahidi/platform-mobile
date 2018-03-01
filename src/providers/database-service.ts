import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';

import { Deployment } from '../models/deployment';
import { User } from '../models/user';
import { Form } from '../models/form';
import { Stage } from '../models/stage';
import { Attribute } from '../models/attribute';
import { Post } from '../models/post';
import { Value } from '../models/value';
import { Image } from '../models/image';
import { Collection } from '../models/collection';
import { Filter } from '../models/filter';
import { Tag } from '../models/tag';

import { SqlService } from '../providers/sql-service';
import { LoggerService } from '../providers/logger-service';

@Injectable()
export class DatabaseService extends SqlService {

  constructor(
    protected sqlite:SQLite,
    protected platform:Platform,
    protected logger:LoggerService) {
      super(sqlite, platform, logger);
  }

  public saveDeployment(deployment:Deployment):Promise<boolean> {
    return this.saveModel(deployment);
  }

  public getDeployments(where:{}=null, order:{}=null):Promise<Deployment[]> {
    return this.getModels<Deployment>(new Deployment(), where, order);
  }

  public getDeployment(id:number):Promise<Deployment> {
    let where = { id: id };
    return this.getModel<Deployment>(new Deployment(), where);
  }

  public removeDeployment(deployment:Deployment):Promise<boolean> {
    let where = { id: deployment.id };
    return this.removeModel<Deployment>(new Deployment(), where);
  }

  public getForms(deployment:Deployment):Promise<Form[]> {
    let where = { deployment_id: deployment.id };
    let order = { name: "ASC" };
    return this.getModels<Form>(new Form(), where, order);
  }

  public getForm(deployment:Deployment, id:number):Promise<Form> {
    let where = {
      deployment_id: deployment.id,
      id: id
    };
    return this.getModel<Form>(new Form(), where);
  }

  public saveForm(deployment:Deployment, form:Form):Promise<boolean>  {
    form.deployment_id = deployment.id;
    return this.saveModel(form);
  }

  public removeForms(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Form>(new Form(), where);
  }

  public getUsers(deployment:Deployment):Promise<User[]> {
    let where = { deployment_id: deployment.id };
    let order = {};
    return this.getModels<User>(new User(), where, order);
  }

  public getUser(deployment:Deployment, id:number):Promise<User> {
    let where = {
      deployment_id: deployment.id,
      id: id
    };
    return this.getModel<User>(new User(), where);
  }

  public saveUser(deployment:Deployment, user:User):Promise<boolean>  {
    user.deployment_id = deployment.id;
    return this.saveModel(user);
  }

  public removeUsers(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<User>(new User(), where);
  }

  public getPosts(deployment:Deployment, filter:Filter=null, limit:number=null, offset:number=null):Promise<Post[]> {
    let postsWhere = { deployment_id: deployment.id };
    let valuesWhere = { deployment_id: deployment.id };
    let statuses = [];
    if (filter == null || filter.show_published) {
      statuses.push("published");
    }
    if (filter == null || filter.show_archived) {
      statuses.push("archived");
    }
    if (filter == null || filter.show_inreview) {
      statuses.push("draft");
    }
    if (statuses.length > 0) {
      postsWhere['status'] = statuses;
    }
    if (filter && filter.show_forms && filter.show_forms.length > 0) {
      postsWhere['form_id'] = filter.show_forms.split(",");
    }
    if (filter && filter.search_text && filter.search_text.length > 0) {
      postsWhere['title'] = `%${filter.search_text}%`;
    }
    return Promise.all([
      this.getModels<Post>(new Post(), postsWhere, { created: "DESC" }, limit, offset),
      this.getModels<Value>(new Value(), valuesWhere, { cardinality: "ASC" })]).
      then((results:any[]) => {
        let posts = <Post[]>results[0];
        let values = <Value[]>results[1];
        for (let post of posts) {
          post.loadValues(values);
        }
        this.logger.info(this, "getPosts", posts.length);
        return posts;
      });
  }

  public getPostsByIDs(deployment:Deployment, ids:number[]):Promise<Post[]> {
    let postsWhere = {
      deployment_id: deployment.id,
      id: ids };
    let valuesWhere = {
      deployment_id: deployment.id
    };
    return Promise.all([
      this.getModels<Post>(new Post(), postsWhere, { created: "DESC" }),
      this.getModels<Value>(new Value(), valuesWhere, { cardinality: "ASC" })]).
      then((results:any[]) => {
        let posts = <Post[]>results[0];
        let values = <Value[]>results[1];
        for (let post of posts) {
          post.loadValues(values);
        }
        this.logger.info(this, "getPostsByIDs", posts.length);
        return posts;
      });
  }

  public getPostsPending(deployment:Deployment):Promise<Post[]> {
    let where = { deployment_id: deployment.id, pending: true };
    let order = { created: "DESC" };
    return this.getModels<Post>(new Post(), where, order);
  }

  public getPost(deployment:Deployment, id:number):Promise<Post> {
    let where = {
      deployment_id: deployment.id,
      id: id };
    return this.getModel<Post>(new Post(), where);
  }

  public savePost(deployment:Deployment, post:Post):Promise<boolean>  {
    post.deployment_id = deployment.id;
    return this.saveModel(post);
  }

  public removePosts(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Post>(new Post(), where);
  }

  public removePost(deployment:Deployment, post:Post):Promise<boolean> {
    let where = {
      deployment_id: deployment.id,
      id: post.id };
    return this.removeModel<Post>(new Post(), where);
  }

  public getPostsLowestID():Promise<number> {
    return this.getMinium<Post>(new Post(), "id");
  }

  public getImages(deployment:Deployment, limit:number=null, offset:number=null):Promise<Image[]> {
    let where = { deployment_id: deployment.id };
    let order = { created: "DESC" };
    return this.getModels<Image>(new Image(), where, order, limit, offset);
  }

  public getImage(deployment:Deployment, id:number):Promise<Image> {
    let where = { deployment_id: deployment.id, id: id };
    return this.getModel<Image>(new Image(), where);
  }

  public saveImage(deployment:Deployment, image:Image):Promise<boolean>  {
    image.deployment_id = deployment.id;
    return this.saveModel(image);
  }

  public removeImages(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Image>(new Image(), where);
  }

  public getPostsWithValues(deployment:Deployment):Promise<Post[]> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getPosts(deployment),
        this.getValues(deployment),
        this.getUsers(deployment),
        this.getForms(deployment)]).then(
          (results:any[]) => {
            let posts = <Post[]>results[0];
            let values = <Value[]>results[1];
            let users = <User[]>results[2];
            let forms = <Form[]>results[3];
            for (let post of posts) {
              post.loadUser(users);
              post.loadForm(forms);
              post.loadValues(values);
            }
            resolve(posts);
          },
          (error:any) => {
            reject(error);
          });
    });
  }

  public getAttributes(deployment:Deployment, form_id:number=null):Promise<Attribute[]> {
    let where = { deployment_id: deployment.id };
    if (form_id != null) {
      where['form_id'] = form_id;
    }
    let order = { priority: "ASC" };
    return this.getModels<Attribute>(new Attribute(), where, order);
  }

  public saveAttribute(deployment:Deployment, attribute:Attribute) {
    attribute.deployment_id = deployment.id;
    return this.saveModel(attribute);
  }

  public removeAttributes(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Attribute>(new Attribute(), where);
  }

  public getFormsWithAttributes(deployment:Deployment):Promise<Form[]> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getForms(deployment),
        this.getStages(deployment),
        this.getAttributes(deployment),
        this.getTags(deployment)]).then(
          (results:any[]) => {
            let forms:Form[] = <Form[]>results[0];
            let stages:Stage[] = <Stage[]>results[1];
            let attributes:Attribute[] = <Attribute[]>results[2];
            let tags:Tag[] = <Tag[]>results[3];
            for (let form of forms) {
              form.loadStages(stages);
              for (let stage of stages) {
                stage.loadAttributes(attributes);
              }
              form.loadAttributes(attributes);
            }
            for (let attribute of attributes) {
              attribute.loadTags(tags);
            }
            resolve(forms);
          },
          (error:any) => {
            reject(error);
          });
    });
  }

  public getFormWithAttributes(deployment:Deployment, id:number):Promise<Form> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getForm(deployment, id),
        this.getStages(deployment, id),
        this.getAttributes(deployment, id),
        this.getTags(deployment, id)]).then(
          (results:any[]) => {
            let form:Form = <Form>results[0];
            let stages:Stage[] = <Stage[]>results[1];
            let attributes:Attribute[] = <Attribute[]>results[2];
            let tags:Tag[] = <Tag[]>results[3];
            form.loadStages(stages);
            for (let stage of stages) {
              stage.loadAttributes(attributes);
            }
            form.loadAttributes(attributes);
            for (let attribute of attributes) {
              attribute.loadTags(tags);
            }
            resolve(form);
          },
          (error:any) => {
            reject(error);
          });
    });
  }

  public getStages(deployment:Deployment, form_id:number=null):Promise<Stage[]> {
    let where = { deployment_id: deployment.id };
    if (form_id != null) {
      where['form_id'] = form_id;
    }
    let order = { priority: "ASC" };
    return this.getModels<Stage>(new Stage(), where, order);
  }

  public saveStage(deployment:Deployment, stage:Stage):Promise<boolean>  {
    stage.deployment_id = deployment.id;
    return this.saveModel(stage);
  }

  public removeStages(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Stage>(new Stage(), where);
  }

  public getValues(deployment:Deployment, post:Post=null):Promise<Value[]> {
    let where:any = { deployment_id: deployment.id };
    if (post != null) {
      where['post_id'] = post.id;
    }
    let order = { cardinality: "ASC" };
    return this.getModels<Value>(new Value(), where, order);
  }

  public saveValue(deployment:Deployment, value:Value):Promise<boolean>  {
    value.deployment_id = deployment.id;
    return this.saveModel(value);
  }

  public removeValues(deployment:Deployment, post:Post=null):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    if (post != null) {
      where['post_id'] = post.id;
    }
    return this.removeModel<Value>(new Value(), where);
  }

  public getFilter(deployment:Deployment):Promise<Filter> {
    let where:any = { deployment_id: deployment.id };
    return this.getModel<Filter>(new Filter(), where);
  }

  public saveFilter(deployment:Deployment, filter:Filter):Promise<boolean>  {
    filter.deployment_id = deployment.id;
    return this.saveModel(filter);
  }

  public removeFilters(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Filter>(new Filter(), where);
  }

  public getCollections(deployment:Deployment):Promise<Collection[]> {
    let where:any = { deployment_id: deployment.id };
    let order = { name: "ASC" };
    return this.getModels<Collection>(new Collection(), where, order);
  }

  public saveCollection(deployment:Deployment, collection:Collection):Promise<boolean> {
    collection.deployment_id = deployment.id;
    return this.saveModel(collection);
  }

  public removeCollections(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Collection>(new Collection(), where);
  }

  public getTags(deployment:Deployment, form_id:number=null):Promise<Tag[]> {
    let where = { deployment_id: deployment.id };
    if (form_id != null) {
      where['form_id'] = form_id;
    }
    let order = { priority: "ASC" };
    return this.getModels<Tag>(new Tag(), where, order);
  }

  public saveTag(deployment:Deployment, tag:Tag):Promise<boolean> {
    tag.deployment_id = deployment.id;
    return this.saveModel(tag);
  }

  public removeTags(deployment:Deployment):Promise<boolean> {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Tag>(new Tag(), where);
  }

}
