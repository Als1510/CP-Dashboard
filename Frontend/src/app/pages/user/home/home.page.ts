import { Component, OnInit } from '@angular/core';
import { ContestService } from 'src/app/services/contest.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private _contestService: ContestService,
    private _loaderService: LoaderService,
    private _utilService: UtilService
  ) { }

  contests = new Array();
  platforms = ['codechef', 'codeforces', 'hackerrank', 'harkerearth', 'leetcode']

  ngOnInit() {
    this.getUpcomingContest()
    this._loaderService.isLoading.next(false)
  }

  toggleBtn() {
    let ul = document.querySelector('ul');
    ul.classList.toggle('active')
  }

  async getUpcomingContest() {
    await this._contestService.upcomingContest().subscribe(
      async data => {
        let platformsData = await this._utilService.extractPlatforms(data, this.platforms)
        this.contests = await this._utilService.convertDateinIST(platformsData)
      }
    )
  }
}
