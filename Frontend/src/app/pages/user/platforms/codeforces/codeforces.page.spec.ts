import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EMPTY, of, Subject } from 'rxjs';

import { CodeforcesPage } from './codeforces.page';
import { UserService } from 'src/app/services/user.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UtilService } from 'src/app/services/util.service';
import { ThemeService } from 'src/app/services/theme.service';
import { AlertService } from 'src/app/services/alert.service';

describe('CodeforcesPage', () => {
  let component: CodeforcesPage;
  let fixture: ComponentFixture<CodeforcesPage>;
  let getUserDetailsSpy: jasmine.Spy;
  let presentToastSpy: jasmine.Spy;
  let isLoadingNextSpy: jasmine.Spy;
  let getPlatformSpy: jasmine.Spy;
  let refreshUserDetailsSpy: jasmine.Spy;

  const okPayload = {
    status: 'OK',
    user_details: {
      username: 'testuser',
      name: 'Test User',
      image: '/avatar.png',
      country: 'IN',
    },
    rating: 1500,
    maxRating: 2600,
    rank: 'Candidate',
    maxRank: 'Grandmaster',
    contest_ratings: [
      { name: 'C1', rating: 100, oldRating: 0, rank: '4th' },
      { name: 'C2', rating: 200, oldRating: 100, rank: '2nd' },
    ],
    total_solved: 'NA',
    fully_solved: { count: 'NA' },
  };

  const failPayload = { status: 'Failed', details: 'Upstream access failure' };
  const failNoDetailsPayload = { status: 'Failed' };
  const freshPayload = {
    status: 'OK',
    user_details: {
      username: 'testuser',
      name: 'Fresh User',
      image: '/avatar2.png',
      country: 'IN',
    },
    rating: 1600,
    maxRating: 2700,
    rank: 'Master',
    maxRank: 'Grandmaster',
    contest_ratings: [
      { name: 'C1', rating: 100, oldRating: 0, rank: '4th' },
      { name: 'C2', rating: 200, oldRating: 100, rank: '2nd' },
      { name: 'C3', rating: 300, oldRating: 200, rank: '1st' },
    ],
    total_solved: 'NA',
    fully_solved: { count: 'NA' },
  };

  beforeEach(waitForAsync(() => {
    isLoadingNextSpy = jasmine.createSpy('next');
    presentToastSpy = jasmine.createSpy('presentToast').and.returnValue(Promise.resolve());
    getPlatformSpy = jasmine.createSpy('getPlatform').and.returnValue({ codeforces: 'testuser' });
    getUserDetailsSpy = jasmine.createSpy('getUserDetails').and.returnValue(of(okPayload));
    refreshUserDetailsSpy = jasmine.createSpy('refreshUserDetails').and.returnValue(of(okPayload));

    TestBed.configureTestingModule({
      declarations: [CodeforcesPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: UserService, useValue: { getUserDetails: getUserDetailsSpy, refreshUserDetails: refreshUserDetailsSpy } },
        { provide: LocalStorageService, useValue: { getPlatform: getPlatformSpy } },
        { provide: LoaderService, useValue: { isLoading: { next: isLoadingNextSpy } } },
        { provide: UtilService, useValue: {} },
        { provide: ThemeService, useValue: { theme: new Subject<string>() } },
        { provide: AlertService, useValue: { presentToast: presentToastSpy } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeforcesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should assign profile data and set parsing on a successful OK response', () => {
    getUserDetailsSpy.and.returnValue(of(okPayload));

    component.userData = null;
    component.ratingArray = [];
    component.contestArray = [];
    component.getUserData();
    expect(component.userData).toBe(okPayload);
    expect(component.ratingArray).toEqual([200, 100]);
    expect(component.contestArray).toEqual(['C2', 'C1']);
    expect(presentToastSpy).not.toHaveBeenCalled();
  });

  it('should show details and stop loader on a Failed response with details', () => {
    getUserDetailsSpy.and.returnValue(of(failPayload));

    component.userData = null;
    component.ratingArray = [];
    component.contestArray = [];
    component.getUserData();
    expect(component.userData).toBeNull();
    expect(component.ratingArray).toEqual([]);
    expect(component.contestArray).toEqual([]);
    expect(isLoadingNextSpy).toHaveBeenCalledWith(false);
    expect(presentToastSpy).toHaveBeenCalledWith('Upstream access failure', 'danger');
  });

  it('should stop loader on a Failed response (spinner stopped)', () => {
    getUserDetailsSpy.and.returnValue(of(failPayload));

    component.userData = null;
    component.ratingArray = [];
    component.contestArray = [];
    component.getUserData();
    expect(isLoadingNextSpy).toHaveBeenCalledWith(false);
  });

  it('should show fallback message on a Failed response without details', () => {
    getUserDetailsSpy.and.returnValue(of(failNoDetailsPayload));

    component.userData = null;
    component.ratingArray = [];
    component.contestArray = [];
    component.getUserData();
    expect(component.userData).toBeNull();
    expect(isLoadingNextSpy).toHaveBeenCalledWith(false);
    expect(presentToastSpy).toHaveBeenCalledWith(
      'Could not fetch profile. Please try again later.',
      'danger'
    );
  });

  it('should consume the canonical payload and build graph arrays from contest_ratings', () => {
    getUserDetailsSpy.and.returnValue(of(okPayload));

    component.userData = null;
    component.ratingArray = [];
    component.contestArray = [];
    component.getUserData();
    expect(component.userData).toBe(okPayload);
    expect(component.ratingArray).toEqual([200, 100]);
    expect(component.contestArray).toEqual(['C2', 'C1']);
  });

  it('should not crash when legacy fields are absent', () => {
    getUserDetailsSpy.and.returnValue(of(okPayload));

    component.userData = null;
    component.ratingArray = [];
    component.contestArray = [];
    component.getUserData();
    expect(component.userData.contests).toBeUndefined();
    expect(component.userData.handle).toBeUndefined();
    expect(component.userData.contribution).toBeUndefined();
    expect(component.userData.friendOfCount).toBeUndefined();
    expect(isLoadingNextSpy).toHaveBeenCalledWith(false);
  });

  it('should replace the profile with fresh data on a successful refresh', () => {
    component.userData = okPayload;
    refreshUserDetailsSpy.and.returnValue(of(freshPayload));

    component.refreshUserData();
    expect(refreshUserDetailsSpy).toHaveBeenCalledWith('codeforces', 'testuser');
    expect(component.userData).toBe(freshPayload);
    expect(component.ratingArray).toEqual([300, 200, 100]);
    expect(component.contestArray).toEqual(['C3', 'C2', 'C1']);
    expect(component.isRefreshing).toBe(false);
    expect(presentToastSpy).not.toHaveBeenCalled();
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
