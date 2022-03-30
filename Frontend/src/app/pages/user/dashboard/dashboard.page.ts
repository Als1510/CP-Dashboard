import { Component, OnInit } from '@angular/core';
import { ContestService } from 'src/app/services/contest.service';
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  contests = new Array();
  platform = new Array()
  time = new Array()
  registeredPlatform = 0;
  value = 0;
  name
  username

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay:true,
   };

  constructor(
    private _contestService: ContestService,
    private _utilService: UtilService,
    private _loaderService: LoaderService,
    private _userService: UserService,
    private _tokenService: TokenService
  ) { }

  ngOnInit() {
    this.getUserData()
    this.getUpcomingContest()
    this.getPlatforms()
  }

  showUser() {
    document.getElementById('user').style.display = 'none'
    document.getElementById('username').style.display='block'
    document.getElementById('name').style.display='block'
    setTimeout(()=>{
      document.getElementById('user').style.display = 'block'
      document.getElementById('username').style.display='none'
      document.getElementById('name').style.display='none'
    }, 2500)
  }

  getUserData() {
    this.name = this._tokenService.getName();
    this.username = this._tokenService.getUserName();
  }

  platformChange(data) {
    if(data == "all") {
      this.platform = new Array()
    } else {
      this.platform = new Array(data)
    }
    this.getUpcomingContest()
  }

  timeChange(data) {
    if(data == "all") {
      this.time = new Array()
    } else {
      this.time = new Array(data)
    }
    this.getUpcomingContest()
  }

  getPlatforms() {
    this._userService.getPlatforms().subscribe(
      data => {
        for(let prop in data['platformData'].platform) {
          if(data['platformData'].platform[prop])
          this.registeredPlatform++
        }
        this.value = 25*this.registeredPlatform
        this._loaderService.isLoading.next(false);
      }
    )
  }

  async getUpcomingContest() {
    this._contestService.upcomingContest().subscribe(
      data => {
        this._loaderService.isLoading.next(false);
        let platformData = this._utilService.extractPlatforms(data, this.platform)
        let timeData = this._utilService.extractTime(platformData, this.time)
        this.contests = this._utilService.convertDateinIST(timeData)
      }
    )
  }
}
