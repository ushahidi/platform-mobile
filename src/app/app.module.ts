import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IsDebug } from '@ionic-native/is-debug';
import { StatusBar } from '@ionic-native/status-bar';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Network } from '@ionic-native/network';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geolocation } from '@ionic-native/geolocation';

import { MyApp } from './app.component';
import { BasePage } from '../pages/base-page/base-page';
import { HomePage } from '../pages/home/home';

import { DeploymentSearchPage } from '../pages/deployment-search/deployment-search';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';
import { DeploymentLoginPage } from '../pages/deployment-login/deployment-login';
import { DeploymentSettingsPage } from '../pages/deployment-settings/deployment-settings';

import { ResponseListPage } from '../pages/response-list/response-list';
import { ResponseDetailsPage } from '../pages/response-details/response-details';
import { ResponseAddPage } from '../pages/response-add/response-add';
import { ResponseMapPage } from '../pages/response-map/response-map';
import { ResponseSearchPage } from '../pages/response-search/response-search';
import { ResponseImagePage } from '../pages/response-image/response-image';

import { InputCheckboxComponent } from '../components/input-checkbox/input-checkbox';
import { InputCheckboxesComponent } from '../components/input-checkboxes/input-checkboxes';
import { InputDateComponent } from '../components/input-date/input-date';
import { InputDateTimeComponent } from '../components/input-datetime/input-datetime';
import { InputImageComponent } from '../components/input-image/input-image';
import { InputLocationComponent } from '../components/input-location/input-location';
import { InputNumberComponent } from '../components/input-number/input-number';
import { InputRadioComponent } from '../components/input-radio/input-radio';
import { InputSelectComponent } from '../components/input-select/input-select';
import { InputTextComponent } from '../components/input-text/input-text';
import { InputTextAreaComponent } from '../components/input-textarea/input-textarea';
import { InputVideoComponent } from '../components/input-video/input-video';
import { ImageCacheComponent } from '../components/image-cache/image-cache';
import { PostCardComponent } from '../components/post-card/post-card';
import { PostValueComponent } from '../components/post-value/post-value';

import { DateTimePipe } from '../pipes/date-time';
import { TimeAgoPipe } from '../pipes/time-ago';
import { TitleizePipe } from '../pipes/titleize';
import { CapitalizePipe } from '../pipes/capitalize';
import { TruncatePipe } from '../pipes/truncate';
import { HtmlParserPipe } from '../pipes/html-parser';

import { LoggerService } from '../providers/logger-service';
import { ApiService } from '../providers/api-service';
import { DatabaseService } from '../providers/database-service';
import { CacheService } from '../providers/cache-service';
import { VimeoService } from '../providers/vimeo-service';

@NgModule({
  declarations: [
    MyApp,
    BasePage,
    HomePage,
    DeploymentSearchPage,
    DeploymentDetailsPage,
    DeploymentSettingsPage,
    DeploymentLoginPage,
    ResponseListPage,
    ResponseDetailsPage,
    ResponseAddPage,
    ResponseMapPage,
    ResponseImagePage,
    ResponseSearchPage,
    InputCheckboxComponent,
    InputCheckboxesComponent,
    InputDateComponent,
    InputDateTimeComponent,
    InputImageComponent,
    InputLocationComponent,
    InputNumberComponent,
    InputRadioComponent,
    InputSelectComponent,
    InputTextComponent,
    InputTextAreaComponent,
    InputVideoComponent,
    PostCardComponent,
    PostValueComponent,
    ImageCacheComponent,
    DateTimePipe,
    TimeAgoPipe,
    TitleizePipe,
    CapitalizePipe,
    TruncatePipe,
    HtmlParserPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    FormsModule,
    ReactiveFormsModule
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    MyApp,
    HomePage,
    DeploymentSearchPage,
    DeploymentLoginPage,
    DeploymentDetailsPage,
    DeploymentSettingsPage,
    ResponseListPage,
    ResponseDetailsPage,
    ResponseAddPage,
    ResponseMapPage,
    ResponseImagePage,
    ResponseSearchPage
  ],
  providers: [
    { provide: File, useClass: File },
    { provide: Camera, useClass: Camera },
    { provide: IsDebug, useClass: IsDebug },
    { provide: Network, useClass: Network },
    { provide: Transfer, useClass: Transfer },
    { provide: StatusBar, useClass: StatusBar },
    { provide: Geolocation, useClass: Geolocation },
    { provide: InAppBrowser, useClass: InAppBrowser },
    { provide: MediaCapture, useClass: MediaCapture },
    { provide: SocialSharing, useClass: SocialSharing },
    { provide: ApiService, useClass: ApiService },
    { provide: VimeoService, useClass: VimeoService },
    { provide: CacheService, useClass: CacheService },
    { provide: LoggerService, useClass: LoggerService },
    { provide: DatabaseService, useClass: DatabaseService },
    { provide: ErrorHandler, useClass: IonicErrorHandler } ]
})
export class AppModule {}
