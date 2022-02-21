import { Component, OnInit } from '@angular/core';
import { ContestService } from 'src/app/services/contest.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private _contestService: ContestService
  ) {}

  contests = new Array();
  platforms = ['codechef', 'codeforces', 'hackerrank', 'harkerearth', 'leetcode']

  ngOnInit() {
    this.getUpcomingContest()
  }

  toggleBtn() {
    let ul = document.querySelector('ul');
    ul.classList.toggle('active')
  }

  calculate(data) {
    data.forEach(event => {
      this.platforms.forEach(platform => {
        if(event.url.includes(platform)) {
          let today = new Date().toLocaleString("en-US", {timeZone: 'Asia/Kolkata'});
          
          let eventDate = new Date(event.start_time).toLocaleString("en-US", {timeZone: 'Asia/Kolkata'})

          if(Date.parse(today) <= Date.parse(eventDate)){
            let startIn = parseInt(eventDate.split(',')[1].split(':')[0]) - parseInt(today.split(',')[1].split(':')[0]);
            this.contests.push(event)
          }
        }
      })
    });
  }

  async getUpcomingContest() {
    await this._contestService.upcomingContest().subscribe(
      data => {
        this.calculate(data)
      } 
    )
  }
}
