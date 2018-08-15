import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Events, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';

import * as L from 'leaflet';

import { TileLayer } from '../../maps/tile-layer';
import { MapMarker } from '../../maps/map-marker';

import { TruncatePipe } from '../../pipes/truncate';

import { Login } from '../../models/login';
import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';
import { Form } from '../../models/form';
import { Filter } from '../../models/filter';
import { Collection } from '../../models/collection';
import { Value } from '../../models/value';
import { Image } from '../../models/image';
import { User } from '../../models/user';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';
import { CacheService } from '../../providers/cache-service';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseAddPage } from '../response-add/response-add';
import { ResponseDetailsPage } from '../response-details/response-details';
import { ResponseSearchPage } from '../response-search/response-search';

import { POST_UPDATED, POST_DELETED } from '../../constants/events';
import { PLACEHOLDER_LATITUDE, PLACEHOLDER_LONGITUDE } from '../../constants/placeholders';

@Component({
  selector: 'response-list-page',
  templateUrl: 'response-list.html',
  providers: [ ApiService, DatabaseService, CacheService, LoggerService ],
  entryComponents:[ ResponseAddPage, ResponseDetailsPage, ResponseSearchPage ]
})
export class ResponseListPage extends BasePage {

  login:Login = null;
  deployment:Deployment = null;
  posts:Post[] = null;
  pending:Post[] = null;
  filter:Filter = null;
  view:string = 'list';
  mapZoom:number = 8;
  mapOptions:string= null;
  mapStyle:string = "streets";
  mapLayer:any = null;
  mapPins:boolean = true;
  mapLatitude:number = PLACEHOLDER_LATITUDE;
  mapLongitude:number = PLACEHOLDER_LONGITUDE;
  limit:number = 5;
  offset:number = 0;
  loading:boolean = false;
  refreshing:boolean = false;
  interrupted:string = "Interrupted";
  map:any=null;

  @ViewChild(Content)
  content: Content;

  constructor(
    protected zone:NgZone,
    protected platform:Platform,
    protected navParams:NavParams,
    protected navController:NavController,
    protected viewController:ViewController,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected alertController:AlertController,
    protected loadingController:LoadingController,
    protected actionController:ActionSheetController,
    protected logger:LoggerService,
    protected api:ApiService,
    protected database:DatabaseService,
    protected cache:CacheService,
    protected geolocation: Geolocation,
    protected events:Events) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.settings.getMapMarkerPins().then((mapPins:boolean) => {
      this.mapPins = mapPins;
    });
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    if (this.deployment == null) {
      this.deployment = this.getParameter<Deployment>("deployment");
    }
    this.login = this.getParameter<Login>("login");
    this.loadUpdates(null, true).then((loaded:any) => {
      this.logger.info(this, 'ionViewWillEnter', "loadUpdates", "Loaded");
    },
    (error:any) => {
      this.logger.error(this, 'ionViewWillEnter', "loadUpdates", "Failed", error);
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.events.subscribe(POST_DELETED, (post_id:number) => {
      this.logger.info(this, 'ionViewDidLoad', POST_DELETED, post_id);
      this.loading = true;
      this.posts = null;
      this.loadPosts(true).then((loaded:any) => {
        this.logger.info(this, 'ionViewDidLoad', POST_DELETED, post_id, "Loaded");
      },
      (error:any) => {
        this.logger.error(this, 'ionViewDidLoad', POST_DELETED, post_id, "Failed", error);
      });
    });
    this.events.subscribe(POST_UPDATED, (post_id:number) => {
      this.logger.info(this, 'ionViewDidLoad', POST_UPDATED, post_id);
      this.loading = true;
      this.posts = null;
      this.loadPosts(true).then((loaded:any) => {
        this.logger.info(this, 'ionViewDidLoad', POST_UPDATED, post_id, "Loaded");
      },
      (error:any) => {
        this.logger.error(this, 'ionViewDidLoad', POST_UPDATED, post_id, "Failed", error);
      });
    });
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.events.unsubscribe(POST_DELETED);
    this.events.unsubscribe(POST_UPDATED);
  }

  private loadUpdates(event:any=null, cache:boolean=false) {
    this.logger.info(this, "loadUpdates", cache);
    this.loading = true;
    this.refreshing = event != null;
    return Promise.resolve()
      .then(() => { return this.loadLogin(cache); })
      .then(() => { return this.loadFilters(cache); })
      .then(() => { return this.loadPosts(cache); })
      .then(() => { return this.loadUsers(cache); })
      .then(() => { return this.loadImages(cache); })
      .then(() => { return this.uploadPending(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Updated");
        if (event != null) {
          event.complete();
        }
        this.loading = false;
        this.refreshing = false;
      })
      .catch((error:any) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event != null) {
          event.complete();
        }
        this.loading = false;
        this.refreshing = false;
        this.language.getTranslations([
          'RESPONSES_ERROR',
          'RESPONSES_ERROR_INTERNET']).then((translations:string[]) => {
            if (this.offline == false) {
              this.showToast(translations[0]);
            }
            else {
              this.showToast(translations[1]);
            }
        });
      });
  }

  private loadLogin(cache:boolean=true):Promise<Login> {
    this.logger.info(this, "loadLogin", cache);
    if (cache && this.login) {
      this.logger.info(this, "loadLogin", "Cached", this.login);
      return Promise.resolve(this.login);
    }
    else {
      return new Promise((resolve, reject) => {
        this.api.userOrClientLogin(this.deployment, this.offline).then(
          (login:Login) => {
            this.logger.info(this, "loadLogin", "Loaded", login);
            this.login = login;
            resolve(login);
          },
          (error:any) => {
            this.logger.error(this, "loadLogin", "Failed", error);
            reject(error);
          });
      });
    }
  }

  private loadFilters(cache:boolean=true):Promise<any> {
    if (cache && this.filter) {
      this.logger.info(this, "loadFilters", "Cached", this.filter);
      this.resizeContent();
      return Promise.resolve();
    }
    else {
      return new Promise((resolve, reject) => {
        this.database.getFilter(this.deployment).then(
          (filter:Filter) => {
            this.logger.info(this, "loadFilters", "Loaded", filter);
            this.filter = filter;
            this.resizeContent();
            resolve();
          },
          (error:any) => {
            this.logger.info(this, "loadFilters", "Failed", error);
            this.filter = null;
            resolve();
          });
      });
    }
  }

  private loadPosts(cache:boolean=true):Promise<boolean> {
    if (cache && this.posts != null && this.posts.length >= this.limit) {
      this.logger.info(this, "loadPosts", "Cached", this.posts.length);
      return Promise.resolve(true);
    }
    else {
      this.logger.info(this, "loadPosts", "Cache", cache);
      return new Promise((resolve, reject) => {
        this.offset = 0;
        this.api.getPostsWithValues(this.deployment, this.filter, cache, this.offline, this.limit, this.offset).then(
          (posts:Post[]) => {
            this.posts = posts;
            this.pending = this.getPending(posts);
            this.logger.info(this, "loadPosts", "Posts", posts.length, "Pending", this.pending.length);
            resolve(true);
          },
          (error:any) => {
            this.logger.error(this, "loadPosts", "Failed", error);
            reject(error);
          });
        });
    }
  }

  private loadUsers(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadUsers");
      let users = [];
      for (let post of this.posts) {
        if (post.user == null && post.user_id != null) {
          users.push(this.loadUser(post));
        }
      }
      Promise.all(users).then((loaded) => {
        this.logger.info(this, "loadUsers", "Loaded");
        resolve(true);
      },
      (error) => {
        this.logger.error(this, "loadUsers", "Failed", error);
        resolve(false);
      });
    });
  }

  private loadUser(post:Post):Promise<User> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadUser", post.title);
      this.api.getUser(this.deployment, post.user_id, true, this.offline).then((user:User) => {
        this.logger.info(this, "loadUser", post.title, "User", user, "Downloaded", user);
        post.user = user;
        let saves = [
          this.database.saveUser(this.deployment, user),
          this.database.savePost(this.deployment, post)
        ];
        Promise.all(saves).then((saved) => {
          this.logger.info(this, "loadImage", post.title, "User", user, "Saved", user);
          resolve(user);
        });
      },
      (error:any) => {
        resolve(null);
      });
    });
  }

  private loadImages(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadImages");
      let images = [];
      for (let post of this.posts) {
        for (let value of post.values) {
          if (value.hasMissingImage()) {
            images.push(this.loadImage(post, value));
          }
        }
        this.cache.fetchMap(this.deployment.mapbox_api_key, post.latitude, post.longitude);
      }
      Promise.all(images).then((saved) => {
        this.logger.info(this, "loadImages", "Loaded");
        resolve(true);
      },
      (error) => {
        this.logger.error(this, "loadImages", "Failed", error);
        resolve(false);
      });
    });
  }

  private loadImage(post:Post, value:Value):Promise<Image> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadImage", post.title, "Value", value.value);
      let id = Number(value.value);
      this.api.getImage(this.deployment, id, true, this.offline).then((image:Image) => {
        this.logger.info(this, "loadImage", post.title, "Value", value.value, "Downloaded", image);
        image.post_id = post.id;
        value.image = image.url;
        post.image = image;
        post.image_url = image.url;
        let saves = [
          this.database.saveImage(this.deployment, image),
          this.database.saveValue(this.deployment, value),
          this.database.savePost(this.deployment, post)
        ];
        Promise.all(saves).then((saved) => {
          this.logger.info(this, "loadImage", post.title, "Value", value.value, "Saved", image);
          this.cache.fetchImage(image.url);
          resolve(image);
        });
      },
      (error:any) => {
        resolve(null);
      });
    });
  }

  private loadMore(event, cache:boolean=true) {
    this.logger.info(this, "loadMore", cache);
    this.loading = true;
    this.offset = this.offset + this.limit;
    this.logger.info(this, "loadMore", "Filter", this.filter, "Limit", this.limit, "Offset", this.offset);
    this.api.getPostsWithValues(this.deployment, this.filter, cache, this.offline, this.limit, this.offset).then(
      (posts:Post[]) => {
        this.posts = this.posts.concat(posts);
        this.pending = this.getPending(this.posts);
        let images = [];
        for (let post of posts) {
          for (let value of post.values) {
            if (value.hasMissingImage()) {
              images.push(this.loadImage(post, value));
            }
          }
          this.cache.fetchMap(this.deployment.mapbox_api_key, post.latitude, post.longitude);
        }
        return Promise.all(images).then((saved) => {
          this.logger.info(this, "loadMore", "Filter", this.filter, "Limit", this.limit, "Offset", this.offset, "Posts", this.posts.length, "Pending", this.pending.length);
          this.loading = false;
        });
      },
      (error:any) => {
        this.logger.error(this, "loadMore", "Failed", error);
        this.loading = false;
        this.showToast(error);
      });
  }

  private uploadPending(cache:boolean=true):Promise<any> {
    if (cache || this.offline) {
      this.logger.info(this, "uploadPending", "Skipping");
      return Promise.resolve();
    }
    else if (this.pending == null || this.pending.length == 0) {
      this.logger.info(this, "uploadPending", "None");
      return Promise.resolve();
    }
    else {
      this.logger.info(this, "uploadPending", "Pending", this.pending.length);
      return new Promise((resolve, reject) => {
        this.language.getTranslations([
          'RESPONSE_POSTING_',
          'RESPONSE_POST_SUCCESS',
          'RESPONSE_POST_SUCCESS_DESCRIPTION',
          'RESPONSE_POST_FAILURE',
          'RESPONSE_POST_FAILURE_DESCRIPTION']).then((translations:string[]) => {
          let loading = this.showLoading(translations[0]);
          let uploads = [];
          for (let post of this.pending) {
            this.logger.info(this, "uploadPending", "Queuing", post.title);
            uploads.push(this.createPost(post));
          }
          Promise.all(uploads).then(
            (uploaded) => {
              this.pending = null;
              loading.dismiss();
              this.showAlert(translations[1], translations[2]);
              resolve();
            },
            (error) => {
              loading.dismiss();
              this.showAlert(translations[3], translations[4]);
              reject(error);
          });
        });
      });
    }
  }

  private createPost(post:Post):Promise<any> {
    this.logger.info(this, "createPost", post.title);
    return new Promise((resolve, reject) => {
      this.logger.info(this, "createPost", "Posting...");
      this.api.createPostWithMedia(this.deployment, post).then(
        (posted:any) => {
          this.logger.info(this, "createPost", "Posted", posted);
          let removes = [];
          if (posted.id != null && posted.id > 0) {
            removes.push(this.database.removePost(this.deployment, post));
            removes.push(this.database.removeValues(this.deployment, post));
          }
          Promise.all(removes).then(
            (removed) => {
              let saves = [];
              post.pending = false;
              if (posted.id != null && posted.id > 0) {
                for (let value of post.values) {
                  value.post_id = posted.id;
                  saves.push(this.database.saveValue(this.deployment, value));
                }
              }
              if (posted.status && posted.status.length > 0) {
                post.status = posted.status;
              }
              saves.push(this.database.savePost(this.deployment, post));
              Promise.all(saves).then(
                (saved) => {
                  this.logger.info(this, "createPost", "Saved", saved);
                  resolve();
                },
                (error) => {
                  this.logger.error(this, "createPost", "Failed", error);
                  reject(error);
                });
            },
            (error) => {
              this.logger.error(this, "createPost", "Failed", error);
              reject(error);
            });
        },
        (error) => {
          this.logger.error(this, "createPost", "Failed", error);
          reject(error);
        });
    });
  }

  private getPending(posts:Post[]): Post[] {
    let pending: Post[] = [];
    if (posts) {
      for (let post of posts) {
        if (post.pending == true) {
          pending.push(post);
        }
      }
    }
    return pending;
  }

  private showResponse(post:Post) {
    this.logger.info(this, "showResponse", post);
    this.showPage(ResponseDetailsPage,
      { deployment: this.deployment,
        login: this.login,
        post: post });
  }

  private addResponse(event:any) {
    this.logger.info(this, "addResponse");
    if (this.deployment.forms.length == 1) {
      let form = this.deployment.forms[0];
      this.showResponseAdd(form);
    }
    else if (this.deployment.forms.length > 1) {
      this.language.getTranslations([
        'ACTION_CANCEL',
        'SURVEY_SUBMIT_RESPONSE']).then((translations:string[]) => {
        this.logger.info(this, "addResponse");
        let buttons = [];
        if (this.deployment.forms != null) {
          for (let form of this.deployment.forms){
            if (form.canSubmit(this.login)) {
              buttons.push({
                text: form.name,
                handler: () => {
                  this.logger.info(this, "addResponse", "Form", form);
                  this.showResponseAdd(form);
              }});
            }
          }
        }
        buttons.push({
          text: translations[0],
          role: 'cancel'});
        this.showActionSheet(translations[1], buttons);
      });
    }
  }

  private showResponseAdd(form:Form) {
    let modal = this.showModal(ResponseAddPage,
      { deployment: this.deployment,
        login: this.login,
        form: form })
    modal.onDidDismiss(data => {
      this.logger.info(this, "showResponseAdd", "Modal", data);
    });
  }

  private searchResponses(event:any) {
    this.language.getTranslations(['FILTERING_']).then((translations:string[]) => {
      this.logger.info(this, "searchResponses");
      let modal = this.showModal(ResponseSearchPage,
        { deployment: this.deployment,
          filter: this.filter });
      modal.onDidDismiss((data:any) => {
        if (data && data.filter) {
          this.logger.info(this, "searchResponses", "Filter", data.filter);
          this.filter = data.filter;
          this.loading = true;
          if (this.view == 'list') {
            let loading = this.showLoading(translations[0]);
            this.loadPosts(false).then((filtered) => {
              loading.dismiss();
              this.loading = false;
            },
            (error:any) => {
              loading.dismiss();
              this.showToast(error);
              this.loading = false;
            });
          }
          else {
            this.loadMarkers(false).then((filtered) => {
              this.loading = false;
            },
            (error:any) => {
              this.loading = false;
              this.showToast(error);
            });
          }
        }
        this.resizeContent(400);
      });
    });
  }

  private shareResponses(event:any) {
    this.language.getTranslations(['RESPONSES_SHARED']).then((translations:string[]) => {
      let subject = this.deployment.name;
      let message = this.deployment.description
      let file = this.deployment.image;
      let url = this.deployment.website;
      this.logger.info(this, "shareResponses", "Subject", subject, "Message", message, "File", file, "URL", url);
      this.showShare(subject, message, file, url).then(
        (shared:boolean) => {
          if (shared) {
            this.showToast(translations[0]);
          }
        },
        (error:any) => {
          this.showToast(error);
      });
    });
  }

  private showOptions(post:Post) {
    this.language.getTranslations([
      'ACTION_SHARE',
      'ACTION_COLLECTION',
      'ACTION_REVIEW',
      'ACTION_ARCHIVE',
      'ACTION_PUBLISH',
      'ACTION_DELETE',
      'ACTION_REMOVE',
      'ACTION_CANCEL']).then((translations:string[]) => {
        this.logger.info(this, "showOptions");
        let buttons = [];
        if (post.can_read) {
          buttons.push({
            text: translations[0],
            handler:() => this.shareResponse(post)
          });
        }
        if (this.offline == false && post.can_update) {
          if (this.deployment.collections && this.deployment.collections.length > 0) {
            buttons.push({
              text: translations[1],
              handler:() => this.addToCollection(post)
            });
          }
          if (post.status == 'published' || post.status == 'archived') {
           buttons.push({
             text: translations[2],
             handler:() => this.draftResponse(post)
           });
          }
          if (post.status == 'published' || post.status == 'draft') {
           buttons.push({
             text: translations[3],
             handler:() => this.archiveResponse(post)
           });
          }
          if (post.status == 'archived' || post.status == 'draft') {
            buttons.push({
              text: translations[4],
              handler:() => this.publishResponse(post)
            });
          }
        }
        if (this.offline == false && post.can_delete) {
          buttons.push({
            text: translations[5],
            role: 'destructive',
            handler:() => this.deleteResponse(post)
          });
        }
        if (post.pending == true) {
          buttons.push({
            text: translations[6],
            role: 'destructive',
            handler:() => this.removeResponse(post)
          });
        }
        buttons.push({
          text: translations[7],
          role: 'cancel'
        });
       this.showActionSheet(null, buttons);
    });
  }

  private shareResponse(post:Post) {
    this.language.getTranslations(['RESPONSE_SHARED']).then((translations:string[]) => {
      let subject:string = `${this.deployment.name} | ${post.title}`;
      let message:string = post.description
      let file:string = post.image_url;
      let url:string = post.url;
      this.logger.info(this, "shareResponse", "Subject", subject, "Message", message, "File", file, "URL", url);
      this.showShare(subject, message, file, url).then(
        (shared:boolean) => {
          if (shared) {
            this.showToast(translations[0]);
          }
        },
        (error:any) => {
          this.showToast(error);
      });
    });
  }

  private editResponse(post:Post) {
    this.logger.info(this, "editResponse", "Post", post);
    let modal = this.showModal(ResponseAddPage,
      { deployment: this.deployment,
        login: this.login,
        form: this.getForm(post.form_id),
        post: post });
    modal.onDidDismiss(data => {
      this.logger.info(this, "editResponse", "Modal", data);
    });
  }

  private getForm(id:number) : Form {
    for (let form of this.deployment.forms) {
      if (form.id == id) {
        return form;
      }
    }
    return null;
  }

  private addToCollection(post:Post, collection:Collection=null) {
    this.language.getTranslations([
      'COLLECTION_ADDING_',
      'COLLECTION_ADD_SUCCESS',
      'COLLECTION_ADD_FAILURE',
      'ACTION_CANCEL',
      'COLLECTION_SELECTION']).then((translations:string[]) => {
      this.logger.info(this, "addToCollection");
      if (collection != null) {
        let loading = this.showLoading(translations[0]);
        this.api.userOrClientLogin(this.deployment, this.offline).then((login:Login) => {
          this.api.addPostToCollection(this.deployment, post, collection).then(
            (results:any) => {
              loading.dismiss();
              this.showToast(translations[1]);
              this.logger.event(this, "Posts", "collected", post.url);
            },
            (error:any) => {
              loading.dismiss();
              this.showAlert(translations[2], error);
            });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert(translations[2], error);
        });
      }
      else if (this.deployment.collections != null) {
        let buttons = [];
        for (let index in this.deployment.collections) {
          let collection:Collection = this.deployment.collections[index];
          buttons.push({
            text: collection.name,
            handler:() => this.addToCollection(post, collection)
          });
        }
        buttons.push({
          text: translations[3],
          role: 'cancel'
        });
        this.showActionSheet(translations[4], buttons);
      }
    });
  }

  private draftResponse(post:Post) {
    this.logger.info(this, "draftResponse");
    this.language.getTranslations([
      'RESPONSE_UPDATING_',
      'RESPONSE_UPDATE_SUCCESS',
      'RESPONSE_UPDATE_FAILURE']).then((translations:string[]) => {
      let loading = this.showLoading(translations[0]);
      let changes = { status: "draft" };
      this.api.userOrClientLogin(this.deployment, this.offline).then((login:Login) => {
        this.api.updatePost(this.deployment, post, changes).then(
          (updated:any) => {
            post.status = "draft";
            this.database.savePost(this.deployment, post).then(saved => {
              loading.dismiss();
              this.showToast(translations[1]);
              this.logger.event(this, "Posts", "drafted", post.url);
            },
            (error:any) => {
              loading.dismiss();
              this.showAlert(translations[2], error);
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert(translations[2], error);
          });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert(translations[2], error);
      });
    });
  }

  private archiveResponse(post:Post) {
    this.language.getTranslations([
      'RESPONSE_ARCHIVING_',
      'RESPONSE_ARCHIVE_SUCCESS',
      'RESPONSE_ARCHIVE_FAILURE']).then((translations:string[]) => {
      this.logger.info(this, "archiveResponse");
      let loading = this.showLoading(translations[0]);
      let changes = { status: "archived" };
      this.api.userOrClientLogin(this.deployment, this.offline).then((login:Login) => {
        this.api.updatePost(this.deployment, post, changes).then(
          (updated:any) => {
            post.status = "archived";
            this.database.savePost(this.deployment, post).then(saved => {
              loading.dismiss();
              this.showToast(translations[1]);
              this.logger.event(this, "Posts", "archived", post.url);
            },
            (error:any) => {
              loading.dismiss();
              this.showAlert(translations[2], error);
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert(translations[2], error);
          });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert(translations[2], error);
      });
    });
  }

  private publishResponse(post:Post) {
    this.language.getTranslations([
      'RESPONSE_PUBLISHING_',
      'RESPONSE_PUBLISH_SUCCESS',
      'RESPONSE_PUBLISH_FAILURE']).then((translations:string[]) => {
      this.logger.info(this, "publishResponse");
      let loading = this.showLoading(translations[0]);
      let changes = { status: "published" };
      this.api.userOrClientLogin(this.deployment, this.offline).then((login:Login) => {
        this.api.updatePost(this.deployment, post, changes).then(
          (updated:any) => {
            post.status = "published";
            this.database.savePost(this.deployment, post).then(saved => {
              loading.dismiss();
              this.showToast(translations[1]);
              this.logger.event(this, "Posts", "published", post.url);
            },
            (error:any) => {
              loading.dismiss();
              this.showAlert(translations[2], error);
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert(translations[2], error);
          });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert(translations[2], error);
      });
    });
  }

  private removeResponse(post:Post) {
    this.language.getTranslations([
      'RESPONSE_REMOVING_',
      'RESPONSE_REMOVE_SUCCESS',
      'RESPONSE_REMOVE_FAILURE']).then((translations:string[]) => {
      this.logger.info(this, "removeResponse");
      let loading = this.showLoading(translations[0]);
      this.database.removeValues(this.deployment, post).then(
        (values) => {
          this.database.removePost(this.deployment, post).then(
            (removed) => {
              let pendingIndex = this.pending.indexOf(post);
              if (pendingIndex > -1) {
                this.pending.splice(pendingIndex, 1);
                this.logger.info(this, "removeResponse", "Pending Removed");
              }
              let postIndex = this.posts.indexOf(post);
              if (postIndex > -1) {
                this.posts.splice(postIndex, 1);
                this.logger.info(this, "removeResponse", "Post Removed")
              }
              loading.dismiss();
              this.showToast(translations[1]);
              this.logger.event(this, "Posts", "removed", post.url);
            },
            (error) => {
              loading.dismiss();
              this.showAlert(translations[2], error);
          });
        },
        (error) => {
          loading.dismiss();
          this.showAlert(translations[2], error);
      });
    });
  }

  private deleteResponse(post:Post) {
    this.language.getTranslations([
      'ACTION_DELETE',
      'RESPONSE_DELETING_',
      'RESPONSE_DELETE_SUCCESS',
      'RESPONSE_DELETE_FAILURE',
      'RESPONSE_DELETE_CONFIRM',
      'RESPONSE_DELETE_CONFIRM_DESCRIPTION']).then((translations:string[]) => {
        let buttons = [
           {
             text: translations[0],
             role: 'destructive',
             handler: () => {
               this.logger.info(this, "deleteResponse", 'Delete');
               let loading = this.showLoading(translations[1]);
               this.api.userOrClientLogin(this.deployment, this.offline).then((login:Login) => {
                 this.api.deletePost(this.deployment, post).then(
                   (results:any) => {
                     loading.dismiss();
                     this.database.removePost(this.deployment, post).then(removed => {
                       let postIndex = this.posts.indexOf(post, 0);
                       if (postIndex > -1) {
                         this.posts.splice(postIndex, 1);
                       }
                       let pendingIndex = this.pending.indexOf(post, 0);
                       if (pendingIndex > -1) {
                         this.pending.splice(pendingIndex, 1);
                       }
                       this.showToast(translations[2]);
                       this.logger.event(this, "Posts", "deleted", post.url);
                    });
                   },
                   (error:any) => {
                     loading.dismiss();
                     this.showAlert(translations[3], error);
                   });
               },
               (error:any) => {
                 loading.dismiss();
                 this.showAlert(translations[3], error);
               });
             }
           },
           {
             text: 'Cancel',
             role: 'cancel',
             handler: () => {
               this.logger.info(this, "deleteResponse", 'Cancel');
             }
           }
         ];
         this.showConfirm(translations[4], translations[5], buttons);
    });
  }

  private clearFilter(event:any, filter:Filter) {
    this.logger.info(this, "clearFilter", filter);
    this.database.removeFilters(this.deployment).then(
      (results:any) => {
        this.filter = null;
        this.loading = true;
        this.resizeContent();
        if (this.view == 'list') {
          let loading = this.showLoading("Loading...");
          this.loadPosts(true).then((cleared) => {
            loading.dismiss();
            this.loading = false;
          },
          (error:any) => {
            loading.dismiss();
            this.loading = false;
            this.showToast(error);
          });
        }
        else {
          this.loadMarkers(true).then((cleared) => {
            this.loading = false;
          },
          (error:any) => {
            this.loading = false;
            this.showToast(error);
          });
        }
      },
      (error:any) => {
        this.showToast(error);
      });
  }

  private showList(event:any) {
    this.logger.info(this, "showList");
    this.view = 'list';
  }

  private showMap(event:any, attempts:number=0) {
    this.logger.info(this, "showMap", attempts);
    this.view = 'map';
    let element: HTMLElement = document.getElementById('mapMany');
    if (element) {
      this.loadCenter().then(
        () => {
          this.loadMap().then(
            (map)=> {
              this.logger.info(this, "showMap", "loadMap", "Done");
              this.loadMarkers().then(
                (markers) => {
                  this.logger.info(this, "showMap", "loadMarkers", "Done");
                },
                (error) => {
                  this.logger.error(this, "showMap", "loadMarkers", error);
                  if (error != this.interrupted) {
                    this.language.getTranslation('MAP_ERROR_MARKERS').then((translation:string) => {
                      this.showToast(translation);
                    });
                  }
                });
            },
            (error) => {
              this.logger.error(this, "showMap", "loadMarkers", error);
              this.language.getTranslation('MAP_ERROR').then((translation:string) => {
                this.showToast(translation);
              });
            });
      });
    }
    else {
      setTimeout((attempts) => {
        this.showMap(event, attempts+1);
      }, 1000, attempts);
    }
  }

  private loadCenter():Promise<any> {
    this.logger.info(this, "loadCenter");
    return new Promise((resolve, reject) => {
      if (this.deployment.map_latitude && this.deployment.map_longitude) {
        if (this.deployment.map_zoom) {
          this.mapZoom = this.deployment.map_zoom;
        }
        this.mapLatitude = this.deployment.map_latitude;
        this.mapLongitude = this.deployment.map_longitude;
        resolve();
      }
      else {
        let options:GeolocationOptions = {
          timeout: 6000,
          enableHighAccuracy: true };
        this.geolocation.getCurrentPosition(options).then(
          (position:Geoposition) => {
            this.logger.info(this, "loadCenter", "getCurrentPosition", position);
            this.mapLatitude = position.coords.latitude;
            this.mapLongitude = position.coords.longitude;
            resolve();
          },
          (error) => {
            this.logger.error(this, "loadCenter", "getCurrentPosition", error);
            this.mapLatitude = PLACEHOLDER_LATITUDE;
            this.mapLongitude = PLACEHOLDER_LONGITUDE;
            reject(error);
          });
      }
    });
  }

  private loadMap():Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadMap");
      this.map = L.map("mapMany").setView([this.mapLatitude, this.mapLongitude], this.mapZoom);
      this.mapLayer = L.tileLayer(new TileLayer(this.deployment.mapbox_api_key, this.mapStyle).getUrl(), { maxZoom: 20 });
      this.mapLayer.addTo(this.map);
      resolve(this.map);
    });
  }

  private loadMarkers(cache:boolean=true, offset:number=0, limit:number=10):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.view == 'map') {
        this.loading = true;
        this.logger.info(this, "loadMarkers", "Limit", limit, "Offset", offset);
        this.api.getPosts(this.deployment, this.filter, cache, this.offline, limit, offset).then(
          (posts:Post[]) => {
            this.logger.info(this, "loadMarkers", "Limit", limit, "Offset", offset, "Loaded");
            for (let post of posts) {
              if (post.latitude && post.longitude) {
                if (this.mapPins) {
                  let marker = this.loadPinMarker(post);
                  marker.addTo(this.map);
                }
                else {
                  let marker = this.loadCircleMarker(post);
                  marker.addTo(this.map);
                }
              }
            }
            if (posts.length == limit) {
              this.logger.info(this, "loadMarkers", "Limit", limit, "Offset", offset, "Resurse");
              this.loadMarkers(cache, offset + limit, limit).then(
                (resurse:any) => {
                  resolve(resurse);
                },
                (error:any) => {
                  reject(error);
              });
            }
            else {
              this.logger.info(this, "loadMarkers", "Limit", limit, "Offset", offset, "Finished");
              this.loading = false;
              resolve(offset);
            }
          },
          (error:any) => {
            this.logger.error(this, "loadMarkers", error);
            this.loading = false;
            reject(error);
          });
      }
      else {
        this.logger.error(this, "loadMarkers", "Interrupted");
        this.loading = false;
        reject(this.interrupted);
      }
    });
  }

  private loadPinMarker(post:Post):any {
    this.logger.info(this, "loadPinMarker", post.title, post.latitude, post.longitude);
    let iconUrl =  new MapMarker(this.deployment.mapbox_api_key, post.color).getUrl();
    let icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [30, 70],
      popupAnchor: [0, -25]
    });
    let truncate = new TruncatePipe();
    let marker = L.marker([post.latitude, post.longitude], {
      icon: icon });
    let content = document.createElement('div');
    content.className = "popup";
    content.innerHTML = `<h4>${truncate.transform(post.title,20)}</h4><p>${truncate.transform(post.description,20)}</p>`;
    content.onclick = () => {
      this.showResponse(post);
    };
    let popup = L.popup().setContent(content);
    marker.bindPopup(popup);
    return marker;
  }

  private loadCircleMarker(post:Post):any {
    this.logger.info(this, "loadCircleMarker", post.title, post.latitude, post.longitude);
    var circle = L.circle([post.latitude, post.longitude], {
      color: post.color,
      radius: 12000,
      fillColor: post.color,
      fillOpacity: 0.5
     });
    let truncate = new TruncatePipe();
    let content = document.createElement('div');
    content.className = "popup";
    content.innerHTML = `<h4>${truncate.transform(post.title,20)}</h4><p>${truncate.transform(post.description,20)}</p>`;
    content.onclick = () => {
      this.showResponse(post);
    };
    let popup = L.popup().setContent(content);
    circle.bindPopup(popup);
    return circle;
  }

  private showStyles(event) {
    this.language.getTranslations([
      'MAP_STYLE_STREETS',
      'MAP_STYLE_OUTDOORS',
      'MAP_STYLE_LIGHT',
      'MAP_STYLE_DARK',
      'MAP_STYLE_SATELLITE',
      'MAP_STYLE_SATELLITE_STREETS',
      'ACTION_CANCEL',
      'MAP_STYLE']).then((translations:string[]) => {
      this.logger.info(this, "showStyles");
      let buttons = [
        {
          text: translations[0],
          handler:() => this.changeStyle("streets")
        },
        {
          text: translations[1],
          handler:() => this.changeStyle("outdoors")
        },
        {
          text: translations[2],
          handler:() => this.changeStyle("light")
        },
        {
          text: translations[3],
          handler:() => this.changeStyle("dark")
        },
        {
          text: translations[4],
          handler:() => this.changeStyle("satellite")
        },
        {
          text: translations[5],
          handler:() => this.changeStyle("satellite-streets")
        },
        {
          text: translations[6],
          role: 'cancel'
        }
      ];
      this.showActionSheet(translations[7], buttons);
    });
  }

  private changeStyle(mapStyle:string) {
    this.logger.info(this, "changeStyle", mapStyle);
    this.mapStyle = mapStyle;
    this.map.removeLayer(this.mapLayer);
    let tileLayerUrl = new TileLayer(this.deployment.mapbox_api_key, this.mapStyle).getUrl()
    this.mapLayer = L.tileLayer(tileLayerUrl, { maxZoom: 20 });
    this.mapLayer.addTo(this.map);
  }

}
