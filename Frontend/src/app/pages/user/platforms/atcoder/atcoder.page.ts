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

  userData:any = null
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
    this.getUserData()
  }

  getData() {
    let platform = this._tokenService.getPlatform();
    this.platform = Object.keys(platform)[0]
    this.username = platform[Object.keys(platform)[0]]
  }

  getUserData() {
    this._userService.getUserDetails(this.platform, this.username).subscribe(
      data=>{
        this.userData = data
        if (data['status'] == "OK") {
          this.userData = data
          if(this.userData.other.hasOwnProperty("TopCoder ID"))
          this.userData["TopCoderID"] = this.userData.other["TopCoder ID"]
          if(this.userData.other.hasOwnProperty("Twitter ID"))
          this.userData["TwitterID"] = this.userData.other["Twitter ID"]
          if(this.userData.other.hasOwnProperty("TCodeforces ID"))
          this.userData["CodeforcesID"] = this.userData.other["Codeforces ID"]
          if(this.userData.other.hasOwnProperty("LastCompeted"))
          this.userData["LastCompeted"] = this.userData.other["LastCompeted"]
          if(this.userData.other.hasOwnProperty("Rated Matches"))
          this.userData["ratedMatches"] = this.userData.other["Rated Matches"]
          if(this.userData.other.hasOwnProperty("Birth Year"))
          this.userData["BirthYear"] = this.userData.other["Birth Year"]
          if(this.userData.other.hasOwnProperty("Country/Region"))
          this.userData["CountryRegion"] = this.userData.other['Country/Region']
        }
        this.loaded = true
        this._loaderService.isLoading.next(false)
      }
    )
  }
}
