import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-platforms',
  templateUrl: './platforms.page.html',
  styleUrls: ['./platforms.page.scss'],
})
export class PlatformsPage implements OnInit {

  constructor(
    private _userSerive: UserService
  ) { }

  ngOnInit() {
  }

  getplatform() {
    
  }

}
