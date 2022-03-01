import { Component, OnInit } from '@angular/core';
import { ContestService } from 'src/app/services/contest.service';
import { LoaderService } from 'src/app/services/loader.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private _contestService: ContestService,
    private _loaderService: LoaderService
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

  calculate(data) {
    data.forEach(event => {
      this.platforms.forEach(platform => {
        if (event.url.includes(platform)) {
          let today = new Date(new Date().toLocaleString("en-US", { timeZone: 'Asia/Kolkata' }))

          let eventDate = new Date(new Date(event.start_time).toLocaleString("en-US", { timeZone: 'Asia/Kolkata' }))

          if (today <= eventDate) {
            let total = (eventDate.valueOf() - today.valueOf());
            let totalD = Math.abs(Math.floor(total / 1000));

            let years = Math.floor(totalD / (365 * 60 * 60 * 24));
            let months = Math.floor((totalD - years * 365 * 60 * 60 * 24) / (30 * 60 * 60 * 24));
            let days = Math.floor((totalD - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24) / (60 * 60 * 24));
            let hours = Math.floor((totalD - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24 - days * 60 * 60 * 24) / (60 * 60));
            let minutes = Math.floor((totalD - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24 - days * 60 * 60 * 24 - hours * 60 * 60) / (60));
            let startIn = '';
            if(days > 0) {
              startIn += days+' days '
            }
            if(hours > 0) {
              startIn += hours+' hours '
            }
            if(minutes > 0) {
              startIn += minutes+' minutes'
            }
            event['startIn'] = startIn
            this.contests.push(event)
          }
        }
      })
    });
    // console.log(this.contests)
  }

  async getUpcomingContest() {
    await this._contestService.upcomingContest().subscribe(
      data => {
        this.calculate(data)
      }
    )
  }
}
