import { Component } from '@angular/core';
import { Platform, NavParams,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsLatLngBounds, CameraPosition, GoogleMapsMarkerOptions, GoogleMapsMarker } from 'ionic-native';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseAddPage } from '../response-add/response-add';
import { ResponseDetailsPage } from '../response-details/response-details';

import { CardComponent } from '../../components/card/card';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';
import { Form } from '../../models/form';
import { Image } from '../../models/image';
import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

@Component({
  selector: 'page-response-list',
  templateUrl: 'response-list.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseAddPage, ResponseDetailsPage ]
})
export class ResponseListPage extends BasePage {

  deployment: Deployment = null;
  posts: Post[] = null;
  forms: any = null;
  images: any = null;
  values: any = null;
  map: GoogleMap = null;
  view: string = 'list';

  constructor(
    public platform:Platform,
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public navParams: NavParams,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    this.logger.info(this, 'ionViewDidLoad');
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter");
    this.deployment = this.navParams.get("deployment");
    this.forms = this.navParams.get("forms");
    this.loadUpdates(null, true);
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  loadUpdates(event:any=null, cache:boolean=false) {
    this.logger.info(this, "loadUpdates", "Cache", cache);
    let promises = [
      this.loadPosts(cache)];
    Promise.all(promises).then(
      (done) => {
        if (event != null) {
          event.complete();
        }
        this.logger.info(this, "loadUpdates", "Done");
      },
      (error) => {
        if (event != null) {
          event.complete();
        }
        this.logger.error(this, "loadUpdates", error);
      });
  }

  loadPosts(cache:boolean=true) {
    this.logger.info(this, "loadPosts", "Cache", cache);
    if (cache && this.posts != null && this.posts.length > 0) {
      this.logger.info(this, "loadPosts", "Cached", this.posts.length);
    }
    else if (cache) {
      return this.database.getPostsWithValues(this.deployment).then(
        (results) => {
          let posts = <Post[]>results;
          this.logger.info(this, "loadPosts", "Database", posts.length);
          if (posts && posts.length > 0) {
            this.posts = posts;
          }
          else {
            this.loadPosts(false);
          }
        },
        (error) => {
          this.logger.error(this, "loadPosts", "Database", error);
        });
    }
    else {
      return this.api.getPostsWithValues(this.deployment).then(
        (results) => {
          this.posts = <Post[]>results;
          this.logger.info(this, "loadPosts", "API", this.posts.length);
          for (let index in this.posts) {
            let post:Post = this.posts[index];
            this.database.savePost(this.deployment, post).then(saved => {
              this.logger.info(this, "loadPosts", "API", "Post Saved", post.id);
            });
            for (let index in post.values) {
              let value:Value = post.values[index];
              this.database.saveValue(this.deployment, value).then(saved => {
                this.logger.info(this, "loadPosts", "API", "Value Saved", value.key);
              });
            }
          }
        },
        (error) => {
          this.logger.error(this, "loadPosts", "API", error);
        });
    }
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
    if (this.forms != null) {
      for (var i = 0; i < this.forms.length; i++){
        let form = this.forms[i];
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
    this.showToast('Search Not Implemented');
  }

  shareResponses(event:any) {
    this.logger.info(this, "shareResponses");
    this.showToast('Sharing Not Implemented');
  }

  showOptions(post:Post) {
    this.logger.info(this, "showOptions");
    let buttons = [
      {
         text: 'Edit',
         handler: () => {
           this.logger.info(this, "showOptions", 'Edit');
           this.showToast("Edit Not Implemented");
         }
       },
       {
         text: 'Add to Collection',
         handler: () => {
           this.logger.info(this, "showOptions", 'Add');
           this.showToast("Add Not Implemented");
         }
       },
       {
         text: 'Share',
         handler: () => {
           this.logger.info(this, "showOptions", 'Share');
           this.showToast("Share Not Implemented");
         }
       },
       {
         text: 'Delete',
         role: 'destructive',
         handler: () => {
           this.logger.info(this, "showOptions", 'Delete');
           this.showToast("Delete Not Implemented");
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           this.logger.info(this, "showOptions", 'Cancel');
         }
       }
     ];
   this.showActionSheet(null, buttons);
  }

  showList(event:any) {
    this.logger.info(this, "showList");
    this.view = 'list';
    if (this.map) {
      this.map.setVisible(false);
    }
  }

  showMap(event:any, attempts:number=0) {
    this.logger.info(this, "showMap", attempts);
    this.view = 'map';
    let element: HTMLElement = document.getElementById('map');
    if (element) {
      if (this.map) {
        this.map.remove();
      }
      this.map = new GoogleMap(element,
        { 'backgroundColor': '#e7e9ec' });
      this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
        this.logger.info(this,  "showMap", 'Map Ready');
        let bounds = [];
        for (var i = 0; i <= this.posts.length; i++){
          let post = this.posts[i];
          if (post && post.latitude && post.longitude) {
            let latitude = Number(post.latitude);
            let longitude = Number(post.longitude);
            let coordinate: GoogleMapsLatLng = new GoogleMapsLatLng(latitude, longitude);
            this.logger.info(this, "showMap", "Coordinate", coordinate);
            this.map.addMarker({
              position: coordinate,
              title: post.title,
              snippet: post.description,
              infoClick: (marker) => {
                this.logger.info(this, "showMap", "Info", post.id);
                this.showResponse(post);
              },
              markerClick: (marker) => {
                this.logger.info(this, "showMap", "Marker", post.id);
                marker.showInfoWindow();
              },
            });
            bounds.push(coordinate);
          }
        }
        if (bounds.length > 0) {
          this.map.animateCamera({
            target: bounds,
            duration: 2000
          });
        }
      });
    }
    else {
      setTimeout((attempts) => {
        this.showMap(event, attempts+1);
      }, 1000, attempts);
    }
  }

}
