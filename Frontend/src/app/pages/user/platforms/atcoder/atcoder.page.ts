import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-atcoder',
  templateUrl: './atcoder.page.html',
  styleUrls: ['./atcoder.page.scss'],
})
export class AtcoderPage implements OnInit {

  userData1:any = null
  userData2:any = null
  username
  platform
  loaded = false
  
  constructor(
    private _userService: UserService,
    private _tokenService: TokenService,
    private _loaderService: LoaderService,
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
    this._userService.getUserDetails1(this.platform, this.username).subscribe(
      data => {
        if (data['status'] == "OK") {
          this.userData1 = data
          if(this.userData1["TopCoder ID"])
          this.userData1["TopCoderID"] = this.userData1["TopCoder ID"]
          if(this.userData1["Twitter ID"])
          this.userData1["TwitterID"] = this.userData1["Twitter ID"]
          if(this.userData1["Codeforces ID"])
          this.userData1["CodeforcesID"] = this.userData1["Codeforces ID"]
          if(this.userData1["Codeforces ID"])
          this.userData1["LastCompeted"] = this.userData1["Codeforces ID"]
          if(this.userData1["Rated Matches"])
          this.userData1["ratedMatches"] = this.userData1["Rated Matches"]
          if(this.userData1["Birth Year"])
          this.userData1["BirthYear"] = this.userData1["Birth Year"]
          if(this.userData1["Country/Region"])
          this.userData1["CountryRegion"] = this.userData1["Country/Region"]
        }
        this.getUserData2()
      }
    )
  }

  getUserData2() {
    this._userService.getUserDetails2(this.platform, this.username).subscribe(
      data => {
        if (data['status'] == "OK")  {
          this.userData2 = data
        }
        this.loaded = true
        this._loaderService.isLoading.next(false)
      }
    )
  }
}
