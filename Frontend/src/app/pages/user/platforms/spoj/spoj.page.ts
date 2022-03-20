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
  userData1: any = null
  userData2: any = null
  loaded = false

  constructor(
    private _userService: UserService,
    private _tokenService: TokenService,
    private _loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.getData()
    this.getUserData1()
  }
  
  getData() {
    let platform = this._tokenService.getPlatform();
    this.platform = Object.keys(platform)[0]
    this.username = platform[Object.keys(platform)[0]]
  }
  
  getUserData1() {
    this._userService.getUserDetails1(this.platform, this.username).subscribe(data=> {
      if(data["status"]=="OK") {
        this.userData1 = data
        this.userData1["problems_solved"] = this.userData1["Problems solved"]
        this.userData1["solution_submitted"] = this.userData1["Solutions submitted"]
        this.getUserData2()
      }
    })
  }

  getUserData2() {
    this._userService.getUserDetails2(this.platform, this.username).subscribe(data=> {
      if(data["status"]=="OK") { 
        this.userData2 = data
        this.loaded = true
      }
      this._loaderService.isLoading.next(false)
    })
  }

}
