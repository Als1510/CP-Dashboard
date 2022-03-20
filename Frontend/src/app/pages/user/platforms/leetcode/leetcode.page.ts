import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js'
import { gql, request } from 'graphql-request';
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
  easyRate = 0
  mediumRate = 0
  hardRate = 0

  query = gql`
  query getRecentSubmissionList($username: String!, $limit: Int) {
      recentSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
          __typename
      }
  }`;

  requestHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:4200',
  'Access-Control-Allow-Credentials': 'true'
  };

  constructor(
    private _userService: UserService,
    private _loaderService: LoaderService,
    private _tokenService: TokenService
  ) {
    Chart.register(...registerables)
  }

  ngOnInit() {
    this.getData()
    this.getUserData1();
  }

  getData() {
    let platform = this._tokenService.getPlatform();
    this.platform = Object.keys(platform)[0]
    this.username = platform[Object.keys(platform)[0]]
  }

  // async getLeetcodeRecentSubmission() {
  //   await request("https://obscure-escarpment-76911.herokuapp.com/https://leetcode.com/graphql", this.query, { username: 'als.1510' })
  // }

  getUserData1() {
    this._userService.getUserDetails2(this.platform, this.username).subscribe(
      data => {
        if(data['status'] == 'OK') {
          this.userData = data
          this.easyRate = this.SolveRate(data['easy_questions_solved'], data['total_easy_questions'])
          this.mediumRate = this.SolveRate(data['medium_questions_solved'], data['total_medium_questions'])
          this.hardRate = this.SolveRate(data['hard_questions_solved'], data['total_hard_questions'])
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
          data: [1, 3, 6, 10],
          backgroundColor: [
            "#F7A35C",
            "#90ED7D",
            "#434348",
            "#7CB5EC",
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
}
