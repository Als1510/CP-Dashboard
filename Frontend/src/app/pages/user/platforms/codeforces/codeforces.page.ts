import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-codeforces',
  templateUrl: './codeforces.page.html',
  styleUrls: ['./codeforces.page.scss'],
})

export class CodeforcesPage implements OnInit {
  lineChart: Chart;
  userData:any = null
  username
  platform
  ratingArray = []
  contestArray = []
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
          this.ratingArray = this.userData.contests.map(res => res.newRating).reverse()
          this.contestArray = this.userData.contests.map(res => res.contest).reverse()
          setTimeout(()=>{
            this.lineChartMethod()
            this._loderService.isLoading.next(false)
          }, 1)
        }
      }
    )
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
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Rating',
            },
            grid: {
              display: false
            },
            min: 0,
          },
        },
      }
    })    
    this.loaded = true
  }
}
