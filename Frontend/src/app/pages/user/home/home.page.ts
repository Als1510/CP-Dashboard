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
  element
  
  ngOnInit() {
    this.getUpcomingContest()
    this.element = document.querySelectorAll('.faq_icon')
    this._loaderService.isLoading.next(false)
    this.element.forEach((event)=>{
      event.addEventListener('click', ()=>{
        if(event.classList.contains('rotate')) {
          event.classList.remove('rotate')
          event.nextSibling.style.display = 'none';
        } else {
          event.nextSibling.style.display = 'block';
          event.classList.add('rotate')
        }
      })
    })
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
        this._loaderService.isLoading.next(false)
      }
    )
  }
}
