import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-codechef',
  templateUrl: './codechef.page.html',
  styleUrls: ['./codechef.page.scss'],
})
export class CodechefPage implements OnInit {
  lineChart: Chart;
  userData:any = null
  username
  platform
  ratingArray = []
  contestArray = []
  starsData = [
    {rating: [0,1399], star:1, color:'#666666', div:4},
    {rating: [1400,1599], star:2, color:'#1E7D22', div:3},
    {rating: [1600,1799], star:3, color:'#3366CC', div:2},
    {rating: [1800,1999], star:4, color:'#684273', div:2},
    {rating: [2000,2199], star:5, color:'#FFBF00', div:1},
    {rating: [2200,2499], star:6, color:'#FF7F00', div:1},
    {rating: [2500,5000], star:7, color:'#D0011B', div:1},
  ]
  loaded = false

  constructor(
    private _userService: UserService,
    private _tokenService: TokenService,
    private _loderService: LoaderService,
    private _utilService: UtilService
  ) { 
    Chart.register(...registerables)
  }

  async ngOnInit() {
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
      data => {
        if (data['status'] == "OK") {
          this.userData = data
          this.CalStars()
          this.userData.user_details['student_professional'] = this.userData.user_details['student/professional']
          this.contestArray = this.userData.contest_ratings.map(res => res.name)
          this.ratingArray = this.userData.contest_ratings.map(res => res.rating)
          setTimeout(()=>{
            this.lineChartMethod()
            this._loderService.isLoading.next(false)
          }, 1)
        }
      }
    )
  }

  countStars(data) {
    return new Array(data);
  }

  CalStars() {
    let rating = this.userData.rating
    this.starsData.forEach(ele => {
      if((rating >= ele.rating[0]) && (rating <= ele.rating[1])) {
        this.userData['color'] = ele.color
        this.userData['stars'] = ele.star
        this.userData['div'] = ele.div
      }
    });
  }

  lineChartMethod() {
    let lineCanvas = document.querySelector('canvas')
    this.lineChart = new Chart(lineCanvas, {
      type: "line",
      data: {
        labels: this.contestArray,
        datasets: [{
            label: "Rating",
            fill: false,
            backgroundColor: "rgba(17, 137, 189,0.4)",
            borderColor: "rgba(17, 137, 189, 1)",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgba(17, 137, 189,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.ratingArray,
            spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Contest',
            },
            grid: {
              display: false
            },
            ticks: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Rating',
            },
            grid: {
              display: false
            },
          },
        },
      }
    }) 
    this.loaded = true
  }
}
