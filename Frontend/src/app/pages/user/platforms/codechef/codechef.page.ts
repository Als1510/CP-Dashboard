import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { LoaderService } from 'src/app/services/loader.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-codechef',
  templateUrl: './codechef.page.html',
  styleUrls: ['./codechef.page.scss'],
})
export class CodechefPage implements OnInit, OnDestroy {
  lineChart: Chart;
  userData: any = null
  username
  platform
  ratingArray = []
  contestArray = []
  starsData = [
    { rating: [0, 1399], star: 1, color: '#666666', div: 4 },
    { rating: [1400, 1599], star: 2, color: '#1E7D22', div: 3 },
    { rating: [1600, 1799], star: 3, color: '#3366CC', div: 2 },
    { rating: [1800, 1999], star: 4, color: '#684273', div: 2 },
    { rating: [2000, 2199], star: 5, color: '#FFBF00', div: 1 },
    { rating: [2200, 2499], star: 6, color: '#FF7F00', div: 1 },
    { rating: [2500, 5000], star: 7, color: '#D0011B', div: 1 },
  ]
  loaded = false
  isRefreshing = false

  @ViewChild('lineCanvas') lineCanvas: ElementRef<HTMLCanvasElement>;

  constructor(
    private _userService: UserService,
    private _localStorageService: LocalStorageService,
    private _loaderService: LoaderService,
    private _utilService: UtilService,
    private _alertService: AlertService
  ) {
    Chart.register(...registerables)
  }

  async ngOnInit() {
    this.getData()
    this.getUserData()
  }

  ngOnDestroy(): void {
    this.lineChart?.destroy();
    this._loaderService.isLoading.next(false);
  }

  getData() {
    let platform = this._localStorageService.getPlatform();
    this.platform = Object.keys(platform)[0]
    this.username = platform[Object.keys(platform)[0]]
  }

  getUserData() {
    this._loaderService.isLoading.next(true)
    this._userService.getUserDetails(this.platform, this.username).subscribe(
      data => {
        this.applyUserData(data)
        this._loaderService.isLoading.next(false)
        this.loaded = true
      },
      () => {
        this._loaderService.isLoading.next(false)
        this.showError({ details: 'Failed to load profile.' })
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
    if (data['status'] == "OK") {
      this.userData = data
      this.CalStars()
      this.contestArray = this.userData.contest_ratings.map(res => res.name)
      this.ratingArray = this.userData.contest_ratings.map(res => res.rating)
      setTimeout(() => {
        this.lineChartMethod()
      }, 1)
    } else {
      this.showError(data)
    }
  }

  showError(data: any) {
    const message = (data && data['details']) || 'Could not fetch profile. Please try again later.'
    this._alertService.presentToast(message, 'danger')
  }

  countStars(data) {
    return new Array(data);
  }

  CalStars() {
    let rating = this.userData.rating
    this.starsData.forEach(ele => {
      if ((rating >= ele.rating[0]) && (rating <= ele.rating[1])) {
        this.userData['color'] = ele.color
        this.userData['stars'] = ele.star
        this.userData['div'] = ele.div
      }
    });
  }

  lineChartMethod() {
    this.lineChart?.destroy();
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
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

  getProblemsValue(key: string, section: string): any {
    const sec = (this.userData as any)[section];
    return sec && sec[key] ? sec[key] : [];
  }
}
