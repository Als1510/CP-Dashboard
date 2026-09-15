import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { LoaderService } from 'src/app/services/loader.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { UserService } from 'src/app/services/user.service';
import { PlatformData } from 'src/app/models/platform.model';

@Component({
  selector: 'app-platforms',
  templateUrl: './platforms.page.html',
  styleUrls: ['./platforms.page.scss'],
})

export class PlatformsPage implements OnInit {
  @ViewChild('modal', { read: ElementRef }) modal: ElementRef<HTMLElement>;

  platforms: PlatformData = {
    codechef: null,
    codeforces: null,
    leetcode: null,
    atcoder: null
  };
  platformForm: FormGroup
  platformEntry = false
  platformEntries: { key: string; value: string | null }[] = []
  lastFetched: { [key: string]: string } = {}
  platformStatus: { [key: string]: string } = {}

  constructor(
    private _userSerive: UserService,
    private _loaderService: LoaderService,
    private _formBuilder: FormBuilder,
    private _alertService: AlertService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _localStorageService: LocalStorageService
  ) { }

  ngOnInit() {
    this.platformForm = this._formBuilder.group({
      platformName: ["", Validators.required],
      username: ["", Validators.required]
    })
    this.getplatform()
    this.hideCard()
  }

  showCard(data: { key: string; value: string | null }) {
    this.platformForm.controls['platformName'].setValue(data.key)
    this.platformForm.controls['username'].setValue(data.value)
    const modalElement = this.modal?.nativeElement
    if (modalElement) {
      modalElement.style.display = 'block';
    }
  }

  hideCard() {
    this.platformForm.controls['platformName'].setValue(null)
    this.platformForm.controls['username'].setValue(null)
    const modalElement = this.modal?.nativeElement
    if (modalElement) {
      modalElement.style.display = 'none';
    }
  }

  editPlatform(platform: keyof PlatformData) {
    this.showCard({ key: platform, value: this.platforms[platform] })
  }

  navigateTo(data) {
    let platformData = {
      [data]: this.platforms[data]
    }
    this._localStorageService.setPlatform(platformData)
    this._router.navigate([data], { relativeTo: this._route })
  }

  formatLastFetched(dateVal: any): string {
    if (!dateVal) return 'Never';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Never';
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }

  getplatform() {
    this._userSerive.getPlatforms().subscribe(
      async data => {
        // Use profileData array when backend provides it; fall back to platform usernames
        const profileArray = data.profileData || [];
        if (profileArray.length > 0) {
          profileArray.forEach((item: any) => {
            if (item && item.platform && item.username) {
              this.platforms[item.platform] = item.username;
              this.lastFetched[item.platform] = item.last_fetched ? this.formatLastFetched(item.last_fetched) : 'Never';
              this.platformStatus[item.platform] = item.status === 'live' ? 'Healthy' : 'Temporarily unavailable';
            }
          });
        } else {
          this.platforms = data.platformData.platform;
        }
        this.platformEntries = Object.keys(this.platforms || {})
          .filter(key => (this.platforms || {})[key])
          .map(key => ({ key, value: (this.platforms || {})[key] }))
        this._loaderService.isLoading.next(false)
        this.getUserPlatformData()
      })
  }

  getUserPlatformData() {
    for (let prop in this.platforms) {
      if (this.platforms[prop]) {
        this.platformEntry = true
      }
    }
    this._loaderService.isLoading.next(false)
  }

  onSubmit() {
    let platformName = this.platformForm.get('platformName').value
    let username = this.platformForm.get('username').value
    this._userSerive.updatePlatform(platformName, username).subscribe(
      data => {
        this._alertService.presentToast(data['msg'], 'success')
        this.getplatform()
        this._loaderService.isLoading.next(false)
      }
    )
    this.hideCard()
  }
}