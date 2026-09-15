import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ContestService } from 'src/app/services/contest.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UtilService } from 'src/app/services/util.service';
import { Contest } from 'src/app/models/contest.model';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  theme: string;
  contests: Contest[] = [];
  element: any;
  countDownInterval: Subscription;

  constructor(
    private _contestService: ContestService,
    private _loaderService: LoaderService,
    private _utilService: UtilService,
    private _themeService: ThemeService
  ) { }

  ngOnInit() {
    this._loaderService.isLoading.next(true);
    this._themeService.theme.subscribe((val) => {
      this.theme = val;
    })
    this.getUpcomingOngoingContest().then(() => {
      this.startCountDown();
    });
    this.setupFaqIcons();
  }

  ngOnDestroy() {
    this.countDownInterval?.unsubscribe();
  }

  setupFaqIcons() {
    const elements = document.querySelectorAll('.faq_icon');
    elements.forEach((element: HTMLElement) => {
      element.addEventListener('click', () => {
        const isRotated = element.classList.contains('rotate');
        element.classList.toggle('rotate', !isRotated);
        const sibling = element.nextElementSibling as HTMLElement | null;
        if (sibling) {
          sibling.style.display = isRotated ? 'none' : 'block';
        }
      });
    });
  }

  toggleBtn() {
    document.querySelector('ul')?.classList.toggle('active');
  }

  async getUpcomingOngoingContest(): Promise<void> {
    return new Promise((resolve) => {
      this._contestService.getUpcomingOngoingContest().subscribe(
        (data: Contest[]) => {
          this.contests = data;
          this.contests.forEach(c => { if (c.platform) c.platform = c.platform.replace(/^\w/, s => s.toUpperCase()); });
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

  getBackground() {
    return `url('../../../../assets/${this.theme === 'dark' ? 'home-dark.jpg' : 'home-light.jpg'}') center/cover no-repeat`;
  }
}
