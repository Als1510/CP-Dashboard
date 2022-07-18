import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-spoj',
  templateUrl: './spoj.page.html',
  styleUrls: ['./spoj.page.scss'],
})
export class SpojPage implements OnInit {

  username
  platform
  userData:any = null
  loaded = false

  constructor(
    private _userService: UserService,
    private _tokenService: TokenService,
    private _loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.getData()
    this.getUserData()
  }
  
  getData() {
    let platform = this._tokenService.getPlatform();
    this.platform = Object.keys(platform)[0]
    this.username = platform[Object.keys(platform)[0]]
  }
  
  getUserData(){
    this._userService.getUserDetails(this.platform, this.username).subscribe(data=> {
      this.userData = data
      this.loaded = true
      this._loaderService.isLoading.next(false)
    })
  }
}
