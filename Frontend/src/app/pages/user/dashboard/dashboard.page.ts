import { Component, OnInit } from '@angular/core';
import { ContestService } from 'src/app/services/contest.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  contests

  constructor(
    private _contestService: ContestService,
    private _utilService: UtilService,
    private _loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.getUpcomingContest()
  }

  async getUpcomingContest() {
    this._contestService.upcomingContest().subscribe(
      data => {
        this._loaderService.isLoading.next(false);
        this.contests = this._utilService.convertDateinIST(data)
      }
    )
  }
}
