import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ContestService } from 'src/app/services/contest.service';
import { LoaderService } from 'src/app/services/loader.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { Contest } from 'src/app/models/contest.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {

  @ViewChild('userIcon', { read: ElementRef }) userIcon: ElementRef<HTMLElement>;
  @ViewChild('usernameElement', { read: ElementRef }) usernameElement: ElementRef<HTMLElement>;
  @ViewChild('nameElement', { read: ElementRef }) nameElement: ElementRef<HTMLElement>;

  contestsData: Contest[] = [];
  contestPlatforms: string[] = [];
  selectedPlatforms: string[] = [];
  contests: Contest[] = [];
  currentPage = 1;
  pageSize = 10;
  registeredPlatform = 0;
  value = 0;
  name: string;
  username: string;
  theme: string;
  countDownInterval: Subscription;

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true,
    loop: true,
  };

  constructor(
    private _contestService: ContestService,
    private _utilService: UtilService,
    private _loaderService: LoaderService,
    private _userService: UserService,
    private _localStorageService: LocalStorageService,
    private _themeService: ThemeService,
    private _renderer: Renderer2
  ) { }

  ngOnInit() {
    this.getUserData();
    this.getPlatforms();
    this.getUpcomingOngoingContest().then(() => {
      this.startCountDown();
    });
  }

  ngOnDestroy(): void {
    this.countDownInterval?.unsubscribe();
  }

  showUser() {
    if (window.innerWidth < 480) {
      this._renderer.addClass(this.userIcon.nativeElement, 'hide');
      this._renderer.setStyle(this.usernameElement.nativeElement, 'display', 'block');
      this._renderer.setStyle(this.nameElement.nativeElement, 'display', 'block');
      setTimeout(() => {
        this._renderer.removeClass(this.userIcon.nativeElement, 'hide');
        this._renderer.removeStyle(this.usernameElement.nativeElement, 'display');
        this._renderer.removeStyle(this.nameElement.nativeElement, 'display');
      }, 2500)
    }
  }

  getUserData() {
    this.name = this._localStorageService.getName();
    this.username = this._localStorageService.getUserName();
  }

  platformChange(data) {
    this.selectedPlatforms = data;
    this.filterContestsByPlatform();
  }

  filterContestsByPlatform() {
    this.contests = (this.selectedPlatforms.length) ? this.contestsData.filter(contest => this.selectedPlatforms.includes(contest.platform)) : this.contestsData;
    this.contests.forEach(c => { if (c.platform) c.platform = c.platform.replace(/^\w/, s => s.toUpperCase()); });
    this.currentPage = 1;
  }

  get paginatedContests(): Contest[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.contests.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.contests.length / this.pageSize) || 1;
  }

  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }

  getPlatforms() {
    this._userService.getPlatforms().subscribe(
      data => {
        const platformData = data?.platformData?.platform
        if (!platformData) return;
        for (const prop of Object.keys(platformData)) {
          if (platformData[prop as keyof typeof platformData])
            this.registeredPlatform++
        }
        this.value = 25 * this.registeredPlatform
      }
    )
  }

  async getUpcomingOngoingContest(): Promise<void> {
    return new Promise((resolve) => {
      this._contestService.getAllUpcomingOngoingContest().subscribe(
        data => {
          this.contestsData = data || [];
          this.contestPlatforms = [...new Set(this.contestsData.map(contest => contest.platform))];
          this.filterContestsByPlatform();
          this._loaderService.isLoading.next(false);
          resolve();
        },
        () => {
          this._loaderService.isLoading.next(false);
          resolve();
        }
      );
    });
  }

  startCountDown() {
    this.countDownInterval = interval(1000).subscribe(() => {
      this.contests.forEach(contest => {
        contest.startsIn = this._utilService.convertDateTimeToMilliseconds(new Date(contest.startTime));
      });
    });

    this.contests.forEach(contest => {
      contest.startsIn = this._utilService.convertDateTimeToMilliseconds(new Date(contest.startTime));
    });
  }
}
