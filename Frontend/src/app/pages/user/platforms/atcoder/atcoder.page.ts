import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { UserService } from 'src/app/services/user.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-atcoder',
  templateUrl: './atcoder.page.html',
  styleUrls: ['./atcoder.page.scss'],
})
export class AtcoderPage implements OnInit, OnDestroy {

  userData: any = null
  username
  platform
  loaded = false
  isRefreshing = false

  constructor(
    private _userService: UserService,
    private _localStorageService: LocalStorageService,
    private _loaderService: LoaderService,
    private _alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getData()
    this.getUserData()
  }

  ngOnDestroy(): void {
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
        this.loaded = true
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
    if (data && data['status'] === 'OK') {
      // Canonical payload: username, rating, highest_rating, rank, level
      // Handle "NA" safely; avoid hasOwnProperty on null/undefined
      const safeVal = (v: any) => (v === undefined || v === null || v === 'NA') ? 'NA' : String(v);
      this.userData = {
        status: data.status,
        username: data.username || this.username,
        rating: safeVal(data.rating),
        highest_rating: safeVal(data.highest_rating),
        rank: safeVal(data.rank),
        level: safeVal(data.level),
      };
      // Defensively copy other only if present and is an object
      if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'other') && data['other'] !== null && typeof data['other'] === 'object') {
        (this.userData as any).other = data['other'];
      }
    } else {
      this.showError(data)
    }
  }

  showError(data: any) {
    const message = (data && data['details']) || 'Could not fetch profile. Please try again later.'
    this._alertService.presentToast(message, 'danger')
  }
}
