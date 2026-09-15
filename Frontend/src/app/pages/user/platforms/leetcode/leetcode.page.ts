import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { LoaderService } from 'src/app/services/loader.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UserService } from 'src/app/services/user.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-leetcode',
  templateUrl: './leetcode.page.html',
  styleUrls: ['./leetcode.page.scss'],
})

export class LeetcodePage implements OnInit, OnDestroy {
  pieChart: Chart;

  username
  platform
  userData: any = null
  easyRate = 0
  mediumRate = 0
  hardRate = 0
  easySolved = 0
  easyTotal = 0
  mediumSolved = 0
  mediumTotal = 0
  hardSolved = 0
  hardTotal = 0
  totalSolved = 0
  chartDataArray = new Array(0, 0, 0, 0)
  submissionList = new Array()
  isRefreshing = false

  @ViewChild('pieCanvas') pieCanvas: ElementRef<HTMLCanvasElement>;
  theme: string;

  constructor(
    private _userService: UserService,
    private _loaderService: LoaderService,
    private _localStorageService: LocalStorageService,
    private _themeService: ThemeService,
    private _alertService: AlertService
  ) {
    Chart.register(...registerables)
  }

  ngOnInit() {
    this.getData()
    this._loaderService.isLoading.next(true)
    this._themeService.theme.subscribe((val) => {
      this.theme = (val === 'dark') ? '#fff' : '#000';
      if (this.pieChart) {
        this.pieChart.options.plugins.legend.labels.color = this.theme;
        this.pieChart.update();
      }
    });
    this.getUserData();
    this.getUserData2();
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this._loaderService.isLoading.next(false);
  }

  getData() {
    let platform = this._localStorageService.getPlatform();
    this.platform = Object.keys(platform)[0]
    this.username = platform[Object.keys(platform)[0]]
  }

  getUserData() {
    this._userService.getUserDetails(this.platform, this.username).subscribe(
      data => {
        this.applyUserData(data)
        this._loaderService.isLoading.next(false)
      }
    )
  }

  refreshUserData(refresher?: HTMLIonRefresherElement) {
    // Prevent duplicate refresh requests while one is already running
    if (this.isRefreshing) {
      return
    }

    this.isRefreshing = true
    this._loaderService.isLoading.next(true)
    this._userService.refreshUserDetails(this.platform, this.username).subscribe({
      next: (data) => {
        this.applyUserData(data)
      },
      error: (err) => {
        this.showError(err || { details: 'Refresh failed. Existing data preserved.' })
      },
      complete: () => {
        this.isRefreshing = false
        this._loaderService.isLoading.next(false)
        if (refresher) {
          refresher.complete()
        }
      }
    })
  }

  applyUserData(data: any) {
    if (data['status'] == 'OK') {
      this.userData = data
      this.easySolved = this.getSolvedCount('Easy', data)
      this.easyTotal = this.getTotalCount('Easy', data)
      this.mediumSolved = this.getSolvedCount('Medium', data)
      this.mediumTotal = this.getTotalCount('Medium', data)
      this.hardSolved = this.getSolvedCount('Hard', data)
      this.hardTotal = this.getTotalCount('Hard', data)
      this.totalSolved = this.getTotalSolved(data)
      this.easyRate = this.SolveRate(this.easySolved, this.easyTotal)
      this.mediumRate = this.SolveRate(this.mediumSolved, this.mediumTotal)
      this.hardRate = this.SolveRate(this.hardSolved, this.hardTotal)
      this.chartDataArray[0] = this.easySolved
      this.chartDataArray[1] = this.mediumSolved
      this.chartDataArray[2] = this.hardSolved
      this.chartDataArray[3] = this.totalSolved
      setTimeout(() => {
        this.pieChartMethod()
      }, 200)
    } else {
      this.showError(data)
    }
  }

  getSolvedCount(difficulty: string, data: any): number {
    return this.getCountFromList(difficulty, data, 'acSubmissionNum')
  }

  getTotalCount(difficulty: string, data: any): number {
    const list = data && data['allQuestionsCount']
    const entry = list && list.find(item => item['difficulty'] === difficulty)
    return entry ? entry['count'] : 0
  }

  getCountFromList(difficulty: string, data: any, key: string): number {
    const stats = data && data['matchedUser'] && data['matchedUser']['submitStats']
    const list = stats && stats[key]
    const entry = list && list.find(item => item['difficulty'] === difficulty)
    return entry ? entry['count'] : 0
  }

  getTotalSolved(data: any): number {
    const stats = data && data['matchedUser'] && data['matchedUser']['submitStats']
    const list = stats && stats['acSubmissionNum']
    if (!list) return 0
    return list.reduce((sum, item) => sum + item['count'], 0)
  }

  showError(data: any) {
    const message = (data && data['details']) || 'Could not fetch profile. Please try again later.'
    this._alertService.presentToast(message, 'danger')
  }

  pieChartMethod() {
    this.pieChart?.destroy();
    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
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
          borderWidth: 0,
        }],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              color: this.theme,
              font: {
                size: 14
              }
            }
          },
        },
      },
    })
  }

  SolveRate(solved, total) {
    if (!total) return 0;
    return solved / total;
  }

  getUserData2() {
    this._userService.getLeetCodeRecentSubmissions(this.username).subscribe(
      data => {
        if (data) {
          this.submissionList = data['recentSubmissionList']
        }
      }
    )
  }
}
