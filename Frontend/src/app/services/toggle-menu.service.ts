import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleMenuService {

  private subject = new Subject<any>();

  sendClickEvent() {
    this.subject.next()
  }

  // getClickEvent()

}
