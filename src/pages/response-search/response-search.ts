import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, Searchbar, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Deployment } from '../../models/deployment';
import { Filter } from '../../models/filter';
import { Form } from '../../models/form';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

@Component({
  selector: 'response-search-page',
  templateUrl: 'response-search.html',
  providers: [ ApiService, DatabaseService, LoggerService ]
})
export class ResponseSearchPage extends BasePage {

  deployment: Deployment = null;
  filter: Filter = null;

  @ViewChild(Content)
  content: Content;

  @ViewChild('searchbar')
  searchbar: Searchbar;

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
    protected database:DatabaseService) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.deployment = this.getParameter<Deployment>("deployment");
    this.filter = this.getParameter<Filter>("filter");
    if (this.filter == null) {
      this.filter = new Filter();
      this.filter.deployment_id = this.deployment.id;
      this.filter.search_text = null;
      this.filter.show_inreview = true;
      this.filter.show_archived = true;
      this.filter.show_published = true;
      this.filter.show_forms = this.deployment.forms.map((form:Form) => form.id).join(",");
    }
    this.logger.info(this, "ionViewWillEnter", "Filter", this.filter);
  }

  onCancel(event:any) {
    this.logger.info(this, "onCancel");
    this.hideModal();
  }

  onDone(event:any) {
    this.logger.info(this, "onDone");
    this.database.saveFilter(this.deployment, this.filter).then(results => {
      this.hideModal({
        filter: this.filter });
    });
  }

  onSearch(event:any) {
    this.logger.info(this, "onSearch", event);
  }

  formChanged(event:any, form:Form) {
    if (event.checked) {
      this.logger.info(this, "formChanged", "Checked", form.id);
      this.filter.addForm(form);
    }
    else {
      this.logger.info(this, "formChanged", "Unchecked", form.id);
      this.filter.removeForm(form);
    }
  }

  publishedChanged(event:any) {
    this.logger.info(this, "publishedChanged");
  }

  reviewChanged(event:any) {
    this.logger.info(this, "reviewChanged");
  }

  archivedChanged(event:any) {
    this.logger.info(this, "archivedChanged");
  }
}
