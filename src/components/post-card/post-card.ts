import { Component, Output, EventEmitter } from '@angular/core';

import { LoggerService } from '../../providers/logger-service';

import { PLACEHOLDER_USER, PLACEHOLDER_PHOTO, PLACEHOLDER_NAME } from '../../constants/placeholders';

@Component({
  selector: 'post-card',
  templateUrl: 'post-card.html',
  inputs: ['post']
})
export class PostCardComponent {

  @Output()
  cardSelected = new EventEmitter();

  @Output()
  menuSelected = new EventEmitter();

  post:any = {};

  userName:string = PLACEHOLDER_NAME;
  userPlaceholder:string = PLACEHOLDER_USER;
  photoPlaceholder:string = PLACEHOLDER_PHOTO;

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
  }

  onCardSelected(event) {
    this.logger.info(this, "onCardSelected");
    this.cardSelected.emit();
  }

  onMenuSelected(event) {
    this.logger.info(this, "onMenuSelected");
    this.menuSelected.emit();
  }

}
