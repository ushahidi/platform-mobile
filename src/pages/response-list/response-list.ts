import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Events, Content,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';

import 'leaflet';

import { TileLayer } from '../../maps/tile-layer';
import { MapMarker } from '../../maps/map-marker';

import { TruncatePipe } from '../../pipes/truncate';

import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';
import { Form } from '../../models/form';
import { Filter } from '../../models/filter';
import { Collection } from '../../models/collection';

import { ApiService } from '../../providers/api-service';
import { CacheService } from '../../providers/cache-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

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

  deployment:Deployment = null;
  posts:Post[] = null;
  pending:Post[] = null;
  filter:Filter = null;
  view:string = 'list';
  mapZoom:number = 8;
  mapOptions:string= null;
  mapStyle:string = "streets";
  mapLayer:any = null;
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
    public geolocation: Geolocation,
    public api:ApiService,
    public cache:CacheService,
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
      this.loadPosts(true);
    });
    this.events.subscribe(POST_UPDATED, (post_id:number) => {
      this.logger.info(this, 'Events', POST_UPDATED, post_id);
      this.posts = null;
      this.loadPosts(true);
    });
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    if (this.deployment == null) {
      this.deployment = this.getParameter<Deployment>("deployment");
    }
    this.loadUpdates(null, true);
  }

  loadUpdates(event:any=null, cache:boolean=false) {
    this.logger.info(this, "loadUpdates", cache);
    this.loading = true;
    this.refreshing = event != null;
    return Promise.resolve()
      .then(() => { return this.loadFilters(cache); })
      .then(() => { return this.loadPosts(cache); })
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
        if (this.offline) {
          this.showToast("Internet connection not available");
        }
        else {
          this.showToast("Problem downloading survey responses");
        }
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
            this.logger.info(this, "loadFilters", "Failed", error);
            this.filter = null;
            resolve();
          });
      });
    }
  }

  loadPosts(cache:boolean=true):Promise<any> {
    if (cache && this.posts != null && this.posts.length >= this.limit) {
      this.logger.info(this, "loadPosts", "Cached", this.posts.length);
      return Promise.resolve();
    }
    else {
      this.logger.info(this, "loadPosts", "Cache", cache);
      return new Promise((resolve, reject) => {
        this.offset = 0;
        this.api.getPostsWithValues(this.deployment, this.filter, cache, this.offline, this.limit, this.offset).then(
          (posts:Post[]) => {
            this.loadCache(posts);
            this.posts = posts;
            this.pending = this.getPending(posts);
            this.logger.info(this, "loadPosts", "Posts", posts.length, "Pending", this.pending.length);
            resolve();
          },
          (error:any) => {
            this.logger.error(this, "loadPosts", "Failed", error);
            reject(error);
          });
        });
    }
  }

  loadMore(event, cache:boolean=true) {
    this.logger.info(this, "loadMore", cache);
    this.loading = true;
    this.offset = this.offset + this.limit;
    this.logger.info(this, "loadMore", "Filter", this.filter, "Limit", this.limit, "Offset", this.offset);
    this.api.getPostsWithValues(this.deployment, this.filter, cache, this.offline, this.limit, this.offset).then(
      (posts:Post[]) => {
        this.loadCache(posts);
        this.posts = this.posts.concat(posts);
        this.pending = this.getPending(this.posts);
        this.logger.info(this, "loadMore", "Filter", this.filter, "Limit", this.limit, "Offset", this.offset, "Posts", this.posts.length, "Pending", this.pending.length);
        this.loading = false;
      },
      (error:any) => {
        this.logger.error(this, "loadMore", "Failed", error);
        this.loading = false;
        this.showToast(error);
      });
  }

  loadCache(posts:Post[]) {
    if (posts != null && this.offline == false) {
      this.logger.info(this, "loadCache", posts.length);
      for (let post of posts) {
        this.cache.fetchImage(post.image_url);
        this.cache.fetchMap(post.latitude, post.longitude);
      }
    }
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
                post.saved = null;
                post.id = posted.id;
                for (let value of post.values) {
                  value.saved = null;
                  value.post_id = posted.id;
                  saves.push(this.database.saveValue(this.deployment, value));
                }
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
    modal.onDidDismiss((data:any) => {
      if (data && data.filter) {
        this.logger.info(this, "searchResponses", "Filter", data.filter);
        this.filter = data.filter;
        this.loading = true;
        if (this.view == 'list') {
          let loading = this.showLoading("Filtering...");
          this.loadPosts(false).then((filtered) => {
            loading.dismiss();
            this.loading = false;
          });
        }
        else {
          this.loadMarkers(false).then((filtered) => {
            this.loading = false;
          });
        }
      }
      this.resizeContent(400);
    });
  }

  shareResponses(event:any) {
    let subject = this.deployment.name;
    let message = this.deployment.description
    let file = this.deployment.image;
    let url = this.deployment.website;
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
          this.trackEvent("Posts", "collected", post.url);
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
          this.trackEvent("Posts", "archived", post.url);
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
          this.showToast("Response published");
          this.trackEvent("Posts", "published", post.url);
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
            loading.dismiss();
            this.showToast("Responsed removed");
            this.trackEvent("Posts", "removed", post.url);
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
                 let pendingIndex = this.pending.indexOf(post, 0);
                 if (pendingIndex > -1) {
                   this.pending.splice(pendingIndex, 1);
                 }
                 this.showToast("Response deleted");
                 this.trackEvent("Posts", "deleted", post.url);
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
        this.loading = true;
        this.resizeContent();
        if (this.view == 'list') {
          let loading = this.showLoading("Loading...");
          this.loadPosts(true).then((cleared) => {
            loading.dismiss();
            this.loading = false;
          });
        }
        else {
          this.loadMarkers(true).then((cleared) => {
            this.loading = false;
          });
        }
      },
      (error:any) => {
        this.showToast(error);
      });
  }

  showList(event:any) {
    this.logger.info(this, "showList");
    this.view = 'list';
  }

  showMap(event:any, attempts:number=0) {
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
                    this.showToast("Problem loading the map markers");
                  }
                });
            },
            (error) => {
              this.logger.error(this, "showMap", "loadMarkers", error);
              this.showToast("Problem loading the map");
            });
      });
    }
    else {
      setTimeout((attempts) => {
        this.showMap(event, attempts+1);
      }, 1000, attempts);
    }
  }

  loadCenter():Promise<any> {
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

  loadMap():Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadMap");
      this.map = L.map("mapMany").setView([this.mapLatitude, this.mapLongitude], this.mapZoom);
      this.mapLayer = L.tileLayer(new TileLayer(this.mapStyle).getUrl(), { maxZoom: 20 });
      this.mapLayer.addTo(this.map);
      resolve(this.map);
    });
  }

  loadMarkers(cache:boolean=true, offset:number=0, limit:number=10):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.view == 'map') {
        this.loading = true;
        this.logger.info(this, "loadMarkers", "Limit", limit, "Offset", offset);
        this.api.getPosts(this.deployment, this.filter, cache, this.offline, limit, offset).then(
          (posts:Post[]) => {
            this.logger.info(this, "loadMarkers", "Limit", limit, "Offset", offset, "Loaded");
            for (let post of posts) {
              if (post.latitude && post.longitude) {
                let marker = this.loadMarker(post);
                marker.addTo(this.map);
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

  loadMarker(post:Post):L.Marker {
    this.logger.info(this, "loadMarker", post.title, post.latitude, post.longitude);
    let icon = L.icon({
      iconUrl: new MapMarker(post.color).getUrl(),
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

  showStyles(event) {
    this.logger.info(this, "showStyles");
    let buttons = [
      {
        text: 'Streets',
        handler:() => this.changeStyle("streets")
      },
      {
        text: 'Outdoors',
        handler:() => this.changeStyle("outdoors")
      },
      {
        text: 'Light',
        handler:() => this.changeStyle("light")
      },
      {
        text: 'Dark',
        handler:() => this.changeStyle("dark")
      },
      {
        text: 'Satellite',
        handler:() => this.changeStyle("satellite")
      },
      {
        text: 'Satellite Streets',
        handler:() => this.changeStyle("satellite-streets")
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
    this.showActionSheet("Change map style", buttons);
  }

  changeStyle(mapStyle:string) {
    this.logger.info(this, "changeStyle", mapStyle);
    this.mapStyle = mapStyle;
    this.map.removeLayer(this.mapLayer);
    this.mapLayer = L.tileLayer(new TileLayer(this.mapStyle).getUrl(), { maxZoom: 20 });
    this.mapLayer.addTo(this.map);
  }

}
