import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EMPTY, of, Subject } from 'rxjs';

import { CodechefPage } from './codechef.page';
import { UserService } from 'src/app/services/user.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UtilService } from 'src/app/services/util.service';
import { AlertService } from 'src/app/services/alert.service';

describe('CodechefPage', () => {
  let component: CodechefPage;
  let fixture: ComponentFixture<CodechefPage>;
  let getUserDetailsSpy: jasmine.Spy;
  let presentToastSpy: jasmine.Spy;
  let isLoadingNextSpy: jasmine.Spy;
  let getPlatformSpy: jasmine.Spy;
  let refreshUserDetailsSpy: jasmine.Spy;

  const okPayload = {
    status: 'OK',
    rating: 1500,
    user_details: {
      username: 'testuser',
      name: 'Test',
      image: '/avatar.png',
      country: 'IN',
      student_professional: 'Professional',
      institution: 'College',
    },
    contest_ratings: [{ name: 'C1', rating: 100 }, { name: 'C2', rating: 200 }],
    highest_rating: 2000,
    global_rank: 100,
    country_rank: 10,
    fully_solved: { count: 0 },
    partially_solved: { count: 0 },
  };

  const failPayload = { status: 'Failed', details: 'Upstream access failure' };
  const failNoDetailsPayload = { status: 'Failed' };
  const freshPayload = {
    status: 'OK',
    rating: 1600,
    user_details: {
      username: 'testuser',
      name: 'Test',
      image: '/avatar.png',
      country: 'IN',
      student_professional: 'Professional',
      institution: 'College',
    },
    contest_ratings: [
      { name: 'C1', rating: 100 },
      { name: 'C2', rating: 200 },
      { name: 'C3', rating: 300 },
    ],
    highest_rating: 2100,
    global_rank: 99,
    country_rank: 9,
    fully_solved: { count: 0 },
    partially_solved: { count: 0 },
  };

  beforeEach(waitForAsync(() => {
    isLoadingNextSpy = jasmine.createSpy('next');
    presentToastSpy = jasmine.createSpy('presentToast').and.returnValue(Promise.resolve());
    getPlatformSpy = jasmine.createSpy('getPlatform').and.returnValue({ codechef: 'testuser' });
    getUserDetailsSpy = jasmine.createSpy('getUserDetails').and.returnValue(of(okPayload));
    refreshUserDetailsSpy = jasmine.createSpy('refreshUserDetails').and.returnValue(of(okPayload));

    TestBed.configureTestingModule({
      declarations: [CodechefPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: UserService, useValue: { getUserDetails: getUserDetailsSpy, refreshUserDetails: refreshUserDetailsSpy } },
        { provide: LocalStorageService, useValue: { getPlatform: getPlatformSpy } },
        { provide: LoaderService, useValue: { isLoading: { next: isLoadingNextSpy } } },
        { provide: UtilService, useValue: {} },
        { provide: AlertService, useValue: { presentToast: presentToastSpy } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CodechefPage);
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
    expect(component.ratingArray).toEqual([100, 200]);
    expect(component.contestArray).toEqual(['C1', 'C2']);
    expect(component.userData.user_details['student_professional']).toBe('Professional');
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

  it('should replace the profile with fresh data on a successful refresh', () => {
    component.userData = okPayload;
    refreshUserDetailsSpy.and.returnValue(of(freshPayload));

    component.refreshUserData();
    expect(refreshUserDetailsSpy).toHaveBeenCalledWith('codechef', 'testuser');
    expect(component.userData).toBe(freshPayload);
    expect(component.ratingArray).toEqual([100, 200, 300]);
    expect(component.contestArray).toEqual(['C1', 'C2', 'C3']);
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
