import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'response-card',
  templateUrl: 'card.html',
  inputs: ['response', 'user', 'index']
})
export class CardComponent {

  @Output() cardSelected = new EventEmitter();
  @Output() menuSelected = new EventEmitter();

  index: number = 0;
  response: any = {};
  user: any = {};
  name: string = null;
  offset: number = 1000;
  placeholderUser: string = "assets/images/placeholder-user.jpg";
  placeholderPhoto: string = "assets/images/placeholder-photo.jpg";
  imageUser: string = null;
  imagePhoto: string = "http://lorempixel.com/400/200/sports/1";

  constructor() {
  }

  ngOnInit() {
    if (this.user) {
      console.log(`Card User ${JSON.stringify(this.user)}`);
      if (this.user['gravatar']) {
        this.imageUser = `https://www.gravatar.com/avatar/${this.user['gravatar']}.jpg?s=32`;
      }
      else {
        this.imageUser = null;
      }
      if (this.user['realname']) {
        this.name = this.user['realname'];
      }
    }
    else {
      console.log(`Card User NULL`);
      this.name = "Anonymous";
    }
  }

  onCardSelected(event) {
    console.log('Card cardSelected');
    this.cardSelected.emit();
  }

  onMenuSelected(event) {
    console.log('Card menuSelected');
    this.menuSelected.emit();
  }
}
