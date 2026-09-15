import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EMPTY, of, Subject } from 'rxjs';

import { LeetcodePage } from './leetcode.page';
import { UserService } from 'src/app/services/user.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ThemeService } from 'src/app/services/theme.service';
import { AlertService } from 'src/app/services/alert.service';

describe('LeetcodePage', () => {
  let component: LeetcodePage;
  let fixture: ComponentFixture<LeetcodePage>;
  let getUserDetailsSpy: jasmine.Spy;
  let presentToastSpy: jasmine.Spy;
  let isLoadingNextSpy: jasmine.Spy;
  let getPlatformSpy: jasmine.Spy;
  let refreshUserDetailsSpy: jasmine.Spy;

  const okPayload = {
    status: 'OK',
    allQuestionsCount: [
      { difficulty: 'Easy', count: 10 },
      { difficulty: 'Medium', count: 6 },
      { difficulty: 'Hard', count: 2 },
      { difficulty: 'All', count: 18 },
    ],
    matchedUser: {
      submitStats: {
        acSubmissionNum: [
          { difficulty: 'Easy', count: 5, submissions: 10 },
          { difficulty: 'Medium', count: 3, submissions: 9 },
          { difficulty: 'Hard', count: 1, submissions: 4 },
          { difficulty: 'All', count: 9, submissions: 23 },
        ],
        totalSubmissionNum: [
          { difficulty: 'Easy', count: 10, submissions: 30 },
          { difficulty: 'Medium', count: 6, submissions: 18 },
          { difficulty: 'Hard', count: 2, submissions: 8 },
          { difficulty: 'All', count: 18, submissions: 60 },
        ],
      },
      profile: {
        userAvatar: '/avatar.png',
        ranking: 4500,
        reputation: 10,
        starRating: 4.9,
      },
    },
  };

  const failPayload = { status: 'Failed', details: 'Upstream access failure' };
  const failNoDetailsPayload = { status: 'Failed' };
  const freshPayload = {
    status: 'OK',
    allQuestionsCount: [
      { difficulty: 'Easy', count: 10 },
      { difficulty: 'Medium', count: 6 },
      { difficulty: 'Hard', count: 2 },
    ],
    matchedUser: {
      submitStats: {
        acSubmissionNum: [
          { difficulty: 'Easy', count: 6, submissions: 12 },
          { difficulty: 'Medium', count: 4, submissions: 10 },
          { difficulty: 'Hard', count: 2, submissions: 5 },
          { difficulty: 'All', count: 12, submissions: 27 },
        ],
        totalSubmissionNum: [],
      },
      profile: { userAvatar: '/avatar2.png', ranking: 4300, reputation: 12, starRating: 5 },
    },
  };
  const submissionsPayload = {
    status: 'OK',
    recentSubmissionList: [
      { title: 'Two Sum', statusDisplay: 'Accepted', lang: 'python3' },
      { title: 'Add Two Numbers', statusDisplay: 'Wrong Answer', lang: 'java' },
    ],
  };

  beforeEach(waitForAsync(() => {
    isLoadingNextSpy = jasmine.createSpy('next');
    presentToastSpy = jasmine.createSpy('presentToast').and.returnValue(Promise.resolve());
    getPlatformSpy = jasmine.createSpy('getPlatform').and.returnValue({ leetcode: 'testuser' });
    getUserDetailsSpy = jasmine.createSpy('getUserDetails').and.returnValue(of(okPayload));
    refreshUserDetailsSpy = jasmine.createSpy('refreshUserDetails').and.returnValue(of(okPayload));

    TestBed.configureTestingModule({
      declarations: [LeetcodePage],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: UserService, useValue: {
            getUserDetails: getUserDetailsSpy,
            getLeetCodeRecentSubmissions: jasmine.createSpy('getLeetCodeRecentSubmissions').and.returnValue(of(submissionsPayload)),
            refreshUserDetails: refreshUserDetailsSpy
          }
        },
        { provide: LocalStorageService, useValue: { getPlatform: getPlatformSpy } },
        { provide: LoaderService, useValue: { isLoading: { next: isLoadingNextSpy } } },
        { provide: ThemeService, useValue: { theme: new Subject<string>() } },
        { provide: AlertService, useValue: { presentToast: presentToastSpy } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeetcodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should assign profile data and set pie chart data on a successful OK response', () => {
    getUserDetailsSpy.and.returnValue(of(okPayload));

    component.userData = null;
    component.chartDataArray = [0, 0, 0, 0];
    component.getUserData();
    expect(component.userData).toBe(okPayload);
    expect(component.easyRate).toBe(0.5);
    expect(component.mediumRate).toBe(0.5);
    expect(component.hardRate).toBe(0.5);
    expect(component.chartDataArray).toEqual([5, 3, 1, 9]);
    expect(presentToastSpy).not.toHaveBeenCalled();
  });

  it('should show details on a Failed response with details', () => {
    getUserDetailsSpy.and.returnValue(of(failPayload));

    component.userData = null;
    component.chartDataArray = [0, 0, 0, 0];
    component.getUserData();
    expect(component.userData).toBeNull();
    expect(component.chartDataArray).toEqual([0, 0, 0, 0]);
    expect(presentToastSpy).toHaveBeenCalledWith('Upstream access failure', 'danger');
  });

  it('should show fallback message on a Failed response without details', () => {
    getUserDetailsSpy.and.returnValue(of(failNoDetailsPayload));

    component.userData = null;
    component.chartDataArray = [0, 0, 0, 0];
    component.getUserData();
    expect(component.userData).toBeNull();
    expect(presentToastSpy).toHaveBeenCalledWith(
      'Could not fetch profile. Please try again later.',
      'danger'
    );
  });

  it('should derive difficulty statistics from the canonical payload', () => {
    getUserDetailsSpy.and.returnValue(of(okPayload));

    component.userData = null;
    component.chartDataArray = [0, 0, 0, 0];
    component.getUserData();
    expect(component.easySolved).toBe(5);
    expect(component.easyTotal).toBe(10);
    expect(component.mediumSolved).toBe(3);
    expect(component.mediumTotal).toBe(6);
    expect(component.hardSolved).toBe(1);
    expect(component.hardTotal).toBe(2);
    expect(component.totalSolved).toBe(9);
    expect(component.chartDataArray).toEqual([5, 3, 1, 9]);
  });

  it('should not crash when matchedUser/submitStats are missing', () => {
    getUserDetailsSpy.and.returnValue(of({ status: 'OK' }));

    component.userData = null;
    component.chartDataArray = [0, 0, 0, 0];
    component.getUserData();
    expect(component.easySolved).toBe(0);
    expect(component.easyTotal).toBe(0);
    expect(component.mediumRate).toBe(0);
    expect(component.chartDataArray).toEqual([0, 0, 0, 0]);
  });

  it('should load recent submissions from the backend submissions endpoint', () => {
    component.getUserData2();
    expect(component.submissionList).toEqual(submissionsPayload.recentSubmissionList);
  });

  it('should replace the profile with fresh data on a successful refresh', () => {
    component.userData = okPayload;
    refreshUserDetailsSpy.and.returnValue(of(freshPayload));

    component.refreshUserData();
    expect(refreshUserDetailsSpy).toHaveBeenCalledWith('leetcode', 'testuser');
    expect(component.userData).toBe(freshPayload);
    expect(component.easySolved).toBe(6);
    expect(component.easyTotal).toBe(10);
    expect(component.totalSolved).toBe(12);
    expect(component.isRefreshing).toBe(false);
  });

  it('should keep the existing profile and show an error when refresh returns Failed', () => {
    component.userData = okPayload;
    refreshUserDetailsSpy.and.returnValue(of(failPayload));

    component.refreshUserData();
    expect(component.userData).toBe(okPayload);
    expect(presentToastSpy).toHaveBeenCalledWith('Upstream access failure', 'danger');
    expect(component.isRefreshing).toBe(false);
  });

  it('should keep the existing profile and stop refreshing when the request completes without data', () => {
    component.userData = okPayload;
    refreshUserDetailsSpy.and.returnValue(EMPTY);

    component.refreshUserData();
    expect(component.userData).toBe(okPayload);
    expect(component.isRefreshing).toBe(false);
  });

  it('should not start a second refresh while one is in progress', () => {
    const pending = new Subject<any>();
    refreshUserDetailsSpy.and.returnValue(pending);
    component.userData = okPayload;

    component.refreshUserData();
    expect(component.isRefreshing).toBe(true);
    component.refreshUserData();
    expect(refreshUserDetailsSpy).toHaveBeenCalledTimes(1);

    pending.next(freshPayload);
    pending.complete();
    expect(component.isRefreshing).toBe(false);
    expect(component.userData).toBe(freshPayload);
  });
});
