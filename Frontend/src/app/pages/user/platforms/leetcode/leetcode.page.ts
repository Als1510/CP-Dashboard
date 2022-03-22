import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js'
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-leetcode',
  templateUrl: './leetcode.page.html',
  styleUrls: ['./leetcode.page.scss'],
})

export class LeetcodePage implements OnInit {
  pieChart: Chart;

  username
  platform
  userData: any = null
  userData1: any = null
  easyRate = 0
  mediumRate = 0
  hardRate = 0
  chartDataArray = new Array(0,0,0,0)
  submissionList = new Array()

  constructor(
    private _userService: UserService,
    private _loaderService: LoaderService,
    private _tokenService: TokenService
  ) {
    Chart.register(...registerables)
  }

  async ngOnInit() {
    this.getData()
    this.userData1 = await this._userService.getLeetCodeRecentSubmission(this.username)
    this.getUserData1();
    this.getUserData2();
  }

  getData() {
    let platform = this._tokenService.getPlatform();
    this.platform = Object.keys(platform)[0]
    this.username = platform[Object.keys(platform)[0]]
  }

  getUserData1() {
    this._userService.getUserDetails2(this.platform, this.username).subscribe(
      data => {
        if(data['status'] == 'OK') {
          this.userData = data
          this.easyRate = this.SolveRate(data['easy_questions_solved'], data['total_easy_questions'])
          this.mediumRate = this.SolveRate(data['medium_questions_solved'], data['total_medium_questions'])
          this.hardRate = this.SolveRate(data['hard_questions_solved'], data['total_hard_questions'])
          this.chartDataArray[0] = this.userData['easy_questions_solved']
          this.chartDataArray[1] = this.userData['medium_questions_solved']
          this.chartDataArray[2] = this.userData['hard_questions_solved']
          this.chartDataArray[3] = this.userData['total_problems_solved']
        }
        setTimeout(()=>{
          this.pieChartMethod()
        }, 200)
        this._loaderService.isLoading.next(false);
      }
    )
  }

  pieChartMethod() {
    let pieChart = document.querySelector('canvas');
    this.pieChart = new Chart(pieChart, {
      type: 'doughnut',
      data: {
        labels: ["Easy", "Medium", "Hard", "All"],
        datasets: [{
          label: "Problems Solved",
          data: this.chartDataArray,
          backgroundColor: [
            "#00AF9B",
            "#FFB904",
            "#F9BBBA",
            "#434348",
          ],
          borderWidth: 1,
        }],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
            }
          },
        },
      },
    })
  }

  SolveRate(solved, total) {
    return solved/total;
  }

  async getUserData2() {
    let data = await this._userService.getLeetCodeSubmissionStats(this.username)
    if(data)
      this.submissionList = data['recentSubmissionList']
  }
}
