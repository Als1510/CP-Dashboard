import { Component, OnInit } from '@angular/core';
import { ContestService } from 'src/app/services/contest.service';
import { LoaderService } from 'src/app/services/loader.service';
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

  constructor(
    private _contestService: ContestService,
    private _utilService: UtilService,
    private _loaderService: LoaderService,
    private _userService: UserService
  ) { }

  ngOnInit() {
    this.getUpcomingContest()
    this.getPlatforms()
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
        this.value = 20*this.registeredPlatform
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
