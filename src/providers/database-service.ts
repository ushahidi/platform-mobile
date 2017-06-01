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

  saveDeployment(deployment:Deployment) {
    return this.saveModel(deployment);
  }

  getDeployments(where:{}=null, order:{}=null):Promise<Deployment[]> {
    return this.getModels<Deployment>(new Deployment(), where, order);
  }

  getDeployment(id:number):Promise<Deployment> {
    let where = { id: id };
    return this.getModel<Deployment>(new Deployment(), where);
  }

  removeDeployment(deployment:Deployment) {
    let where = { id: deployment.id };
    return this.removeModel<Deployment>(new Deployment(), where);
  }

  getForms(deployment:Deployment):Promise<Form[]> {
    let where = { deployment_id: deployment.id };
    let order = { name: "ASC" };
    return this.getModels<Form>(new Form(), where, order);
  }

  getForm(deployment:Deployment, id:number):Promise<Form> {
    let where = {
      deployment_id: deployment.id,
      id: id };
    return this.getModel<Form>(new Form(), where);
  }

  saveForm(deployment:Deployment, form:Form) {
    form.deployment_id = deployment.id;
    return this.saveModel(form);
  }

  removeForms(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Form>(new Form(), where);
  }

  getUsers(deployment:Deployment):Promise<User[]> {
    let where = { deployment_id: deployment.id };
    let order = {};
    return this.getModels<User>(new User(), where, order);
  }

  saveUser(deployment:Deployment, user:User) {
    user.deployment_id = deployment.id;
    return this.saveModel(user);
  }

  removeUsers(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<User>(new User(), where);
  }

  getPosts(deployment:Deployment, filter:Filter=null, limit:number=null, offset:number=null):Promise<Post[]> {
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
      postsWhere['title'] = `%${ filter.search_text}%`;
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

  getPostsPending(deployment:Deployment):Promise<Post[]> {
    let where = { deployment_id: deployment.id, pending: true };
    let order = { created: "DESC" };
    return this.getModels<Post>(new Post(), where, order);
  }

  getPost(deployment:Deployment, id:number):Promise<Post> {
    let where = {
      deployment_id: deployment.id,
      id: id };
    return this.getModel<Post>(new Post(), where);
  }

  savePost(deployment:Deployment, post:Post) {
    post.deployment_id = deployment.id;
    return this.saveModel(post);
  }

  removePosts(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Post>(new Post(), where);
  }

  removePost(deployment:Deployment, post:Post) {
    let where = {
      deployment_id: deployment.id,
      id: post.id };
    return this.removeModel<Post>(new Post(), where);
  }

  getPostsLowestID():Promise<number> {
    return this.getMinium<Post>(new Post(), "id");
  }

  getImages(deployment:Deployment, limit:number=null, offset:number=null):Promise<Image[]> {
    let where = { deployment_id: deployment.id };
    let order = { created: "DESC" };
    return this.getModels<Image>(new Image(), where, order, limit, offset);
  }

  getImage(deployment:Deployment, id:number):Promise<Image> {
    let where = { deployment_id: deployment.id, id: id };
    return this.getModel<Image>(new Image(), where);
  }

  saveImage(deployment:Deployment, image:Image) {
    image.deployment_id = deployment.id;
    return this.saveModel(image);
  }

  removeImages(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Image>(new Image(), where);
  }

  getPostsWithValues(deployment:Deployment):Promise<Post[]> {
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

  getAttributes(deployment:Deployment, form_id:number=null):Promise<Attribute[]> {
    let where = { deployment_id: deployment.id };
    if (form_id != null) {
      where['form_id'] = form_id;
    }
    let order = { priority: "ASC" };
    return this.getModels<Attribute>(new Attribute(), where, order);
  }

  saveAttribute(deployment:Deployment, attribute:Attribute) {
    attribute.deployment_id = deployment.id;
    return this.saveModel(attribute);
  }

  removeAttributes(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Attribute>(new Attribute(), where);
  }

  getFormsWithAttributes(deployment:Deployment):Promise<Form[]> {
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

  getFormWithAttributes(deployment:Deployment, id:number):Promise<Form> {
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

  getStages(deployment:Deployment, form_id:number=null):Promise<Stage[]> {
    let where = { deployment_id: deployment.id };
    if (form_id != null) {
      where['form_id'] = form_id;
    }
    let order = { priority: "ASC" };
    return this.getModels<Stage>(new Stage(), where, order);
  }

  saveStage(deployment:Deployment, stage:Stage) {
    stage.deployment_id = deployment.id;
    return this.saveModel(stage);
  }

  removeStages(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Stage>(new Stage(), where);
  }

  getValues(deployment:Deployment, post:Post=null):Promise<Value[]> {
    let where:any = { deployment_id: deployment.id };
    if (post != null) {
      where['post_id'] = post.id;
    }
    let order = { cardinality: "ASC" };
    return this.getModels<Value>(new Value(), where, order);
  }

  saveValue(deployment:Deployment, value:Value) {
    value.deployment_id = deployment.id;
    return this.saveModel(value);
  }

  removeValues(deployment:Deployment, post:Post=null) {
    let where = { deployment_id: deployment.id };
    if (post != null) {
      where['post_id'] = post.id;
    }
    return this.removeModel<Value>(new Value(), where);
  }

  getFilter(deployment:Deployment):Promise<Filter> {
    let where:any = { deployment_id: deployment.id };
    return this.getModel<Filter>(new Filter(), where);
  }

  saveFilter(deployment:Deployment, filter:Filter) {
    filter.deployment_id = deployment.id;
    return this.saveModel(filter);
  }

  removeFilters(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Filter>(new Filter(), where);
  }

  getCollections(deployment:Deployment):Promise<Collection[]> {
    let where:any = { deployment_id: deployment.id };
    let order = { name: "ASC" };
    return this.getModels<Collection>(new Collection(), where, order);
  }

  saveCollection(deployment:Deployment, collection:Collection) {
    collection.deployment_id = deployment.id;
    return this.saveModel(collection);
  }

  removeCollections(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Collection>(new Collection(), where);
  }

  getTags(deployment:Deployment, form_id:number=null):Promise<Tag[]> {
    let where = { deployment_id: deployment.id };
    if (form_id != null) {
      where['form_id'] = form_id;
    }
    let order = { priority: "ASC" };
    return this.getModels<Tag>(new Tag(), where, order);
  }

  saveTag(deployment:Deployment, tag:Tag) {
    tag.deployment_id = deployment.id;
    return this.saveModel(tag);
  }

  removeTags(deployment:Deployment) {
    let where = { deployment_id: deployment.id };
    return this.removeModel<Tag>(new Tag(), where);
  }

}
