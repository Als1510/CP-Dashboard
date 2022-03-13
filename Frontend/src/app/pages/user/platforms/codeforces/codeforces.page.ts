import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-codeforces',
  templateUrl: './codeforces.page.html',
  styleUrls: ['./codeforces.page.scss'],
})
export class CodeforcesPage implements OnInit {

  userData1
  userData2 = new Array()
  username
  platform
  loaded1=false
  loaded2=false

  constructor(
    private _userService: UserService,
    private _tokenService: TokenService,
    private _loderService: LoaderService,
    private _utilService: UtilService
  ) { }

  async ngOnInit() {
    this.getData()
    this.getUserData1()
    this.getUserData2()
  }

  getData() {
    let platform = this._tokenService.getPlatform();
    this.platform = Object.keys(platform)[0]
    this.username = platform[Object.keys(platform)[0]]
  }

  getUserData1() {
    this._userService.getUserDetails1(this.platform, this.username).subscribe(
      data=> {
        if(data['status'] == "OK")
          this.userData1 = data
        console.log(data)
        this.loaded1 = true
        this._loderService.isLoading.next(false)
      }
    )
  }

  getUserData2() {
    this._userService.getUserDetails2(this.platform, this.username).subscribe(
      data => {
        if(data['status'] == "OK")
          this.userData2 = data['contests']
        this.loaded2 = true
        this._loderService.isLoading.next(false)
      }
    )
  }

}
