import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Events, Content,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { SebmGoogleMap, LatLngBounds, MapsAPILoader } from 'angular2-google-maps/core';
import { Geolocation, GeolocationOptions, Geoposition } from 'ionic-native';

import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';
import { Form } from '../../models/form';
import { Filter } from '../../models/filter';
import { Collection } from '../../models/collection';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseAddPage } from '../response-add/response-add';
import { ResponseDetailsPage } from '../response-details/response-details';
import { ResponseSearchPage } from '../response-search/response-search';

import { POST_UPDATED, POST_DELETED } from '../../constants/events';
import { PLACEHOLDER_LATITUDE, PLACEHOLDER_LONGITUDE } from '../../constants/placeholders';

export declare var google: any;

@Component({
  selector: 'response-list-page',
  templateUrl: 'response-list.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseAddPage, ResponseDetailsPage, ResponseSearchPage ]
})
export class ResponseListPage extends BasePage {

  deployment:Deployment = null;
  posts:Post[] = null;
  filtered:Post[] = null;
  pending:Post[] = null;
  markers:Post[] = [];
  filter:Filter = null;
  view:string = 'list';
  mapLoaded:boolean = false;
  mapDraggable:boolean = true;
  zoomControl:boolean = false;
  disableDefaultUI:boolean = true;
  zoom:number = 6;
  limit:number = 5;
  offset:number = 0;
  spinner:boolean = false;
  latitude:number = PLACEHOLDER_LATITUDE;
  longitude:number = PLACEHOLDER_LONGITUDE;
  interrupted:string = "Interrupted";

  @ViewChild(Content)
  content: Content;

  @ViewChild("map")
  map:SebmGoogleMap;

  constructor(
    public mapsAPILoader:MapsAPILoader,
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public events:Events,
    public navParams:NavParams,
    public zone: NgZone,
    public platform:Platform,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(zone, platform, logger, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.events.subscribe(POST_DELETED, (post_id:number) => {
      this.logger.info(this, 'Events', POST_DELETED, post_id);
      this.posts = null;
      this.filtered = null;
      this.loadPosts(true);
    });
    this.events.subscribe(POST_UPDATED, (post_id:number) => {
      this.logger.info(this, 'Events', POST_UPDATED, post_id);
      this.posts = null;
      this.filtered = null;
      this.loadPosts(true);
    });
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.deployment = this.getParameter<Deployment>("deployment");
    this.loadUpdates(null, true);
  }

  loadUpdates(event:any=null, cache:boolean=false) {
    this.logger.info(this, "loadUpdates", cache);
    let updates = [
      this.loadFilters(cache),
      this.loadPosts(cache),
      this.uploadPending(cache)];
    return Promise.all(updates).then(
      (updated) => {
        if (event != null) {
          event.complete();
        }
        this.logger.info(this, "loadUpdates", "Updated");
      },
      (error) => {
        if (event != null) {
          event.complete();
        }
        this.logger.error(this, "loadUpdates", "Failed", error);
      });
  }

  loadFilters(cache:boolean=true):Promise<any> {
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
            this.logger.info(this, "loadFilters", "Loaded", error);
            this.filter = null;
            resolve();
          });
      });
    }
  }

  loadPosts(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadPosts", "Cache", cache);
    if (cache && this.posts != null && this.posts.length > 0) {
      this.logger.info(this, "loadPosts", "Cached", this.posts.length);
      return Promise.resolve();
    }
    else {
      return new Promise((resolve, reject) => {
        this.offset = 0;
        this.api.getPostsWithValues(this.deployment, cache, this.offline, this.limit, this.offset).then(
          (posts:Post[]) => {
            this.logger.info(this, "loadPosts", "Posts", posts.length);
            this.posts = posts;
            this.filtered = this.getFiltered(posts, this.filter);
            this.pending = this.getPending(posts);
            this.logger.info(this, "loadPosts", "Filtered", this.filtered.length, "Pending", this.pending.length);
            resolve();
          },
          (error:any) => {
            this.logger.error(this, "loadPosts", "API", error);
            reject(error);
          });
        });
    }
  }

  loadMore(event, cache:boolean=true) {
    this.logger.info(this, "loadMore", cache);
    this.offset = this.offset + this.limit;
    this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
    this.api.getPostsWithValues(this.deployment, cache, this.offline, this.limit, this.offset).then(
      (posts:Post[]) => {
        this.posts = this.posts.concat(posts);
        this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Posts", this.posts.length);
        this.filtered = this.getFiltered(this.posts, this.filter);
        this.pending = this.getPending(this.posts);
        this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Filtered", this.filtered.length, "Pending", this.pending.length);
        if (event) {
          event.complete();
        }
      },
      (error:any) => {
        this.logger.error(this, "loadMore", "Failed", error);
        if (event) {
          event.complete();
        }
        this.showToast(error);
      });
  }

  uploadPending(cache:boolean=true):Promise<any> {
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
        let loading = this.showLoading("Posting...");
        let uploads = [];
        for (let post of this.pending) {
          this.logger.info(this, "uploadPending", "Queuing", post.title);
          uploads.push(this.createPost(post));
        }
        Promise.all(uploads).then(
          (uploaded) => {
            this.pending = null;
            loading.dismiss();
            this.showAlert('Response Posted', 'Your pending responses have been posted!');
            resolve();
          },
          (error) => {
            loading.dismiss();
            this.showAlert('Response Failed', 'There was a problem posting your pending responses.');
            reject(error);
        });
      });
    }
  }

  createPost(post:Post):Promise<any> {
    this.logger.info(this, "createPost", post.title);
    return new Promise((resolve, reject) => {
      this.logger.info(this, "createPost", "Posting...");
      this.api.createPostWithMedia(this.deployment, post).then(
        (posted:any) => {
          this.logger.info(this, "createPost", "Posted", posted);
          let removes = [
            this.database.removePost(this.deployment, post),
            this.database.removeValues(this.deployment, post),
          ];
          Promise.all(removes).then(
            (removed) => {
              this.logger.info(this, "createPost", "Pending Removed", removed);
              post.id = posted.id;
              post.saved = null;
              post.pending = false;
              let saves = [
                this.database.savePost(this.deployment, post),
              ];
              for (let value of post.values) {
                value.post_id = posted.id;
                value.saved = null;
                saves.push(this.database.saveValue(this.deployment, value));
              }
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

  getFiltered(posts:Post[], filter:Filter): Post[] {
    let filtered: Post[] = [];
    if (posts) {
      for (let post of posts) {
        if (filter == null) {
          filtered.push(post);
        }
        else if (filter.showPost(post)) {
          filtered.push(post);
        }
      }
    }
    return filtered;
  }

  getPending(posts:Post[]): Post[] {
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

  showResponse(post:Post) {
    this.logger.info(this, "showResponse", post);
    this.showPage(ResponseDetailsPage,
      { deployment: this.deployment,
        post: post });
  }

  addResponse(event:any) {
    this.logger.info(this, "addResponse");
    let buttons = [];
    if (this.deployment.forms != null) {
      for (let form of this.deployment.forms){
        buttons.push({
          text: form.name,
          handler: () => {
            this.logger.info(this, "addResponse", "Form", form);
            this.showResponseAdd(form);
        }});
      }
    }
    buttons.push({
      text: 'Cancel',
      role: 'cancel'});
    this.showActionSheet('Submit a survey response', buttons);
  }

  showResponseAdd(form) {
    let modal = this.showModal(ResponseAddPage,
      { form: form,
        deployment: this.deployment })
    modal.onDidDismiss(data => {
      this.logger.info(this, "showResponseAdd", "Modal", data);
    });
  }

  searchResponses(event:any) {
    this.logger.info(this, "searchResponses");
    let modal = this.showModal(ResponseSearchPage,
      { deployment: this.deployment,
        filter: this.filter });
    modal.onDidDismiss(data => {
      this.logger.info(this, "searchResponses", "Modal", data);
      if (data) {
        this.filter = data['filter'];
        this.filtered = this.getFiltered(this.posts, this.filter);
      }
      this.resizeContent(400);
    });
  }

  shareResponses(event:any) {
    let subject = this.deployment.name;
    let message = this.deployment.description
    let file = this.deployment.image;
    let url = this.deployment.url;
    this.logger.info(this, "shareResponses", "Subject", subject, "Message", message, "File", file, "URL", url);
    this.showShare(subject, message, file, url).then(
      (shared:boolean) => {
        if (shared) {
          this.showToast("Responses Shared");
        }
      },
      (error:any) => {
        this.showToast(error);
    });
  }

  showOptions(post:Post) {
    this.logger.info(this, "showOptions");
    let buttons = [];
    if (post.can_read) {
      buttons.push({
        text: 'Share',
        handler:() => this.shareResponse(post)
      });
    }
    if (this.offline == false && post.can_update) {
      buttons.push({
         text: 'Edit',
         handler:() => this.editResponse(post)
       });
      if (this.deployment.collections && this.deployment.collections.length > 0) {
        buttons.push({
          text: 'Add to Collection',
          handler:() => this.addToCollection(post)
        });
      }
      if (post.status == 'published' || post.status == 'draft') {
       buttons.push({
         text: 'Archive',
         handler:() => this.archiveResponse(post)
       });
      }
      if (post.status == 'archived' || post.status == 'draft') {
        buttons.push({
          text: 'Publish',
          handler:() => this.publishResponse(post)
        });
      }
    }
    if (this.offline == false && post.can_delete) {
      buttons.push({
        text: 'Delete',
        role: 'destructive',
        handler:() => this.deleteResponse(post)
      });
    }
    if (post.pending == true) {
      buttons.push({
        text: 'Remove',
        role: 'destructive',
        handler:() => this.removeResponse(post)
      });
    }
    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });
   this.showActionSheet(null, buttons);
  }

  shareResponse(post:Post) {
    let subject:string = `${this.deployment.name} | ${post.title}`;
    let message:string = post.description
    let file:string = post.image_url;
    let url:string = post.url;
    this.logger.info(this, "shareResponse", "Subject", subject, "Message", message, "File", file, "URL", url);
    this.showShare(subject, message, file, url).then(
      (shared:boolean) => {
        if (shared) {
          this.showToast("Response Shared");
        }
      },
      (error:any) => {
        this.showToast(error);
    });
  }

  editResponse(post:Post) {
    this.logger.info(this, "editResponse", "Post", post);
    let modal = this.showModal(ResponseAddPage,
      { deployment: this.deployment,
        form: this.getForm(post.form_id),
        post: post });
    modal.onDidDismiss(data => {
      this.logger.info(this, "editResponse", "Modal", data);
    });
  }

  getForm(id:number) : Form {
    for (let form of this.deployment.forms) {
      if (form.id == id) {
        return form;
      }
    }
    return null;
  }

  addToCollection(post:Post, collection:Collection=null) {
    this.logger.info(this, "addToCollection");
    if (collection != null) {
      let loading = this.showLoading("Adding...");
      this.api.addPostToCollection(this.deployment, post, collection).then(
        (results:any) => {
          loading.dismiss();
          this.showToast("Added To Collection");
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert("Problem Adding To Collection", error);
      })
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
        text: 'Cancel',
        role: 'cancel'
      });
      this.showActionSheet("Select Collection", buttons);
    }
  }

  archiveResponse(post:Post) {
    this.logger.info(this, "archiveResponse");
    let loading = this.showLoading("Archiving...");
    let changes = { status: "archived" };
    this.api.updatePost(this.deployment, post, changes).then(
      (updated:any) => {
        post.status = "archived";
        this.database.savePost(this.deployment, post).then(saved => {
          loading.dismiss();
          this.showToast("Responsed archived");
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problme Updating Response", error);
      });
  }

  publishResponse(post:Post) {
    this.logger.info(this, "publishResponse");
    let loading = this.showLoading("Publishing...");
    let changes = { status: "published" };
    this.api.updatePost(this.deployment, post, changes).then(
      (updated:any) => {
        post.status = "published";
        this.database.savePost(this.deployment, post).then(saved => {
          loading.dismiss();
          this.showToast("Response archived");
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Updating Response", error);
      });
  }

  removeResponse(post:Post) {
    this.logger.info(this, "removeResponse");
    let loading = this.showLoading("Removing...");
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
            let filteredIndex = this.filtered.indexOf(post);
            if (filteredIndex > -1) {
              this.filtered.splice(filteredIndex, 1);
              this.logger.info(this, "removeResponse", "Filtered Removed");
            }
            loading.dismiss();
            this.showToast("Responsed removed");
          },
          (error) => {
            loading.dismiss();
            this.showAlert("Problem Removing Response", error);
        });
      },
      (error) => {
        loading.dismiss();
        this.showAlert("Problem Removing Response", error);
    });
  }

  deleteResponse(post:Post) {
    let buttons = [
       {
         text: 'Delete',
         role: 'destructive',
         handler: () => {
           this.logger.info(this, "deleteResponse", 'Delete');
           let loading = this.showLoading("Deleting...");
           this.api.deletePost(this.deployment, post).then(
             (results:any) => {
               loading.dismiss();
               this.database.removePost(this.deployment, post).then(removed => {
                 let postIndex = this.posts.indexOf(post, 0);
                 if (postIndex > -1) {
                   this.posts.splice(postIndex, 1);
                 }
                 let filteredIndex = this.filtered.indexOf(post, 0);
                 if (filteredIndex > -1) {
                   this.filtered.splice(filteredIndex, 1);
                 }
                 this.showToast("Response deleted");
              });
             },
             (error:any) => {
               loading.dismiss();
               this.showAlert("Problem Deleting Response", error);
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
     this.showConfirm("Delete Response", "Are you sure you want to delete this response?", buttons);
  }

  clearFilter(event:any, filter:Filter) {
    this.logger.info(this, "clearFilter", filter);
    this.database.removeFilters(this.deployment).then(
      (results:any) => {
        this.filter = null;
        this.filtered = this.getFiltered(this.posts, this.filter);
      },
      (error:any) => {
        this.showToast(error);
      });
      this.resizeContent();
  }

  showList(event:any) {
    this.logger.info(this, "showList");
    this.view = 'list';
  }

  showMap(event:any) {
    this.logger.info(this, "showMap");
    this.view = 'map';
    this.detectLocation().then(
      () => {
        this.logger.info(this, "showMap", "detectLocation", "Done");
        this.loadMarkers(true).then(
          (markers) => {
            this.logger.info(this, "showMap", "loadMarkers", "Done");
          },
          (error) => {
            this.logger.error(this, "showMap", "loadMarkers", error);
            if (error != this.interrupted) {
              this.showToast("Problem loading the map markers");
            }
          });
      },
      (error) => {
        this.logger.error(this, "showMap", "detectLocation", error);
        this.showToast("Problem detecting your location");
      });
  }

  detectLocation():Promise<any> {
    this.logger.info(this, "detectLocation");
    return new Promise((resolve, reject) => {
      let options:GeolocationOptions = {
        timeout: 6000,
        enableHighAccuracy: true };
      Geolocation.getCurrentPosition(options).then(
        (position:Geoposition) => {
          this.logger.info(this, "detectLocation", position);
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          resolve();
        },
        (error) => {
          this.logger.error(this, "detectLocation", error);
          this.latitude = PLACEHOLDER_LATITUDE;
          this.longitude = PLACEHOLDER_LONGITUDE;
          reject(error);
        });
    });
  }

  loadMarkers(cache:boolean=true):Promise<any> {
    if (cache && this.markers != null && this.markers.length > 0 && this.mapLoaded) {
      this.logger.info(this, "loadMarkers", "Cached", this.markers.length);
      return Promise.resolve();
    }
    else {
      return new Promise((resolve, reject) => {
        this.markers = [];
        this.spinner = true;
        let limit = 10;
        let promise = Promise.resolve();
        for (let offset = 0; offset < this.deployment.posts_count; offset += limit) {
          this.logger.info(this, "loadMarkers", "Limit", limit, "Offset", offset, "Queued");
          promise = promise.then(
            () => {
              if (this.view == 'map') {
                return this.api.getPosts(this.deployment, cache, this.offline, limit, offset).then(posts => {
                  this.logger.info(this, "loadMarkers", "Limit", limit, "Offset", offset, "Loaded");
                  this.markers = this.markers.concat(posts);
                })
              }
              else {
                this.logger.error(this, "loadMarkers", "Interrupted");
                return Promise.reject(this.interrupted);
              }
            });
        }
        promise.then(
          () => {
            this.logger.info(this, "loadMarkers", "Finished");
            this.spinner = false;
            this.mapLoaded = true;
            resolve();
          },
          (error) => {
            this.logger.error(this, "loadMarkers", "Rejected");
            this.spinner = false;
            this.mapLoaded = false;
            reject(error);
          });
      });
    }
  }

  extendBounds(markers:Post[]):Promise<any> {
    this.logger.info(this, "extendBounds", markers.length);
    return new Promise((resolve, reject) => {
      this.mapsAPILoader.load().then(() => {
        let latLngBounds:LatLngBounds = new google.maps.LatLngBounds();
        for (let post of markers) {
          if (post.latitude != null && post.longitude != null) {
            this.logger.info(this, "extendBounds", post.latitude, post.longitude);
            latLngBounds.extend(new google.maps.LatLng(post.latitude, post.longitude));
          }
        }
        if (latLngBounds.isEmpty()) {
          this.logger.info(this, "extendBounds", "Bounds", "Empty");
        }
        else if (this.map) {
          this.map.fitBounds = latLngBounds;
          this.logger.info(this, "extendBounds", "Bounds", latLngBounds);
        }
        else {
          this.logger.info(this, "extendBounds", "Bounds", "Map NULL");
        }
        resolve();
      });
    });
  }

}
